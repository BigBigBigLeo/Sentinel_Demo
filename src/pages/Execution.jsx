import React, { useMemo, useState, useEffect } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { executionRecords as historicalExecutionRecords } from '../data/mockData';

export default function Execution() {
    const {
        activeExecution, executions, activePrescription, activeScenario,
        fields, activeFieldId, currentSnapshot, aiAgentLog,
        thinkingChain, isThinking, thinkingContext,
        startExecutionThinking, stopThinking, completeExecution,
    } = useStore();
    const field = fields[activeFieldId];
    const execution = activeExecution;
    const rx = activePrescription;
    const sensors = currentSnapshot?.sensors || {};

    // Simulated live progress for actors
    const [actorProgress, setActorProgress] = useState({});
    const [elapsedSec, setElapsedSec] = useState(0);
    const [selectedPreviousExecutionId, setSelectedPreviousExecutionId] = useState(null);

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
        return new Date(iso).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
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

    return (
        <div className="page">
            <PipelineBreadcrumb />

            {/* 鈹佲攣鈹?Command Center Header 鈹佲攣鈹?*/}
            <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="execution" size={22} color="#f59e0b" /> Execution Command Center
                    </h1>
                    <p className="page-subtitle">
                        Stage 5: Multi-Actor Execution  - {field?.name} | {activeScenario ? `Scenario ${activeScenario.id}` : 'Live Mode'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {execution && (
                        <button className="btn btn-secondary" onClick={startExecutionThinking} disabled={isThinking}>
                            <Icon name="reasoning" size={14} /> AI Analysis
                        </button>
                    )}
                    {execution && execution.status !== 'completed' && (
                        <button className="btn btn-primary" onClick={completeExecution} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="check" size={14} /> Complete Execution
                        </button>
                    )}
                </div>
            </div>

            {/* AI Thinking Panel */}
            {(thinkingChain.length > 0 && thinkingContext === 'execution') && (
                <AIThinkingPanel chain={thinkingChain} isThinking={isThinking} onComplete={stopThinking} />
            )}

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
                                    Execution {execution.id}  - {execution.status === 'completed' ? 'COMPLETE' : 'IN PROGRESS'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: 16, marginTop: 4 }}>
                                    <span>Rx: {execution.prescriptionId}</span>
                                    <span>Method: {execution.method?.replace('_', ' ')}</span>
                                    <span>Actors: {execution.executionPlan?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            {[
                                { label: 'Coverage', value: `${execution.actualCoverage_pct}%`, color: '#34d399' },
                                { label: 'Dosage', value: `${(execution.actualDosageRatio * 100).toFixed(0)}%`, color: '#38bdf8' },
                                { label: 'Duration', value: execution.endTime ? `${Math.round((new Date(execution.endTime) - new Date(execution.startTime)) / 60000)} min` : 'Active', color: '#f59e0b' },
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
                        <Icon name="users" size={16} color="#38bdf8" /> Multi-Actor Orchestration - {execution.executionPlan.length} Actors
                    </h3>

                    {/* Gantt Timeline */}
                    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span className="card-title" style={{ margin: 0 }}>Execution Timeline</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                Elapsed: {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
                            </span>
                        </div>
                        {execution.executionPlan.map((actor, i) => {
                            const progress = actorProgress[actor.id] || 0;
                            return (
                                <div key={actor.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < execution.executionPlan.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}>
                                    <div style={{ width: 30, textAlign: 'center' }}><Icon name={actorIconName(actor.actorType)} size={18} color="#94a3b8" /></div>
                                    <div style={{ width: 120, minWidth: 120 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#e2e8f0' }}>{actor.actor}</div>
                                        <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{actor.offsetLabel}</div>
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
                                        <StatusBadge status={actor.status === 'completed' ? 'monitoring' : actor.status === 'in-progress' ? 'elevated' : actor.status === 'pending' ? 'warning' : 'low'} label={actor.status.toUpperCase()} />
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
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{actor.actor}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{actor.id}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={actor.status === 'completed' ? 'monitoring' : actor.status === 'in-progress' ? 'elevated' : 'low'} label={actor.status} />
                                </div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#38bdf8', marginBottom: 4 }}>{actor.action}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>{actor.detail}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.65rem' }}>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>Zone: </span>
                                        <span style={{ color: '#e2e8f0' }}>{actor.targetZone}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>Coverage: </span>
                                        <span style={{ color: '#34d399' }}>{actor.coverage}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>Duration: </span>
                                        <span style={{ color: '#e2e8f0' }}>{actor.estimatedDuration}</span>
                                    </div>
                                    <div style={{ padding: '4px 8px', background: 'rgba(15,23,42,0.4)', borderRadius: 4 }}>
                                        <span style={{ color: '#64748b' }}>Chemical: </span>
                                        <span style={{ color: actor.chemicalUsed === 'N/A (scan only)' || actor.chemicalUsed?.startsWith('N/A') ? '#64748b' : '#f59e0b' }}>{actor.chemicalUsed}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: 6, fontSize: '0.62rem', color: '#475569', fontStyle: 'italic' }}>{actor.precision}</div>
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
                            <Icon name="shield" size={16} color="#38bdf8" /> Execution Fingerprint
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
                                        {execution.executionFingerprint?.match ? 'FINGERPRINT MATCH' : 'FINGERPRINT MISMATCH'}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Cryptographic execution verification</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6 }}>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>Prescribed Hash</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#38bdf8', wordBreak: 'break-all' }}>{execution.executionFingerprint?.prescribed || '--'}</div>
                                </div>
                                <div style={{ padding: '8px 10px', background: 'rgba(15,23,42,0.4)', borderRadius: 6 }}>
                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>Actual Hash</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: execution.executionFingerprint?.match ? '#34d399' : '#ef4444', wordBreak: 'break-all' }}>{execution.executionFingerprint?.actual || '--'}</div>
                                </div>
                            </div>
                            {execution.deviations?.length > 0 && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="warning" size={12} color="#f59e0b" /> Deviations Detected:</div>
                                    {execution.deviations.map((d, i) => (
                                        <div key={i} style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 6, fontSize: '0.7rem', color: '#f59e0b', marginBottom: 4 }}>
                                            <strong>{d.parameter}</strong>: Prescribed {d.prescribed} {'->'} Actual {d.actual} ({d.delta})
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dosage Comparison */}
                    <div className="card">
                        <h3 className="card-title">Sentinel vs. Traditional  - Chemical Usage</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dosageData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis type="number" domain={[0, 350]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                                    labelStyle={{ color: '#e2e8f0' }}
                                    formatter={(v) => [`${v} ml/mu`, 'Dosage']}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                    {dosageData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        {execution.precisionMetrics && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                {[
                                    { label: 'Chemical Reduction', value: execution.precisionMetrics.chemicalReduction, color: '#34d399' },
                                    { label: 'Area Targeted', value: execution.precisionMetrics.areaTargeted, color: '#38bdf8' },
                                    { label: 'Area Spared', value: execution.precisionMetrics.areaSpared, color: '#a78bfa' },
                                    { label: 'Actors Used', value: execution.precisionMetrics.actorsUsed, color: '#f59e0b' },
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
                        <Icon name="activity" size={16} color="#38bdf8" /> Execution Progress  - Step by Step
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
                                        <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.8rem' }}>{step.label}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#475569' }}>{fmtTime(step.time)}</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{step.detail}</div>
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
                        <Icon name="reasoning" size={16} color="#a78bfa" /> AI Agent Activity Feed
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
                                        }}>{log.agent}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>{log.action}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: 2 }}>
                                            Step {log.scenarioStep}  - {log.context}
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
                    <h3 className="card-title">Live Environment During Execution</h3>
                    <div className="grid grid-4" style={{ gap: 10 }}>
                        {[
                            { label: 'Temperature', value: `${sensors.temp_C?.toFixed(1) || '--'}°C`, icon: 'thermostat', status: sensors.temp_C > 32 ? 'warning' : 'ok', color: '#f59e0b' },
                            { label: 'Humidity', value: `${sensors.humidity_pct?.toFixed(0) || '--'}%`, icon: 'water-drop', status: sensors.humidity_pct > 90 ? 'warning' : 'ok', color: '#38bdf8' },
                            { label: 'Wind Speed', value: `${sensors.wind_speed_ms?.toFixed(1) || '--'} m/s`, icon: 'wind', status: sensors.wind_speed_ms > 3 ? 'critical' : 'ok', color: sensors.wind_speed_ms > 3 ? '#ef4444' : '#34d399' },
                            { label: 'Light', value: `${sensors.light_Lux?.toLocaleString() || '--'} Lux`, icon: 'sun', status: 'ok', color: '#fbbf24' },
                        ].map((env, i) => (
                            <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                                <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><Icon name={env.icon} size={20} color={env.color} /></div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: env.color, fontFamily: 'monospace' }}>{env.value}</div>
                                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 2 }}>{env.label}</div>
                                {env.status !== 'ok' && (
                                    <div style={{ fontSize: '0.55rem', color: env.status === 'critical' ? '#ef4444' : '#f59e0b', marginTop: 2, fontWeight: 700 }}>
                                        <Icon name="warning" size={9} color={env.status === 'critical' ? '#ef4444' : '#f59e0b'} /> {env.status === 'critical' ? 'EXCEEDS LIMIT' : 'ELEVATED'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?No Execution State 鈹佲攣鈹?*/}
            {!execution && (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ marginBottom: 12, opacity: 0.3, display: 'flex', justifyContent: 'center' }}><Icon name="bolt" size={48} color="#64748b" /></div>
                    <div style={{ color: '#94a3b8', marginBottom: 8, fontSize: '1rem', fontWeight: 600 }}>No Active Execution</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 400, margin: '0 auto' }}>
                        {rx ? 'Prescription ready  - execute from the Prescription page to begin multi-actor orchestration.'
                            : 'Generate and execute a prescription to see the real-time command center.'}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Execution Completion Summary 鈹佲攣鈹?*/}
            {execution?.comparisonReport && (
                <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(52,211,153,0.06) 0%, rgba(56,189,248,0.04) 100%)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="check" size={16} color="#34d399" /> Execution Complete  - Final Summary
                    </h3>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Grade Badge */}
                        <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(15,23,42,0.5)', borderRadius: 12, minWidth: 100 }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: execution.comparisonReport.grade === 'A' ? '#34d399' : execution.comparisonReport.grade === 'B' ? '#38bdf8' : '#f59e0b', lineHeight: 1 }}>
                                {execution.comparisonReport.grade}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>Overall Grade</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace' }}>{execution.comparisonReport.overallScore.toFixed(1)}%</div>
                        </div>

                        {/* Accuracy Metrics */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                            {[
                                { label: 'Dosage Accuracy', value: `${execution.comparisonReport.dosage.accuracy.toFixed(1)}%`, color: execution.comparisonReport.dosage.accuracy >= 95 ? '#34d399' : '#f59e0b' },
                                { label: 'Coverage Accuracy', value: `${execution.comparisonReport.coverage.accuracy.toFixed(1)}%`, color: execution.comparisonReport.coverage.accuracy >= 95 ? '#34d399' : '#f59e0b' },
                                { label: 'Timing Accuracy', value: `${execution.comparisonReport.timing.accuracy.toFixed(1)}%`, color: execution.comparisonReport.timing.accuracy >= 90 ? '#34d399' : '#f59e0b' },
                                { label: 'Risk Reduction', value: `${execution.comparisonReport.riskBefore} ->${execution.comparisonReport.riskAfter.toFixed(0)}`, color: '#34d399' },
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
                        <Icon name="activity" size={16} color="#a78bfa" /> Prescription vs. Execution  - Comparison
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>Parameter</th><th>Prescribed</th><th>Actual</th><th>Accuracy</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { param: 'Dosage Ratio', prescribed: `${(execution.comparisonReport.dosage.prescribed * 100).toFixed(0)}%`, actual: `${(execution.comparisonReport.dosage.actual * 100).toFixed(0)}%`, accuracy: execution.comparisonReport.dosage.accuracy },
                                { param: 'Coverage', prescribed: `${execution.comparisonReport.coverage.prescribed}%`, actual: `${execution.comparisonReport.coverage.actual.toFixed(1)}%`, accuracy: execution.comparisonReport.coverage.accuracy },
                                { param: 'Timing', prescribed: execution.comparisonReport.timing.prescribed, actual: execution.comparisonReport.timing.actual, accuracy: execution.comparisonReport.timing.accuracy },
                                { param: 'Actors', prescribed: execution.comparisonReport.actors.prescribed, actual: execution.comparisonReport.actors.actual, accuracy: execution.comparisonReport.actors.prescribed === execution.comparisonReport.actors.actual ? 100 : 80 },
                                { param: 'Methods', prescribed: execution.comparisonReport.methods.prescribed, actual: execution.comparisonReport.methods.actual, accuracy: 100 },
                                { param: 'Chemical/Agent', prescribed: execution.comparisonReport.chemicals.prescribed, actual: execution.comparisonReport.chemicals.actual, accuracy: execution.comparisonReport.chemicals.prescribed === execution.comparisonReport.chemicals.actual ? 100 : 70 },
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
                        <Icon name="trending-up" size={16} color="#10b981" /> Post-Execution Impact Assessment
                    </h3>
                    <div className="grid grid-3" style={{ gap: 12 }}>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>Risk Score Change</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>{execution.comparisonReport.riskBefore}</span>
                                <span style={{ color: '#64748b' }}>{'->'}</span>
                                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>{execution.comparisonReport.riskAfter.toFixed(0)}</span>
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}><Icon name="trending-up" size={10} color="#34d399" /> {(execution.comparisonReport.riskBefore - execution.comparisonReport.riskAfter).toFixed(0)} pts reduced</div>
                        </div>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>Projected Harvest Impact</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                                {activeScenario?.outcomeMetrics?.gradeResult || 'Grade A Protected'}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4 }}>Revenue: CNY {(activeScenario?.outcomeMetrics?.revenueProtected || 28000).toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6 }}>AI Confidence</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', fontFamily: 'monospace' }}>
                                {confidencePct.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 4 }}>Intervention success probability</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Previous Executions */}
            {previousExecutions.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="history" size={16} color="#38bdf8" />
                        Previous Executions (Recent)
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
                                        <StatusBadge status={item.status === 'completed' ? 'monitoring' : 'critical'} label={item.status?.toUpperCase()} />
                                    </div>
                                    <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                                        {item.prescriptionId || '--'} | Coverage {item.actualCoverage_pct ?? '--'}%
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
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Prescription: {selectedPreviousExecution.prescriptionId || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Start: {fmtTime(selectedPreviousExecution.startTime)}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>End: {fmtTime(selectedPreviousExecution.endTime)}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Coverage: {selectedPreviousExecution.actualCoverage_pct ?? '--'}%</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Dosage: {selectedPreviousExecution.actualDosageRatio ? `${(selectedPreviousExecution.actualDosageRatio * 100).toFixed(0)}%` : '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Actors: {selectedPreviousExecution.actorCount || selectedPreviousExecution.executionPlan?.length || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>Duration: {selectedPreviousExecution.duration || '--'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>
                                    Fingerprint: {selectedPreviousExecution.executionFingerprint?.match ? 'Match' : 'Mismatch'}
                                </div>
                                {selectedPreviousExecution.deviations?.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>Deviations</div>
                                        {selectedPreviousExecution.deviations.slice(0, 3).map((item, idx) => (
                                            <div key={`${selectedPreviousExecution.id}-dev-${idx}`} style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: 3 }}>
                                                {item.parameter}: {item.delta}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPreviousExecution.feedback && (
                                    <div style={{ marginTop: 10 }}>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 4 }}>Execution Feedback</div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.45 }}>{selectedPreviousExecution.feedback}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}



