import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';

export default function FinancialKPI({ financials, compact = false }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);

    if (!financials) return null;

    const currency = financials.currency || 'CNY ';
    const fmt = (v) => {
        if (v >= 10000) return `${(v / 10000).toFixed(1)}w`;
        if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
        return v.toLocaleString();
    };

    const comparisonData = [
        { name: t('Sentinel Precision', 'Sentinel 精准方案'), cost: financials.totalSpent, fill: '#38bdf8' },
        { name: t('Traditional Method', '传统方案'), cost: financials.traditionalEstimate, fill: '#64748b' },
    ];

    if (compact) {
        return (
            <div className="financial-kpi-compact">
                <div className="fin-metric">
                    <div className="fin-label">{t('Season Spend', '季内支出')}</div>
                    <div className="fin-value" style={{ color: '#f59e0b' }}>{currency}{fmt(financials.totalSpent)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">{t('Predicted Savings', '预计节省')}</div>
                    <div className="fin-value" style={{ color: '#34d399' }}>{currency}{fmt(financials.predictedSavings)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">{t('Revenue Protected', '已保护收益')}</div>
                    <div className="fin-value" style={{ color: '#38bdf8' }}>{currency}{fmt(financials.revenueProtected)}</div>
                </div>
                <div className="fin-divider" />
                <div className="fin-metric">
                    <div className="fin-label">{t('Season ROI', '季内 ROI')}</div>
                    <div className="fin-value" style={{ color: '#a78bfa' }}>{financials.seasonROI}x</div>
                </div>
            </div>
        );
    }

    return (
        <div className="financial-kpi-panel">
            <div className="financial-kpi-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="fin-icon-wrap"><Icon name="dollar" size={18} /></div>
                    <div>
                        <div className="fin-title">{t('Season Financial Intelligence', '季度财务智能')}</div>
                        <div className="fin-subtitle">{financials.interventions} {t('interventions', '次干预')} | {financials.gradeDowngradesPrevented} {t('downgrades prevented', '次降级已避免')}</div>
                    </div>
                </div>
            </div>

            <div className="financial-kpi-body">
                <div className="fin-grid-4">
                    <div className="fin-card" style={{ borderLeftColor: '#f59e0b' }}>
                        <div className="fin-card-label">{t('Total Spent', '总支出')}</div>
                        <div className="fin-card-value" style={{ color: '#f59e0b' }}>{currency}{fmt(financials.totalSpent)}</div>
                        <div className="fin-card-breakdown">
                            {t('Labor', '人工')} {currency}{fmt(financials.laborCost)} | {t('Chemical', '药剂')} {currency}{fmt(financials.chemicalCost)} | Drone {currency}{fmt(financials.droneCost)} | IoT {currency}{fmt(financials.iotCost)}
                        </div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#34d399' }}>
                        <div className="fin-card-label">{t('Predicted Savings', '预计节省')}</div>
                        <div className="fin-card-value" style={{ color: '#34d399' }}>{currency}{fmt(financials.predictedSavings)}</div>
                        <div className="fin-card-breakdown">{t('vs. traditional broadcast approach', '相较传统全覆盖喷施')}</div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#38bdf8' }}>
                        <div className="fin-card-label">{t('Revenue Protected', '已保护收益')}</div>
                        <div className="fin-card-value" style={{ color: '#38bdf8' }}>{currency}{fmt(financials.revenueProtected)}</div>
                        <div className="fin-card-breakdown">{t('Losses prevented', '已避免损失')}: {currency}{fmt(financials.preventedLosses)}</div>
                    </div>
                    <div className="fin-card" style={{ borderLeftColor: '#a78bfa' }}>
                        <div className="fin-card-label">{t('Season ROI', '季内 ROI')}</div>
                        <div className="fin-card-value" style={{ color: '#a78bfa' }}>{financials.seasonROI}x</div>
                        <div className="fin-card-breakdown">{t('Net benefit', '净收益')}: {currency}{fmt(financials.netBenefit)}</div>
                    </div>
                </div>

                <div className="fin-chart-section">
                    <div className="fin-chart-label">{t('Sentinel vs. Traditional - Season Cost Comparison', 'Sentinel vs 传统方案｜季内成本对比')}</div>
                    <ResponsiveContainer width="100%" height={130}>
                        <BarChart data={comparisonData} layout="vertical" barSize={22}>
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} formatter={(v) => `${currency}${v.toLocaleString()}`} />
                            <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                                {comparisonData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
