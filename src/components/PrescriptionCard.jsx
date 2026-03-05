import React from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import StatusBadge from './StatusBadge';

export default function PrescriptionCard({ rx, onModify, onApprove, onExecute, compact = false }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);

    if (!rx) return null;

    const renderField = (label, value, mono = false) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{label}</span>
            <span style={{ color: '#e2e8f0', fontSize: '0.8rem', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
    );

    return (
        <div className="card" style={{ borderLeft: `3px solid ${rx.usedFallback ? '#f59e0b' : '#3dabf5'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Sentinel Rx #{rx.id}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rx.timestamp}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <StatusBadge status={rx.status} />
                    {rx.usedFallback && <StatusBadge status="warning" label="FALLBACK" />}
                </div>
            </div>

            {renderField(t('Target', '目标'), rx.target)}
            {renderField(t('Threat', '威胁'), `${rx.threatName} (${t('Score', '分值')}: ${rx.riskScore})`)}
            {renderField(t('Action', '动作'), rx.actionLabel)}
            {rx.activeIngredient && renderField(t('Active Ingredient', '有效成分'), `${rx.activeIngredient.name} [MoA ${rx.activeIngredient.moaGroup}]`)}
            {rx.dosageRatio > 0 && renderField(t('Dosage', '剂量'), `${(rx.dosageRatio * 100).toFixed(0)}% ${t('of label rate', '标签剂量')}`, true)}
            {renderField(t('Confidence', '置信度'), `${(rx.confidence * 100).toFixed(0)}%`, true)}
            {renderField(t('Responsibility', '责任归属'), rx.responsibilityBoundary)}

            {rx.constraints && !compact && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>{t('Constraints', '约束条件')}</div>
                    {rx.constraints.wind_max_ms && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('Wind', '风速')}: &lt; {rx.constraints.wind_max_ms} m/s</div>}
                    {rx.constraints.phi_days > 0 && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PHI: {rx.constraints.phi_days} {t('days', '天')}</div>}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('Soil moisture', '土壤含水率')}: &lt; {rx.constraints.soil_moisture_max_pct}%</div>
                </div>
            )}

            {rx.constraintCheck?.violations?.length > 0 && (
                <div style={{ marginTop: 12, padding: 10, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>{t('CONSTRAINT VIOLATIONS', '约束违规')}</div>
                    {rx.constraintCheck.violations.map((v, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#ef4444' }}>{v.type}: {v.message}</div>
                    ))}
                </div>
            )}

            {!compact && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>{t('Verification', '验证')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('Recheck', '复检')}: {rx.verification.recheckAfterHours}h | {t('Target', '目标')}: {rx.verification.targetReduction}</div>
                </div>
            )}

            {!compact && rx.expectedOutcome && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                        {t('Expected', '预计')}: {t('Risk', '风险')} -{rx.expectedOutcome.riskReduction} pts
                        {rx.expectedOutcome.gradeProtection && ` | ${t('Grade', '等级')} ${rx.expectedOutcome.gradeProtection} ${t('protected', '已保护')}`}
                    </div>
                    {rx.estimatedCost > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('Estimated cost', '预计成本')}: CNY {rx.estimatedCost.toLocaleString()}</div>
                    )}
                </div>
            )}

            {(onModify || onApprove || onExecute) && rx.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {onModify && <button className="btn btn-secondary" onClick={() => onModify(rx.id)}>{t('Modify', '调整')}</button>}
                    {onApprove && <button className="btn btn-primary" onClick={() => onApprove(rx.id)}>{t('Approve', '审批')}</button>}
                    {onExecute && <button className="btn btn-success" onClick={() => onExecute(rx.id)}>{t('Execute', '执行')}</button>}
                </div>
            )}
        </div>
    );
}
