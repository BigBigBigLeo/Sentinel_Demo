import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { PHASES } from '../engine/thinkingEngine';

const phaseList = Object.values(PHASES);

function TypewriterText({ text, speed = 12, onComplete }) {
    const [displayed, setDisplayed] = useState('');
    const idx = useRef(0);

    useEffect(() => {
        idx.current = 0;
        setDisplayed('');
        const timer = setInterval(() => {
            idx.current++;
            setDisplayed(text.slice(0, idx.current));
            if (idx.current >= text.length) {
                clearInterval(timer);
                onComplete?.();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{displayed}<span className="thinking-cursor">|</span></span>;
}

function DataBadge({ label, value }) {
    return (
        <span className="thinking-data-badge">
            <span className="thinking-data-label">{label}</span>
            <span className="thinking-data-value">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
        </span>
    );
}

function DataRequestCard({ details }) {
    if (!details) return null;
    return (
        <div className="thinking-request-card">
            <div className="thinking-request-title">
                <Icon name="perception" size={14} color="#38bdf8" />
                {details.title}
            </div>
            <div className="thinking-request-body">
                {details.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: i < details.items.length - 1 ? '1px solid rgba(56,189,248,0.08)' : 'none' }}>
                        <span className="actor-badge actor-drone" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{item.asset}</span>
                        <span style={{ flex: 1, fontSize: '0.68rem', color: '#94a3b8' }}>{item.action}</span>
                        <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 600 }}>ETA: {item.eta}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ConfidenceMeter({ value }) {
    const pct = Math.min(100, Math.max(0, value * 100));
    const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#ef4444';
    return (
        <div className="confidence-meter">
            <span style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap' }}>Confidence</span>
            <div className="confidence-track">
                <div className="confidence-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="confidence-label" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
    );
}

export default function AIThinkingPanel({ chain = [], isThinking = false, onComplete }) {
    const [visibleSteps, setVisibleSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [typingDone, setTypingDone] = useState(false);
    const scrollRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (chain.length === 0) {
            setVisibleSteps([]);
            setCurrentStep(-1);
            setTypingDone(false);
            return;
        }
        if (isThinking) {
            setVisibleSteps([]);
            setCurrentStep(-1);
            setTypingDone(false);
            revealNext(0);
        }
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [chain, isThinking]);

    const revealNext = (index) => {
        if (index >= chain.length) {
            onComplete?.();
            return;
        }
        setCurrentStep(index);
        setVisibleSteps(prev => [...prev, chain[index]]);
        setTypingDone(false);
    };

    const handleTypingComplete = () => {
        setTypingDone(true);
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        const nextIndex = currentStep + 1;
        if (nextIndex < chain.length) {
            timeoutRef.current = setTimeout(() => revealNext(nextIndex), chain[currentStep]?.duration || 500);
        } else {
            onComplete?.();
        }
    };

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [visibleSteps, typingDone]);

    if (chain.length === 0 && !isThinking) return null;

    const elapsed = visibleSteps.length;
    const total = chain.length;
    const progress = total > 0 ? (elapsed / total) * 100 : 0;
    const currentPhase = visibleSteps[visibleSteps.length - 1]?.phase;
    const currentRound = visibleSteps[visibleSteps.length - 1]?.round || 1;
    const maxRound = Math.max(...chain.map(s => s.round || 1));
    const isDone = elapsed >= total && typingDone;

    // Compute running confidence from chain steps
    const confidenceSteps = visibleSteps.filter(s => s.data?.confidence || s.data?.ensemble_confidence || s.data?.preliminary_confidence);
    const latestConfidence = confidenceSteps.length > 0
        ? parseFloat(Object.values(confidenceSteps[confidenceSteps.length - 1].data).find(v => typeof v === 'number' && v <= 1 && v > 0) || 0.5)
        : 0;

    return (
        <div className={`thinking-panel ${isThinking && !isDone ? 'thinking-active' : ''} ${isDone ? 'thinking-done' : ''}`}>
            {/* Header */}
            <div className="thinking-header">
                <div className="thinking-header-left">
                    <div className={`thinking-indicator ${isThinking && !isDone ? 'pulsing' : ''}`}>
                        <Icon name="reasoning" size={18} />
                    </div>
                    <div>
                        <div className="thinking-title">
                            {isDone ? 'Analysis Complete — All Rounds' : 'Sentinel AI — Iterative Reasoning'}
                        </div>
                        <div className="thinking-subtitle">
                            {isDone
                                ? `${total} reasoning steps · ${maxRound} rounds · ${chain.filter(s => s.isDataRequest).length} data requests`
                                : currentPhase
                                    ? `Phase: ${currentPhase.label} · Round ${currentRound} of ${maxRound}`
                                    : 'Initializing multimodal reasoning pipeline...'
                            }
                        </div>
                    </div>
                </div>
                <div className="thinking-header-right">
                    <span className="thinking-round-badge">Round {currentRound}/{maxRound}</span>
                    <span className="thinking-model-badge">Sentinel-Agri v4.2</span>
                    <span className="thinking-step-count">{elapsed}/{total}</span>
                </div>
            </div>

            {/* Phase Progress */}
            <div className="thinking-phases">
                {phaseList.map((phase, i) => {
                    const isActive = currentPhase?.id === phase.id;
                    const phaseIdx = phaseList.findIndex(p => p.id === currentPhase?.id);
                    const isPast = phaseIdx > i || isDone;
                    return (
                        <div key={phase.id} className={`thinking-phase-dot ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
                            <div className="phase-dot" style={{ background: isPast || isActive ? phase.color : 'rgba(148,163,184,0.2)', boxShadow: isActive ? `0 0 12px ${phase.color}40` : 'none' }}>
                                <Icon name={phase.icon} size={14} color={isPast || isActive ? '#fff' : '#475569'} />
                            </div>
                            <span className="phase-label" style={{ color: isPast || isActive ? phase.color : '#475569' }}>{phase.label}</span>
                        </div>
                    );
                })}
                <div className="thinking-progress-track">
                    <div className="thinking-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Confidence Meter */}
            {latestConfidence > 0 && (
                <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                    <ConfidenceMeter value={latestConfidence} />
                </div>
            )}

            {/* Thinking Steps */}
            <div className="thinking-steps" ref={scrollRef}>
                {visibleSteps.map((step, i) => {
                    const isLatest = i === visibleSteps.length - 1;
                    const showTypewriter = isLatest && !typingDone && isThinking;
                    const prevRound = i > 0 ? visibleSteps[i - 1]?.round : 0;
                    const showRoundSeparator = step.round && step.round !== prevRound;

                    return (
                        <React.Fragment key={step.id}>
                            {showRoundSeparator && step.round > 1 && (
                                <div style={{ padding: '12px 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(244,114,182,0.15)' }} />
                                    <span className="thinking-round-badge">Round {step.round} — {step.round === 2 ? 'New Data Integration' : 'Decision & Verification'}</span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(244,114,182,0.15)' }} />
                                </div>
                            )}
                            <div className={`thinking-step ${isLatest ? 'latest' : 'completed'}`}>
                                <div className="thinking-step-header">
                                    {step.formattedTime && (
                                        <span className="timestamp-label" style={{ marginRight: 6 }}>[{step.formattedTime}]</span>
                                    )}
                                    <span className="step-phase-tag" style={{ background: `${step.phase.color}20`, color: step.phase.color, borderColor: `${step.phase.color}40` }}>
                                        {step.phase.label}
                                    </span>
                                    <span className="step-title">{step.title}</span>
                                </div>
                                <div className="thinking-step-content">
                                    {showTypewriter ? (
                                        <TypewriterText text={step.content} speed={6} onComplete={handleTypingComplete} />
                                    ) : (
                                        <span>{step.content}</span>
                                    )}
                                </div>
                                {/* Data Request Card */}
                                {step.isDataRequest && (typingDone || !isLatest) && (
                                    <DataRequestCard details={step.requestDetails} />
                                )}
                                {/* Data Badges */}
                                {step.data && (typingDone || !isLatest) && (
                                    <div className="thinking-step-data">
                                        {Object.entries(step.data).map(([k, v]) => (
                                            <DataBadge key={k} label={k.replace(/_/g, ' ')} value={v} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
                {isThinking && !isDone && visibleSteps.length === 0 && (
                    <div className="thinking-step latest">
                        <div className="thinking-step-content" style={{ color: '#64748b' }}>
                            Initializing multimodal reasoning pipeline...
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {isDone && (
                <div className="thinking-footer">
                    <div className="thinking-footer-left">
                        <Icon name="check" size={14} color="#34d399" />
                        <span>Iterative reasoning chain validated — {maxRound} rounds, {total} steps</span>
                    </div>
                    <div className="thinking-footer-right">
                        <span className="thinking-hash">Chain: {Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
