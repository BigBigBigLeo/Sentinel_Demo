import React from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';

const STAGES = [
    { id: 'perceiving', label: 'Perceiving', labelZh: '感知', icon: 'perception', color: '#06b6d4' },
    { id: 'analyzing', label: 'Analyzing', labelZh: '分析', icon: 'trending-up', color: '#3b82f6' },
    { id: 'reasoning', label: 'Reasoning', labelZh: '推理', icon: 'reasoning', color: '#8b5cf6' },
    { id: 'deciding', label: 'Deciding', labelZh: '决策', icon: 'settings', color: '#f59e0b' },
    { id: 'verifying', label: 'Verifying', labelZh: '验证', icon: 'shield', color: '#10b981' },
];

export default function IterativeReasoningOverlay() {
    const {
        isIterating,
        iterationRound,
        iterationStage,
        iterationLog,
        locale,
    } = useStore();

    const t = (en, zh) => pick(locale, en, zh);

    if (!isIterating) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(6, 11, 20, 0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 500,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        padding: '6px 16px',
                        borderRadius: 999,
                        color: '#38bdf8',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
                    }}
                >
                    {t('Iteration Round', '迭代轮次')} 0{iterationRound}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {STAGES.map(stage => {
                        const isActive = iterationStage === stage.id;
                        return (
                            <div
                                key={stage.id}
                                className={`reasoning-badge badge-${stage.id}`}
                                style={{
                                    opacity: isActive ? 1 : 0.2,
                                    transform: isActive ? 'scale(1.1)' : 'scale(0.9)',
                                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    boxShadow: isActive ? `0 0 15px ${stage.color}40` : 'none',
                                    borderWidth: isActive ? 2 : 1,
                                }}
                            >
                                <Icon name={stage.icon} size={14} color={stage.color} />
                                <span>{locale === 'zh' ? stage.labelZh : stage.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="ai-inner-monologue"
                    style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: 120,
                        marginTop: 12,
                        textAlign: 'left',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.65rem' }}>{t('INTERNAL_LOG.EXE', '内部日志')}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                        </div>
                    </div>
                    <div className="scrollbar-themed" style={{ maxHeight: 150, overflowY: 'auto' }}>
                        {iterationLog.map((log, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 4,
                                    opacity: i === iterationLog.length - 1 ? 1 : 0.5,
                                    animation: 'fadeIn 0.2s ease-out',
                                }}
                            >
                                <span style={{ color: '#475569' }}>&gt; </span>
                                {log.text || log}
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 10,
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.6)',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <Icon name="info" size={14} color="rgba(255,255,255,0.4)" />
                    {t('Sentinel is investigating risk variables autonomously...', 'Sentinel 正在自主推演风险变量...')}
                </div>
            </div>
        </div>
    );
}
