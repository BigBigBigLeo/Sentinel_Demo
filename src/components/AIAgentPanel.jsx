import React, { useMemo, useState } from 'react';
import useStore from '../engine/store';
import Icon from './Icon';
import { pick, localeTag } from '../i18n/locale.js';

const ROLE_ICON = {
    manager: 'user',
    agronomist: 'leaf',
    chemist: 'water-drop',
    compliance: 'shield',
    safety: 'warning',
    finance: 'money',
    sales: 'trending-up',
    controller: 'settings',
    operator: 'drone',
    retriever: 'perception',
    learning: 'reasoning',
};

const ROLE_COLOR = {
    manager: '#60a5fa',
    agronomist: '#34d399',
    chemist: '#f59e0b',
    compliance: '#a78bfa',
    safety: '#f97316',
    finance: '#22c55e',
    sales: '#38bdf8',
    controller: '#f472b6',
    operator: '#ef4444',
    retriever: '#06b6d4',
    learning: '#8b5cf6',
};

const ROLE_LABEL_ZH = {
    manager: '管理',
    agronomist: '农艺师',
    chemist: '植保化学',
    compliance: '合规',
    safety: '安全',
    finance: '财务',
    sales: '销售',
    controller: '控制',
    operator: '作业',
    retriever: '采集',
    learning: '学习',
};

const STREAM_LABEL_ZH = {
    decision: '决策',
    analysis: '分析',
    audit: '审计',
    watchdog: '看门狗',
    execution: '执行',
    perception: '感知',
};

const STREAM_LABEL_EN = {
    decision: 'Decision',
    analysis: 'Analysis',
    audit: 'Audit',
    watchdog: 'Watchdog',
    execution: 'Execution',
    perception: 'Perception',
};

const toLabel = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown';
const formatTime = (iso, locale) => new Date(iso).toLocaleTimeString(localeTag(locale), {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});
const localizeAgentAction = (locale, value) => {
    if (locale !== 'zh' || !value) return value;
    let text = String(value);
    const actionMatch = text.match(/^(.+):\s*(lead|reviewer|executor) action by (.+)$/i);
    if (actionMatch) {
        const roleZh = actionMatch[2].toLowerCase() === 'lead' ? '主责' : actionMatch[2].toLowerCase() === 'reviewer' ? '复核' : '执行';
        text = `${actionMatch[1]}：${roleZh}动作｜${actionMatch[3]}`;
    }
    const phraseMap = [
        ['Data Ingestion', '数据接入'],
        ['Multimodal Risk Reasoning', '多模态风险推理'],
        ['Compliance and Safety Gate', '合规与安全闸门'],
        ['Prescription Planning', '处方规划'],
        ['Execution Orchestration', '执行编排'],
        ['Audit and Reporting', '审计与报告'],
        ['Outcome Learning', '结果学习'],
        ['Detected humidity anomaly', '检测到湿度异常'],
        ['Cross-referenced weather API', '已交叉校验天气 API'],
        ['Risk score', '风险分值'],
        ['exceeds critical threshold', '超过高危阈值'],
        ['Flagging for prescription', '已标记进入处方流程'],
        ['Dispatched', '已派发'],
        ['Multi-actor dispatch', '多主体协同调度'],
        ['Execution fingerprint generated', '执行指纹已生成'],
        ['hash match', '哈希匹配'],
        ['Verification scan', '复核扫描'],
        ['Treatment efficacy', '处置有效性'],
        ['Audit generated', '审计已生成'],
        ['Autonomous cycle', '自治循环'],
        ['end-to-end loop completed', '端到端闭环已完成'],
        ['for undefined', '针对当前低风险对象'],
        ['lead action by', '主责动作｜'],
        ['reviewer action by', '复核动作｜'],
        ['executor action by', '执行动作｜'],
    ];
    phraseMap.forEach(([en, zh]) => {
        text = text.split(en).join(zh);
    });
    const tokenMap = [
        ['Humidity', '湿度'],
        ['Temperature', '温度'],
        ['Gray Mold', '灰霉病'],
        ['Botrytis', '灰霉病原'],
        ['Drone', '无人机'],
        ['Field Team', '田间团队'],
        ['watchdog', '看门狗'],
        ['analysis', '分析'],
        ['decision', '决策'],
        ['execution', '执行'],
        ['audit', '审计'],
        ['Safety Officer', '安全官'],
        ['Control Engineer', '控制工程师'],
        ['Field Operator', '田间作业员'],
        ['Data Retriever', '数据采集员'],
        ['Remote Sensor Pilot', '远程传感操控员'],
        ['Drone Operator', '无人机作业员'],
        ['Ops Manager', '运营经理'],
        ['Learning Engineer', '学习工程师'],
        ['Compliance Officer', '合规官'],
        ['Crop Chemist', '植保化学师'],
        ['Field Agronomist', '田间农艺师'],
        ['Greenhouse Agronomist', '温室农艺师'],
        ['Finance Analyst', '财务分析师'],
        ['Sales Planner', '销售规划师'],
    ];
    tokenMap.forEach(([en, zh]) => {
        text = text.replace(new RegExp(en, 'gi'), zh);
    });
    text = text.replace(/->/g, '→');
    return text;
};

