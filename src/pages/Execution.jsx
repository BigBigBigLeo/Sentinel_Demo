import React, { useMemo, useState, useEffect } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { executionRecords as historicalExecutionRecords, assetRoster } from '../data/mockData';
import AssetMonitor from '../components/AssetMonitor';
import { pick, localeTag } from '../i18n/locale.js';
import { ENTERPRISE_ORDERS } from '../data/ordersData';
import OrderDossierModal from '../components/OrderDossierModal';
import MetricCard from '../components/MetricCard';

export default function Execution() {
    const {
        activeExecution, executions, activeScenario,
        fields, activeFieldId, currentSnapshot, aiAgentLog,
        thinkingChain, isThinking, thinkingContext,
        startExecutionThinking, stopThinking, completeExecution,
        locale,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const localizeExecText = (value) => {
        if (!isZh || !value) return value;
        let text = String(value);
        text = text.replace(/鈫\?/g, '→');
        text = text.replace(/鈥\?/g, ' - ');
        text = text.replace(/渭m/g, 'μm');
        text = text.replace(/^(.+):\s*(lead|reviewer|executor) action by (.+)$/i, (_, task, role, who) => {
            const roleZh = role.toLowerCase() === 'lead' ? '主责' : role.toLowerCase() === 'reviewer' ? '复核' : '执行';
            return `${task}：${roleZh}动作｜${who}`;
        });
        const phraseMap = [
            ['Multi-actor dispatch', '多主体协同调度'],
            ['Execution fingerprint generated', '执行指纹已生成'],
            ['hash match [OK]', '哈希校验通过'],
            ['Delayed execution detected', '检测到执行延迟'],
            ['Drone verification scan', '无人机复核扫描'],
            ['Treatment efficacy', '处置有效性'],
            ['Prescription Queued', '处方已入队'],
            ['Pre-flight Check', '飞前检查'],
            ['IoT Systems Activated', 'IoT 系统已激活'],
            ['Drones Dispatched', '无人机已出动'],
            ['Precision Spray Complete', '精准喷施完成'],
            ['Field Team Dispatched', '田间团队已派出'],
            ['Verification Scan Scheduled', '复核扫描已排程'],
            ['Execution aborted: battery critical', '执行中止：电量告警'],
            ['queued — multi-actor execution plan generated', '已入队，已生成多主体执行计划'],
            ['queued - multi-actor execution plan generated', '已入队，已生成多主体执行计划'],
            ['Battery', '电量'],
            ['GPS locked', 'GPS 已锁定'],
            ['Ventilation', '通风'],
            ['Irrigation target', '灌溉目标'],
            ['Chemical used', '药剂用量'],
            ['Rows', '行区'],
            ['spray', '喷施'],
            ['recon', '侦察'],
            ['Team A', 'A 组团队'],
            ['manual pruning of infected tissue', '人工修剪感染组织'],
            ['Hyperspectral re-scan at T+72h for efficacy validation', 'T+72h 安排高光谱复扫用于疗效验证'],
            ['Autonomous cycle', '自治循环'],
            ['end-to-end loop completed', '端到端闭环已完成'],
            ['for undefined', '，目标未定义'],
            ['Data Ingestion', '数据接入'],
            ['Multimodal Risk Reasoning', '多模态风险推理'],
            ['Compliance and Safety Gate', '合规与安全闸门'],
            ['Prescription Planning', '处方规划'],
            ['Execution Orchestration', '执行编排'],
            ['Audit and Reporting', '审计与报告'],
            ['Outcome Learning', '结果学习'],
            ['risk', '风险'],
            ['coverage', '覆盖率'],
            ['dosage', '剂量'],
            ['response', '响应'],
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
            ['Botrytis', '灰霉病原'],
            ['Gray Mold', '灰霉病'],
            ['Drone', '无人机作业'],
            ['Field Team', '采收班组'],
            ['Actor', '执行主体'],
            ['operator', '现场作业'],
            ['Safety Officer', '安全防灾'],
            ['Control Engineer', '环境自控'],
            ['Field Operator', '采收调度'],
            ['Data Retriever', '遥测感知'],
            ['Remote Sensor Pilot', '遥测感知'],
            ['Drone Operator', '无人机作业'],
            ['Ops Manager', '运营管理'],
            ['Learning Engineer', '算法模型'],
            ['Compliance Officer', '法规合规'],
            ['Crop Chemist', '植保病理'],
            ['Field Agronomist', '田间农艺'],
            ['Greenhouse Agronomist', '设施温室'],
            ['Finance Analyst', '财务核算'],
            ['Sales Planner', '销售履约'],
            ['IoT Control', '环境自控总线'],
            ['Irrigation System', '水肥灌溉系统'],
            ['Field 人工作业员', '采收作业员'],
            ['无人机人工操作员', '无人机作业员'],
        ];
        tokenMap.forEach(([en, zh]) => {
            text = text.replace(new RegExp(en, 'gi'), zh);
        });
        text = text.replace(/->/g, '→');
        return text;
    };
    const field = fields[activeFieldId];
    const execution = activeExecution;
    const sensors = currentSnapshot?.sensors || {};

    // Simulated live progress for actors
    const [actorProgress, setActorProgress] = useState({});
    const [elapsedSec, setElapsedSec] = useState(0);
    const [selectedPreviousExecutionId, setSelectedPreviousExecutionId] = useState(null);
    const [execViewTab, setExecViewTab] = useState('focal');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!execution) return;
        const interval = setInterval(() => {
            setElapsedSec(s => s + 1);
            setActorProgress(prev => {
                const next = { ...prev };
                (execution.executionPlan || []).forEach(actor => {
                    const curr = next[actor.id] || 0;
                    if (actor.status === 'completed') next[actor.id] = 100;
                    else if (actor.status === 'in-progress') next[actor.id] = Math.min(curr + Math.random() * 2.5, 98);
                    else if (actor.status === 'pending') next[actor.id] = 0;
                    else if (actor.status === 'scheduled') next[actor.id] = 0;
                });
                return next;
            });
        }, 800);
        return () => clearInterval(interval);
    }, [execution]);

    const fmtTime = (iso) => {
        if (!iso) return '--';
        return new Date(iso).toLocaleString(localeTag(locale), { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const statusColor = (s) => {
        const map = { completed: '#34d399', 'in-progress': '#38bdf8', pending: '#f59e0b', scheduled: '#64748b', failed: '#ef4444', skipped: '#475569' };
        return map[s] || '#64748b';
    };

    const actorIconName = (type) => {
        const map = { drone: 'drone', iot: 'signal', human: 'user', facility: 'facility' };
        return map[type] || 'gear';
    };

    const dosageData = execution ? [
        { name: 'Sentinel\nPrecision', value: Math.round((execution.actualDosageRatio || 0.7) * 300), fill: '#34d399' },
        { name: 'Traditional\nBroadcast', value: 300, fill: '#475569' },
    ] : [];

    // Filter execution-related AI agent logs
    const execAgentLogs = aiAgentLog.filter(l => l.agent === 'execution' || l.agent === 'watchdog' || l.agent === 'perception');
    const confidencePct = execution?.comparisonReport
        ? Math.min(99.9, Math.max(80, execution.comparisonReport.overallScore + 4.5))
        : 88;
    const seededExecutions = useMemo(() => (
        (historicalExecutionRecords || []).map(item => ({
            id: item.id,
            prescriptionId: item.rxId,
            startTime: item.timestamp,
            endTime: item.timestamp,
            status: item.status || 'completed',
            actualCoverage_pct: item.actors?.length
                ? Math.round(item.actors.reduce((sum, actor) => sum + Number.parseFloat(String(actor.coverage || '0').replace('%', '')), 0) / item.actors.length)
                : 95,
            actualDosageRatio: item.id === 'EX-20260302-001' ? 0.96 : item.id === 'EX-20260212-001' ? 0.91 : 0.86,
            executionFingerprint: { match: item.id !== 'EX-20260302-001' },
            duration: item.duration,
            actorCount: item.actors?.length || 0,
            feedback: item.feedback,
            feedbackZh: item.feedbackZh,
            deviations: item.id === 'EX-20260302-001'
                ? [{ parameter: 'Dosage ratio', delta: '+0.12x' }, { parameter: 'Timing window', delta: '+14 min' }]
                : [],
        }))
    ), []);
    const previousExecutions = useMemo(() => {
        const live = executions.slice(0, -1).reverse();
        const seen = new Set(live.map(item => item.id));
        const fallback = seededExecutions.filter(item => !seen.has(item.id));
        return [...live, ...fallback].slice(0, 12);
    }, [executions, seededExecutions]);
    const selectedPreviousExecution = previousExecutions.find(item => item.id === selectedPreviousExecutionId) || previousExecutions[0];
    const actorLabel = (actor) => (isZh ? (actor.actorZh || localizeExecText(actor.actor)) : actor.actor);
    const actorActionLabel = (actor) => (isZh ? (actor.actionZh || localizeExecText(actor.action)) : actor.action);
    const actorDetailLabel = (actor) => (isZh ? (actor.detailZh || localizeExecText(actor.detail)) : actor.detail);
    const actorZoneLabel = (actor) => (isZh ? (actor.targetZoneZh || localizeExecText(actor.targetZone)) : actor.targetZone);
    const actorCoverageLabel = (actor) => (isZh ? localizeExecText(actor.coverage) : actor.coverage);
    const actorDurationLabel = (actor) => (isZh ? localizeExecText(actor.estimatedDuration) : actor.estimatedDuration);
    const actorChemicalLabel = (actor) => (isZh ? (actor.chemicalUsedZh || localizeExecText(actor.chemicalUsed)) : actor.chemicalUsed);
    const actorPrecisionLabel = (actor) => (isZh ? (actor.precisionZh || localizeExecText(actor.precision)) : actor.precision);

    return (
        <div className="page">
            <PipelineBreadcrumb />

            {/* 鈹佲攣鈹?Command Center Header 鈹佲攣鈹?*/}
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="execution" size={22} color="#f59e0b" /> {t('Execution Command Center', '执行指挥中心')}
                    </h1>
                    <p className="page-subtitle">
                        {t('Stage 5: Multi-Actor Execution', '阶段 5：多主体执行')} - {locale === 'zh' ? (field?.nameZh || field?.name) : field?.name} | {activeScenario ? `${t('Scenario', '场景')} ${activeScenario.id}` : t('Live Mode', '实时模式')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {execution && execution.status !== 'completed' && (
                        <button className="btn btn-primary" onClick={completeExecution} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="check" size={14} /> {t('Complete Execution', '完成现场执行闭环')}
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode Toggle: Focal Plan B vs 12 Orders Enterprise Dispatch */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, background: 'rgba(15, 23, 42, 0.6)', padding: 6, borderRadius: 8, border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <button
                    type="button"
                    onClick={() => setExecViewTab('focal')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: execViewTab === 'focal' ? 'rgba(0, 229, 163, 0.15)' : 'transparent',
                        color: execViewTab === 'focal' ? '#00e5a3' : '#94a3b8',
                        fontWeight: execViewTab === 'focal' ? 800 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: execViewTab === 'focal' ? 'inset 0 0 0 1px #00e5a3' : 'none'
                    }}
                >
                    <Icon name="prescription" size={16} color={execViewTab === 'focal' ? '#00e5a3' : '#64748b'} />
                    {t('Plan B Focal Ticket Orchestration (750 kg Hema · WO-B3)', '决策冲突焦点工单多主体调度 (方案 B · 盒马 750kg 工单)')}
                </button>

                <button
                    type="button"
                    onClick={() => setExecViewTab('enterprise_orders')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: execViewTab === 'enterprise_orders' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: execViewTab === 'enterprise_orders' ? '#38bdf8' : '#94a3b8',
                        fontWeight: execViewTab === 'enterprise_orders' ? 800 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: execViewTab === 'enterprise_orders' ? 'inset 0 0 0 1px #38bdf8' : 'none'
                    }}
                >
                    <Icon name="layers" size={16} color={execViewTab === 'enterprise_orders' ? '#38bdf8' : '#64748b'} />
                    {t('900-Mu Facility: 12 Enterprise Orders Live Dispatch Board (12,450 kg · 5 Trucks)', '900 亩全园 12 批企业订单当日履约派发调度总览 (12,450 kg · 5 专车 · 120 技工)')}
                </button>
            </div>

            {execViewTab === 'focal' && (
                <>
            {/* 处方室批准方案与执行工单承接横幅 */}
            <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(15,23,42,0.65) 100%)', border: '1px solid #1e3a8a', borderLeft: '4px solid #38bdf8', padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="prescription" size={22} color="#38bdf8" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f1f5f9' }}>
                                    {t('Execution Source: Prescription Room Approved Plan B (North Greenhouse Dawn Harvest + Plan C CA Buffer)', '现场执行承接：处方决策室批准之【方案 B：北区日光温室拂晓抢收 + 气调库应急缓冲方案 C】')}
                                </span>
                                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(52,211,153,0.3)' }}>
                                    工单 WO-B3-2026-001
                                </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                <span><strong style={{ color: '#cbd5e1' }}>目标客户：</strong>盒马鲜生 (SLA 交付 750kg 特级果 18mm+)</span>
                                <span><strong style={{ color: '#cbd5e1' }}>锁定边际贡献：</strong><span style={{ color: '#34d399', fontWeight: 600 }}>+¥45,800</span> (毛利率 93.9%)</span>
                                <span><strong style={{ color: '#cbd5e1' }}>GS1 存证哈希：</strong><code style={{ color: '#38bdf8' }}>1AAD49H2</code> (7/7 法定安全门禁全票通过)</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>协同执行主体：</span>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', fontSize: '0.7rem' }}>A12 采收调度</span>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: '#c084fc', fontSize: '0.7rem' }}>A10 环境自控</span>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(52,211,153,0.12)', color: '#34d399', fontSize: '0.7rem' }}>A05 品质追溯</span>
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(244,63,94,0.12)', color: '#fb7185', fontSize: '0.7rem' }}>A11 无人机作业</span>
                    </div>
                </div>
            </div>

            {/* 鈹佲攣鈹?Execution Status Banner 鈹佲攣鈹?*/}
            {execution && (
                <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(56,189,248,0.06) 100%)', borderLeft: `3px solid ${execution.status === 'completed' ? '#34d399' : '#38bdf8'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: execution.status === 'completed' ? 'rgba(52,211,153,0.15)' : 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name={execution.status === 'completed' ? 'check-circle' : 'refresh'} size={24} color={execution.status === 'completed' ? '#34d399' : '#38bdf8'} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '1rem' }}>
                                    {t('Execution', '执行')} {execution.id}  - {execution.status === 'completed' ? t('COMPLETE', '已完成') : t('IN PROGRESS', '执行中')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: 16, marginTop: 4 }}>
                                    <span>{t('Rx', '处方')}: {execution.prescriptionId}</span>
                                    <span>{t('Method', '方法')}: {execution.method?.replace('_', ' ')}</span>
                                    <span>{t('Actors', '执行主体')}: {execution.executionPlan?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                                {[
                                    { label: t('Coverage', '覆盖率'), value: `${execution.actualCoverage_pct}%`, color: '#34d399' },
                                    { label: t('Dosage', '剂量'), value: `${(execution.actualDosageRatio * 100).toFixed(0)}%`, color: '#38bdf8' },
                                    { label: t('Duration', '时长'), value: execution.endTime ? `${Math.round((new Date(execution.endTime) - new Date(execution.startTime)) / 60000)} ${t('min', '分钟')}` : t('Active', '进行中'), color: '#f59e0b' },
                                ].map((m, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '6px 16px', background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Multi-Actor Orchestration 鈹佲攣鈹?*/}
            {execution?.executionPlan && (
                <div style={{ marginBottom: 20 }}>
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="users" size={16} color="#38bdf8" /> {t('Multi-Actor Orchestration', '多主体协同调度')} - {execution.executionPlan.length} {t('Actors', '执行主体')}
                    </h3>

                    {/* Gantt Timeline */}
                    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span className="card-title" style={{ margin: 0 }}>{t('Execution Timeline', '执行时间线')}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                {t('Elapsed', '已用时')}: {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
                            </span>
                        </div>
                        {execution.executionPlan.map((actor, i) => {
                            const progress = actorProgress[actor.id] || 0;
                            return (
                                <div key={actor.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < execution.executionPlan.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
                                    <div style={{ width: 30, textAlign: 'center' }}><Icon name={actorIconName(actor.actorType)} size={18} color="#94a3b8" /></div>
                                    <div style={{ width: 120, minWidth: 120 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#e2e8f0' }}>{actorLabel(actor)}</div>
                                            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{isZh ? localizeExecText(actor.offsetLabel) : actor.offsetLabel}</div>
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(15,23,42,0.5)', borderRadius: 6, height: 24, overflow: 'hidden', position: 'relative' }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${statusColor(actor.status)}40, ${statusColor(actor.status)})`,
                                            borderRadius: 6,
                                            transition: 'width 0.8s ease-out',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            paddingRight: 8,
                                        }}>
                                            {progress > 20 && (
                                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0f172a' }}>{Math.round(progress)}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ width: 80, textAlign: 'right' }}>
                                        <StatusBadge status={actor.status === 'completed' ? 'monitoring' : actor.status === 'in-progress' ? 'elevated' : actor.status === 'pending' ? 'warning' : 'low'} label={t(actor.status.toUpperCase(), actor.status === 'completed' ? '已完成' : actor.status === 'in-progress' ? '执行中' : actor.status === 'pending' ? '待执行' : '已计划')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Actor Detail Cards */}
                    <div className="grid grid-3" style={{ gap: 12 }}>
                        {execution.executionPlan.map(actor => (
                            <div key={actor.id} className="card" style={{ borderLeft: `3px solid ${statusColor(actor.status)}`, padding: '14px 16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Icon name={actorIconName(actor.actorType)} size={20} color="#94a3b8" />
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{actorLabel(actor)}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{actor.id}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={actor.status === 'completed' ? 'monitoring' : actor.status === 'in-progress' ? 'elevated' : 'low'} label={actor.status} />
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>{actorActionLabel(actor)}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>{actorDetailLabel(actor)}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.65rem' }}>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>{t('Zone', '分区')}: </span>
                                        <span style={{ color: '#e2e8f0' }}>{actorZoneLabel(actor)}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>{t('Coverage', '覆盖率')}: </span>
                                        <span style={{ color: '#34d399' }}>{actorCoverageLabel(actor)}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>{t('Duration', '时长')}: </span>
                                        <span style={{ color: '#e2e8f0' }}>{actorDurationLabel(actor)}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>{t('Chemical', '药剂')}: </span>
                                        <span style={{ color: actor.chemicalUsed === 'N/A (scan only)' || actor.chemicalUsed?.startsWith('N/A') ? '#64748b' : '#f59e0b' }}>{actorChemicalLabel(actor)}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: 6, fontSize: '0.62rem', color: '#475569', fontStyle: 'italic' }}>{actorPrecisionLabel(actor)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Execution vs Prescription + Fingerprint 鈹佲攣鈹?*/}
            {execution && (
                <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
                    {/* Fingerprint Verification */}
                    <div className="card">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="shield" size={16} color="#38bdf8" /> {t('Execution Fingerprint', '执行指纹')}
                        </h3>
                        <div style={{
                            padding: 16,
                            background: execution.executionFingerprint?.match ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)',
                            borderRadius: 10,
                            border: `1px solid ${execution.executionFingerprint?.match ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: execution.executionFingerprint?.match ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon name={execution.executionFingerprint?.match ? 'check-circle' : 'warning'} size={18} color={execution.executionFingerprint?.match ? '#34d399' : '#ef4444'} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: execution.executionFingerprint?.match ? '#34d399' : '#ef4444', fontSize: '0.9rem' }}>
                                        {execution.executionFingerprint?.match ? t('FINGERPRINT MATCH', '指纹匹配') : t('FINGERPRINT MISMATCH', '指纹不匹配')}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{t('Cryptographic execution verification', '执行指纹加密校验')}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6 }}>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>{t('Prescribed Hash', '处方哈希')}</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#38bdf8', wordBreak: 'break-all' }}>{execution.executionFingerprint?.prescribed || '--'}</div>
                                </div>
                                <div style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6 }}>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>{t('Actual Hash', '执行哈希')}</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: execution.executionFingerprint?.match ? '#34d399' : '#ef4444', wordBreak: 'break-all' }}>{execution.executionFingerprint?.actual || '--'}</div>
                                </div>
                            </div>
                            {execution.deviations?.length > 0 && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="warning" size={12} color="#f59e0b" /> {t('Deviations Detected', '检测到偏差')}:</div>
                                    {execution.deviations.map((d, i) => (
                                        <div key={i} style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 6, fontSize: '0.7rem', color: '#f59e0b', marginBottom: 4 }}>
                                            <strong>{d.parameter}</strong>: {t('Prescribed', '处方')} {d.prescribed} {'->'} {t('Actual', '实际')} {d.actual} ({d.delta})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dosage Comparison */}
                    <div className="card">
                        <h3 className="card-title">{t('Sentinel vs. Traditional - Chemical Usage', 'Sentinel vs 传统方案｜用药量对比')}</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dosageData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 350]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                    formatter={(v) => [`${v} ml/mu`, t('Dosage', '剂量')]}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                    {dosageData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        {execution.precisionMetrics && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                {[
                                    { label: t('Chemical Reduction', '化学用量下降'), value: execution.precisionMetrics.chemicalReduction, color: '#34d399' },
                                    { label: t('Area Targeted', '定向覆盖面积'), value: execution.precisionMetrics.areaTargeted, color: '#38bdf8' },
                                    { label: t('Area Spared', '免喷面积'), value: execution.precisionMetrics.areaSpared, color: '#a78bfa' },
                                    { label: t('Actors Used', '执行主体数'), value: execution.precisionMetrics.actorsUsed, color: '#f59e0b' },
                                ].map((m, i) => (
                                    <div key={i} style={{ padding: '6px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{m.label}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Execution Steps Timeline 鈹佲攣鈹?*/}
            {execution?.steps && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="activity" size={16} color="#38bdf8" /> {t('Execution Progress - Step by Step', '执行进度｜步骤追踪')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {execution.steps.map((step) => (
                            <div key={step.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0',
                                borderLeft: `2px solid ${statusColor(step.status)}`,
                                paddingLeft: 14, marginLeft: 8,
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                                    background: `${statusColor(step.status)}20`,
                                    border: `2px solid ${statusColor(step.status)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 700, color: statusColor(step.status),
                                }}>
                                    {step.status === 'completed' ? <Icon name="check" size={10} color="#34d399" /> : step.status === 'failed' ? <Icon name="x" size={10} color="#ef4444" /> : step.id}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.8rem' }}>
                                            {isZh ? (step.labelZh || localizeExecText(step.label)) : step.label}
                                        </span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#475569' }}>{fmtTime(step.time)}</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                                        {isZh ? (step.detailZh || localizeExecText(step.detail)) : step.detail}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?AI Agent Activity Feed 鈹佲攣鈹?*/}
            {execAgentLogs.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="reasoning" size={16} color="#a78bfa" /> {t('AI Agent Activity Feed', 'AI 代理活动流')}
                    </h3>
                    <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {execAgentLogs.slice(-15).reverse().map((log, i) => {
                            const agentColors = { execution: '#38bdf8', watchdog: '#f59e0b', perception: '#34d399', analysis: '#a78bfa', decision: '#f472b6', audit: '#fbbf24' };
                            return (
                                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6, borderLeft: `3px solid ${agentColors[log.agent] || '#64748b'}` }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                                            background: `${agentColors[log.agent]}15`, color: agentColors[log.agent],
                                            fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                                        }}>{isZh ? ({ execution: '执行', watchdog: '看门狗', perception: '感知', analysis: '分析', decision: '决策', audit: '审计' }[log.agent] || log.agent) : log.agent}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>{isZh ? (log.actionZh || localizeExecText(log.action)) : log.action}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 2 }}>
                                            {t('Step', '步骤')} {log.scenarioStep}  - {isZh ? (log.contextZh || localizeExecText(log.context)) : log.context}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Live Environment Conditions 鈹佲攣鈹?*/}
            {execution && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 className="card-title">{t('Live Environment During Execution', '执行过程实时环境')}</h3>
                    <div className="grid grid-4" style={{ gap: 10 }}>
                        {[
                            { label: t('Temperature', '温度'), value: `${sensors.temp_C?.toFixed(1) || '--'}°C`, icon: 'thermostat', status: sensors.temp_C > 32 ? 'warning' : 'ok', color: '#f59e0b' },
                            { label: t('Humidity', '湿度'), value: `${sensors.humidity_pct?.toFixed(0) || '--'}%`, icon: 'water-drop', status: sensors.humidity_pct > 90 ? 'warning' : 'ok', color: '#38bdf8' },
                            { label: t('Wind Speed', '风速'), value: `${sensors.wind_speed_ms?.toFixed(1) || '--'} m/s`, icon: 'wind', status: sensors.wind_speed_ms > 3 ? 'critical' : 'ok', color: sensors.wind_speed_ms > 3 ? '#ef4444' : '#34d399' },
                            { label: t('Light', '光照'), value: `${sensors.light_Lux?.toLocaleString() || '--'} Lux`, icon: 'sun', status: 'ok', color: '#fbbf24' },
                        ].map((env, i) => (
                            <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><Icon name={env.icon} size={20} color={env.color} /></div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: env.color, fontFamily: 'monospace' }}>{env.value}</div>
                                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{env.label}</div>
                                {env.status !== 'ok' && (
                                    <div style={{ fontSize: '0.55rem', color: env.status === 'critical' ? '#ef4444' : '#f59e0b', marginTop: 2, fontWeight: 700 }}>
                                        <Icon name="warning" size={9} color={env.status === 'critical' ? '#ef4444' : '#f59e0b'} /> {env.status === 'critical' ? t('EXCEEDS LIMIT', '超过阈值') : t('ELEVATED', '升高')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Asset Monitor (Always Visible) 鈹佲攣鈹?*/}
            <AssetMonitor assets={assetRoster} />

            {/* 鈹佲攣鈹?Execution Completion Summary 鈹佲攣鈹?*/}
            {execution?.comparisonReport && (
                <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(56,189,248,0.04) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="check" size={16} color="#34d399" /> {t('Execution Complete - Final Summary', '执行完成｜最终汇总')}
                    </h3>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Grade Badge */}
                        <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(15,23,42,0.5)', borderRadius: 12, minWidth: 100 }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: execution.comparisonReport.grade === 'A' ? '#34d399' : execution.comparisonReport.grade === 'B' ? '#38bdf8' : '#f59e0b', lineHeight: 1 }}>
                                {execution.comparisonReport.grade}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>{t('Overall Grade', '综合等级')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}>{execution.comparisonReport.overallScore.toFixed(1)}%</div>
                        </div>

                        {/* Accuracy Metrics */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                                {[
                                    { label: t('Dosage Accuracy', '剂量准确率'), value: `${execution.comparisonReport.dosage.accuracy.toFixed(1)}%`, color: execution.comparisonReport.dosage.accuracy >= 95 ? '#34d399' : '#f59e0b' },
                                    { label: t('Coverage Accuracy', '覆盖准确率'), value: `${execution.comparisonReport.coverage.accuracy.toFixed(1)}%`, color: execution.comparisonReport.coverage.accuracy >= 95 ? '#34d399' : '#f59e0b' },
                                    { label: t('Timing Accuracy', '时序准确率'), value: `${execution.comparisonReport.timing.accuracy.toFixed(1)}%`, color: execution.comparisonReport.timing.accuracy >= 90 ? '#34d399' : '#f59e0b' },
                                    { label: t('Risk Reduction', '风险下降'), value: `${execution.comparisonReport.riskBefore} ->${execution.comparisonReport.riskAfter.toFixed(0)}`, color: '#34d399' },
                                ].map((m, i) => (
                                <div key={i} style={{ padding: '10px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Prescription vs. Execution Comparison 鈹佲攣鈹?*/}
            {execution?.comparisonReport && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="activity" size={16} color="#a78bfa" /> {t('Prescription vs. Execution - Comparison', '处方与执行对比')}
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>{t('Parameter', '参数')}</th><th>{t('Prescribed', '处方')}</th><th>{t('Actual', '实际')}</th><th>{t('Accuracy', '准确率')}</th><th>{t('Status', '状态')}</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { param: t('Dosage Ratio', '剂量比例'), prescribed: `${(execution.comparisonReport.dosage.prescribed * 100).toFixed(0)}%`, actual: `${(execution.comparisonReport.dosage.actual * 100).toFixed(0)}%`, accuracy: execution.comparisonReport.dosage.accuracy },
                                { param: t('Coverage', '覆盖率'), prescribed: `${execution.comparisonReport.coverage.prescribed}%`, actual: `${execution.comparisonReport.coverage.actual.toFixed(1)}%`, accuracy: execution.comparisonReport.coverage.accuracy },
                                { param: t('Timing', '时序'), prescribed: execution.comparisonReport.timing.prescribed, actual: execution.comparisonReport.timing.actual, accuracy: execution.comparisonReport.timing.accuracy },
                                { param: t('Actors', '执行主体'), prescribed: execution.comparisonReport.actors.prescribed, actual: execution.comparisonReport.actors.actual, accuracy: execution.comparisonReport.actors.prescribed === execution.comparisonReport.actors.actual ? 100 : 80 },
                                { param: t('Methods', '方法'), prescribed: execution.comparisonReport.methods.prescribed, actual: execution.comparisonReport.methods.actual, accuracy: 100 },
                                { param: t('Chemical/Agent', '药剂/制剂'), prescribed: execution.comparisonReport.chemicals.prescribed, actual: execution.comparisonReport.chemicals.actual, accuracy: execution.comparisonReport.chemicals.prescribed === execution.comparisonReport.chemicals.actual ? 100 : 70 },
                            ].map((row, i) => {
                                const statusIcon = row.accuracy >= 95 ? <Icon name="check" size={14} color="#34d399" /> : row.accuracy >= 80 ? <Icon name="warning" size={14} color="#f59e0b" /> : <Icon name="x" size={14} color="#ef4444" />;
                                const statusColor2 = row.accuracy >= 95 ? '#34d399' : row.accuracy >= 80 ? '#f59e0b' : '#ef4444';
                                return (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{row.param}</td>
                                        <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>{row.prescribed}</td>
                                        <td style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.75rem' }}>{row.actual}</td>
                                        <td style={{ fontFamily: 'monospace', color: statusColor2, fontWeight: 700, fontSize: '0.75rem' }}>{typeof row.accuracy === 'number' ? `${row.accuracy.toFixed(1)}%` : row.accuracy}</td>
                                        <td>{statusIcon}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 鈹佲攣鈹?Post-Execution Impact 鈹佲攣鈹?*/}
            {execution?.comparisonReport && (
                <div className="card" style={{ marginBottom: 20, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="trending-up" size={16} color="#10b981" /> {t('Post-Execution Impact Assessment', '执行后效果评估')}
                    </h3>
                    <div className="grid grid-3" style={{ gap: 12 }}>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>{t('Risk Score Change', '风险分值变化')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{execution.comparisonReport.riskBefore}</span>
                                <span style={{ color: '#64748b' }}>{'->'}</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{execution.comparisonReport.riskAfter.toFixed(0)}</span>
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}><Icon name="trending-up" size={10} color="#34d399" /> {(execution.comparisonReport.riskBefore - execution.comparisonReport.riskAfter).toFixed(0)} pts reduced</div>
                        </div>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>{t('Projected Harvest Impact', '预计采收影响')}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                                {activeScenario?.outcomeMetrics?.gradeResult || t('Grade A Protected', 'A级品质已保护')}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4 }}>{t('Revenue', '收益')}: CNY {(activeScenario?.outcomeMetrics?.revenueProtected || 28000).toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>{t('AI Confidence', 'AI 置信度')}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'monospace' }}>
                                {confidencePct.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4 }}>{t('Intervention success probability', '干预成功概率')}</div>
                        </div>
                    </div>
                </div>
            )}

                            </>
            )}

            {/* ════════════════════════════════════════════════════════════════════════════
                VIEW 2: 900-MU FACILITY 12 ENTERPRISE ORDERS LIVE DISPATCH BOARD
               ════════════════════════════════════════════════════════════════════════════ */}
            {execViewTab === 'enterprise_orders' && (
                <div>
                    {/* 4 Hero Dispatch KPIs */}
                    <div className="grid grid-4" style={{ gap: 12, marginBottom: 16 }}>
                        <MetricCard
                            label={t('Total Dispatched Volume Today', '全园当日采收出库总量')}
                            value="12,450 kg"
                            subtitle={t('12 Orders · Capacity Load 93.6%', '12 批重点订单 · 产能负荷率 93.6%')}
                            status="low"
                            icon="box"
                        />
                        <MetricCard
                            label={t('Field Crews & Specialized Staff', '在岗作业班组与技工')}
                            value="120 人"
                            subtitle={t('Zone A 38 (Gloves) · Zone B 62 · CA QA 20', 'A区温室38人 · B区大棚62人 · C区质检20人')}
                            status="low"
                            icon="users"
                        />
                        <MetricCard
                            label={t('Active Cold-Chain Transits', '在途冷链温控保障车队')}
                            value="5 辆专车"
                            subtitle={t('Southwest 4 Trucks + Changshui Air Express', '成渝/贵阳/南宁 4 车 + 长水空港航线 1 车')}
                            status="low"
                            icon="refresh"
                        />
                        <MetricCard
                            label={t('Autonomous Machinery Units', '智能农机自动化协同单元')}
                            value="12 台/组"
                            subtitle={t('2 DJI T50 Drones · 4 CA Compressors · 6 Traps', '2台大疆T50无人机 · 4组气调机 · 6处诱捕哨兵')}
                            status="low"
                            icon="drone"
                        />
                    </div>

                    {/* 12 Enterprise Orders Live Dispatch Table */}
                    <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="layers" size={18} color="#38bdf8" />
                                <h3 className="card-title" style={{ margin: 0, fontSize: '0.95rem' }}>
                                    {t('900-Mu Facility: 12 Enterprise Contracts Autonomous Dispatch Ledger', '云南澄江 900 亩基地 12 批重点企业直供订单自治派发调度总台账')}
                                </h3>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {t('Click any order to view full multi-agent fulfillment & audit dossier', '点击任意订单卡片可下钻查阅 5 维度履约与合规审计档案')}
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.6)', color: '#94a3b8' }}>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Order / Client', '订单编号 / 采购客户')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Category', '业务类型')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Specs & Quantity', '规格 / 签约总量')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Allocated Zone & Labor', '指定采收产区与在岗班组')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Cold Chain Routing', '冷链干线 / 运力承接')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Dispatch Progress', '派发履约执行进度')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>{t('SLA & Gate', '法定门禁 / SLA')}</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>{t('Action', '操作')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ENTERPRISE_ORDERS.map(order => {
                                        const isFocal = order.id === 'BB-2026-HM01';
                                        return (
                                            <tr
                                                key={order.id}
                                                style={{
                                                    borderBottom: '1px solid rgba(148,163,184,0.08)',
                                                    background: isFocal ? 'rgba(0, 229, 163, 0.05)' : 'transparent',
                                                    transition: 'background 0.15s',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <td style={{ padding: '12px', color: '#f1f5f9' }}>
                                                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {order.id}
                                                        {isFocal && (
                                                            <span style={{ fontSize: '0.62rem', background: '#00e5a3', color: '#090d16', padding: '1px 5px', borderRadius: 3, fontWeight: 800 }}>
                                                                FOCAL
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: 2 }}>
                                                        {isZh ? order.clientZh : order.client}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: '0.65rem',
                                                        background: order.category === 't0' ? 'rgba(56,189,248,0.15)' : 'rgba(148,163,184,0.15)',
                                                        color: order.category === 't0' ? '#38bdf8' : '#94a3b8',
                                                        fontWeight: 600
                                                    }}>
                                                        {isZh ? order.categoryLabelZh : order.categoryLabel}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{order.quantityKg?.toLocaleString()} kg</div>
                                                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                                        ¥{order.pricePerKg}/kg · {isZh ? order.gradeZh : order.grade}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', color: '#cbd5e1' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8' }}>
                                                        <Icon name="facility" size={13} />
                                                        <span>{isZh ? order.assignedZoneZh : order.assignedZone}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>
                                                        {isZh ? order.laborDispatchZh : order.laborDispatch}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', color: '#cbd5e1' }}>
                                                    <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>
                                                        {isZh ? order.logisticsRouteZh : order.logisticsRoute}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                                                        {isZh ? order.fleetVehicleZh : order.fleetVehicle}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', minWidth: 140 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginBottom: 4 }}>
                                                        <span style={{ color: order.dispatchProgressPct === 100 ? '#34d399' : '#38bdf8', fontWeight: 600 }}>
                                                            {isZh ? order.fulfillmentStatusZh : order.fulfillmentStatus}
                                                        </span>
                                                        <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{order.dispatchProgressPct}%</span>
                                                    </div>
                                                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${order.dispatchProgressPct}%`,
                                                            height: '100%',
                                                            background: order.dispatchProgressPct === 100
                                                                ? 'linear-gradient(90deg, #10b981, #059669)'
                                                                : 'linear-gradient(90deg, #38bdf8, #0284c7)',
                                                            borderRadius: 3
                                                        }} />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        background: 'rgba(52,211,153,0.1)',
                                                        color: '#34d399',
                                                        padding: '2px 6px',
                                                        borderRadius: 4,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700
                                                    }}>
                                                        <Icon name="check-circle" size={11} color="#34d399" />
                                                        PASS 7/7
                                                    </div>
                                                    <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 2 }}>
                                                        {order.tempTarget || '1.5°C 稳态'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrder(order);
                                                        }}
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: 4,
                                                            border: '1px solid rgba(56,189,248,0.4)',
                                                            background: 'rgba(56,189,248,0.1)',
                                                            color: '#38bdf8',
                                                            fontSize: '0.68rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {t('Dossier', '查阅档案')}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Previous Executions */}
            {previousExecutions.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="history" size={16} color="#38bdf8" />
                        {t('Previous Executions (Recent)', '历史执行记录（最近）')}
                    </h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div className="scrollbar-themed" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {previousExecutions.map(item => (
                                <button
                                    key={item.id}
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedPreviousExecutionId(item.id)}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        border: selectedPreviousExecution?.id === item.id
                                            ? '1px solid rgba(56,189,248,0.35)'
                                            : '1px solid rgba(51,65,85,0.6)',
                                        background: selectedPreviousExecution?.id === item.id
                                            ? 'rgba(56,189,248,0.12)'
                                            : 'rgba(15,23,42,0.45)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 3,
                                    }}
                                >
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700 }}>{item.id}</span>
                                        <StatusBadge status={item.status === 'completed' ? 'monitoring' : 'critical'} label={t(item.status?.toUpperCase() || '', item.status === 'completed' ? '已完成' : '异常')} />
                                    </div>
                                    <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                                        {item.prescriptionId || '--'} | {t('Coverage', '覆盖率')} {item.actualCoverage_pct ?? '--'}%
                                    </span>
                                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>
                                        {fmtTime(item.startTime)}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedPreviousExecution && (
                            <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{selectedPreviousExecution.id}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Prescription', '处方')}: {selectedPreviousExecution.prescriptionId || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Start', '开始')}: {fmtTime(selectedPreviousExecution.startTime)}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('End', '结束')}: {fmtTime(selectedPreviousExecution.endTime)}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Coverage', '覆盖率')}: {selectedPreviousExecution.actualCoverage_pct ?? '--'}%</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Dosage', '剂量')}: {selectedPreviousExecution.actualDosageRatio ? `${(selectedPreviousExecution.actualDosageRatio * 100).toFixed(0)}%` : '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Actors', '执行主体')}: {selectedPreviousExecution.actorCount || selectedPreviousExecution.executionPlan?.length || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Duration', '时长')}: {selectedPreviousExecution.duration || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>
                                    {t('Fingerprint', '指纹')}: {selectedPreviousExecution.executionFingerprint?.match ? t('Match', '匹配') : t('Mismatch', '不匹配')}
                                </div>
                                {selectedPreviousExecution.deviations?.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>{t('Deviations', '偏差')}</div>
                                        {selectedPreviousExecution.deviations.slice(0, 3).map((item, idx) => (
                                            <div key={`${selectedPreviousExecution.id}-dev-${idx}`} style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: 3 }}>
                                                {isZh ? localizeExecText(item.parameter) : item.parameter}: {isZh ? localizeExecText(item.delta) : item.delta}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPreviousExecution.feedback && (
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>{t('Execution Feedback', '执行反馈')}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.45 }}>{isZh ? (selectedPreviousExecution.feedbackZh || localizeExecText(selectedPreviousExecution.feedback)) : selectedPreviousExecution.feedback}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}


        
            {/* Global Order Dossier Modal */}
            <OrderDossierModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                locale={locale}
            />
        </div>
    );
}