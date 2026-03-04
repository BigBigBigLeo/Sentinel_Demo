import React from 'react';
import Icon from './Icon';

export default function ApprovalModal({ item, onApprove, onReject, onClose }) {
    if (!item) return null;

    const rx = item.prescription || {};
    const risk = item.riskScore || 0;
    const severity = risk >= 70 ? 'critical' : risk >= 50 ? 'elevated' : 'warning';

    return (
        <div className="approval-overlay" onClick={onClose}>
            <div className="approval-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="approval-header">
                    <div className="approval-header-icon">
                        <Icon name="alert-triangle" size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <div className="approval-title">Human Approval Required</div>
                        <div className="approval-subtitle">Critical decision — risk score {risk}/100 exceeds auto-execute threshold</div>
                    </div>
                    <button className="approval-close" onClick={onClose}>×</button>
                </div>

                {/* Body */}
                <div className="approval-body">
                    {/* Prescription Summary */}
                    <div className="approval-section">
                        <div className="approval-section-title">Prescription Summary</div>
                        <div className="approval-detail-grid">
                            <div className="approval-detail">
                                <span className="approval-label">Target Threat</span>
                                <span className="approval-value">{rx.targetThreat || item.threat || '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">Action</span>
                                <span className="approval-value">{rx.primaryAction?.action || rx.action || '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">Chemical</span>
                                <span className="approval-value">{rx.primaryAction?.activeIngredient?.name || '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">Dosage</span>
                                <span className="approval-value">{rx.primaryAction?.dosageRatio ? `${(rx.primaryAction.dosageRatio * 100).toFixed(0)}% standard` : '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">Risk Score</span>
                                <span className="approval-value" style={{ color: severity === 'critical' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{risk}/100</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">Estimated Cost</span>
                                <span className="approval-value">{rx.estimatedCost ? `¥${rx.estimatedCost.toLocaleString()}` : '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Evidence */}
                    <div className="approval-section">
                        <div className="approval-section-title">Contributing Evidence</div>
                        <div className="approval-evidence-list">
                            {(item.evidence || []).map((e, i) => (
                                <div key={i} className="approval-evidence-item">
                                    <span className="approval-evidence-dot" style={{ background: e.impact === 'high' ? '#ef4444' : e.impact === 'medium' ? '#f59e0b' : '#34d399' }} />
                                    <span>{e.description}</span>
                                    <span className="approval-evidence-score">+{e.points}pts</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Constraints Check */}
                    <div className="approval-section">
                        <div className="approval-section-title">Constraint Checks</div>
                        <div className="approval-checks">
                            {(item.constraints || [
                                { name: 'PHI Compliance', status: 'pass', detail: '30d to harvest > 14d PHI' },
                                { name: 'Wind Conditions', status: 'pass', detail: '1.8 m/s < 3.0 m/s limit' },
                                { name: 'Banned Substance', status: 'pass', detail: 'Mancozeb not on banned list' },
                                { name: 'MOA Rotation', status: 'pass', detail: 'M03 group — last use >21d ago' },
                            ]).map((c, i) => (
                                <div key={i} className="approval-check-row">
                                    <Icon name={c.status === 'pass' ? 'check' : 'alert-triangle'} size={14} color={c.status === 'pass' ? '#34d399' : '#ef4444'} />
                                    <span className="approval-check-name">{c.name}</span>
                                    <span className="approval-check-detail">{c.detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="approval-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => onReject(item.id)}>
                        <Icon name="alert-triangle" size={14} /> Reject
                    </button>
                    <button className="btn btn-success" onClick={() => onApprove(item.id)}>
                        <Icon name="check" size={14} /> Approve & Execute
                    </button>
                </div>
            </div>
        </div>
    );
}