export default function AIAgentPanel() {
    const {
        agentRoster,
        agentAssignments,
        aiAgentLog,
        autonomousState,
        operatorAlerts,
        locale,
    } = useStore();

    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    const roleLabel = (value) => (isZh ? (ROLE_LABEL_ZH[value] || value || '未知') : toLabel(value));
    const streamLabel = (value) => (isZh ? (STREAM_LABEL_ZH[value] || value || '未知') : (STREAM_LABEL_EN[value] || toLabel(value)));

    const [expandedAgentId, setExpandedAgentId] = useState(null);
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const safeRoster = agentRoster || [];
    const safeAssignments = agentAssignments || [];
    const latestCycleId = safeAssignments.length ? safeAssignments[safeAssignments.length - 1].cycleId : null;
    const latestAssignments = latestCycleId ? safeAssignments.filter(a => a.cycleId === latestCycleId) : [];

    const actionCountByAgent = aiAgentLog.reduce((acc, log) => {
        if (log.agentId) acc[log.agentId] = (acc[log.agentId] || 0) + 1;
        return acc;
    }, {});

    const assignmentCountByAgent = latestAssignments.reduce((acc, assignment) => {
        (assignment.members || []).forEach(member => {
            acc[member.id] = (acc[member.id] || 0) + 1;
        });
        return acc;
    }, {});

    const taskLogsByTaskId = useMemo(() => {
        const logs = {};
        latestAssignments.forEach(assignment => {
            const memberIds = new Set((assignment.members || []).map(m => m.id));
            logs[assignment.id] = aiAgentLog
                .filter(l => l.cycleId === assignment.cycleId && (
                    memberIds.has(l.agentId)
                    || l.action?.includes(assignment.taskLabel)
                    || l.actionZh?.includes(assignment.taskLabelZh || '')
                ))
                .slice(-16)
                .reverse();
        });
        return logs;
    }, [latestAssignments, aiAgentLog]);

    if (!safeRoster.length) return null;

    return (
        <div className="card" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="robot" size={16} color="#38bdf8" />
                    {t('Autonomous Agent Mesh', '自治代理网络')}
                </h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[`${t('Cycles', '轮次')} ${autonomousState?.cycleCount || 0}`,
                    `${t('Auto Exec', '自动执行')} ${autonomousState?.autoExecutions || 0}`,
                    `${t('Escalations', '升级')} ${autonomousState?.escalations || 0}`,
                    `${t('Alerts', '告警')} ${operatorAlerts?.length || 0}`].map(label => (
                        <span key={label} style={{ fontSize: '0.62rem', color: '#93c5fd', padding: '3px 8px', borderRadius: 999, background: 'rgba(30,64,175,0.18)', border: '1px solid rgba(96,165,250,0.25)' }}>
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(56,189,248,0.03)', border: '1px dashed rgba(56,189,248,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="perception" size={14} color="#38bdf8" />
                        {t('Global Ecosystem Connectivity (24/7)', '全域生态连接（7x24）')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>
                        <div className="status-dot pulse" style={{ width: 4, height: 4, background: '#38bdf8' }} />
                        <span style={{ fontSize: '0.55rem', fontWeight: 400 }}>{t('MESH SYNC ACTIVE', '网络同步中')}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                        { label: 'GOV_API (FSMA 204)', icon: 'shield', color: '#a78bfa' },
                        { label: 'WEATHER_NET_INTL', icon: 'weather', color: '#60a5fa' },
                        { label: 'LOGISTICS_SYNC_V2', icon: 'drone', color: '#ef4444' },
                        { label: 'SUPPLY_CHAIN_CO', icon: 'settings', color: '#f59e0b' },
                        { label: 'INSURANCE_RISK_POOL', icon: 'trending-up', color: '#10b981' },
                        { label: 'PEST_CONTROL_LINK', icon: 'leaf', color: '#34d399' },
                        { label: 'LABOR_COMPLIANCE', icon: 'user', color: '#fbbf24' },
                        { label: 'SATELLITE_FEED_A8', icon: 'perception', color: '#38bdf8' },
                    ].map(node => (
                        <div key={node.label} className="external-node">
                            <Icon name={node.icon} size={11} color={node.color} />
                            <span style={{ fontFamily: 'monospace', letterSpacing: -0.2 }}>{node.label}</span>
                            <div className="status-dot pulse" style={{ width: 4, height: 4, background: node.color }} />
                        </div>
                    ))}
                </div>
            </div>

            {latestAssignments.length > 0 && (
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {latestAssignments.map(assignment => {
                        const id = assignment.taskId || assignment.id;
                        const expanded = expandedTaskId === id;
                        const taskLogs = taskLogsByTaskId[assignment.id] || [];
                        return (
                            <div key={assignment.id} style={{ border: '1px solid rgba(56,189,248,0.2)', background: 'rgba(15,23,42,0.35)', borderRadius: 8, padding: '8px 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700 }}>{isZh ? (assignment.taskLabelZh || assignment.taskLabel) : assignment.taskLabel}</div>
                                    <button type="button" className="icon-btn" onClick={() => setExpandedTaskId(expanded ? null : id)} aria-label={expanded ? t('Collapse task details', '收起任务详情') : t('Expand task details', '展开任务详情')}>
                                        <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} color="#64748b" />
                                    </button>
                                </div>
                                <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {(assignment.members || []).map(member => (
                                        <span key={`${assignment.id}-${member.id}`} style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            <Icon name={ROLE_ICON[member.role] || 'user'} size={12} color={ROLE_COLOR[member.role] || '#94a3b8'} /> {isZh ? (member.nameZh || member.name) : member.name} ({isZh ? (member.assignmentZh || member.assignment) : member.assignment})
                                        </span>
                                    ))}
                                </div>
                                {expanded && (
                                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(51,65,85,0.6)' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                                            <span className="mesh-chip">{t('Task ID', '任务ID')} {assignment.taskId}</span>
                                            <span className="mesh-chip">{t('Cycle', '轮次')} {assignment.cycleId}</span>
                                            <span className="mesh-chip">{t('Agents', '代理数')} {(assignment.members || []).length}</span>
                                        </div>
                                        <div className="scrollbar-themed" style={{ maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {taskLogs.length === 0 && <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{t('No task logs yet.', '暂无任务日志。')}</div>}
                                            {taskLogs.map((log, idx) => (
                                                <div key={`${assignment.id}-log-${idx}`} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.62rem' }}>
                                                    <span style={{ color: '#475569', fontFamily: 'monospace', minWidth: 62 }}>{formatTime(log.timestamp, locale)}</span>
                                                    <span style={{ color: '#94a3b8' }}>{isZh ? (log.actionZh || localizeAgentAction(locale, log.action)) : log.action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-3" style={{ marginTop: 12, gap: 8 }}>
                {safeRoster.map(agent => {
                    const actions = actionCountByAgent[agent.id] || 0;
                    const assigned = assignmentCountByAgent[agent.id] || 0;
                    const tone = ROLE_COLOR[agent.role] || '#38bdf8';
                    const logs = aiAgentLog
                        .filter(entry => entry.agentId === agent.id || entry.agent === agent.stream)
                        .slice(-16)
                        .reverse();
                    const expanded = expandedAgentId === agent.id;

                    return (
                        <div
                            key={agent.id}
                            style={{
                                border: `1px solid ${actions > 0 || assigned > 0 ? `${tone}40` : 'rgba(51,65,85,0.5)'}`,
                                background: actions > 0 || assigned > 0 ? `${tone}10` : 'rgba(15,23,42,0.3)',
                                borderRadius: 8,
                                padding: '9px 10px',
                                gridColumn: expanded ? '1 / -1' : 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Icon name={ROLE_ICON[agent.role] || 'user'} size={14} color={tone} />
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>{isZh ? (agent.nameZh || agent.name) : agent.name}</div>
                                </div>
                                <button type="button" className="icon-btn" onClick={() => setExpandedAgentId(expanded ? null : agent.id)} aria-label={expanded ? t('Collapse agent details', '收起代理详情') : t('Expand agent details', '展开代理详情')}>
                                    <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={12} color="#64748b" />
                                </button>
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 2 }}>
                                {roleLabel(agent.role)} | {streamLabel(agent.stream)}
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 2 }}>{isZh ? (agent.traitsZh || agent.traits) : agent.traits}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: '0.58rem', color: '#94a3b8' }}>
                                <span>{t('Actions', '动作')} {actions}</span>
                                <span>{t('Current Tasks', '当前任务')} {assigned}</span>
                            </div>
                            {expanded && (
                                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(51,65,85,0.6)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 8 }}>
                                        <div className="mesh-metric"><span>{t('Role', '角色')}</span><strong>{roleLabel(agent.role)}</strong></div>
                                        <div className="mesh-metric"><span>{t('Stream', '流')}</span><strong>{streamLabel(agent.stream)}</strong></div>
                                        <div className="mesh-metric"><span>{t('Assignments', '分配')}</span><strong>{assigned}</strong></div>
                                        <div className="mesh-metric"><span>{t('Total Actions', '总动作')}</span><strong>{actions}</strong></div>
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#93c5fd', marginBottom: 6 }}>{t('Real-Time Activity Logs', '实时活动日志')}</div>
                                    <div className="scrollbar-themed" style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {logs.length === 0 && <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{t('No recent actions yet.', '暂无最近动作。')}</div>}
                                        {logs.map((log, idx) => (
                                            <div key={`${agent.id}-activity-${idx}`} style={{ display: 'flex', gap: 8, fontSize: '0.62rem' }}>
                                                <span style={{ minWidth: 62, color: '#475569', fontFamily: 'monospace' }}>{formatTime(log.timestamp, locale)}</span>
                                                <span style={{ color: '#e2e8f0', flex: 1 }}>{isZh ? (log.actionZh || localizeAgentAction(locale, log.action)) : log.action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="srl-stat-box">
                    <div style={{ fontSize: '0.6rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>{t('Structural Revenue Leakage Avoided', '已避免结构性收入流失')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fee2e2' }}>CNY {((autonomousState?.estimatedSavings || 0) * 1.25).toLocaleString()}</div>
                </div>
                <div className="grade-uplift-box">
                    <div style={{ fontSize: '0.6rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>{t('Grade A Quality Protected', 'A级品质保护率')}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f0fdf4' }}>{98.4 + (Math.random() * 1.5).toFixed(1)}%</div>
                </div>
            </div>
        </div>
    );
}
