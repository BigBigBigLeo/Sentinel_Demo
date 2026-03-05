import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
} from 'recharts';
import useStore from '../engine/store';
import RiskGauge from '../components/RiskGauge';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { previousActions, sensorThresholds } from '../data/mockData';
import { pick, localeTag } from '../i18n/locale.js';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const riskBand = (score) => (score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low');

export default function RiskAssessment() {
    const navigate = useNavigate();
    const {
        riskResults,
        revenueAtRisk,
        currentSnapshot,
        fields,
        activeFieldId,
        activeScenario,
        simulationData,
        currentDay,
        locale,
    } = useStore();

    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const field = fields[activeFieldId];
    const sensors = currentSnapshot?.sensors || {};
    const pests = currentSnapshot?.pests || {};
    const actions = previousActions[activeFieldId] || {};

    const safeRiskResults = Array.isArray(riskResults)
        ? riskResults.filter(item => item && typeof item === 'object')
        : [];

    const [report, setReport] = useState(null);
    const reportRef = useRef(null);

    const now = new Date().toLocaleString(localeTag(locale), {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const topRisk = safeRiskResults[0];
    const topRiskName = topRisk
        ? (isZh ? (topRisk.nameZh || topRisk.name) : (topRisk.name || topRisk.nameZh))
        : t('None', '无');

    const chartData = safeRiskResults.map((r) => {
        const rawName = isZh
            ? String(r?.nameZh || r?.name || r?.threatId || '未知威胁')
            : String(r?.name || r?.nameZh || r?.threatId || 'Unknown Threat');
        const score = Number.isFinite(Number(r?.score)) ? Number(r.score) : 0;
        return {
            name: rawName.length > 14 ? `${rawName.slice(0, 12)}...` : rawName,
            score,
            color: score >= 70 ? '#ef4444' : score >= 50 ? '#f59e0b' : score >= 30 ? '#3dabf5' : '#10b981',
        };
    });

    const evidence = useMemo(() => {
        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        return [
            {
                title: t('Humidity Pressure', '湿度压力'),
                value: `${Number(sensors.humidity_pct || 0).toFixed(1)}%`,
                detail: t(`Threshold ${sensorThresholds.humidity?.max || 85}%`, `阈值 ${sensorThresholds.humidity?.max || 85}%`),
                impact: Number(sensors.humidity_pct || 0) > (sensorThresholds.humidity?.max || 85) ? 'high' : 'medium',
            },
            {
                title: t('Leaf Wetness', '叶面湿润'),
                value: `${num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs).toFixed(1)}h`,
                detail: t(`Threshold ${sensorThresholds.leafWetness?.max || 3}h`, `阈值 ${sensorThresholds.leafWetness?.max || 3}h`),
                impact: num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs) > (sensorThresholds.leafWetness?.max || 3) ? 'high' : 'low',
            },
            {
                title: t('Pest Trap Counts', '虫情诱捕数量'),
                value: `${Number(pests.sticky_trap_daily || pests.aphids_per_leaf || 0).toFixed(1)}`,
                detail: t('Daily trap and leaf checks', '每日诱捕与叶片巡检'),
                impact: Number(pests.sticky_trap_daily || 0) > 12 ? 'high' : 'medium',
            },
            {
                title: t('Growth Stage', '生长阶段'),
                value: isZh
                    ? (currentSnapshot?.stageNameZh || currentSnapshot?.stageName || '未知')
                    : (currentSnapshot?.stageName || 'Unknown'),
                detail: t('Stage-sensitive threat response', '阶段敏感型威胁响应'),
                impact: 'medium',
            },
            {
                title: t('Days To Harvest', '距采收天数'),
                value: `${daysToHarvest}d`,
                detail: daysToHarvest < 14
                    ? t('PHI constraints likely active', 'PHI 约束可能生效')
                    : t('PHI constraints manageable', 'PHI 约束可控'),
                impact: daysToHarvest < 14 ? 'high' : 'medium',
            },
            {
                title: t('Recent Spray', '最近喷施'),
                value: actions.last_spray || t('No recent spray', '暂无最近喷施'),
                detail: t(`Chemical: ${actions.last_spray_chemical || 'N/A'}`, `药剂：${actions.last_spray_chemical || 'N/A'}`),
                impact: 'low',
            },
        ];
    }, [
        activeScenario?.daysToHarvest,
        actions.last_spray,
        actions.last_spray_chemical,
        currentSnapshot?.stageName,
        currentSnapshot?.stageNameZh,
        isZh,
        pests.aphids_per_leaf,
        pests.sticky_trap_daily,
        sensors.humidity_pct,
        sensors.leaf_wetness_h,
        sensors.leaf_wetness_hrs,
        t,
    ]);

    const fieldData = simulationData[activeFieldId] || [];
    const riskTrend = useMemo(() => {
        const slice = fieldData.slice(Math.max(0, currentDay - 7), currentDay);
        return slice.map((d, i) => {
            const jitter = (Math.random() * 2 - 1);
            return {
                day: `D${d?.day || i + 1}`,
                botrytis: clamp((d?.threats?.grayMold?.score ?? 10) + jitter),
                anthracnose: clamp((d?.threats?.anthracnose?.score ?? 8) + jitter),
                aphids: clamp((d?.threats?.aphids?.score ?? 6) + jitter),
            };
        });
    }, [fieldData, currentDay]);

    const generateRiskReport = () => {
        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        const humidity = num(sensors.humidity_pct);
        const humidityTh = num(sensorThresholds.humidity?.max, 85);
        const leafWetness = num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs);
        const leafWetnessTh = num(sensorThresholds.leafWetness?.max, 3);
        const trapCount = num(pests.sticky_trap_daily ?? pests.aphids_per_leaf);
        const trapTh = 12;

        const fallbackCompositeScore = clamp(
            8
            + Math.max(0, (humidity - humidityTh) * 1.2)
            + Math.max(0, (leafWetness - leafWetnessTh) * 9)
            + Math.max(0, (trapCount - trapTh) * 1.6)
            + (daysToHarvest < 14 ? 4 : 0),
        );

        const threats = safeRiskResults.length > 0
            ? safeRiskResults
                .map(item => ({
                    name: isZh
                        ? (item.nameZh || item.name || item.threatId || '未知威胁')
                        : (item.name || item.nameZh || item.threatId || 'Unknown threat'),
                    score: num(item.score),
                    trend: item.trend || 'stable',
                    status: item.status || riskBand(num(item.score)),
                    factors: Array.isArray(item.factors) ? item.factors : [],
                }))
                .sort((a, b) => b.score - a.score)
            : [{
                name: t('Composite Environmental Risk', '综合环境风险'),
                score: fallbackCompositeScore,
                trend: fallbackCompositeScore >= 30 ? 'rising' : 'stable',
                status: riskBand(fallbackCompositeScore),
                factors: [
                    t('No explicit threat vector exceeded calibrated model thresholds.', '未发现超过模型阈值的单一威胁向量。'),
                    t('Composite score synthesized from humidity, leaf wetness, pest trap, and harvest window.', '综合分值由湿度、叶面湿润、虫情诱捕和采收窗口共同计算。'),
                ],
            }];

        const primary = threats[0];
        const highSignals = evidence.filter(item => item.impact === 'high').map(item => item.title);
        const mediumSignals = evidence.filter(item => item.impact === 'medium').map(item => item.title);

        const reasoningTrail = [
            ...threats.slice(0, 3).map(item => {
                const factorText = item.factors?.length
                    ? item.factors.join(' | ')
                    : t('No critical rule violations; background pressure only.', '未触发关键规则违例，仅存在背景压力。');
                return `${item.name}: ${item.score}/100 (${item.status}, ${item.trend}). ${t('Evidence', '证据')}: ${factorText}`;
            }),
            isZh
                ? `遥测汇总：湿度 ${humidity.toFixed(1)}%（阈值 ${humidityTh}%）；叶面湿润 ${leafWetness.toFixed(1)}h（阈值 ${leafWetnessTh}h）；虫情诱捕 ${trapCount.toFixed(1)}（阈值 ${trapTh}）。`
                : `Telemetry synthesis: humidity ${humidity.toFixed(1)}% vs ${humidityTh}% threshold; leaf wetness ${leafWetness.toFixed(1)}h vs ${leafWetnessTh}h; pest trap ${trapCount.toFixed(1)} vs ${trapTh}.`,
            isZh
                ? `经济上下文：当前风险收入 ${revenueAtRisk ? `CNY ${Number(revenueAtRisk.total || 0).toLocaleString()}` : 'CNY 0'}。`
                : `Economic context: revenue-at-risk ${revenueAtRisk ? `CNY ${Number(revenueAtRisk.total || 0).toLocaleString()}` : 'CNY 0'} at current state.`,
            activeScenario
                ? (isZh
                    ? `场景上下文：${activeScenario.id} - ${activeScenario.nameZh || activeScenario.name}；距采收 ${daysToHarvest} 天。`
                    : `Scenario context: ${activeScenario.id} - ${activeScenario.name}; days-to-harvest ${daysToHarvest}.`)
                : (isZh
                    ? `运行模式：实时遥测（无激活脚本场景）。基准距采收 ${daysToHarvest} 天。`
                    : `Operating mode: live telemetry (no active scripted scenario). Days-to-harvest baseline ${daysToHarvest}.`),
            isZh
                ? `作业上下文：最近喷施 ${actions.last_spray || '未记录'}；药剂 ${actions.last_spray_chemical || 'N/A'}。`
                : `Operational context: last spray ${actions.last_spray || 'not recorded'}; material ${actions.last_spray_chemical || 'N/A'}.`,
        ];

        const conclusion = primary.score >= 70
            ? t('Critical risk. Immediate response and approval workflow required before execution window closes.', '高危风险。执行窗口关闭前需要立即响应并触发审批流程。')
            : primary.score >= 50
                ? t('Elevated risk. Prepare targeted intervention and execute within 6-24 hours.', '风险升高。建议准备靶向干预，并在 6-24 小时内执行。')
                : primary.score >= 30
                    ? t('Moderate risk. Continue enhanced monitoring and pre-stage preventive actions.', '中等风险。继续增强监测，并预置预防动作。')
                    : t('Low risk. No immediate intervention required; maintain baseline monitoring and scheduled inspections.', '低风险。当前无需立即干预，保持基线监测与例行巡检。');

        setReport({
            generatedAt: new Date().toISOString(),
            field: isZh ? (field?.nameZh || field?.name) : field?.name,
            crop: field?.crop,
            scenarioContext: activeScenario
                ? `${activeScenario.id} - ${isZh ? (activeScenario.nameZh || activeScenario.name) : activeScenario.name}`
                : t('Live telemetry mode', '实时遥测模式'),
            topThreat: primary.name,
            topScore: primary.score,
            status: primary.status,
            keySignals: [...highSignals, ...mediumSignals].slice(0, 8),
            riskWindow: primary.score >= 70 ? '0-6h' : primary.score >= 50 ? '6-24h' : primary.score >= 30 ? '24-72h' : '72h+',
            threatMatrix: threats.slice(0, 5),
            dataCoverage: evidence.map(item => ({
                source: item.title,
                value: item.value,
                detail: item.detail,
                influence: item.impact,
            })),
            rationale: reasoningTrail,
            conclusion,
            phiNote: daysToHarvest < 14
                ? t('Short harvest window - verify PHI before chemical actions.', '采收窗口较短，化学干预前请确认 PHI 合规。')
                : t('Harvest window supports standard PHI plans.', '采收窗口允许采用标准 PHI 方案。'),
            recommendationSummary: primary.score >= 70
                ? t('Prepare immediate intervention package and approval routing.', '建议立即准备干预方案并进入审批路由。')
                : primary.score >= 50
                    ? t('Prepare targeted intervention package and validate execution constraints.', '建议准备靶向干预方案并校验执行约束。')
                    : primary.score >= 30
                        ? t('Increase monitoring cadence and keep preventive package ready.', '建议提高监测频率并预备预防方案。')
                        : t('Continue routine monitoring with no intervention dispatch.', '建议继续例行监测，当前不下发干预。'),
        });
    };

    useEffect(() => {
        if (report && reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [report]);

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="risk" size={22} color="#f59e0b" />
                        {t('Risk Assessment Engine', '风险评估引擎')}
                    </h1>
                    <p className="page-subtitle">{t('Stage 3: AI Reasoning', '阶段 3：AI 推理')} | {isZh ? (field?.nameZh || field?.name) : field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={generateRiskReport}>
                        {t('Generate Risk Report', '生成风险报告')}
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/prescription')}>
                        {t('Open Prescription Builder', '打开处方构建器')}
                    </button>
                </div>
            </div>

            <div className="grid grid-3">
                <MetricCard label={t('Highest Threat', '最高威胁')} value={topRisk?.score || 0} unit="/100" status={topRisk?.status || 'low'} subtitle={topRiskName} icon="alert-triangle" />
                <MetricCard
                    label={t('Revenue at Risk', '风险收入')}
                    value={revenueAtRisk ? `CNY ${(revenueAtRisk.total / 1000).toFixed(1)}k` : 'CNY 0'}
                    status={revenueAtRisk?.total > 30000 ? 'critical' : revenueAtRisk?.total > 10000 ? 'elevated' : 'low'}
                    subtitle={revenueAtRisk
                        ? (isZh
                            ? `等级 ${revenueAtRisk.currentGrade} | 降级概率 ${revenueAtRisk.downgradeProbability}%`
                            : `Grade ${revenueAtRisk.currentGrade} | ${revenueAtRisk.downgradeProbability}% downgrade probability`)
                        : '--'}
                    icon="money"
                />
                <MetricCard
                    label={t('Decision Window', '决策窗口')}
                    value={activeScenario ? `${activeScenario.daysToHarvest}d` : '30d'}
                    subtitle={t('to harvest', '距采收')}
                    status={activeScenario?.daysToHarvest < 7 ? 'critical' : 'low'}
                    icon="clock"
                />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="layers" size={16} color="#38bdf8" />
                    {t('Multimodal Evidence Board', '多模态证据面板')}
                </h3>
                <div className="evidence-board">
                    {evidence.map((e, i) => (
                        <div key={i} className={`evidence-card ${e.impact}`}>
                            <div className="evidence-source">{e.title}</div>
                            <div className="evidence-value">{e.value}</div>
                            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{e.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{t('Threat Assessment - Risk Gauges', '威胁评估｜风险仪表')}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', padding: '16px 0' }}>
                    {safeRiskResults.map((r, idx) => (
                        <div key={r.threatId || `${r.name || 'risk'}-${idx}`} style={{ textAlign: 'center' }}>
                            <RiskGauge score={Number(r?.score || 0)} size={110} threat={isZh ? (r?.nameZh || r?.name || r?.threatId || '未知威胁') : (r?.name || r?.nameZh || r?.threatId || 'Unknown Threat')} />
                            <div style={{ marginTop: 4 }}>
                                <StatusBadge status={r?.status || 'low'} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>{t('Trend', '趋势')}: {r?.trend || t('stable', '稳定')}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{t('Risk Score Comparison', '风险分值对比')}</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} layout="vertical">
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
                        <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {riskTrend.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">{t('7-Day Risk Trend', '7天风险趋势')}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={riskTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Line type="monotone" dataKey="botrytis" stroke="#ef4444" dot={false} name={t('Gray Mold', '灰霉病')} />
                            <Line type="monotone" dataKey="anthracnose" stroke="#f59e0b" dot={false} name={t('Anthracnose', '炭疽病')} />
                            <Line type="monotone" dataKey="aphids" stroke="#34d399" dot={false} name={t('Aphids', '蚜虫')} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {report && (
                <div ref={reportRef} className="card" style={{ marginTop: 16, borderLeft: '3px solid #38bdf8', background: 'rgba(56,189,248,0.05)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="report" size={16} color="#38bdf8" />
                        {t('Risk Assessment Report', '风险评估报告')}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 12 }}>
                        <div className="mesh-metric"><span>{t('Generated', '生成时间')}</span><strong>{new Date(report.generatedAt).toLocaleString(localeTag(locale))}</strong></div>
                        <div className="mesh-metric"><span>{t('Top Threat', '首要威胁')}</span><strong>{report.topThreat} ({report.topScore}/100)</strong></div>
                        <div className="mesh-metric"><span>{t('Risk Window', '风险窗口')}</span><strong>{report.riskWindow}</strong></div>
                        <div className="mesh-metric"><span>{t('Field/Crop', '地块/作物')}</span><strong>{report.field} / {report.crop}</strong></div>
                        <div className="mesh-metric"><span>{t('Scenario/Mode', '场景/模式')}</span><strong>{report.scenarioContext}</strong></div>
                        <div className="mesh-metric"><span>{t('Conclusion', '结论')}</span><strong>{isZh ? report.status : report.status?.toUpperCase()}</strong></div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>{t('Key Signals', '关键信号')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {report.keySignals.length > 0 ? report.keySignals.map(item => (
                            <span key={item} className="mesh-chip">{item}</span>
                        )) : <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('No high-severity evidence signals detected.', '未检测到高严重度证据信号。')}</span>}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>{t('Data Considered', '纳入数据')}</div>
                    <div className="scrollbar-themed" style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6, marginBottom: 12 }}>
                        {(report.dataCoverage || []).map((entry) => (
                            <div key={entry.source} style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '6px 8px', borderRadius: 8, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(51,65,85,0.45)' }}>
                                <strong style={{ color: '#e2e8f0' }}>{entry.source}:</strong> {entry.value} | {entry.detail} | {t('influence', '影响')} {entry.influence}
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: 6, fontWeight: 700 }}>{t('Reasoning Trail', '推理链路')}</div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: '0.74rem', lineHeight: 1.6 }}>
                        {(report.rationale || []).map((line, idx) => <li key={idx}>{line}</li>)}
                    </ul>

                    <div style={{ fontSize: '0.75rem', color: '#93c5fd', margin: '10px 0 6px', fontWeight: 700 }}>{t('Threat Matrix', '威胁矩阵')}</div>
                    <div className="scrollbar-themed" style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6 }}>
                        {(report.threatMatrix || []).map((item) => (
                            <div key={item.name} style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '6px 8px', borderRadius: 8, background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(51,65,85,0.45)' }}>
                                <strong style={{ color: '#e2e8f0' }}>{item.name}</strong> - {item.score}/100 ({item.status}, {item.trend})
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 10, fontSize: '0.74rem', color: '#94a3b8' }}>{report.phiNote}</div>
                    <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#38bdf8', fontWeight: 700 }}>{t('Conclusion', '结论')}: {report.conclusion}</div>
                    <div style={{ marginTop: 6, fontSize: '0.76rem', color: '#e2e8f0', fontWeight: 600 }}>{report.recommendationSummary}</div>
                </div>
            )}
        </div>
    );
}
