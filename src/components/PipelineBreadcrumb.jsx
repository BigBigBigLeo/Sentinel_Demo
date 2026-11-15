import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';

const PIPELINE_STAGES = [
    { id: 1, path: '/sensors', label: 'Telemetry', labelZh: '传感遥测', icon: 'sensors' },
    { id: 2, path: '/risk', label: 'Risk Analysis', labelZh: '风险研判', icon: 'risk' },
    { id: 3, path: '/prescription', label: 'Prescription Matrix', labelZh: '处方决策', icon: 'prescription' },
    { id: 4, path: '/execution', label: 'Autonomous Dispatch', labelZh: '派发执行', icon: 'execution' },
    { id: 5, path: '/audit', label: 'Audit & Ledger', labelZh: '审计存证', icon: 'audit' },
    { id: 6, path: '/history', label: 'Review & History', labelZh: '历史复盘', icon: 'history' },
];

export default function PipelineBreadcrumb() {
    const navigate = useNavigate();
    const location = useLocation();
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    // When on Mission Control (Root Cockpit)
    if (location.pathname === '/') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 8,
                marginBottom: 16,
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: 1
                    }}>
                        LEVEL 0 · COP
                    </span>
                    <strong style={{ fontSize: '0.82rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="dashboard" size={15} color="#38bdf8" />
                        {t('Integrated Production & Fulfillment Cockpit · Yunnan Chengjiang 900-Mu Facility', '基地生产与履约综合看板 · 云南澄江 900 亩现代农业产业园')}
                    </strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a3', boxShadow: '0 0 6px #00e5a3' }} />
                        {t('3 Production Zones Online', '3大片区全联机')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                        {t('12 Enterprise Contracts Reconciled', '12 批大额直供在手')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24' }} />
                        {t('L3+ Autonomous Core Active', 'L3+ 自治中枢在线')}
                    </span>
                </div>
            </div>
        );
    }

    const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.path === location.pathname);
    const activeStage = currentStageIndex >= 0 ? currentStageIndex : 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            {/* Quick return to Global Cockpit */}
            <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; }}
            >
                <Icon name="dashboard" size={13} color="#38bdf8" />
                <span>{t('← Return to Mission Control Cockpit', '← 返回全域战备指挥大厅')}</span>
            </button>

            {/* 6-Stage Operational Workflow Breadcrumb */}
            <div className="pipeline-breadcrumb" style={{ margin: 0 }}>
                {PIPELINE_STAGES.map((stage, i) => {
                    const isActive = i === activeStage;
                    const isCompleted = i < activeStage;
                    const cls = `pipeline-stage ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
                    return (
                        <React.Fragment key={stage.id}>
                            {i > 0 && (
                                <div className={`pipeline-connector ${isCompleted ? 'completed' : ''}`}>
                                    <svg width="18" height="10" viewBox="0 0 18 10">
                                        <path d="M0 5 L14 5 L10 1 M14 5 L10 9" stroke={isCompleted ? '#34d399' : '#334155'} fill="none" strokeWidth="1.5" />
                                    </svg>
                                </div>
                            )}
                            <div className={cls} onClick={() => navigate(stage.path)} title={t(stage.label, stage.labelZh)}>
                                <div className="pipeline-stage-number">{stage.id}</div>
                                <span className="pipeline-stage-label">{t(stage.label, stage.labelZh)}</span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
