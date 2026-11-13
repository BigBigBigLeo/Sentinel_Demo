import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import { pick } from '../i18n/locale.js';
import { CASE_ID, ORDER_KG, ORDER_PRICE, LOTS } from '../demo/scenario.js';

export default function FarmBusiness() {
    const navigate = useNavigate();
    const { locale, activeFieldId, fields } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const field = fields[activeFieldId] || { name: 'Yunnan Blueberry Base' };

    const [activeTab, setActiveTab] = useState('orders');

    const totalContractValue = ORDER_KG * ORDER_PRICE;
    const nominalCapacity = 3 * 25 * 12; // 3 days * 25 pickers * 12 kg/day = 900 kg

    return (
        <div className="page business-page">
            <PipelineBreadcrumb />

            <div className="page-header" style={{ marginBottom: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="layers" size={22} color="#38bdf8" />
                        {t('Farm Business & Commitments', '农场经营与在手订单')}
                    </h1>
                    <p className="page-subtitle">
                        {isZh ? (field.nameZh || field.name) : field.name} | {t('Order & Resource Economics', '订单履约、批次对齐与经营核算')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/risk')}>
                        <Icon name="risk" size={14} /> {t('Check Field Risk', '查看地块风险')}
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/prescription')}>
                        {t('Decision Room', '前往决策室')} <Icon name="chevron-right" size={14} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <MetricCard
                    label={t('Open Order Commitment', '在手主订单承诺')}
                    value={`${ORDER_KG} kg`}
                    subtitle={`Grade A · ${CASE_ID}`}
                    status="low"
                    icon="box"
                />
                <MetricCard
                    label={t('Gross Contract Value', '全量交付合同总额')}
                    value={`CNY ${totalContractValue.toLocaleString()}`}
                    subtitle={`¥${ORDER_PRICE}/kg ${t('signed contract', '签约合同单价')}`}
                    status="low"
                    icon="dollar"
                />
                <MetricCard
                    label={t('Nominal Harvest Capacity', '3天标称采收产能')}
                    value={`${nominalCapacity} kg`}
                    subtitle={`25 ${t('pickers', '人')} · 12 kg/${t('picker-day', '工日')}`}
                    icon="users"
                />
                <MetricCard
                    label={t('Eligible Supply Available', '合格 A 级供给储备')}
                    value="780 kg"
                    subtitle="LOT-01 (420kg) + LOT-02 (360kg)"
                    status="low"
                    icon="activity"
                />
            </div>

            {/* Business Tabs */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'rgba(15,23,42,0.4)' }}>
                    {[
                        { key: 'orders', label: t('Orders & Crop Lots', '订单与作物批次'), icon: 'box' },
                        { key: 'resources', label: t('Labor & Logistics Capacity', '劳动力与采运负荷'), icon: 'users' },
                        { key: 'economics', label: t('Economics & Contribution', '成本收益与价格基准'), icon: 'dollar' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '12px 20px',
                                background: activeTab === tab.key ? 'rgba(56,189,248,0.08)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '2px solid #38bdf8' : '2px solid transparent',
                                color: activeTab === tab.key ? '#38bdf8' : '#94a3b8',
                                fontWeight: activeTab === tab.key ? 700 : 500,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                            }}
                        >
                            <Icon name={tab.icon} size={15} color={activeTab === tab.key ? '#38bdf8' : '#64748b'} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: 20 }}>
                    {activeTab === 'orders' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                    {t('Commercial Commitment: Customer Order Registry', '商业承诺：客户合同与批次分配寄存表')}
                                </h3>
                                <StatusBadge status="ready" text={t('Contract Active · Locked Price', '履约中 · 合同锁定单价')} />
                            </div>

                            <div className="table-responsive" style={{ overflowX: 'auto', marginBottom: 20 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', color: '#64748b' }}>
                                            <th style={{ padding: '8px 12px' }}>{t('Order ID', '订单编号')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Target Grade', '等级规格')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Committed Volume', '承诺数量')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Contract Price', '签约单价')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Total Value', '合同总值')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Due In', '交付期限')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Allocated Batches', '关联分配批次')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', background: 'rgba(56,189,248,0.03)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#38bdf8' }}>{CASE_ID}</td>
                                            <td style={{ padding: '10px 12px' }}><span className="badge badge-primary">Grade A</span></td>
                                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ORDER_KG} kg</td>
                                            <td style={{ padding: '10px 12px' }}>¥{ORDER_PRICE} / kg</td>
                                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#34d399' }}>¥{totalContractValue.toLocaleString()}</td>
                                            <td style={{ padding: '10px 12px' }}>3 {t('days', '天')}</td>
                                            <td style={{ padding: '10px 12px', color: '#94a3b8' }}>LOT-01, LOT-02</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                                {t('Field Lot Allocation & Availability Register', '田间地块批次分配与当前状态')}
                            </h4>
                            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', color: '#64748b' }}>
                                            <th style={{ padding: '8px 12px' }}>{t('Lot ID', '批次号')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Block / Plot', '所属生产地块')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Ready Volume', '现存待采量')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Grade A Forecast', 'A级预估量')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Operational Status', '当前运营状态')}</th>
                                            <th style={{ padding: '8px 12px' }}>{t('Ontology Impact', '业务本体关联影响')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {LOTS.map(lot => (
                                            <tr key={lot.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                                                <td style={{ padding: '10px 12px', fontWeight: 700 }}>{lot.id}</td>
                                                <td style={{ padding: '10px 12px' }}>{lot.plot}</td>
                                                <td style={{ padding: '10px 12px' }}>{lot.ready} kg</td>
                                                <td style={{ padding: '10px 12px', fontWeight: 600, color: lot.gradeA > 0 ? '#34d399' : '#94a3b8' }}>
                                                    {lot.gradeA} kg
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    {lot.id === 'LOT-03' ? (
                                                        <span className="badge badge-warning" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                            {t('Isolated (Pest Watch)', '已风险隔离 (虫害告警)')}
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-success" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                                                            {t('Released for Harvest', '合格待采收')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px 12px', color: '#94a3b8' }}>
                                                    {lot.id === 'LOT-03'
                                                        ? t('TRAP-S02 alert -> Isolated -> Excluded from Grade A delivery', 'TRAP-S02 触发告警 -> 物理隔离 -> 剔除出 A 级交付')
                                                        : t(`Allocated to ${CASE_ID}`, `已锁定并分配给 ${CASE_ID}`)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                    {t('Labor Allocation & Picking Window Constraints', '采收班组调度与采收窗口硬约束')}
                                </h3>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {t('Resource ID: CREW-25 · 2 Shifts Active', '资源标识：CREW-25 · 2个作业组在岗')}
                                </span>
                            </div>

                            <div className="grid grid-3" style={{ gap: 14, marginBottom: 16 }}>
                                <div className="card" style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Crew Group A (North)', 'A 采收组 (北区)')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>13 {t('Workers', '人')}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                                        {t('Assigned to LOT-01 · 156 kg/day', '定点采收 LOT-01 · 156 kg/天')}
                                    </div>
                                </div>
                                <div className="card" style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Crew Group B (South Healthy)', 'B 采收组 (南区健康段)')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>12 {t('Workers', '人')}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                                        {t('Assigned to LOT-02 · 144 kg/day', '定点采收 LOT-02 · 144 kg/天')}
                                    </div>
                                </div>
                                <div className="card" style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{t('Cold Chain & Packing Slot', '冷链预冷与包装线排班')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>Slot C-02</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                                        {t('Reserved for T+1 16:00 · 800 kg max', '已预约 T+1 16:00 · 最大 800 kg')}
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ background: 'rgba(56,189,248,0.03)', border: '1px solid rgba(56,189,248,0.15)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <Icon name="activity" size={16} color="#38bdf8" />
                                    <strong style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{t('Window Feasibility Check', '采收与交付时效推演校验')}</strong>
                                </div>
                                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0 }}>
                                    {t(
                                        'Under Plan B, harvesting begins on Day 1. Total 3-day crew throughput is 900 kg, comfortably exceeding the 750 kg order quota. In contrast, under a 1-day delivery emergency scenario, maximum capacity is strictly 300 kg, generating a non-negotiable 450 kg shortfall that triggers automated escalation.',
                                        '在 Plan B 策略下，第 1 天即可开始采收。3 天总运力可达 900 kg，充裕覆盖 750 kg 合同需求。反之，若处于 1 天紧急交付窗口，单日最大运力仅 300 kg，将产生不可避免的 450 kg 履约缺口并触发自动升级。'
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'economics' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                    {t('Order Financial Analysis & Plan Contribution', '订单财务核算与备选方案边际贡献')}
                                </h3>
                                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                                    {t('Full Contract Fulfillment: CNY 48,750', '全额交付总额：CNY 48,750')}
                                </span>
                            </div>

                            <div className="grid grid-3" style={{ gap: 14, marginBottom: 16 }}>
                                <div className="card" style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t('Plan A: Full Protection', '方案 A：全量植保')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', marginTop: 4 }}>CNY 0</div>
                                    <small style={{ color: '#ef4444' }}>{t('Blocked by PHI · Delivery missed', '安全期冲突 · 无法交付')}</small>
                                </div>
                                <div className="card" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.3)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>{t('Plan B: Selective Release (Lead)', '方案 B：分批放行 (推荐)')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>CNY 43,350</div>
                                    <small style={{ color: '#94a3b8' }}>¥48,750 {t('gross', '收入')} - ¥5,400 {t('ops cost', '执行成本')}</small>
                                </div>
                                <div className="card" style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t('Plan C: Harvest-First', '方案 C：抢收降级')}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>CNY 41,900</div>
                                    <small style={{ color: '#f59e0b' }}>{t('Short 30kg Grade A · Downgraded', 'A级短缺30kg · 降级处理')}</small>
                                </div>
                            </div>

                            <div className="card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                                    {t('Price Basis & Market Divergence Policy', '价格口径与市场基准对账原则')}
                                </h4>
                                <ul style={{ fontSize: '0.76rem', color: '#94a3b8', paddingLeft: 18, lineHeight: 1.6, margin: 0 }}>
                                    <li>
                                        <strong>{t('Contract Price:', '订单合同价：')}</strong> ¥65/kg · {t('Binding legal obligation. Market fluctuations do NOT alter this signed order value.', '法定履约约束。外部行情波动不改变已签订单结算单价。')}
                                    </li>
                                    <li>
                                        <strong>{t('Regional Benchmark:', '产区参考价：')}</strong> ¥54/kg (vs ¥60/kg prior, -10%) · {t('Market reference is advisory only. Triggers sales review for upcoming quotes without penalizing current order contribution.', '市场参考仅作预警提示。触发销售端对新报价的复核，不损益当前已锁定合同贡献。')}
                                    </li>
                                    <li>
                                        <strong>{t('Spot Wholesale Offer:', '公开批发挂牌：')}</strong> ¥100/kg · {t('Chengjiang Huaxiang listing. Verified source reference only.', '澄江华香挂牌价。作为公开参考信源，不进入履约计算。')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
