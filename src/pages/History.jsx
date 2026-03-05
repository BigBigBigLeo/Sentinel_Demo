import React, { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import StatusBadge from '../components/StatusBadge';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import useStore from '../engine/store';
import { historicalDecisions } from '../data/mockData';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { pick, localeTag } from '../i18n/locale.js';

// Expanded historical records for all 6 scenarios
const scenarioOutcomes = [
    { id: 'A', name: 'Blueberry PHI Constraint', date: '2025-11-08', crop: 'Blueberry', riskPeak: 85, riskFinal: 42, grade: 'A+', revenueProtected: 44000, cost: 3200, responseMin: 18, chemical: 'Trichoderma (Bio)', aiAccuracy: 94 },
    { id: 'B', name: 'Monsoon Rose Gray Mold', date: '2025-11-15', crop: 'Rose', riskPeak: 88, riskFinal: 55, grade: 'B (30% downgraded)', revenueProtected: 51000, cost: 4500, responseMin: 380, chemical: 'Carbendazim', aiAccuracy: 91, loss: 12600 },
    { id: 'C', name: 'Execution Deviation', date: '2025-12-02', crop: 'Blueberry', riskPeak: 72, riskFinal: 18, grade: 'A+', revenueProtected: 28000, cost: 3640, responseMin: 22, chemical: 'Chlorothalonil', aiAccuracy: 92, excessCost: 840 },
    { id: 'D', name: 'Multi-Pest Cascade', date: '2025-12-18', crop: 'Blueberry', riskPeak: 78, riskFinal: 22, grade: 'A+', revenueProtected: 68000, cost: 5800, responseMin: 35, chemical: 'Sequential', aiAccuracy: 96 },
    { id: 'E', name: 'Frost Emergency', date: '2026-01-05', crop: 'Blueberry', riskPeak: 82, riskFinal: 10, grade: 'A+', revenueProtected: 52000, cost: 1800, responseMin: 8, chemical: 'None (Non-chemical)', aiAccuracy: 98 },
    { id: 'F', name: 'Ventilation Failure', date: '2026-01-22', crop: 'Rose', riskPeak: 82, riskFinal: 28, grade: 'A+', revenueProtected: 72000, cost: 6200, responseMin: 12, chemical: 'Carbendazim (Emergency)', aiAccuracy: 95 },
];

const aiAccuracyTrend = [
    { month: 'Sep', accuracy: 82, decisions: 3 },
    { month: 'Oct', accuracy: 86, decisions: 5 },
    { month: 'Nov', accuracy: 91, decisions: 8 },
    { month: 'Dec', accuracy: 94, decisions: 6 },
    { month: 'Jan', accuracy: 97, decisions: 7 },
    { month: 'Feb', accuracy: 98, decisions: 4 },
];

const chemicalUsageTrend = [
    { month: 'Sep', sentinel: 12, traditional: 28 },
    { month: 'Oct', sentinel: 9, traditional: 26 },
    { month: 'Nov', sentinel: 7, traditional: 25 },
    { month: 'Dec', sentinel: 5, traditional: 24 },
    { month: 'Jan', sentinel: 3, traditional: 23 },
    { month: 'Feb', sentinel: 4, traditional: 22 },
];

const revenueCumulative = [
    { month: 'Sep', protected: 12000, cost: 3200 },
    { month: 'Oct', protected: 35000, cost: 7800 },
    { month: 'Nov', protected: 128000, cost: 15500 },
    { month: 'Dec', protected: 224000, cost: 25100 },
    { month: 'Jan', protected: 348000, cost: 33100 },
    { month: 'Feb', protected: 413000, cost: 39200 },
];

const responseTimeData = [
    { range: '<15min', count: 8, fill: '#34d399' },
    { range: '15-30min', count: 12, fill: '#38bdf8' },
    { range: '30-60min', count: 5, fill: '#f59e0b' },
    { range: '1-4hr', count: 3, fill: '#f97316' },
    { range: '>4hr', count: 1, fill: '#ef4444' },
];

export default function History() {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const scenarioName = (item) => {
        const mapZh = {
            'Blueberry PHI Constraint': '蓝莓 PHI 约束',
            'Monsoon Rose Gray Mold': '雨季玫瑰灰霉病',
            'Execution Deviation': '执行偏差',
            'Multi-Pest Cascade': '多虫害级联',
            'Frost Emergency': '霜冻应急',
            'Ventilation Failure': '通风故障',
        };
        return isZh ? (mapZh[item.name] || item.name) : item.name;
    };
    const cropLabel = (value) => {
        const mapZh = { Blueberry: '蓝莓', Rose: '玫瑰' };
        return isZh ? (mapZh[value] || value) : value;
    };
    const gradeLabel = (value) => {
        if (!isZh) return value;
        if (value === 'A+') return 'A+';
        if (value === 'B (30% downgraded)') return 'B（30% 降级）';
        return value;
    };
    const chemicalLabel = (value) => {
        if (!isZh) return value;
        const mapZh = {
            'Trichoderma (Bio)': 'Trichoderma（生防）',
            Carbendazim: '多菌灵',
            Chlorothalonil: '百菌清',
            Sequential: '阶段化复合方案',
            'None (Non-chemical)': '无（非化学方案）',
            'Carbendazim (Emergency)': '多菌灵（应急）',
        };
        return mapZh[value] || value;
    };
    const decisionThreat = (item) => (isZh ? (item.threatZh || item.threat) : item.threat);
    const decisionAction = (item) => (isZh ? (item.actionZh || item.action) : item.action);
    const decisionNote = (item) => (isZh ? (item.noteZh || item.note) : item.note);
    const decisionApprover = (item) => (isZh ? (item.approvedByZh || item.approvedBy) : item.approvedBy);
    const decisionApprovalType = (item) => {
        if (!isZh) return item.approvalType;
        return item.approvalType === 'critical' ? '人工审批' : item.approvalType === 'auto' ? '系统自动' : item.approvalType;
    };
    const [filter, setFilter] = useState('all');
    const [expandedScenario, setExpandedScenario] = useState(null);
    const [selectedDecisionId, setSelectedDecisionId] = useState(null);

    const filteredOutcomes = filter === 'all' ? scenarioOutcomes
        : filter === 'success' ? scenarioOutcomes.filter(s => s.grade.includes('+'))
            : scenarioOutcomes.filter(s => !s.grade.includes('+'));

    const totalProtected = scenarioOutcomes.reduce((s, o) => s + o.revenueProtected, 0);
    const totalCost = scenarioOutcomes.reduce((s, o) => s + o.cost, 0);
    const avgAccuracy = (scenarioOutcomes.reduce((s, o) => s + o.aiAccuracy, 0) / scenarioOutcomes.length).toFixed(1);
    const avgResponse = Math.round(scenarioOutcomes.reduce((s, o) => s + o.responseMin, 0) / scenarioOutcomes.length);
    const decisionEntries = useMemo(
        () => [...historicalDecisions]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 16),
        [],
    );
    const selectedDecision = decisionEntries.find(item => item.id === selectedDecisionId) || decisionEntries[0];

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="history" size={20} color="#38bdf8" /> {t('Analytics & History', '分析与历史')}
                    </h1>
                    <p className="page-subtitle">{t('Season Performance Dashboard', '季度表现看板')} - {scenarioOutcomes.length} {t('Interventions Tracked', '次干预记录')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['all', 'success', 'issues'].map(f => (
                        <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(f)} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                            {f === 'all' ? t('All', '全部') : f === 'success' ? t('Success', '成功') : t('Issues', '问题')}
                        </button>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Summary KPI Cards 鈹佲攣鈹?*/}
            <div className="grid grid-4" style={{ gap: 12, marginBottom: 20 }}>
                {[
                    { label: t('Revenue Protected', '已保护收益'), value: `CNY ${(totalProtected / 1000).toFixed(0)}K`, sub: t(`from ${scenarioOutcomes.length} interventions`, `来自 ${scenarioOutcomes.length} 次干预`), color: '#34d399', icon: 'money' },
                    { label: t('Total Cost', '总成本'), value: `CNY ${(totalCost / 1000).toFixed(1)}K`, sub: `ROI: ${(totalProtected / totalCost).toFixed(1)}x`, color: '#f59e0b', icon: 'clipboard' },
                    { label: t('AI Accuracy', 'AI 准确率'), value: `${avgAccuracy}%`, sub: t('avg decision quality', '平均决策质量'), color: '#38bdf8', icon: 'robot' },
                    { label: t('Avg Response', '平均响应'), value: `${avgResponse} ${t('min', '分钟')}`, sub: t('detection to execution', '从检测到执行'), color: '#a78bfa', icon: 'bolt' },
                ].map((kpi, i) => (
                    <div key={i} className="card" style={{
                        background: `linear-gradient(135deg, ${kpi.color}08 0%, transparent 100%)`,
                        borderTop: `2px solid ${kpi.color}40`,
                        textAlign: 'center', padding: '16px 12px',
                    }}>
                        <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><Icon name={kpi.icon} size={24} color={kpi.color} /></div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.color, fontFamily: 'monospace', lineHeight: 1.2 }}>{kpi.value}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{kpi.label}</div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            {/* 鈹佲攣鈹?Scenario Replay Cards 鈹佲攣鈹?*/}
            <div style={{ marginBottom: 20 }}>
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span><Icon name="folder" size={16} color="#38bdf8" /></span> {t('Intervention Record - Scenario Replay', '干预记录｜场景回放')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredOutcomes.map(outcome => (
                        <div key={outcome.id} className="card" style={{
                            cursor: 'pointer',
                            borderLeft: `3px solid ${outcome.grade.includes('+') ? '#34d399' : '#f59e0b'}`,
                            transition: 'all 0.2s',
                        }} onClick={() => setExpandedScenario(expandedScenario === outcome.id ? null : outcome.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10,
                                        background: outcome.grade.includes('+') ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 800, fontSize: '0.9rem', color: outcome.grade.includes('+') ? '#34d399' : '#f59e0b',
                                    }}>{outcome.id}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{scenarioName(outcome)}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', gap: 12, marginTop: 2 }}>
                                            <span>{outcome.date}</span>
                                            <span>{cropLabel(outcome.crop)}</span>
                                            <span>{t('Treatment', '处理方案')}: {chemicalLabel(outcome.chemical)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.9rem' }}>CNY {outcome.revenueProtected.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{t('protected', '已保护')}</div>
                                    </div>
                                    <StatusBadge status={outcome.grade.includes('+') ? 'monitoring' : 'warning'} label={gradeLabel(outcome.grade)} />
                                    <Icon name="chevron-right" size={14} color="#475569" />
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expandedScenario === outcome.id && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(30,41,59,0.5)' }}>
                                    <div className="grid grid-4" style={{ gap: 8, marginBottom: 12 }}>
                                        {[
                                            { label: t('Risk Peak', '风险峰值'), value: `${outcome.riskPeak}/100`, color: '#ef4444' },
                                            { label: t('Risk Final', '最终风险'), value: `${outcome.riskFinal}/100`, color: '#34d399' },
                                            { label: t('Response', '响应时长'), value: `${outcome.responseMin} ${t('min', '分钟')}`, color: '#38bdf8' },
                                            { label: t('AI Accuracy', 'AI 准确率'), value: `${outcome.aiAccuracy}%`, color: '#a78bfa' },
                                        ].map((m, i) => (
                                            <div key={i} style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6, textAlign: 'center' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
                                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Risk journey bar */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(15,23,42,0.3)', borderRadius: 8 }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b', width: 50 }}>{t('Risk', '风险')}:</span>
                                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(15,23,42,0.5)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, height: '100%',
                                                width: `${outcome.riskPeak}%`, borderRadius: 4,
                                                background: 'linear-gradient(90deg, #34d399, #f59e0b, #ef4444)',
                                                opacity: 0.3,
                                            }} />
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, height: '100%',
                                                width: `${outcome.riskFinal}%`, borderRadius: 4,
                                                background: '#34d399',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, fontFamily: 'monospace', width: 70, textAlign: 'right' }}>{`${outcome.riskPeak}->${outcome.riskFinal}`}</span>
                                    </div>
                                    {outcome.loss && (
                                        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(239,68,68,0.06)', borderRadius: 6, fontSize: '0.7rem', color: '#f87171' }}>
                                            <Icon name="warning" size={10} color="#f59e0b" /> {t('Revenue loss', '收益损失')}: CNY {outcome.loss.toLocaleString()}  - {outcome.id === 'B' ? t('due to 6h operator delay', '因人工延迟 6 小时') : t('execution deviation', '执行偏差')}
                                        </div>
                                    )}
                                    {outcome.excessCost && (
                                        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(245,158,11,0.06)', borderRadius: 6, fontSize: '0.7rem', color: '#f59e0b' }}>
                                            <Icon name="warning" size={10} color="#f59e0b" /> {t('Excess cost', '额外成本')}: CNY {outcome.excessCost.toLocaleString()}  - {t('dosage deviation', '剂量偏差')} {outcome.id === 'C' ? '(0.7x->1.2x)' : ''}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Charts Grid 鈹佲攣鈹?*/}
            <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
                {/* AI Accuracy Trend */}
                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="reasoning" size={16} color="#38bdf8" /> {t('AI Decision Accuracy Over Time', 'AI 决策准确率趋势')}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={aiAccuracyTrend}>
                            <defs>
                                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis domain={[75, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => `${v}%`} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`${v}%`, t('Accuracy', '准确率')]} />
                            <Area type="monotone" dataKey="accuracy" stroke="#38bdf8" fill="url(#accGrad)" strokeWidth={2} dot={{ fill: '#38bdf8', r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#34d399', marginTop: 4 }}>
                        <Icon name="trending-up" size={10} color="#34d399" /> {t('+16% improvement over 6 months - model self-learning active', '6 个月提升 +16%，模型自学习持续生效')}
                    </div>
                </div>

                {/* Chemical Usage Trend */}
                <div className="card">
                    <h3 className="card-title">{t('Chemical Usage - Sentinel vs. Traditional (L/month)', '用药量对比｜Sentinel vs 传统（L/月）')}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chemicalUsageTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                            <Bar dataKey="traditional" fill="#475569" radius={[4, 4, 0, 0]} barSize={16} name={t('Traditional', '传统方案')} />
                            <Bar dataKey="sentinel" fill="#34d399" radius={[4, 4, 0, 0]} barSize={16} name="Sentinel" />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.7rem' }} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#34d399', marginTop: 4 }}>
                        <Icon name="leaf" size={10} color="#34d399" /> {t('Average 68% chemical reduction through precision targeting', '通过精准作业平均减少 68% 用药量')}
                    </div>
                </div>

                {/* Revenue Protected Cumulative */}
                <div className="card">
                    <h3 className="card-title">{t('Cumulative Revenue Protected (CNY)', '累计保护收入（CNY）')}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={revenueCumulative}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => `CNY ${(v / 1000).toFixed(0)}K`} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [`CNY ${v.toLocaleString()}`, '']} />
                            <Area type="monotone" dataKey="protected" stroke="#34d399" fill="url(#revGrad)" strokeWidth={2} name={t('Protected', '已保护')} />
                            <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="rgba(245,158,11,0.05)" strokeWidth={1.5} strokeDasharray="4 4" name={t('Cost', '成本')} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.7rem' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Response Time Distribution */}
                <div className="card">
                    <h3 className="card-title">{t('Response Time Distribution', '响应时间分布')}</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={responseTimeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32} name={t('Interventions', '干预次数')}>
                                {responseTimeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#38bdf8', marginTop: 4 }}>
                        <Icon name="bolt" size={10} color="#38bdf8" /> {t('69% of interventions responded to within 30 minutes', '69% 的干预在 30 分钟内响应')}
                    </div>
                </div>
            </div>

            {/* 鈹佲攣鈹?Decision Quality Matrix 鈹佲攣鈹?*/}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#a78bfa" /> {t('Decision Quality Matrix', '决策质量矩阵')}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', fontSize: '0.75rem' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}>ID</th>
                                <th>{t('Scenario', '场景')}</th>
                                <th>{t('Date', '日期')}</th>
                                <th>{t('Risk Peak', '风险峰值')}</th>
                                <th>{t('Risk Final', '最终风险')}</th>
                                <th>{t('Response', '响应')}</th>
                                <th>{t('AI Accuracy', 'AI 准确率')}</th>
                                <th>{t('Grade', '等级')}</th>
                                <th>ROI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scenarioOutcomes.map(o => (
                                <tr key={o.id}>
                                    <td style={{ fontWeight: 800, color: '#38bdf8' }}>{o.id}</td>
                                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{scenarioName(o)}</td>
                                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{o.date}</td>
                                    <td>
                                        <span style={{ color: o.riskPeak >= 80 ? '#ef4444' : o.riskPeak >= 70 ? '#f59e0b' : '#f97316', fontWeight: 700, fontFamily: 'monospace' }}>{o.riskPeak}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: o.riskFinal <= 30 ? '#34d399' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{o.riskFinal}</span>
                                    </td>
                                    <td>
                                        <span style={{ color: o.responseMin <= 30 ? '#34d399' : o.responseMin <= 60 ? '#f59e0b' : '#ef4444', fontFamily: 'monospace' }}>
                                            {o.responseMin >= 60 ? `${(o.responseMin / 60).toFixed(1)}h` : `${o.responseMin}m`}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.5)' }}>
                                                <div style={{ width: `${o.aiAccuracy}%`, height: '100%', borderRadius: 2, background: o.aiAccuracy >= 95 ? '#34d399' : '#38bdf8' }} />
                                            </div>
                                            <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{o.aiAccuracy}%</span>
                                        </div>
                                    </td>
                                    <td><StatusBadge status={o.grade.includes('+') ? 'monitoring' : 'warning'} label={gradeLabel(o.grade)} /></td>
                                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>{(o.revenueProtected / o.cost).toFixed(1)}x</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 鈹佲攣鈹?Compliance Record 鈹佲攣鈹?*/}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="audit-alt" size={16} color="#34d399" /> {t('Compliance & Regulatory Record', '合规与监管记录')}
                </h3>
                <div className="grid grid-3" style={{ gap: 10 }}>
                        {[
                        { label: t('PHI Compliance', 'PHI 合规率'), value: '100%', detail: t('6/6 interventions PHI-verified', '6/6 干预均通过 PHI 校验'), color: '#34d399', icon: 'check-circle' },
                        { label: t('Banned Substance', '禁限用物质'), value: t('CLEAR', '通过'), detail: t('Zero restricted chemicals used', '禁限用农药使用为 0'), color: '#34d399', icon: 'shield' },
                        { label: t('Label Rate', '标签剂量符合率'), value: '92%', detail: t('1 deviation (Scenario C: +71%)', '1 次偏差（场景 C：+71%）'), color: '#f59e0b', icon: 'clipboard' },
                        { label: t('Wind Safety', '风速安全'), value: '100%', detail: t('All drone ops within 3.0 m/s', '所有无人机作业均在 3.0 m/s 内'), color: '#34d399', icon: 'wind' },
                        { label: t('Audit Coverage', '审计覆盖率'), value: '100%', detail: t('All interventions fully audited', '所有干预均完成审计'), color: '#34d399', icon: 'clipboard' },
                        { label: 'GB 2763-2021', value: t('PASSED', '通过'), detail: t('MRL testing within limits', 'MRL 检测符合限值'), color: '#34d399', icon: 'building' },
                    ].map((c, i) => (
                        <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${c.color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name={c.icon} size={14} color={c.color} /> {c.label}</span>
                                <span style={{ fontWeight: 800, color: c.color, fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.value}</span>
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{c.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 鈹佲攣鈹?Decision Log 鈹佲攣鈹?*/}
            <div className="card">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="activity" size={16} color="#64748b" /> {t('Detailed Decision Log', '详细决策日志')}
                </h3>
                <div className="grid grid-2" style={{ gap: 12 }}>
                    <div className="scrollbar-themed" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {decisionEntries.map((d) => (
                            <button
                                key={d.id}
                                className="btn btn-secondary"
                                onClick={() => setSelectedDecisionId(d.id)}
                                style={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    border: selectedDecision?.id === d.id
                                        ? '1px solid rgba(56,189,248,0.35)'
                                        : '1px solid rgba(51,65,85,0.5)',
                                    background: 'rgba(15,23,42,0.45)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: 3,
                                }}
                            >
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.65rem' }}>
                                        {new Date(d.timestamp).toLocaleString(localeTag(locale), { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </span>
                                    <StatusBadge status={d.outcome === 'success' ? 'monitoring' : d.outcome === 'partial' ? 'warning' : d.outcome === 'no_action' ? 'low' : 'critical'} label={isZh ? (d.outcome === 'success' ? '成功' : d.outcome === 'partial' ? '部分完成' : d.outcome === 'no_action' ? '无需动作' : '失败') : d.outcome?.replace('_', ' ').toUpperCase()} />
                                </div>
                                <span style={{ fontSize: '0.71rem', color: '#e2e8f0', lineHeight: 1.3 }}>{decisionThreat(d)}</span>
                                <span style={{ fontSize: '0.63rem', color: '#94a3b8' }}>{decisionAction(d)}</span>
                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{d.field} | {t('Risk', '风险')} {d.riskScore ?? '--'}/100</span>
                            </button>
                        ))}
                    </div>
                    {selectedDecision && (
                        <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginBottom: 8 }}>
                                {new Date(selectedDecision.timestamp).toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <StatusBadge
                                    status={selectedDecision.outcome === 'success'
                                        ? 'monitoring'
                                        : selectedDecision.outcome === 'partial'
                                            ? 'warning'
                                            : selectedDecision.outcome === 'no_action'
                                                ? 'low'
                                                : 'critical'}
                                    label={isZh ? (selectedDecision.outcome === 'success' ? '成功' : selectedDecision.outcome === 'partial' ? '部分完成' : selectedDecision.outcome === 'no_action' ? '无需动作' : '失败') : selectedDecision.outcome?.replace('_', ' ').toUpperCase()}
                                />
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{decisionThreat(selectedDecision)}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>{t('Action', '动作')}: {decisionAction(selectedDecision)}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>{t('Field', '地块')}: {selectedDecision.field}</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>{t('Risk Score', '风险分值')}: {selectedDecision.riskScore ?? '--'}/100</div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                {t('Approval', '审批')}: {decisionApprover(selectedDecision)} ({decisionApprovalType(selectedDecision)})
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                {t('Prescription/Execution/Audit', '处方/执行/审计')}: {selectedDecision.prescriptionId || '--'} | {selectedDecision.executionId || '--'} | {selectedDecision.auditId || '--'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#34d399', fontFamily: 'monospace', marginTop: 8 }}>
                                {t('Savings', '节省')}: CNY {(selectedDecision.savingsYuan || selectedDecision.savings || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontFamily: 'monospace', marginTop: 4 }}>
                                {t('Cost', '成本')}: CNY {(selectedDecision.costYuan || 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.45, marginTop: 8 }}>
                                {decisionNote(selectedDecision)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}





