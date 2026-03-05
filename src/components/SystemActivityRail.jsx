import React, { useEffect, useMemo, useState } from 'react';
import useStore from '../engine/store';
import Icon from './Icon';
import { pick } from '../i18n/locale.js';

const EVENT_META = {
    autonomy: { icon: 'activity', color: '#38bdf8', label: 'Autonomy', labelZh: '自治' },
    prescription: { icon: 'prescription', color: '#f59e0b', label: 'Prescription', labelZh: '处方' },
    execution: { icon: 'execution', color: '#34d399', label: 'Execution', labelZh: '执行' },
    execution_complete: { icon: 'check-circle', color: '#22c55e', label: 'Execution', labelZh: '执行' },
    deviation: { icon: 'warning', color: '#ef4444', label: 'Deviation', labelZh: '偏差' },
    audit: { icon: 'audit', color: '#a78bfa', label: 'Audit', labelZh: '审计' },
    approval: { icon: 'check-circle', color: '#34d399', label: 'Approval', labelZh: '审批' },
    rejection: { icon: 'x-circle', color: '#ef4444', label: 'Rejection', labelZh: '驳回' },
    modification: { icon: 'settings', color: '#f97316', label: 'Edit', labelZh: '修改' },
    scenario: { icon: 'layers', color: '#38bdf8', label: 'Scenario', labelZh: '场景' },
    scenario_event: { icon: 'layers', color: '#60a5fa', label: 'Scenario', labelZh: '场景' },
};

const STREAM_META = {
    perception: { icon: 'perception', color: '#34d399', label: 'Perception', labelZh: '感知' },
    analysis: { icon: 'reasoning', color: '#a78bfa', label: 'Analysis', labelZh: '分析' },
    decision: { icon: 'prescription', color: '#fbbf24', label: 'Decision', labelZh: '决策' },
    execution: { icon: 'execution', color: '#38bdf8', label: 'Execution', labelZh: '执行' },
    audit: { icon: 'audit', color: '#22c55e', label: 'Audit', labelZh: '审计' },
    watchdog: { icon: 'warning', color: '#f59e0b', label: 'Watchdog', labelZh: '看门狗' },
};

