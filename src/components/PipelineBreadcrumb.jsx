import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';

const STAGES = [
    { id: 1, path: '/', label: 'Dashboard', labelZh: '总览', icon: 'home' },
    { id: 2, path: '/sensors', label: 'Sensors', labelZh: '传感器', icon: 'perception' },
    { id: 3, path: '/risk', label: 'Risk Analysis', labelZh: '风险评估', icon: 'alert-triangle' },
    { id: 4, path: '/prescription', label: 'Prescription', labelZh: '处方', icon: 'prescription' },
    { id: 5, path: '/execution', label: 'Execution', labelZh: '执行', icon: 'play' },
    { id: 6, path: '/audit', label: 'Audit', labelZh: '审计', icon: 'lock' },
    { id: 7, path: '/history', label: 'History', labelZh: '历史', icon: 'box' },
];

export default function PipelineBreadcrumb() {
    const navigate = useNavigate();
    const location = useLocation();

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
                        <div className={cls} onClick={() => navigate(stage.path)} title={stage.label}>
                            <div className="pipeline-stage-number">{stage.id}</div>
                            <span className="pipeline-stage-label">{stage.label}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
