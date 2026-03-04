import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import ExecutionFingerprint from '../components/ExecutionFingerprint';
import Icon from '../components/Icon';
import MetricCard from '../components/MetricCard';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { executionRecords } from '../data/mockData';

const actorTypeClass = { drone: 'actor-drone', iot: 'actor-iot', human: 'actor-human', facility: 'actor-facility' };
const actorTypeIcon = { drone: '🛸', iot: '📡', human: '👷', facility: '🏭' };
const actorTypeColor = { drone: '#38bdf8', iot: '#34d399', human: '#fb923c', facility: '#a78bfa' };

// Parse time "HH:MM" to minutes from midnight
const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export default function Execution() {
    const {
        activeExecution, activePrescription, executions, eventLog,
        fields, activeFieldId, currentSnapshot,
    } = useStore();
    const field = fields[activeFieldId];
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Use active execution or the most recent completed execution for display
    const execution = activeExecution || executions[executions.length - 1] || null;

    // Simulation: actors with progress
    const [simProgress, setSimProgress] = useState({});
    useEffect(() => {
        if (!execution?.actors) return;
        const interval = setInterval(() => {
            setSimProgress(prev => {
                const next = { ...prev };
                execution.actors.forEach(a => {
                    const current = next[a.id] || 0;
                    if (a.status === 'completed') {
                        next[a.id] = 100;
                    } else if (current < 95) {
                        next[a.id] = Math.min(current + Math.random() * 3 + 0.5, 100);
                    }
                });
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [execution]);

    // Combined actors: from active or most recent historical execution
    const displayExec = execution || (executionRecords.length > 0 ? executionRecords[executionRecords.length - 1] : null);
    const actors = displayExec?.actors || [];

    // Timeline calculations
    const timeRange = actors.length > 0 ? {
        min: Math.min(...actors.map(a => toMinutes(a.startTime))),
        max: Math.max(...actors.map(a => toMinutes(a.endTime))),
    } : { min: 780, max: 1020 }; // 13:00-17:00 default
    const duration = timeRange.max - timeRange.min || 1;

    // Coverage chart
    const coverageData = actors.map(a => ({
        name: a.id,
        coverage: parseInt(a.coverage) || 0,
        color: actorTypeColor[a.type] || '#94a3b8',
    }));

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Execution Control</h1>
                    <p className="page-subtitle">Stage 5: Multi-Actor Execution — {field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {displayExec && <StatusBadge status={displayExec.status === 'completed' ? 'monitoring' : 'elevated'} label={displayExec.status?.toUpperCase()} />}
                </div>
            </div>

            {/* Active Execution Summary */}
            {displayExec && (
                <div className="grid grid-4" style={{ marginBottom: 16 }}>
                    <MetricCard label="Actors Deployed" value={actors.length} subtitle={`${new Set(actors.map(a => a.type)).size} types`} />
                    <MetricCard label="Duration" value={displayExec.duration || '—'} subtitle="total operation time" />
                    <MetricCard label="Status" value={displayExec.status === 'completed' ? '✓ Complete' : 'In Progress'} status={displayExec.status === 'completed' ? 'monitoring' : 'elevated'} />
                    <MetricCard label="Rx Source" value={displayExec.rxId?.slice(0, 16) || 'Active Rx'} subtitle="prescription ID" />
                </div>
            )}

            {/* Execution Plan Table */}
            {actors.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="play" size={16} color="#34d399" /> Execution Plan — {actors.length} Actors
                    </h3>
                    <table className="data-table">
                        <thead>
                            <tr><th>Actor</th><th>Type</th><th>Task</th><th>Zone</th><th>Start</th><th>End</th><th>Coverage</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {actors.map((a, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{actorTypeIcon[a.type]} {a.id}</td>
                                    <td><span className="exec-actor-type">{a.type}</span></td>
                                    <td style={{ fontSize: '0.72rem', maxWidth: 250 }}>{a.task}</td>
                                    <td>{a.zone}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.startTime}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.endTime}</td>
                                    <td style={{ fontWeight: 600, color: '#34d399' }}>{a.coverage}</td>
                                    <td><StatusBadge status={a.status === 'completed' ? 'monitoring' : 'elevated'} label={a.status?.toUpperCase()} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Multi-Actor Gantt Timeline */}
            {actors.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title">Multi-Actor Timeline (Gantt)</h3>
                    <div className="exec-timeline">
                        {actors.map((a, i) => {
                            const startPct = ((toMinutes(a.startTime) - timeRange.min) / duration) * 100;
                            const widthPct = ((toMinutes(a.endTime) - toMinutes(a.startTime)) / duration) * 100;
                            const progress = simProgress[a.id] || (a.status === 'completed' ? 100 : 0);
                            return (
                                <div key={i} className="exec-timeline-row">
                                    <div className="exec-actor-label">
                                        <span>{actorTypeIcon[a.type]}</span>
                                        <span>{a.id}</span>
                                    </div>
                                    <div className="exec-bar-track">
                                        <div
                                            className={`exec-bar ${a.type}`}
                                            style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                                        >
                                            {a.task.length > 30 ? a.task.slice(0, 28) + '...' : a.task}
                                        </div>
                                        {/* Progress overlay */}
                                        {progress < 100 && (
                                            <div style={{
                                                position: 'absolute', top: 0, left: `${startPct}%`, bottom: 0,
                                                width: `${(widthPct * progress) / 100}%`,
                                                background: actorTypeColor[a.type], opacity: 0.15,
                                                borderRadius: '4px 0 0 4px',
                                            }} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Time axis */}
                        <div className="exec-time-axis">
                            {Array.from({ length: 5 }, (_, i) => {
                                const mins = timeRange.min + (duration * i) / 4;
                                return <span key={i} className="exec-time-tick">{`${Math.floor(mins / 60)}:${String(Math.round(mins % 60)).padStart(2, '0')}`}</span>;
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Coverage Chart */}
            {coverageData.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title">Coverage by Actor</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={coverageData}>
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: '0.7rem' }} />
                            <Bar dataKey="coverage" radius={[4, 4, 0, 0]}>
                                {coverageData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Live Monitoring Panel */}
            {actors.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                        Live Monitoring — Real-Time Actor Status
                    </h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        {actors.map((a, i) => {
                            const progress = simProgress[a.id] || (a.status === 'completed' ? 100 : 0);
                            const isComplete = progress >= 100 || a.status === 'completed';
                            const chemicalUsed = a.type === 'drone' ? (progress * 8.5 / 100).toFixed(1) : null;
                            const areaCovered = a.type === 'drone' ? (progress * 1.4 / 100).toFixed(2) : a.type === 'human' ? (progress * 0.5 / 100).toFixed(2) : null;

                            return (
                                <div key={i} style={{
                                    padding: 14, background: 'rgba(15,23,42,0.4)', borderRadius: 10,
                                    border: `1px solid ${isComplete ? 'rgba(52,211,153,0.3)' : 'var(--border-subtle)'}`,
                                    borderLeft: `3px solid ${actorTypeColor[a.type]}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{actorTypeIcon[a.type]} {a.id}</span>
                                        <StatusBadge status={isComplete ? 'monitoring' : 'elevated'} label={isComplete ? 'COMPLETE' : 'IN PROGRESS'} />
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ height: 6, background: '#1e293b', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${progress}%`,
                                            background: `linear-gradient(90deg, ${actorTypeColor[a.type]}, ${actorTypeColor[a.type]}88)`,
                                            borderRadius: 3, transition: 'width 1s ease',
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.68rem', color: '#64748b' }}>
                                        <span>{progress.toFixed(0)}% complete</span>
                                        <span>{a.zone}</span>
                                    </div>

                                    {/* Live metrics */}
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {chemicalUsed && (
                                            <div style={{ padding: '4px 8px', background: 'rgba(56,189,248,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#38bdf8' }}>
                                                💧 {chemicalUsed}L dispensed
                                            </div>
                                        )}
                                        {areaCovered && (
                                            <div style={{ padding: '4px 8px', background: 'rgba(52,211,153,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#34d399' }}>
                                                📐 {areaCovered} ha covered
                                            </div>
                                        )}
                                        {a.type === 'drone' && (
                                            <>
                                                <div style={{ padding: '4px 8px', background: 'rgba(251,191,36,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#fbbf24' }}>
                                                    🔋 {Math.max(15, 100 - progress * 0.85).toFixed(0)}% battery
                                                </div>
                                                <div style={{ padding: '4px 8px', background: 'rgba(168,85,247,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#a855f7' }}>
                                                    📏 Alt: 2.5m | 4m/s
                                                </div>
                                            </>
                                        )}
                                        {a.type === 'iot' && (
                                            <div style={{ padding: '4px 8px', background: 'rgba(52,211,153,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#34d399' }}>
                                                ⚡ System running at {isComplete ? '75' : '90'}% capacity
                                            </div>
                                        )}
                                    </div>

                                    {/* Task description */}
                                    <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.5 }}>{a.task}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Execution Environment */}
                    <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.7rem', color: '#94a3b8' }}>
                        <span>🌡️ Temp: 18.5°C</span>
                        <span>💨 Wind: 1.8 m/s ✅</span>
                        <span>💧 Humidity: 85%</span>
                        <span>☁️ Cloud: 65%</span>
                        <span>🌧️ Rain forecast: None 24h</span>
                        <span>📡 GPS: Active</span>
                        <span>🛰️ RTK: Fixed (2cm accuracy)</span>
                    </div>
                </div>
            )}

            {/* Live Feedback */}
            {displayExec?.feedback && (
                <div className="card" style={{ marginBottom: 16, borderLeft: '3px solid #34d399' }}>
                    <h3 className="card-title">Post-Execution Feedback</h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.8 }}>{displayExec.feedback}</div>
                </div>
            )}

            {/* Previous Executions from History */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">Recent Execution History</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>ID</th><th>Time</th><th>Actors</th><th>Duration</th><th>Status</th><th>Feedback</th></tr>
                    </thead>
                    <tbody>
                        {executionRecords.map((ex, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{ex.id}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{new Date(ex.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                <td>{ex.actors.map(a => actorTypeIcon[a.type]).join(' ')}</td>
                                <td>{ex.duration}</td>
                                <td><StatusBadge status="monitoring" label="DONE" /></td>
                                <td style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: 300 }}>{ex.feedback.slice(0, 80)}...</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Execution Log */}
            {eventLog.filter(e => e.type === 'execution' || e.type === 'actorEvent').length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Execution Event Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {eventLog.filter(e => e.type === 'execution' || e.type === 'actorEvent').map((e, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: '0.75rem' }}>
                                <span style={{ color: '#64748b', minWidth: 150, fontFamily: 'monospace' }}>{new Date(e.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                <StatusBadge status={e.type === 'execution' ? 'monitoring' : 'elevated'} label={e.type.toUpperCase()} />
                                <span style={{ color: '#94a3b8' }}>{e.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No execution state */}
            {!displayExec && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 8 }}><Icon name="play" size={48} /></div>
                    <div style={{ color: '#94a3b8', marginBottom: 16 }}>No active executions.</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Generate and approve a prescription to start multi-actor execution.</div>
                </div>
            )}

            {/* Execution Fingerprint */}
            {execution && <ExecutionFingerprint execution={execution} />}
        </div>
    );
}
