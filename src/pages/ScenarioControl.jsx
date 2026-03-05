import React, { useState, useEffect, useRef } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import { getScenarioList } from '../engine/scenarioEngine';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';

export default function ScenarioControl() {
    const {
        activeScenario, scenarioStep, loadScenario, advanceScenario,
        riskResults, activePrescription, activeExecution, aiAgentLog,
    } = useStore();
    const [autoPlay, setAutoPlay] = useState(false);
    const autoRef = useRef(null);
    const scenarios = getScenarioList();

    useEffect(() => {
        if (autoPlay && activeScenario) {
            autoRef.current = setInterval(() => {
                const { scenarioStep, activeScenario } = useStore.getState();
                if (scenarioStep < activeScenario.eventCount) {
                    advanceScenario();
                } else {
                    setAutoPlay(false);
                    clearInterval(autoRef.current);
                }
            }, 3000);
        }
        return () => clearInterval(autoRef.current);
    }, [autoPlay, activeScenario, advanceScenario]);

    const riskLevelColor = (level) => {
        const map = { low: '#34d399', elevated: '#f59e0b', high: '#f97316', critical: '#ef4444' };
        return map[level] || '#64748b';
    };

    const threatTypeIconName = (type) => {
        const map = { disease: 'virus', compound: 'link', environmental: 'snowflake', system_failure: 'gear' };
        return map[type] || 'bolt';
    };

    const complexityStars = (n) => '●'.repeat(n) + '○'.repeat(5 - n);

    // Pipeline stages for journey map
    const pipelineStages = [
        { key: 'detection', label: 'Detection', icon: 'perception' },
        { key: 'risk', label: 'Risk Analysis', icon: 'bolt' },
        { key: 'prescription', label: 'Prescription', icon: 'prescription' },
        { key: 'execution', label: 'Execution', icon: 'target' },
        { key: 'audit', label: 'Audit', icon: 'clipboard' },
    ];

    const getCurrentStage = () => {
        if (!activeScenario) return -1;
        if (activeExecution) return 3;
        if (activePrescription) return 2;
        if (riskResults.length > 0 && riskResults[0]?.score >= 30) return 1;
        if (scenarioStep > 0) return 0;
        return -1;
    };
    const currentStage = getCurrentStage();

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="layers" size={22} color="#a78bfa" /> Scenario Control Center
                    </h1>
                    <p className="page-subtitle">{scenarios.length} Agricultural Decision Scenarios  - Load, Step Through, Analyze</p>
                </div>
                {activeScenario && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={advanceScenario}
                            disabled={scenarioStep >= activeScenario.eventCount}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            Step {scenarioStep + 1}/{activeScenario.eventCount} <Icon name="chevron-right" size={14} />
                        </button>
                        <button className={`btn ${autoPlay ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => setAutoPlay(!autoPlay)}>
                            {autoPlay ? <><Icon name="pause" size={14} /> Pause</> : <><Icon name="play" size={14} /> Auto-Play</>}
                        </button>
                    </div>
                )}
            </div>

            {/* 鈹佲攣鈹?Journey Map (when scenario active) 鈹佲攣鈹?*/}
            {activeScenario && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h3 className="card-title" style={{ margin: 0 }}>Pipeline Journey  - Scenario {activeScenario.id}</h3>
                        <StatusBadge status={riskLevelColor(activeScenario.riskLevel) === '#ef4444' ? 'critical' : 'elevated'} label={activeScenario.riskLevel.toUpperCase()} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {pipelineStages.map((stage, i) => {
                            const isActive = i === currentStage;
                            const isPast = i < currentStage;
                            return (
                                <React.Fragment key={stage.key}>
                                    <div style={{
                                        flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 8,
                                        background: isActive ? 'rgba(56,189,248,0.1)' : isPast ? 'rgba(52,211,153,0.06)' : 'rgba(15,23,42,0.3)',
                                        border: isActive ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
                                        transition: 'all 0.3s',
                                    }}>
                                        <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><Icon name={stage.icon} size={20} color={isActive ? '#38bdf8' : isPast ? '#34d399' : '#475569'} /></div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#38bdf8' : isPast ? '#34d399' : '#475569' }}>
                                            {stage.label}
                                        </div>
                                        {isPast && <div style={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}><Icon name="check" size={10} color="#34d399" /></div>}
                                        {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', margin: '4px auto 0', animation: 'pulse 1.5s infinite' }} />}
                                    </div>
                                    {i < pipelineStages.length - 1 && (
                                        <div style={{ width: 24, height: 2, background: isPast ? '#34d399' : '#1e293b', flexShrink: 0 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Active Scenario Detail 鈹佲攣鈹?*/}
            {activeScenario && (
                <div className="card" style={{ marginBottom: 16, borderLeft: `3px solid ${riskLevelColor(activeScenario.riskLevel)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon name={threatTypeIconName(activeScenario.threatType)} size={18} color={riskLevelColor(activeScenario.riskLevel)} />
                                </span>
                                <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1rem' }}>
                                    Scenario {activeScenario.id}: {activeScenario.name}
                                </h3>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0, maxWidth: 600 }}>{activeScenario.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                            <div style={{ textAlign: 'center', padding: '4px 12px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Field</div>
                                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{activeScenario.field}</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '4px 12px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Days to Harvest</div>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.82rem' }}>{activeScenario.daysToHarvest}d</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '4px 12px' }}>
                                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Complexity</div>
                                <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem', letterSpacing: 2 }}>{complexityStars(activeScenario.complexity)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Event Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>
                        {activeScenario.events.map((event, i) => {
                            const isCompleted = i < scenarioStep;
                            const isCurrent = i === scenarioStep;
                            return (
                                <div key={event.step} style={{
                                    display: 'flex', gap: 12, padding: '10px 0',
                                    borderLeft: `2px solid ${isCompleted ? '#34d399' : isCurrent ? '#38bdf8' : '#1e293b40'}`,
                                    paddingLeft: 14, marginLeft: 8,
                                    opacity: isCompleted || isCurrent ? 1 : 0.4,
                                }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: isCompleted ? 'rgba(52,211,153,0.2)' : isCurrent ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)',
                                        border: `2px solid ${isCompleted ? '#34d399' : isCurrent ? '#38bdf8' : '#334155'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6rem', fontWeight: 700, color: isCompleted ? '#34d399' : isCurrent ? '#38bdf8' : '#475569',
                                    }}>
                                        {isCompleted ? <Icon name="check" size={10} color="#34d399" /> : event.step}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.78rem' }}>{event.title}</span>
                                            <span style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'monospace' }}>Day {event.day}</span>
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{event.description}</div>
                                        {/* Show AI agent actions for completed events */}
                                        {isCompleted && event.aiAgentActions && (
                                            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                {event.aiAgentActions.slice(0, 2).map((aa, j) => {
                                                    const agentColors = { execution: '#38bdf8', watchdog: '#f59e0b', perception: '#34d399', analysis: '#a78bfa', decision: '#f472b6', audit: '#fbbf24' };
                                                    return (
                                                        <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.6rem' }}>
                                                            <span style={{ padding: '1px 6px', borderRadius: 8, background: `${agentColors[aa.agent]}12`, color: agentColors[aa.agent], fontWeight: 700 }}>{aa.agent}</span>
                                                            <span style={{ color: '#64748b' }}>{aa.action}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?AI Agent Activity (when scenario active) 鈹佲攣鈹?*/}
            {activeScenario && aiAgentLog.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="reasoning" size={16} color="#a78bfa" /> AI Agent Activity  - {aiAgentLog.length} Actions
                    </h3>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        {['perception', 'analysis', 'decision', 'execution', 'audit', 'watchdog'].map(agent => {
                            const count = aiAgentLog.filter(l => l.agent === agent).length;
                            if (count === 0) return null;
                            const agentColors = { execution: '#38bdf8', watchdog: '#f59e0b', perception: '#34d399', analysis: '#a78bfa', decision: '#f472b6', audit: '#fbbf24' };
                            return (
                                <div key={agent} style={{
                                    padding: '4px 10px', borderRadius: 12,
                                    background: `${agentColors[agent]}12`, border: `1px solid ${agentColors[agent]}30`,
                                    fontSize: '0.65rem', fontWeight: 600, color: agentColors[agent],
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: agentColors[agent] }} />
                                    {agent} ({count})
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {aiAgentLog.slice(-10).reverse().map((log, i) => {
                            const agentColors = { execution: '#38bdf8', watchdog: '#f59e0b', perception: '#34d399', analysis: '#a78bfa', decision: '#f472b6', audit: '#fbbf24' };
                            return (
                                <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 8px', fontSize: '0.62rem', borderLeft: `2px solid ${agentColors[log.agent]}`, paddingLeft: 8 }}>
                                    <span style={{ color: agentColors[log.agent], fontWeight: 700, width: 65, flexShrink: 0, textTransform: 'uppercase', fontSize: '0.58rem' }}>{log.agent}</span>
                                    <span style={{ color: '#94a3b8', flex: 1 }}>{log.action}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 鈹佲攣鈹?Scenario Selection Grid 鈹佲攣鈹?*/}
            {!activeScenario && (
                <div>
                    <h3 className="section-title">Select a Scenario</h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        {scenarios.map(s => (
                            <div key={s.id} className="card" style={{
                                cursor: 'pointer', borderLeft: `3px solid ${riskLevelColor(s.riskLevel)}`,
                                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                            }}
                                onClick={() => loadScenario(s.id)}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Background threat type indicator */}
                                <div style={{
                                    position: 'absolute', right: 12, top: 12,
                                    opacity: 0.12, pointerEvents: 'none',
                                }}>
                                    <Icon name={threatTypeIconName(s.threatType)} size={44} color={riskLevelColor(s.riskLevel)} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: `${riskLevelColor(s.riskLevel)}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '0.95rem', color: riskLevelColor(s.riskLevel),
                                        }}>{s.id}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{s.nameZh}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={s.riskLevel === 'critical' ? 'critical' : s.riskLevel === 'high' ? 'elevated' : 'monitoring'} label={s.riskLevel.toUpperCase()} />
                                </div>

                                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: 1.5 }}>{s.description}</p>

                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                                    {[
                                        { label: 'Crop', value: s.crop, color: '#34d399' },
                                        { label: 'Field', value: s.field, color: '#38bdf8' },
                                        { label: 'Events', value: s.eventCount, color: '#a78bfa' },
                                        { label: 'Harvest', value: `${s.daysToHarvest}d`, color: '#f59e0b' },
                                    ].map((tag, i) => (
                                        <span key={i} style={{ padding: '2px 8px', borderRadius: 6, background: `${tag.color}10`, border: `1px solid ${tag.color}20`, fontSize: '0.6rem', color: tag.color }}>
                                            {tag.label}: <strong>{tag.value}</strong>
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(30,41,59,0.5)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: '0.6rem', color: '#64748b' }}>Complexity:</span>
                                        <span style={{ fontSize: '0.7rem', color: '#a78bfa', letterSpacing: 2 }}>{complexityStars(s.complexity)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ fontSize: '0.6rem', color: '#64748b' }}>AI Agents:</span>
                                        {s.aiAgents?.slice(0, 4).map((a, j) => {
                                            const agentColors = { execution: '#38bdf8', watchdog: '#f59e0b', perception: '#34d399', analysis: '#a78bfa', decision: '#f472b6', audit: '#fbbf24' };
                                            return <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: agentColors[a] || '#64748b' }} />;
                                        })}
                                        {(s.aiAgents?.length || 0) > 4 && <span style={{ fontSize: '0.55rem', color: '#64748b' }}>+{s.aiAgents.length - 4}</span>}
                                    </div>
                                </div>

                                {/* Expected Outcome Preview */}
                                {s.outcomeMetrics && (
                                    <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(15,23,42,0.3)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                                        <span style={{ color: '#34d399' }}><Icon name="money" size={10} color="#34d399" /> CNY {(s.outcomeMetrics.revenueProtected / 1000).toFixed(0)}K protected</span>
                                        <span style={{ color: '#f59e0b' }}><Icon name="prescription" size={10} color="#f59e0b" /> {s.outcomeMetrics.chemicalReduction} chem. reduction</span>
                                        <span style={{ color: '#38bdf8' }}><Icon name="bolt" size={10} color="#38bdf8" /> {s.outcomeMetrics.responseTimeMin}min response</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Return to selection */}
            {activeScenario && (
                <div style={{ textAlign: 'center', marginTop: 24, padding: '0 20px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => loadScenario(null)}
                        style={{
                            width: '100%', maxWidth: 400, padding: '12px 24px',
                            fontSize: '0.88rem', fontWeight: 700, letterSpacing: 0.5,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            margin: '0 auto', borderRadius: 12,
                            background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(100,116,139,0.3)',
                            transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; e.currentTarget.style.color = '#34d399'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.6)'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.3)'; e.currentTarget.style.color = ''; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /><line x1="20" y1="12" x2="9" y2="12" /></svg>
                        Return to Scenario Selection
                    </button>
                </div>
            )}
        </div>
    );
}

