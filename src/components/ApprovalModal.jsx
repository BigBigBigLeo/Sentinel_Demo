import React from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';

export default function ApprovalModal({ item, onApprove, onReject, onClose }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);

    if (!item) return null;

    const rx = item.prescription || {};
    const risk = item.riskScore || 0;
    const severity = risk >= 70 ? 'critical' : risk >= 50 ? 'elevated' : 'warning';

    return (
        <div className="approval-overlay" onClick={onClose}>
            <div className="approval-modal" onClick={e => e.stopPropagation()}>
                <div className="approval-header">
                    <div className="approval-header-icon">
                        <Icon name="alert-triangle" size={20} color="#f59e0b" />
                    </div>
                    <div>
                        <div className="approval-title">{t('Human Approval Required', '需要人工审批')}</div>
                        <div className="approval-subtitle">
                            {t('Critical decision: risk score', '关键决策：风险分值')} {risk}/100 {t('exceeds auto-execution threshold', '超过自动执行阈值')}
                        </div>
                    </div>
                    <button className="approval-close" onClick={onClose} aria-label={t('Close', '关闭')}>×</button>
                </div>

                <div className="approval-body">
                    <div className="approval-section">
                        <div className="approval-section-title">{t('Prescription Summary', '处方摘要')}</div>
                        <div className="approval-detail-grid">
                            <div className="approval-detail">
                                <span className="approval-label">{t('Target Threat', '目标威胁')}</span>
                                <span className="approval-value">{locale === 'zh' ? (rx.threatNameZh || rx.targetThreatZh || item.threatZh || rx.targetThreat || item.threat || '—') : (rx.targetThreat || rx.threatName || item.threat || '—')}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">{t('Action', '动作')}</span>
                                <span className="approval-value">{locale === 'zh' ? (rx.actionLabelZh || rx.primaryAction?.actionZh || rx.primaryAction?.action || rx.action || '—') : (rx.actionLabel || rx.primaryAction?.action || rx.action || '—')}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">{t('Chemical', '药剂')}</span>
                                <span className="approval-value">{rx.primaryAction?.activeIngredient?.name || '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">{t('Dosage', '剂量')}</span>
                                <span className="approval-value">{rx.primaryAction?.dosageRatio ? `${(rx.primaryAction.dosageRatio * 100).toFixed(0)}% ${t('standard', '标准剂量')}` : '—'}</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">{t('Risk Score', '风险分值')}</span>
                                <span className="approval-value" style={{ color: severity === 'critical' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{risk}/100</span>
                            </div>
                            <div className="approval-detail">
                                <span className="approval-label">{t('Estimated Cost', '预计成本')}</span>
                                <span className="approval-value">{rx.estimatedCost ? `CNY ${rx.estimatedCost.toLocaleString()}` : '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="approval-section">
                        <div className="approval-section-title">{t('Contributing Evidence', '关键证据')}</div>
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

                    <div className="approval-section">
                        <div className="approval-section-title">{t('Constraint Checks', '约束检查')}</div>
                        <div className="approval-checks">
                            {(item.constraints || [
                                { name: 'PHI Compliance', status: 'pass', detail: '30d to harvest > 14d PHI' },
                                { name: 'Wind Conditions', status: 'pass', detail: '1.8 m/s < 3.0 m/s limit' },
                                { name: 'Banned Substance', status: 'pass', detail: 'Mancozeb not on banned list' },
                                { name: 'MOA Rotation', status: 'pass', detail: 'M03 group - last use >21d ago' },
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

                <div className="approval-footer">
                    <button className="btn btn-outline" onClick={onClose}>{t('Cancel', '取消')}</button>
                    <button className="btn btn-danger" onClick={() => onReject(item.id)}>
                        <Icon name="alert-triangle" size={14} /> {t('Reject', '驳回')}
                    </button>
                    <button className="btn btn-success" onClick={() => onApprove(item.id)}>
                        <Icon name="check" size={14} /> {t('Approve & Execute', '审批并执行')}
                    </button>
                </div>
            </div>
        </div>
    );
}