const formatTime = (iso, locale) => {
    if (!iso) return '--:--:--';
    return new Date(iso).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

const localizeActivityMessage = (locale, value) => {
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
        ['Risk assessment initiated', '已启动风险评估'],
        ['Prescription generated', '处方已生成'],
        ['Execution initiated', '已启动执行'],
        ['Audit report compiled and recorded', '审计报告已汇编并归档'],
        ['Human approved', '人工审批通过'],
        ['routed to human approval', '已流转至人工审批'],
        ['Sensor anomaly detected', '检测到传感异常'],
        ['Post-execution verification', '执行后验证'],
        ['No operator action', '未检测到人工操作'],
        ['revenue impact', '营收影响'],
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
        ['Leaf Wetness', '叶面湿润'],
        ['Gray Mold', '灰霉病'],
        ['Botrytis', '灰霉病原'],
        ['risk', '风险'],
        ['approval', '审批'],
        ['execution', '执行'],
        ['audit', '审计'],
        ['watchdog', '看门狗'],
        ['Scenario', '场景'],
        ['Task', '任务'],
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

export default function SystemActivityRail() {
    const {
        eventLog,
        aiAgentLog,
        agentAssignments,
        approvalQueue,
        autonomousState,
        thinkingChain,
        isThinking,
        operatorAlerts,
        locale,
    } = useStore();

    const t = (en, zh) => pick(locale, en, zh);

    const [nowTick, setNowTick] = useState(0);
    useEffect(() => {
        setNowTick(Date.now());
        const timer = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const latestCycleId = agentAssignments.length ? agentAssignments[agentAssignments.length - 1].cycleId : null;
    const latestAssignments = latestCycleId ? agentAssignments.filter(a => a.cycleId === latestCycleId) : [];

    const streamItems = useMemo(() => {
        const events = (eventLog || []).slice(-150).map(item => {
            const meta = EVENT_META[item.type] || { icon: 'info', color: '#94a3b8', label: 'Event', labelZh: '事件' };
            return {
                id: `evt-${item.timestamp}-${item.type}-${item.message?.slice(0, 24) || ''}`,
                timestamp: item.timestamp,
                icon: meta.icon,
                color: meta.color,
                tag: locale === 'zh' ? (meta.labelZh || meta.label) : meta.label,
                message: locale === 'zh'
                    ? (item.messageZh || localizeActivityMessage(locale, item.message))
                    : item.message,
            };
        });

        const agentEntries = (aiAgentLog || []).slice(-220).map(item => {
            const meta = STREAM_META[item.agent] || { icon: 'activity', color: '#94a3b8', label: 'Agent', labelZh: '代理' };
            return {
                id: `agt-${item.timestamp}-${item.agentId || item.agent}-${item.action?.slice(0, 24) || ''}`,
                timestamp: item.timestamp,
                icon: meta.icon,
                color: meta.color,
                tag: locale === 'zh' ? (meta.labelZh || meta.label) : meta.label,
                message: locale === 'zh'
                    ? (item.actionZh || localizeActivityMessage(locale, item.action))
                    : item.action,
            };
        });

        const assignmentEntries = latestAssignments.map(item => ({
            id: `asg-${item.id}`,
            timestamp: item.timestamp,
            icon: 'users',
            color: item.status === 'operator_gate' ? '#f59e0b' : '#38bdf8',
            tag: locale === 'zh' ? '任务' : 'Task',
            message: locale === 'zh'
                ? `${item.taskLabelZh || item.taskLabel}：${(item.members || []).map(m => m.nameZh || m.name).join('、')}`
                : `${item.taskLabel}: ${(item.members || []).map(m => m.name).join(', ')}`,
        }));

        const thinkingEntries = isThinking
            ? (thinkingChain || []).slice(-8).map(item => ({
                id: `thk-${item.id}-${item.timestamp}`,
                timestamp: item.timestamp,
                icon: item.phase?.icon || 'reasoning',
                color: item.phase?.color || '#a78bfa',
                tag: locale === 'zh' ? '推理' : 'Thinking',
                message: localizeActivityMessage(locale, item.title),
            }))
            : [];

        return [...events, ...agentEntries, ...assignmentEntries, ...thinkingEntries]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 220);
    }, [eventLog, aiAgentLog, latestAssignments, isThinking, thinkingChain, locale]);

    const eventsLast30m = useMemo(() => {
        const cutoff = nowTick - 30 * 60 * 1000;
        return streamItems.filter(item => new Date(item.timestamp).getTime() >= cutoff).length;
    }, [streamItems, nowTick]);

    return (
        <aside className="system-activity-rail card">
            <div className="system-activity-header">
                <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#38bdf8" />
                    {t('Live System Stream', '系统实时流')}
                </h3>
                <span className="system-activity-badge">
                    <span className="system-activity-pulse" />
                    {t('Live', '实时')}
                </span>
            </div>

            <div className="system-activity-stats">
                <span>{t('Cycle', '轮次')} {autonomousState?.cycleCount || 0}</span>
                <span>{eventsLast30m} {t('events / 30m', '条事件 / 30分钟')}</span>
                <span>{approvalQueue.length} {t('approvals pending', '待审批')}</span>
                <span>{operatorAlerts.length} {t('action required', '待处理')}</span>
            </div>

            <div className="system-activity-stream scrollbar-themed">
                {streamItems.map(item => (
                    <div key={item.id} className="system-activity-item">
                        <div className="system-activity-icon" style={{ color: item.color }}>
                            <Icon name={item.icon} size={13} color={item.color} />
                        </div>
                        <div className="system-activity-body">
                            <div className="system-activity-meta">
                                <span className="system-activity-tag" style={{ color: item.color }}>{item.tag}</span>
                                <span className="system-activity-time">{formatTime(item.timestamp, locale)}</span>
                            </div>
                            <div className="system-activity-text">{item.message}</div>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
