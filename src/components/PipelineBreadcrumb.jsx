import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';

const STAGES = [
    { id: 1, path: '/', label: 'Dashboard', labelZh: '总览' },
    { id: 2, path: '/sensors', label: 'Sensors', labelZh: '传感' },
    { id: 3, path: '/risk', label: 'Risk Analysis', labelZh: '风险分析' },
    { id: 4, path: '/prescription', label: 'Prescription', labelZh: '处方' },
    { id: 5, path: '/execution', label: 'Execution', labelZh: '执行' },
    { id: 6, path: '/audit', label: 'Audit', labelZh: '审计' },
    { id: 7, path: '/history', label: 'History', labelZh: '历史' },
];

export default function PipelineBreadcrumb() {
    const navigate = useNavigate();
    const location = useLocation();
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);

    const currentStageIndex = STAGES.findIndex(s => s.path === location.pathname);
    const activeStage = currentStageIndex >= 0 ? currentStageIndex : 0;

    return (
        <div className="pipeline-breadcrumb">
            {STAGES.map((stage, i) => {
                const isActive = i === activeStage;
                const isCompleted = i < activeStage;
                const cls = `pipeline-stage ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
                return (
                    <React.Fragment key={stage.id}>
                        {i > 0 && (
                            <div className={`pipeline-connector ${isCompleted ? 'completed' : ''}`}>
                                <svg width="20" height="10" viewBox="0 0 20 10">
                                    <path d="M0 5 L16 5 L12 1 M16 5 L12 9" stroke={isCompleted ? '#34d399' : '#334155'} fill="none" strokeWidth="1.5" />
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
    );
}
