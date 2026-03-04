import React, { useEffect, useRef } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { getScenarioList } from '../engine/scenarioEngine';

export default function ScenarioControl() {
    const { loadScenario, advanceScenario, activeScenario, scenarioStep, scenarioEvents } = useStore();
    const scenarios = getScenarioList();
    const autoPlayRef = useRef(null);
    const [autoPlay, setAutoPlay] = React.useState(false);

    useEffect(() => {
        if (autoPlay && activeScenario && scenarioStep < activeScenario.events.length) {
            autoPlayRef.current = setInterval(() => advanceScenario(), 4000);
        }
        return () => clearInterval(autoPlayRef.current);
    }, [autoPlay, scenarioStep, activeScenario]);

    const handleAutoPlayToggle = () => {
        if (autoPlay) clearInterval(autoPlayRef.current);
        setAutoPlay(!autoPlay);
    };

    const riskColors = { critical: '#ef4444', high: '#f59e0b', elevated: '#3dabf5' };
    const now = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <div className="page">
            <PipelineBreadcrumb />
            <div className="page-header">
                <div>
                    <h1 className="page-title">Scenario Control Panel</h1>
                    <p className="page-subtitle">Load and step through demo scenarios — {now}</p>
                </div>
                {activeScenario && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={handleAutoPlayToggle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name={autoPlay ? 'pause' : 'play'} size={14} /> {autoPlay ? 'Pause' : 'Auto-Play'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={advanceScenario}
                            disabled={scenarioStep >= activeScenario.events.length}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            Advance Step <Icon name="chevron-right" size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Scenario Cards — Rich Detail */}
            <div className="grid grid-3">
                {scenarios.map(s => {
                    const isActive = activeScenario?.id === s.id;
                    const scenario = activeScenario?.id === s.id ? activeScenario : null;
                    return (
                        <div
                            key={s.id}
                            className={`card scenario-card ${isActive ? 'scenario-active' : ''}`}
                            style={isActive ? { borderColor: riskColors[s.riskLevel] || '#3dabf5' } : {}}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: riskColors[s.riskLevel] || '#3dabf5' }}>Scenario {s.id}</div>
                                <StatusBadge status={s.riskLevel === 'critical' ? 'critical' : s.riskLevel === 'high' ? 'elevated' : 'monitoring'} label={s.riskLevel.toUpperCase()} />
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{s.nameZh}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{s.description}</div>

                            {/* Scenario metadata */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                <span style={{ padding: '3px 8px', background: 'rgba(56,189,248,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#38bdf8' }}>📍 {s.field}</span>
                                <span style={{ padding: '3px 8px', background: 'rgba(52,211,153,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#34d399' }}>🌿 {s.crop}</span>
                                <span style={{ padding: '3px 8px', background: 'rgba(245,158,11,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#f59e0b' }}>📅 Day {s.startDay || '?'}</span>
                                <span style={{ padding: '3px 8px', background: 'rgba(251,113,133,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#fb7185' }}>🔢 {s.eventCount} events</span>
                                {s.daysToHarvest && <span style={{ padding: '3px 8px', background: 'rgba(168,85,247,0.08)', borderRadius: 6, fontSize: '0.65rem', color: '#a855f7' }}>⏰ {s.daysToHarvest}d to harvest</span>}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: 12, fontStyle: 'italic' }}>
                                Expected: {s.expectedOutcome}
                            </div>
                            <button
                                className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => loadScenario(s.id)}
                                style={{ width: '100%' }}
                            >
                                {isActive ? 'Reload Scenario' : 'Load Scenario'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Active Scenario Progress with Rich Event Data */}
            {activeScenario && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">
                        Scenario {activeScenario.id} Progress — Step {scenarioStep}/{activeScenario.events.length}
                    </h3>

                    {/* Progress Bar */}
                    <div style={{ height: 8, background: '#1e293b', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${(scenarioStep / activeScenario.events.length) * 100}%`,
                            background: `linear-gradient(90deg, ${riskColors[activeScenario.riskLevel] || '#3dabf5'}, ${riskColors[activeScenario.riskLevel] || '#3dabf5'}88)`,
                            borderRadius: 4, transition: 'width 0.4s ease',
                        }} />
                    </div>

                    {/* Event Timeline with Rich Data */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {activeScenario.events.map((event, i) => {
                            const isCompleted = i < scenarioStep;
                            const isCurrent = i === scenarioStep - 1;
                            const isFuture = i >= scenarioStep;
                            return (
                                <div key={event.step} className="timeline-entry">
                                    <div className="timeline-dot-wrapper">
                                        <div className={`timeline-dot ${isCompleted ? 'dot-ok' : isCurrent ? 'dot-current' : 'dot-future'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {isCompleted ? <Icon name="check" size={10} color="#0a0e1a" /> : event.step}
                                        </div>
                                        {i < activeScenario.events.length - 1 && (
                                            <div className={`timeline-line ${isCompleted ? 'line-ok' : ''}`} />
                                        )}
                                    </div>
                                    <div className="timeline-content" style={{ opacity: isFuture && !isCurrent ? 0.5 : 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                                                Day {event.day}: {event.title}
                                            </div>
                                            {isCurrent && <StatusBadge status="monitoring" label="CURRENT" />}
                                            {isCompleted && <StatusBadge status="completed" />}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
                                            {event.description}
                                        </div>

                                        {/* Sensor Overrides at this Step */}
                                        {(isCompleted || isCurrent) && event.sensorOverrides && (
                                            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {Object.entries(event.sensorOverrides).map(([key, val]) => (
                                                    <span key={key} style={{
                                                        padding: '3px 8px', background: 'rgba(56,189,248,0.08)',
                                                        borderRadius: 6, fontSize: '0.65rem', color: '#38bdf8',
                                                        fontFamily: 'monospace',
                                                    }}>
                                                        {key.replace(/_/g, ' ')}: {val}
                                                    </span>
                                                ))}
                                                {event.pestOverrides && Object.entries(event.pestOverrides).map(([key, val]) => (
                                                    <span key={key} style={{
                                                        padding: '3px 8px', background: 'rgba(251,113,133,0.08)',
                                                        borderRadius: 6, fontSize: '0.65rem', color: '#fb7185',
                                                        fontFamily: 'monospace',
                                                    }}>
                                                        {key.replace(/_/g, ' ')}: {val}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Expected Action */}
                                        {event.expectedAction && (isCompleted || isCurrent) && (
                                            <div style={{ marginTop: 6, fontSize: '0.68rem', color: '#64748b' }}>
                                                Expected: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{event.expectedAction.replace(/_/g, ' ')}</span>
                                            </div>
                                        )}

                                        {/* Grade Downgrade */}
                                        {event.gradeDowngrade && (isCompleted || isCurrent) && (
                                            <div style={{ marginTop: 6, padding: '4px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, fontSize: '0.68rem', color: '#ef4444', display: 'inline-block' }}>
                                                ⚠ Grade {event.gradeDowngrade.from} → {event.gradeDowngrade.to} ({event.gradeDowngrade.affectedPct}% affected)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Scenario Event Log */}
            {scenarioEvents.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">Scenario Event Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[...scenarioEvents].reverse().map((e, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #1e293b', fontSize: '0.75rem' }}>
                                <span style={{ color: '#3dabf5', fontWeight: 600, minWidth: 50 }}>Step {e.step}</span>
                                <span style={{ color: '#64748b', minWidth: 40 }}>D{e.day}</span>
                                <span style={{ color: '#e2e8f0', fontWeight: 500, flex: 1 }}>{e.title}</span>
                                {e.sensorOverrides && (
                                    <span style={{ fontSize: '0.6rem', color: '#475569' }}>
                                        {Object.keys(e.sensorOverrides).length} sensor params
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
