import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, ReferenceArea } from 'recharts';
import useStore from '../engine/store';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import RiskGauge from '../components/RiskGauge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import DataIngestionPanel from '../components/DataIngestionPanel';
import FinancialKPI from '../components/FinancialKPI';
import MultimodalGallery from '../components/MultimodalGallery';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import AIAgentPanel from '../components/AIAgentPanel';
import SystemActivityRail from '../components/SystemActivityRail';
import { sensorTimeSeries, sensorForecasts, trendAlerts, aiWatchdog, seasonFinancials, currentSensors, sensorThresholds, zoneIntervals } from '../data/mockData';
import { pick, localeTag } from '../i18n/locale.js';

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        currentSnapshot, riskResults, revenueAtRisk, fields, activeFieldId,
        prescriptions, auditRecords, activeScenario, simulationData,
        thinkingChain, isThinking, thinkingContext, startRiskThinking, stopThinking,
        autonomousState, agentAssignments, operatorAlerts, approvalQueue, autonomousMode,
        startActionRequiredFlow, activeExecution,
        isIterating, iterationRound, iterationStage,
        currentDay,
        locale,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const riskLabel = (risk) => (isZh ? (risk?.nameZh || risk?.name) : (risk?.name || risk?.nameZh));
    const localizeDynamic = (value) => {
        if (!isZh || !value) return value;
        let text = String(value);
        const phraseMap = [
            ['ANOMALY - ', '异常：'],
            ['OK - All sensors within thresholds', '正常：全部传感器在阈值内'],
            ['trend breach predicted', '趋势预计越界'],
            ['Greenhouse A2 humidity critical', 'A2 温室湿度达到高危区'],
            ['Leaf wetness duration approaching limit', '叶面湿润时长接近上限'],
            ['No action required', '无需处置'],
            ['ACTION REQUIRED', '需要处理'],
            ['risk score', '风险分值'],
            ['threshold', '阈值'],
        ];
        phraseMap.forEach(([en, zh]) => {
            text = text.split(en).join(zh);
        });
        const tokenMap = [
            ['Humidity', '湿度'],
            ['Temperature', '温度'],
            ['Leaf Wetness', '叶面湿润'],
            ['Soil Moisture', '土壤含水率'],
            ['Wind Speed', '风速'],
            ['Prediction', '预测'],
            ['Recommended', '建议'],
            ['Gray Mold', '灰霉病'],
            ['Botrytis', '灰霉病原'],
            ['critical', '高危'],
            ['warning', '告警'],
            ['resolved', '已恢复'],
            ['monitoring', '监测中'],
        ];
        tokenMap.forEach(([en, zh]) => {
            text = text.replace(new RegExp(en, 'gi'), zh);
        });
        return text;
    };
    const field = fields[activeFieldId];
    const topRisk = riskResults.reduce((max, r) => r.score > (max?.score || 0) ? r : max, null);

    const fieldId = activeFieldId || 'BS-B3';
    const sensors = currentSnapshot?.sensors || currentSensors[fieldId] || {};
    const timeSeries = sensorTimeSeries[fieldId] || {};
    const forecasts = sensorForecasts[fieldId] || {};
    const alerts = trendAlerts[fieldId] || [];
    const financials = seasonFinancials[fieldId];
    const activeAlerts = alerts.filter(a => a.status === 'active');
    const latestOperatorAlert = operatorAlerts.length ? operatorAlerts[operatorAlerts.length - 1] : null;
    const latestCycleId = agentAssignments.length ? agentAssignments[agentAssignments.length - 1].cycleId : null;
    const latestCycleTasks = latestCycleId ? agentAssignments.filter(a => a.cycleId === latestCycleId) : [];

    const fieldData = simulationData[activeFieldId] || [];
    const riskTrend = React.useMemo(() => {
        // Take 30 days up to currentDay
        const slice = fieldData.slice(Math.max(0, currentDay - 30), currentDay);
        return slice.map((d, i) => {
            const jitter = (Math.random() * 2 - 1);
            return {
                day: d.day,
                grayMold: Math.max(0, (d.threats?.grayMold?.score || 5) + jitter),
                anthracnose: Math.max(0, (d.threats?.anthracnose?.score || 5) + jitter),
                aphids: Math.max(0, (d.threats?.aphids?.score || 5) + jitter),
            };
        });
    }, [fieldData, currentDay]);

    const handleRunAnalysis = () => {
        startRiskThinking();
        setTimeout(() => {
            aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    const handleActionRequired = () => {
        startActionRequiredFlow();
        setTimeout(() => navigate('/execution'), 1400);
    };

    const aiRef = useRef(null);

    // Sensor display config
    const sensorCards = [
        { key: 'temperature', label: 'Temperature', labelZh: '温度', value: sensors.temp_C, unit: '°C', threshold: sensorThresholds.temperature, trend: 'stable' },
        { key: 'humidity', label: 'Humidity', labelZh: '湿度', value: sensors.humidity_pct, unit: '%', threshold: sensorThresholds.humidity, trend: 'rising' },
        { key: 'soilMoisture', label: 'Soil Moisture', labelZh: '土壤含水率', value: sensors.soil_moist_pct, unit: '%', threshold: sensorThresholds.soilMoisture, trend: 'stable' },
        { key: 'leafWetness', label: 'Leaf Wetness', labelZh: '叶面湿润', value: sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 2.62, unit: 'h', threshold: sensorThresholds.leafWetness, trend: 'rising' },
        { key: 'wind', label: 'Wind Speed', labelZh: '风速', value: sensors.wind_speed_ms, unit: 'm/s', threshold: sensorThresholds.wind, trend: 'stable' },
        { key: 'light', label: 'Light', labelZh: '光照', value: sensors.light_Lux, unit: 'Lux', threshold: sensorThresholds.light, trend: 'falling' },
    ];

    const formatNow = () => new Date().toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const isActionRequired = (topRisk?.score || 0) >= 70 && !activeExecution?.comparisonReport;

    return (
        <div className="page dashboard-page">
            <PipelineBreadcrumb />
            <div className="dashboard-layout">
                <section className="dashboard-main-column">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Icon name="dashboard" size={22} color="#38bdf8" />
                                {t('Mission Control', '指挥中心')}
                            </h1>
                            <p className="page-subtitle">
                                {(locale === 'zh' ? (field?.nameZh || field?.name) : field?.name)} | {t('Stage', '阶段')}: {locale === 'zh' ? (currentSnapshot?.stageNameZh || currentSnapshot?.stageName || '--') : (currentSnapshot?.stageName || '--')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary" onClick={handleRunAnalysis} disabled={isThinking} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="reasoning" size={14} /> {t('Run AI Analysis', '运行 AI 分析')}
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/prescription')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {t('Generate Rx', '生成处方')} <Icon name="chevron-right" size={14} />
                            </button>
                        </div>
                    </div>

                    {/* AI Watchdog Status Bar */}
                    <div className="ai-watchdog-bar">
                        <div className="watchdog-dot" />
                        <span className="watchdog-label">{t('AI Monitoring: Active 24x7', 'AI 监控：7x24 在线')}</span>
                        <div className="watchdog-divider" />
                        <span className="watchdog-stat">{t('Last scan', '最近扫描')}: <strong>{new Date(aiWatchdog.lastScan).toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</strong></span>
                        <div className="watchdog-divider" />
                        <span className="watchdog-stat">{t('Scans today', '今日扫描')}: <strong>{aiWatchdog.totalScansToday.toLocaleString(localeTag(locale))}</strong></span>
                        <div className="watchdog-divider" />
                        <span className="watchdog-stat">{t('Anomalies', '异常')}: <strong style={{ color: aiWatchdog.anomaliesDetected > 0 ? '#f59e0b' : '#34d399' }}>{aiWatchdog.anomaliesDetected}</strong></span>
                        <div className="watchdog-divider" />
                        <span className="watchdog-stat">{t('Proactive alerts', '主动告警')}: <strong style={{ color: '#38bdf8' }}>{aiWatchdog.proactiveAlerts}</strong></span>
                        <div className="watchdog-divider" />
                        <span className="watchdog-stat">{t('Uptime', '运行时长')}: <strong>{aiWatchdog.uptime}</strong></span>
                        <div style={{ flex: 1 }} />
                        <span className="watchdog-stat" style={{ color: '#475569' }}>{aiWatchdog.modelVersion}</span>
                    </div>

                    {/* Financial KPIs  - Compact */}
                    {financials && <FinancialKPI financials={financials} compact />}

                    <div className="grid grid-4" style={{ marginTop: 10 }}>
                        <MetricCard
                            label={t('Autonomous Cycles', '自治循环')}
                            value={autonomousState?.cycleCount || 0}
                            subtitle={`${autonomousMode ? t('Running', '运行中') : t('Paused', '已暂停')} | ${autonomousState?.lowRiskCycles || 0} ${t('low-risk loops', '低风险轮次')}`}
                            icon="activity"
                        />
                        <MetricCard
                            label={t('Auto Executions', '自动执行')}
                            value={autonomousState?.autoExecutions || 0}
                            subtitle={`${autonomousState?.auditsGenerated || 0} ${t('audits generated', '份审计已生成')}`}
                            icon="play"
                        />
                        <MetricCard
                            label={t('Escalations', '升级次数')}
                            value={autonomousState?.escalations || 0}
                            subtitle={`${approvalQueue?.length || 0} ${t('pending approvals', '待审批')}`}
                            status={(approvalQueue?.length || 0) > 0 ? 'warning' : 'low'}
                            icon="warning"
                        />
                        <MetricCard
                            label={t('Task Cells / Cycle', '每轮任务单元')}
                            value={latestCycleTasks.length}
                            subtitle={`${latestCycleTasks.reduce((sum, task) => sum + (task.members?.length || 0), 0)} ${t('agent assignments', '代理分配')}`}
                            icon="users"
                        />
                    </div>

                    {/* Structural Revenue Leakage (SRL) Insight - Video Highlight */}
                    <div className="card" style={{
                        marginTop: 10,
                        borderLeft: `4px solid ${revenueAtRisk?.total > 0 ? '#ef4444' : '#10b981'}`,
                        background: revenueAtRisk?.total > 0
                            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.05), transparent)'
                            : 'linear-gradient(90deg, rgba(16, 185, 129, 0.05), transparent)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    color: revenueAtRisk?.total > 0 ? '#fca5a5' : '#6ee7b7',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1
                                }}>
                                    {revenueAtRisk?.total > 0 ? t('Decision Vacuum Risk (SRL)', '决策真空风险（SRL）') : t('Decision Vacuum Closed', '决策真空已闭环')}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', margin: '4px 0', color: '#fee2e2' }}>
                                    {revenueAtRisk?.total > 0
                                        ? t(`Structural Revenue Leakage: CNY ${(revenueAtRisk.total * 0.42).toLocaleString()}`, `结构性收入流失：CNY ${(revenueAtRisk.total * 0.42).toLocaleString()}`)
                                        : t('SRL Risk Mitigated: Sentinel Active', 'SRL 风险已缓解：Sentinel 在线')
                                    }
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '80%' }}>
                                    {revenueAtRisk?.total > 0
                                        ? t('High-value crops suffer from \"invisible\" profit loss due to delayed decision cycles. Sentinel AI transforms this uncertainty into deterministic profit.', '高价值作物常因决策滞后产生“隐形利润流失”。Sentinel AI 将这种不确定性转化为可预测利润。')
                                        : t(`Sentinel's autonomous reasoning has closed the 12-hour decision gap, protecting CNY ${(field.estimatedVolume * 45).toLocaleString()} in potential premium value.`, `Sentinel 自主推理已闭合 12 小时决策空窗，预计保护溢价价值 CNY ${(field.estimatedVolume * 45).toLocaleString()}。`)
                                    }
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.4rem',
                                    fontWeight: 800,
                                    color: revenueAtRisk?.total > 0 ? '#ef4444' : '#10b981'
                                }}>
                                    {revenueAtRisk?.total > 0
                                        ? `-${(revenueAtRisk.downgradeProbability * 0.42).toFixed(1)}%`
                                        : t('OPTIMIZED', '已优化')
                                    }
                                </div>
                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                    {revenueAtRisk?.total > 0 ? t('Projected Margin Leak', '预计利润流失') : t('Grade A Quality Protected', 'A级品质已保护')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {latestOperatorAlert && (
                        <div className="alert-banner alert-warning" style={{ marginTop: 10 }}>
                            <div className="alert-content">
                                <span className="alert-icon"><Icon name="warning" size={22} /></span>
                                <div>
                                    <div className="alert-title">{t('ACTION REQUIRED', '需要处理')}</div>
                                    <div className="alert-body">{localizeDynamic(latestOperatorAlert.message)}</div>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={handleActionRequired}>
                                {t('Start AI Response', '启动 AI 响应')} <Icon name="arrow-right" size={14} />
                            </button>
                        </div>
                    )}

                    {isActionRequired && !latestOperatorAlert && (
                        <div className="alert-banner alert-critical" style={{ marginTop: 10 }}>
                            <div className="alert-content">
                                <span className="alert-icon"><Icon name="warning" size={22} /></span>
                                <div>
                                    <div className="alert-title">{t('ACTION REQUIRED', '需要处理')}</div>
                                    <div className="alert-body">
                                        {isZh
                                            ? `${topRisk?.nameZh || topRisk?.name} 达到 ${topRisk?.score}/100，需要启动引导式响应流程。`
                                            : `${topRisk?.name} at ${topRisk?.score}/100 requires guided response workflow.`}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={handleActionRequired}>
                                {t('Start AI Response', '启动 AI 响应')} <Icon name="arrow-right" size={14} />
                            </button>
                        </div>
                    )}

                    <AIAgentPanel />

                    {/* Trend Alerts (Proactive) */}
                    {activeAlerts.length > 0 && (
                        <div className="trend-alerts">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className={`trend-alert-card severity-${alert.severity}`}>
                                    <div className="trend-alert-header">
                                        <div className="trend-alert-title">
                                            <Icon name={alert.icon} size={16} />
                                            {isZh ? (alert.titleZh || localizeDynamic(alert.title)) : alert.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="timestamp-label">{new Date(alert.timestamp).toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                            <StatusBadge status={alert.severity} />
                                        </div>
                                    </div>
                                    <div className="trend-alert-detail">{isZh ? (alert.detailZh || localizeDynamic(alert.detail)) : alert.detail}</div>
                                    <div className="trend-alert-prediction" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Icon name="activity" size={11} color="#38bdf8" />
                                        {t('Prediction', '预测')}: {isZh ? (alert.predictionZh || localizeDynamic(alert.prediction)) : alert.prediction}
                                    </div>
                                    <div className="trend-alert-action">
                                        <Icon name="play" size={10} />
                                        {t('Recommended', '建议动作')}: {isZh ? (alert.recommendedZh || localizeDynamic(alert.recommended)) : alert.recommended}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Live Environment Strip  - Sensor Sparkline Cards */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 16 }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('Live Environment - Real-Time Sensors', '实时环境｜传感器看板')}</h3>
                        <span className="section-timestamp">{t('Updated', '更新时间')}: {formatNow()}</span>
                    </div>
                    <div className="sensor-grid">
                        {sensorCards.map(s => {
                            const series = timeSeries[s.key];
                            const forecast = forecasts[s.key];
                            const isAboveMax = s.threshold && s.value > s.threshold.max;
                            const chartData = series ? [...series.slice(-12).map(d => ({ time: d.time, actual: d.value })), ...(forecast ? forecast.slice(0, 6).map(d => ({ time: d.time, forecast: d.value })) : [])] : [];

                            return (
                                <div key={s.key} className="sensor-sparkline-card" style={{ borderLeftColor: isAboveMax ? '#ef4444' : undefined, borderLeft: isAboveMax ? '3px solid #ef4444' : undefined }} onClick={() => navigate('/sensors')}>
                                    <div className="sensor-card-header">
                                        <div>
                                            <div className="sensor-card-name">{isZh ? (s.labelZh || s.label) : s.label}</div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                                <span className="sensor-card-reading" style={{ color: isAboveMax ? '#ef4444' : undefined }}>{s.key === 'light' ? `${(s.value / 1000).toFixed(1)}k` : s.value}</span>
                                                <span className="sensor-card-unit">{s.unit}</span>
                                            </div>
                                        </div>
                                        <span className={`sensor-card-trend ${s.trend}`}>
                                            {s.trend === 'rising' ? '↑' : s.trend === 'falling' ? '↓' : '→'} {t(s.trend, s.trend === 'rising' ? '上升' : s.trend === 'falling' ? '下降' : '稳定')}
                                        </span>
                                    </div>
                                    {chartData.length > 0 && (
                                        <ResponsiveContainer width="100%" height={50}>
                                            <LineChart data={chartData}>
                                                {(() => {
                                                    const zi = zoneIntervals[s.key]; return zi ? <>
                                                        {zi.normal && <ReferenceArea y1={zi.normal[0]} y2={zi.normal[1]} fill="#34d399" fillOpacity={0.06} />}
                                                        {zi.risky && <ReferenceArea y1={zi.risky[0]} y2={zi.risky[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zi.riskyHigh && <ReferenceArea y1={zi.riskyHigh[0]} y2={zi.riskyHigh[1]} fill="#f59e0b" fillOpacity={0.08} />}
                                                        {zi.critical && <ReferenceArea y1={zi.critical[0]} y2={zi.critical[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                        {zi.criticalHigh && <ReferenceArea y1={zi.criticalHigh[0]} y2={zi.criticalHigh[1]} fill="#ef4444" fillOpacity={0.08} />}
                                                    </> : null;
                                                })()}
                                                <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
                                                <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                                                {s.threshold && <ReferenceLine y={s.threshold.max} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={0.8} />}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                    {s.threshold && <div className="sensor-card-threshold">{t('Threshold', '阈值')}: {s.threshold.max}{s.unit}</div>}
                                    {forecast && <div className="sensor-card-forecast">{t('AI Forecast', 'AI 预测')}: {s.trend === 'rising' ? t('Expected to breach in ~2h', '预计约2小时触线') : t('Within safe range', '处于安全范围')}</div>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Multimodal Data Ingestion */}
                    <DataIngestionPanel isActive={true} />

                    {/* Multimodal Sensor Feed  - Compact Strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 16 }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>{t('Multimodal Sensor Imagery', '多模态传感图像')}</h3>
                        <button className="btn btn-sm" onClick={() => navigate('/sensors')} style={{ fontSize: '0.65rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>{t('View All', '查看全部')} <Icon name="arrow-right" size={11} /></button>
                    </div>
                    <MultimodalGallery compact />

                    {/* AI Thinking Panel */}
                    <div ref={aiRef}>
                        {(thinkingChain.length > 0 && thinkingContext === 'risk') && (
                            <AIThinkingPanel
                                chain={thinkingChain}
                                isThinking={isThinking}
                                onComplete={stopThinking}
                            />
                        )}
                    </div>

                    {/* Alert Banner */}
                    {topRisk && topRisk.score >= 50 && (
                        <div className={`alert-banner ${topRisk.score >= 70 ? 'alert-critical' : 'alert-warning'}`} style={{ marginTop: 16 }}>
                            <div className="alert-content">
                                <span className="alert-icon"><Icon name={topRisk.score >= 70 ? 'alert-triangle' : 'alert-triangle'} size={24} /></span>
                                <div>
                                    <div className="alert-title">{riskLabel(topRisk)}  - {t('Risk Score', '风险分值')} {topRisk.score}/100</div>
                                    <div className="alert-body">
                                        {topRisk.factors?.map(localizeDynamic).join(' | ') || t('Elevated risk detected. Review recommended.', '检测到升高风险，建议复核。')}
                                        {activeScenario && ` | ${t('Scenario', '场景')} ${activeScenario.id} ${t('active', '进行中')}`}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={() => navigate('/risk')}>{t('View Risk', '查看风险')} <Icon name="arrow-right" size={14} /></button>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-4" style={{ marginTop: 16 }}>
                        <MetricCard
                            label={t('Active Threats', '活跃威胁')}
                            value={riskResults.filter(r => r.score >= 50).length}
                            unit={`/${riskResults.length}`}
                            status={riskResults.filter(r => r.score >= 70).length > 0 ? 'critical' : 'low'}
                            icon="alert-triangle"
                            onClick={() => navigate('/risk')}
                        />
                        <MetricCard
                            label={t('Grade Class', '等级')}
                            value={field?.gradeClass || 'A'}
                            subtitle={t(`CNY ${field?.gradeClass === 'A' ? '180' : '120'}/kg export`, `出口单价 CNY ${field?.gradeClass === 'A' ? '180' : '120'}/kg`)}
                            icon="star"
                        />
                        <MetricCard
                            label={t('Revenue at Risk', '风险收入')}
                            value={revenueAtRisk ? `CNY ${(revenueAtRisk.total / 1000).toFixed(1)}k` : 'CNY 0.0k'}
                            status={revenueAtRisk?.total > 30000 ? 'critical' : 'low'}
                            subtitle={revenueAtRisk ? t(`${revenueAtRisk.downgradeProbability}% downgrade prob.`, `降级概率 ${revenueAtRisk.downgradeProbability}%`) : '--'}
                            icon="dollar"
                        />
                        <MetricCard
                            label={t('Decisions', '决策数')}
                            value={prescriptions.length}
                            subtitle={t(`${auditRecords.length} audited`, `已审计 ${auditRecords.length}`)}
                            icon="box"
                        />
                    </div>

                    {/* Biological Threats + Environment */}
                    <div className="grid grid-2" style={{ marginTop: 16 }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="card-title">{t('Biological Threats', '生物威胁')}</h3>
                                <span className="section-timestamp">{formatNow()}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: '8px 0' }}>
                                {riskResults.map(r => (
                                    <div key={r.threatId} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/risk')}>
                                        <RiskGauge score={r.score} size={90} threat={riskLabel(r)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="card-title">{t('Environment Snapshot', '环境快照')}</h3>
                                <span className="section-timestamp">{formatNow()}</span>
                            </div>
                            <div className="grid grid-3" style={{ gap: 12, marginTop: 8 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{Number.isFinite(Number(sensors.temp_C)) ? Number(sensors.temp_C).toFixed(1) : '--'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>°C</span></div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Temperature', '温度')}</div>
                                    <div style={{ fontSize: '0.55rem', color: '#475569' }}>{t('Trend', '趋势')}: {t('stable', '稳定')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: sensors.humidity_pct > 85 ? '#ef4444' : '#e2e8f0' }}>{Number.isFinite(Number(sensors.humidity_pct)) ? Number(sensors.humidity_pct).toFixed(1) : '--'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span></div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Humidity', '湿度')}</div>
                                    <div style={{ fontSize: '0.55rem', color: '#ef4444', fontWeight: 600 }}>{t('Trend', '趋势')}: {t('rising', '上升')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{Number.isFinite(Number(sensors.soil_moist_pct)) ? Number(sensors.soil_moist_pct).toFixed(1) : '--'}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>%</span></div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Soil Moisture', '土壤含水率')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{sensors.wind_speed_ms}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>m/s</span></div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Wind', '风速')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: (sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 0) > 3 ? '#ef4444' : '#e2e8f0' }}>{sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 2.62}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>h</span></div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Leaf Wetness', '叶面湿润')}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{sensors.soil_ph || 4.79}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{t('pH', '酸碱度 pH')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 30-Day Risk Profile */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="card-title">{t('30-Day Risk Profile - AI Predicted Trend', '30天风险画像｜AI 预测趋势')}</h3>
                            <span className="section-timestamp">{formatNow()}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={riskTrend.slice(-30)}>
                                <defs>
                                    <linearGradient id="grayMold" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="anthracnose" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} label={{ value: t('Simulation Day', '仿真日'), position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 10 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                                <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
                                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={0.8} label={{ value: t('Critical', '高危'), position: 'right', fill: '#ef4444', fontSize: 10 }} />
                                <Area type="monotone" dataKey="grayMold" stroke="#ef4444" fillOpacity={1} fill="url(#grayMold)" strokeWidth={1.5} name={t('Gray Mold', '灰霉病')} />
                                <Area type="monotone" dataKey="anthracnose" stroke="#f59e0b" fillOpacity={1} fill="url(#anthracnose)" strokeWidth={1.5} name={t('Anthracnose', '炭疽病')} />
                                <Area type="monotone" dataKey="aphids" stroke="#3dabf5" fillOpacity={0} strokeWidth={1} name={t('Aphids', '蚜虫')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* AI Watchdog Scan History (last 8) */}
                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 className="card-title">{t('AI Watchdog - Recent Scan Log', 'AI 看门狗｜最近扫描日志')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {aiWatchdog.scanHistory.map((scan, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid rgba(148,163,184,0.04)', alignItems: 'center' }}>
                                    <span className="timestamp-full">{scan.time}</span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: scan.severity === 'ok' ? '#34d399' : scan.severity === 'warning' ? '#f59e0b' : scan.severity === 'critical' ? '#ef4444' : '#38bdf8', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.72rem', color: scan.severity === 'ok' ? '#64748b' : '#e2e8f0', flex: 1 }}>{isZh ? (scan.resultZh || localizeDynamic(scan.result)) : scan.result}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <SystemActivityRail />
            </div>
        </div>
    );
}
