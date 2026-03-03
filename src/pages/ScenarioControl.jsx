import React, { useState, useEffect, useRef } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import { getScenarioList } from '../engine/scenarioEngine';

export default function ScenarioControl() {
    const { activeScenario, scenarioStep, scenarioEvents, loadScenario, advanceScenario } = useStore();
    const [autoPlay, setAutoPlay] = useState(false);
    const autoPlayRef = useRef(null);
    const scenarios = getScenarioList();

    useEffect(() => {
        if (autoPlay && activeScenario && scenarioStep < activeScenario.events.length) {
            autoPlayRef.current = setInterval(() => {
                const state = useStore.getState();
                if (state.scenarioStep >= state.activeScenario.events.length) {
                    setAutoPlay(false);
                    clearInterval(autoPlayRef.current);
                    return;
                }
                state.advanceScenario();
            }, 3000);
        }
        return () => clearInterval(autoPlayRef.current);
    }, [autoPlay, activeScenario, scenarioStep]);

    const handleAutoPlayToggle = () => {
        if (autoPlay) {
            clearInterval(autoPlayRef.current);
        }
        setAutoPlay(!autoPlay);
    };

    const riskColors = { critical: '#ef4444', high: '#f59e0b', elevated: '#3dabf5' };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Scenario Control Panel</h1>
                    <p className="page-subtitle">Load and step through demo scenarios</p>
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

            {/* Scenario Cards */}
            <div className="grid grid-3">
                {scenarios.map(s => {
                    const isActive = activeScenario?.id === s.id;
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
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 8 }}>
                                Field: {s.field} | Crop: {s.crop} | Events: {s.eventCount}
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

            {/* Active Scenario Progress */}
            {activeScenario && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">
                        Scenario {activeScenario.id} Progress — Step {scenarioStep}/{activeScenario.events.length}
                    </h3>

                    {/* Progress Bar */}
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${(scenarioStep / activeScenario.events.length) * 100}%`,
                            background: riskColors[activeScenario.riskLevel] || '#3dabf5',
                            borderRadius: 3,
                            transition: 'width 0.4s ease',
                        }} />
                    </div>

                    {/* Event Timeline */}
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
                                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{e.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
