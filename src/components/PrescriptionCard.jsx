import React from 'react';
import StatusBadge from './StatusBadge';

export default function PrescriptionCard({ rx, onModify, onApprove, onExecute, compact = false }) {
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

            {renderField('Target', rx.target)}
            {renderField('Threat', `${rx.threatName} (Score: ${rx.riskScore})`)}
            {renderField('Action', rx.actionLabel)}
            {rx.activeIngredient && renderField('Active Ingredient', `${rx.activeIngredient.name} [MoA ${rx.activeIngredient.moaGroup}]`)}
            {rx.dosageRatio > 0 && renderField('Dosage', `${(rx.dosageRatio * 100).toFixed(0)}% of label rate`, true)}
            {renderField('Confidence', `${(rx.confidence * 100).toFixed(0)}%`, true)}
            {renderField('Responsibility', rx.responsibilityBoundary)}

            {/* Constraints */}
            {rx.constraints && !compact && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Constraints</div>
                    {rx.constraints.wind_max_ms && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wind: &lt; {rx.constraints.wind_max_ms} m/s</div>}
                    {rx.constraints.phi_days > 0 && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PHI: {rx.constraints.phi_days} days</div>}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Soil moisture: &lt; {rx.constraints.soil_moisture_max_pct}%</div>
                </div>
            )}

            {/* Constraint violations */}
            {rx.constraintCheck?.violations?.length > 0 && (
                <div style={{ marginTop: 12, padding: 10, background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>CONSTRAINT VIOLATIONS</div>
                    {rx.constraintCheck.violations.map((v, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#ef4444' }}>{v.type}: {v.message}</div>
                    ))}
                </div>
            )}

            {/* Verification */}
            {!compact && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Verification</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Recheck: {rx.verification.recheckAfterHours}h | Target: {rx.verification.targetReduction}</div>
                </div>
            )}

            {/* Expected */}
            {!compact && rx.expectedOutcome && (
                <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                        Expected: Risk -{rx.expectedOutcome.riskReduction} pts
                        {rx.expectedOutcome.gradeProtection && ` | Grade ${rx.expectedOutcome.gradeProtection} protected`}
                    </div>
                    {rx.estimatedCost > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated cost: ¥{rx.estimatedCost.toLocaleString()}</div>
                    )}
                </div>
            )}

            {/* Actions */}
            {(onModify || onApprove || onExecute) && rx.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    {onModify && <button className="btn btn-secondary" onClick={() => onModify(rx.id)}>Modify</button>}
                    {onApprove && <button className="btn btn-primary" onClick={() => onApprove(rx.id)}>Approve</button>}
                    {onExecute && <button className="btn btn-success" onClick={() => onExecute(rx.id)}>Execute</button>}
                </div>
            )}
        </div>
    );
}
