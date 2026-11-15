import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import Tooltip from '../components/Tooltip';
import OrderDossierModal from '../components/OrderDossierModal';
import { pick } from '../i18n/locale.js';
import { CASE_ID, ORDER_KG, ORDER_PRICE, LOTS } from '../demo/scenario.js';

import { ENTERPRISE_ORDERS, ORDER_CATEGORIES, PORTFOLIO_SUMMARY } from '../data/ordersData';

// Zone Topology Specifications (900 Mu)
const ZONE_TOPOLOGY = [
    {
        id: 'ZONE-A',
        name: 'A区：350 亩 现代智能连栋温室',
        nameEn: 'Zone A: 350-Mu Smart Greenhouse',
        role: '早熟高端果核心区 · 基质盆栽水肥闭环',
        roleEn: 'Early-Season Premium Core · Closed Hydroponics',
        crop: '华香、法新 (早熟特大果)',
        cropEn: 'Huaxiang, Faxin (Early Large-Berries)',
        equipment: '荷兰全自控灌溉、自动遮阳幕帘、TRAP-S01~S06 智能诱捕',
        equipmentEn: 'Auto Fertigation, Solar Screens, Smart Traps S01-S06',
        capacityToday: '1,950 kg / 2,200 kg (负荷率 88.6%)',
        capacityTodayEn: '1,950 kg / 2,200 kg (Load 88.6%)',
        loadPct: 88.6,
        color: '#00e5a3',
        crew: '38 人专业技工班组 (严格白手套纯手工采收，保果粉完整)',
        crewEn: '38 Skilled Harvest Technicians (Strict white-glove wax preservation)',
    },
    {
        id: 'ZONE-B',
        name: 'B区：400 亩 双层保温大棚',
        nameEn: 'Zone B: 400-Mu Thermal High-Tunnel',
        role: '高产稳产区 · 反季节错峰出产主力',
        roleEn: 'High-Yield Stable Core · Off-Season Bulk Carrier',
        crop: '绿宝石、珠宝 (高产稳产中熟果)',
        cropEn: 'Emerald, Jewel (Mid-Season High Yield)',
        equipment: '电动卷膜通风、滴灌中控台、防霜冻空气加温机',
        equipmentEn: 'Motorized Vents, Drip Substation, Frost Heaters',
        capacityToday: '6,500 kg / 6,800 kg (负荷率 95.6%)',
        capacityTodayEn: '6,500 kg / 6,800 kg (Load 95.6%)',
        loadPct: 95.6,
        color: '#38bdf8',
        crew: '62 名专业采收技术员（日人均采摘 105 kg，专注大仓快速履约）',
        crewEn: '62 Harvest Technicians (Avg 105 kg/day, high-speed KA fulfillment)',
    },
    {
        id: 'ZONE-C',
        name: 'C区：150 亩 露天试验基底 + 300 吨集中气调保鲜库',
        nameEn: 'Zone C: 150-Mu Field Base + 300t CA Cold Storage',
        role: '品种培育试验田 + 集中气调恒温调峰储备枢纽',
        roleEn: 'Breeding Trial Base + 300t CA Cold Storage Hub',
        crop: '新品种试种 + 梯度预冷打冷仓储',
        cropEn: 'New Cultivars + Step Pre-cooling & CA Storage',
        equipment: '4 套螺杆压缩机组、98% 高纯氮气机、果心温 1.5±0.2°C 监控',
        equipmentEn: '4 Screw Compressors, 98% N2 Gas, 1.5±0.2°C Core Temp',
        capacityToday: '现存合格储备 145 吨 / 库容 300 吨 (库容占比 48.3%)',
        capacityTodayEn: 'Current Reserve 145t / 300t Capacity (Occupancy 48.3%)',
        loadPct: 48.3,
        color: '#f59e0b',
        crew: '20 名库管与分拣冷链质检专员 (24 小时气调监控)',
        crewEn: '20 Cold-chain QA Specialists (24h CA monitoring)',
    },
];

export default function FarmBusiness() {
    const navigate = useNavigate();
    const { locale, activeFieldId, fields } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const field = fields[activeFieldId] || { name: 'Yunnan Blueberry Base' };

    // Mode Toggle: 'macro' (900-Mu Enterprise Portfolio) vs 'focal' (750kg Decision Case)
    const [viewMode, setViewMode] = useState('macro');
    // Active sub-tab inside macro mode
    const [macroTab, setMacroTab] = useState('orders'); // 'orders' | 'zones' | 'pnl'
    // Order Category Filter in Enterprise Registry: 'ALL' | 'T0' | 'T1_T3' | 'QUARTER' | 'LONGTERM'
    const [orderCategoryFilter, setOrderCategoryFilter] = useState('ALL');
    // Selected Order for Dossier Modal
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredOrders = ENTERPRISE_ORDERS.filter(order => {
        if (orderCategoryFilter === 'ALL') return true;
        if (orderCategoryFilter === 'T0') return order.category === 't0';
        if (orderCategoryFilter === 'T1_T3') return order.category === 't1_t3';
        if (orderCategoryFilter === 'QUARTER') return order.category === 'quarter';
        if (orderCategoryFilter === 'LONGTERM') return order.category === 'longterm';
        return true;
    });

    // Macro Totals (Derived from Unified SSOT ordersData)
    const totalVolumeKg = PORTFOLIO_SUMMARY.totalVolumeKg; // 12,450 kg
    const totalRevenue = PORTFOLIO_SUMMARY.totalContractRevenue; // ¥898,150
    const totalDirectCost = PORTFOLIO_SUMMARY.totalDirectCost; // ¥385,200
    const netContribution = PORTFOLIO_SUMMARY.netContribution; // ¥512,950 (57.1%)
    const sentinelValueAdd = PORTFOLIO_SUMMARY.sentinelValueAdd; // +¥183,950

    // Focal Case Totals
    const focalTotalValue = ORDER_KG * ORDER_PRICE;
    const focalCapacity = 3 * 25 * 12; // 900 kg

    return (
        <div className="page business-page" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <PipelineBreadcrumb />

            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="layers" size={22} color="#38bdf8" />
                        {t('Enterprise Farm Business & Order Fulfillment Core', '900亩超级园区产销大盘与企业履约中枢')}
                    </h1>
                    <p className="page-subtitle">
                        {isZh ? '云南澄江 900 亩数字农业核心示范园区 · 3大种植片区 · 12批企业级商业与战略长协订单交付矩阵' : 'Yunnan Chengjiang 900-Mu Digital Facility · 3 Zones · 12 Enterprise KA & Strategic Commitments'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/risk')}>
                        <Icon name="risk" size={14} /> {t('Check Field Risk', '查看地块风险')}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/prescription')}
                        style={{ background: 'linear-gradient(135deg, #00e5a3 0%, #059669 100%)', color: '#090d16', fontWeight: 800 }}
                    >
                        {t('Enter Decision Room →', '前往方案决策室 →')}
                    </button>
                </div>
            </div>

            {/* ── View Switcher: Macro Enterprise Portfolio vs Focal Ticket ── */}
            <div style={{
                background: '#0a0f1d',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: 4,
                marginBottom: 16,
                display: 'flex',
                gap: 6
            }}>
                <button
                    type="button"
                    onClick={() => setViewMode('macro')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: viewMode === 'macro' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: viewMode === 'macro' ? '#38bdf8' : '#94a3b8',
                        fontWeight: viewMode === 'macro' ? 800 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: viewMode === 'macro' ? 'inset 0 0 0 1px #38bdf8' : 'none'
                    }}
                >
                    <Icon name="layers" size={16} color={viewMode === 'macro' ? '#38bdf8' : '#64748b'} />
                    {t('900-Mu Enterprise Portfolio (12 Orders · 12,450 kg · ¥898.1K)', '900 亩全园产销大盘 (12 批大单 · 12,450 kg · 当日总销售 ¥89.8万)')}
                </button>

                <button
                    type="button"
                    onClick={() => setViewMode('focal')}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: 6,
                        border: 'none',
                        background: viewMode === 'focal' ? 'rgba(0, 229, 163, 0.15)' : 'transparent',
                        color: viewMode === 'focal' ? '#00e5a3' : '#94a3b8',
                        fontWeight: viewMode === 'focal' ? 800 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s',
                        boxShadow: viewMode === 'focal' ? 'inset 0 0 0 1px #00e5a3' : 'none'
                    }}
                >
                    <Icon name="box" size={16} color={viewMode === 'focal' ? '#00e5a3' : '#64748b'} />
                    {t('Focal Conflict Ticket (750 kg Hema · Plan B Lead)', '决策冲突焦点工单 (750 kg 盒马鲜生 · 方案 B 胜出)')}
                </button>
            </div>

            {/* ════════════════════════════════════════════════════════════════════════════
                MODE 1: 900-MU ENTERPRISE PORTFOLIO (MACRO VIEW)
               ════════════════════════════════════════════════════════════════════════════ */}
            {viewMode === 'macro' && (
                <div>
                    {/* Top 4 Hero KPIs */}
                    <div className="grid grid-4" style={{ marginBottom: 16 }}>
                        <Tooltip
                            title={t('Total Daily Fulfillment', '全园当日履约交付总量')}
                            content={t('Total dispatched volume across all 12 enterprise contracts for today. Reflects full 900-mu facility throughput.', '全园 12 个企业直供订单的单日履约总出库量。覆盖 900 亩澄江工厂全部在岗班组与气调库。')}
                            delayMs={1000}
                        >
                            <MetricCard
                                label={t('Daily Enterprise Output', '全园当日交付总量')}
                                value="12,450 kg"
                                subtitle={t('12.45 Tons · 93.6% Load', '12.45 吨 · 产能负荷 93.6%')}
                                status="low"
                                icon="box"
                            />
                        </Tooltip>

                        <Tooltip
                            title={t('Gross Contract Revenue', '全园当日合同总销售额')}
                            content={t('Locked direct contractual revenue across 12 enterprise contracts (Ole, Sams, Cathay, Hema, Pagoda, etc.).', '基于锁定直供合同单价(Ole¥88、国泰¥82、盒马¥65、山姆¥58、百果园¥55、批发¥37.5)计算的 12 批大单销售总额。')}
                            delayMs={1000}
                        >
                            <MetricCard
                                label={t('Gross Daily Sales Value', '全园当日合同总额')}
                                value="¥898,150"
                                subtitle={t('Avg ¥72.1/kg · 12 Key Orders', '综合均价 ¥72.1/kg · 锁定价格')}
                                status="low"
                                icon="dollar"
                            />
                        </Tooltip>

                        <Tooltip
                            title={t('Operating Cost & Margin', '当日综合成本与净毛利')}
                            content={t('Direct costs include labor (120 harvest crew), fertigation energy, cold storage, packaging, and freight.', '直接成本包含 120 人采收班组、智能水肥能耗、气调库打冷、环保保鲜盒及干线冷链运费。')}
                            delayMs={1000}
                        >
                            <MetricCard
                                label={t('Direct Cost & Margin', '综合成本与毛利')}
                                value="¥512,950"
                                subtitle={t('Cost ¥385.2K · Margin 57.1%', '成本 ¥38.5万 · 毛利率 57.1%')}
                                status="low"
                                icon="activity"
                            />
                        </Tooltip>

                        <Tooltip
                            title={t('Sentinel AI Value Captured', 'Sentinel 智能增益与价值挽损')}
                            content={t('Quantified value captured today: PHI compliance claim avoidance, cold-storage wax retention, crew efficiency, water/fertilizer savings, and shrink reduction.', '今日实证增益：规避农药违规索赔(+¥48,750)、气调库保鲜溢价(+¥56,200)、班组工效提升(+¥3,960)、节水肥(+¥15,040)、减损(+¥60,000)。')}
                            delayMs={1000}
                        >
                            <MetricCard
                                label={t('Sentinel Value-Add Captured', 'Sentinel 智能增益挽损')}
                                value="+¥183,950"
                                subtitle={t('14.2x System Daily ROI', '系统单日投资回报 14.2 倍')}
                                status="low"
                                icon="award"
                            />
                        </Tooltip>
                    </div>

                    {/* Macro Sub-Navigation Tabs */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(148,163,184,0.1)', background: 'rgba(15,23,42,0.6)' }}>
                            {[
                                { key: 'orders', label: t('Enterprise Order Portfolio (12 Key Orders)', '全园 12 大重点订单寄存与排产矩阵'), icon: 'box' },
                                { key: 'zones', label: t('900-Mu 3-Zone Topology & Capacity', '900 亩三大片区拓扑与产能负荷'), icon: 'layers' },
                                { key: 'pnl', label: t('Enterprise Daily P&L & Sentinel ROI', '900 亩企业级当日损益与增益精算'), icon: 'dollar' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setMacroTab(tab.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '12px 20px',
                                        background: macroTab === tab.key ? 'rgba(56,189,248,0.08)' : 'transparent',
                                        border: 'none',
                                        borderBottom: macroTab === tab.key ? '2px solid #38bdf8' : '2px solid transparent',
                                        color: macroTab === tab.key ? '#38bdf8' : '#94a3b8',
                                        fontWeight: macroTab === tab.key ? 700 : 500,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Icon name={tab.icon} size={15} color={macroTab === tab.key ? '#38bdf8' : '#64748b'} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: 20 }}>
                            {/* Sub-Tab 1: Enterprise Order Portfolio */}
                            {macroTab === 'orders' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                                        <div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Icon name="box" size={17} color="#38bdf8" />
                                                {t('Daily Enterprise Multi-Order Commitment Registry', '全园在手企业级大额订单交付总控台 (12 批大单)')}
                                            </h3>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                                                {t('Reconciles all 12 enterprise contracts across T0 same-day, trunk freight, quarterly quota, and strategic multi-month supply.', '对齐 12 大企业级订单与战略长协：涵盖当日急单、跨日干线、季度大单与半年长协交付看板。')}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '4px 10px', borderRadius: 4, fontWeight: 700 }}>
                                                {t('Total Daily Throughput: 12,450 kg · ¥898,150', '今日全园出库交付：12,450 kg · ¥898,150')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Category Filter Tabs */}
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: 'rgba(15,23,42,0.8)', padding: 4, borderRadius: 6, border: '1px solid rgba(148,163,184,0.15)', flexWrap: 'wrap' }}>
                                        {ORDER_CATEGORIES.map(tab => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => setOrderCategoryFilter(tab.id)}
                                                style={{
                                                    padding: '5px 12px',
                                                    borderRadius: 4,
                                                    border: 'none',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    background: orderCategoryFilter === tab.id ? '#38bdf8' : 'transparent',
                                                    color: orderCategoryFilter === tab.id ? '#090d16' : '#94a3b8',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {isZh ? tab.labelZh : tab.labelEn}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', color: '#64748b' }}>
                                                    <th style={{ padding: '10px 12px' }}>{t('Order ID', '订单代码')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Customer / Channel', '直供客户与渠道')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Category', '业务类型')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Target Grade', '等级与规格要求')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Volume', '签约量')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Unit Price', '约定单价')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Contract Value', '合同总值')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Delivery Due', '交货时限')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Assigned Zone', '承接片区与地块')}</th>
                                                    <th style={{ padding: '10px 12px' }}>{t('Fulfillment & Dossier', '履约状态与档案')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map(order => (
                                                    <tr
                                                        key={order.id}
                                                        onClick={() => setSelectedOrder(order)}
                                                        style={{
                                                            borderBottom: '1px solid rgba(148,163,184,0.08)',
                                                            background: order.isFocal ? 'rgba(0, 229, 163, 0.05)' : 'transparent',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = order.isFocal ? 'rgba(0, 229, 163, 0.05)' : 'transparent'; }}
                                                        title="点击查看订单履约全景档案与财务精算"
                                                    >
                                                        <td style={{ padding: '12px 12px', fontWeight: 800, fontFamily: 'monospace', color: order.isFocal ? '#00e5a3' : '#38bdf8' }}>
                                                            {order.id}
                                                            {order.isFocal && (
                                                                <span style={{ display: 'inline-block', marginLeft: 6, fontSize: '0.62rem', color: '#00e5a3', background: 'rgba(0,229,163,0.15)', border: '1px solid rgba(0,229,163,0.3)', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
                                                                    {t('Focal', '重点工单')}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px 12px', fontWeight: 600, color: '#f8fafc' }}>
                                                            {isZh ? order.customerZh : order.customer}
                                                        </td>
                                                        <td style={{ padding: '12px 12px' }}>
                                                            <span style={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                borderRadius: 4,
                                                                background: order.category === 't0' ? 'rgba(239,68,68,0.15)' : order.category === 't1_t3' ? 'rgba(56,189,248,0.15)' : order.category === 'quarter' ? 'rgba(168,85,247,0.15)' : 'rgba(52,211,153,0.15)',
                                                                color: order.category === 't0' ? '#f87171' : order.category === 't1_t3' ? '#38bdf8' : order.category === 'quarter' ? '#c084fc' : '#34d399',
                                                                border: `1px solid ${order.category === 't0' ? 'rgba(239,68,68,0.3)' : order.category === 't1_t3' ? 'rgba(56,189,248,0.3)' : order.category === 'quarter' ? 'rgba(168,85,247,0.3)' : 'rgba(52,211,153,0.3)'}`
                                                            }}>
                                                                {order.category === 't0' ? '当日急单 (T0)' : order.category === 't1_t3' ? '跨日干线' : order.category === 'quarter' ? '季度大单' : '战略长协'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 12px' }}>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: 4,
                                                                background: order.grade.includes('AAA') ? 'rgba(167, 139, 250, 0.15)' : order.grade.includes('AA') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                                                color: order.grade.includes('AAA') ? '#a78bfa' : order.grade.includes('AA') ? '#38bdf8' : '#34d399',
                                                                fontSize: '0.72rem', fontWeight: 700
                                                            }}>
                                                                {isZh ? order.gradeZh : order.grade}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 12px', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                                                            {order.volumeKg.toLocaleString()} kg
                                                        </td>
                                                        <td style={{ padding: '12px 12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                            ¥{order.unitPrice}/kg
                                                        </td>
                                                        <td style={{ padding: '12px 12px', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                                                            ¥{order.totalValue.toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px 12px', color: '#e2e8f0', fontSize: '0.74rem' }}>
                                                            {isZh ? order.dueTime : order.dueTimeEn}
                                                        </td>
                                                        <td style={{ padding: '12px 12px', color: '#94a3b8', fontSize: '0.74rem' }}>
                                                            {isZh ? order.zone : order.zoneEn}
                                                        </td>
                                                        <td style={{ padding: '12px 12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {order.isFocal ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate('/prescription');
                                                                        }}
                                                                        style={{
                                                                            background: 'rgba(0, 229, 163, 0.15)',
                                                                            border: '1px solid #00e5a3',
                                                                            borderRadius: 4,
                                                                            color: '#00e5a3',
                                                                            padding: '4px 8px',
                                                                            fontSize: '0.68rem',
                                                                            fontWeight: 800,
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 4
                                                                        }}
                                                                    >
                                                                        <span>{isZh ? order.statusLabel : order.statusLabelEn}</span>
                                                                        <Icon name="chevron-right" size={12} color="#00e5a3" />
                                                                    </button>
                                                                ) : (
                                                                    <span style={{
                                                                        padding: '3px 8px', borderRadius: 4,
                                                                        background: order.status === 'shipped' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                                        color: order.status === 'shipped' ? '#38bdf8' : '#10b981',
                                                                        fontSize: '0.7rem', fontWeight: 600
                                                                    }}>
                                                                        {isZh ? order.statusLabel : order.statusLabelEn}
                                                                    </span>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedOrder(order);
                                                                    }}
                                                                    style={{
                                                                        background: 'rgba(56, 189, 248, 0.12)',
                                                                        border: '1px solid rgba(56, 189, 248, 0.35)',
                                                                        borderRadius: 4,
                                                                        color: '#38bdf8',
                                                                        padding: '3px 8px',
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 700,
                                                                        cursor: 'pointer',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    title="查看合同与边际精算详情"
                                                                >
                                                                    档案
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ borderTop: '2px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.6)', fontWeight: 800 }}>
                                                    <td colSpan={4} style={{ padding: '12px 12px', color: '#f8fafc' }}>
                                                        {t('Total Daily Enterprise Portfolio (900-Mu Yunnan Super-Farm)', '全园单日交付总盘（900 亩云南澄江超级园区 12 大订单汇总）')}
                                                    </td>
                                                    <td style={{ padding: '12px 12px', color: '#38bdf8', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                                        12,450 kg
                                                    </td>
                                                    <td style={{ padding: '12px 12px', color: '#94a3b8' }}>-</td>
                                                    <td style={{ padding: '12px 12px', color: '#34d399', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                                        ¥898,150
                                                    </td>
                                                    <td colSpan={3} style={{ padding: '12px 12px', color: '#64748b', fontSize: '0.75rem' }}>
                                                        {t('12 KA Contractual Commitments Reconciled (100% Gated)', '12 批大单全部纳入 Sentinel 刚性门禁排产')}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Sub-Tab 2: 900-Mu 3-Zone Topology */}
                            {macroTab === 'zones' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                                {t('900-Mu Spatial Allocation & Zone Capacity Distribution', '900 亩空间分布与三大片区作业负荷')}
                                            </h3>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                                                {t('Physical farm layout, precision facilities, microclimate automation, and daily picking crew deployment.', '农场物理分布、环境自控设备、微气候传感器阵列与现场采收班组规制。')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-3" style={{ gap: 16 }}>
                                        {ZONE_TOPOLOGY.map(zone => (
                                            <div
                                                key={zone.id}
                                                className="card"
                                                style={{
                                                    background: '#090d16',
                                                    border: `1px solid ${zone.color}40`,
                                                    borderTop: `4px solid ${zone.color}`,
                                                    borderRadius: 8,
                                                    padding: 16,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                        <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                                                            {isZh ? zone.name : zone.nameEn}
                                                        </strong>
                                                        <span style={{ fontSize: '0.68rem', color: zone.color, fontWeight: 800 }}>
                                                            {zone.loadPct}% {t('Load', '负荷')}
                                                        </span>
                                                    </div>

                                                    <div style={{ fontSize: '0.74rem', color: zone.color, fontWeight: 600, marginBottom: 8 }}>
                                                        {isZh ? zone.role : zone.roleEn}
                                                    </div>

                                                    <div style={{ background: 'rgba(15,23,42,0.8)', padding: 10, borderRadius: 6, fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                                        <div>
                                                            <span style={{ color: '#64748b' }}>{t('Target Cultivars: ', '栽植品种：')}</span>
                                                            <strong style={{ color: '#e2e8f0' }}>{isZh ? zone.crop : zone.cropEn}</strong>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#64748b' }}>{t('Automation: ', '设施装备：')}</span>
                                                            <span>{isZh ? zone.equipment : zone.equipmentEn}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#64748b' }}>{t('Crew Allocation: ', '现场作业规制：')}</span>
                                                            <span style={{ color: '#38bdf8' }}>{isZh ? zone.crew : zone.crewEn}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: 10 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>
                                                        <span>{t('Daily Throughput', '当日采运吞吐')}</span>
                                                        <strong style={{ color: zone.color }}>{isZh ? zone.capacityToday : zone.capacityTodayEn}</strong>
                                                    </div>
                                                    <div style={{ height: 6, width: '100%', background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${zone.loadPct}%`, background: zone.color, borderRadius: 3 }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sub-Tab 3: Enterprise Daily P&L & Sentinel ROI */}
                            {macroTab === 'pnl' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <div>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                                {t('Enterprise Daily P&L Ledger & Sentinel ROI Value Ledger', '900 亩企业级当日财务损益平衡表与系统增益明细')}
                                            </h3>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                                                {t('Rigorous accounting reconciling gross revenue, direct input costs, logistics, packaging, and quantified Sentinel value capture.', '严谨精算对齐全园销售额、直接物化成本、冷链包装运输与 Sentinel 系统实证创造的真实净价值。')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-2" style={{ gap: 16 }}>
                                        {/* Left Column: Direct P&L */}
                                        <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                <strong style={{ fontSize: '0.86rem', color: '#38bdf8' }}>
                                                    {t('Daily Income & Direct Cost Balance', '全园当日营业损益核算 (Direct P&L)')}
                                                </strong>
                                                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>
                                                    {t('Margin: 57.1%', '净毛利率: 57.1%')}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.75rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(56,189,248,0.05)', borderRadius: 4 }}>
                                                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{t('1. Gross Sales Revenue (12.45t)', '1. 全园销售总收入 (12.45吨)')}</span>
                                                    <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>+¥898,150</strong>
                                                </div>

                                                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 6, color: '#94a3b8' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('Harvest Crew Labor (120 workers × ¥180 + night shift)', '采收分选人工 (120人 × ¥180/工日 + 早夜班补贴)')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥24,600</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('Precision Fertigation & Power (900 mu automated)', '水肥一体化营养液与泵站电耗 (900亩灌区)')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥18,400</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('300t CA Cold Storage Chilling & Nitrogen', '300吨集中气调库梯度打冷与高纯氮能耗')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥12,200</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('Eco Packaging Boxes & Insulated Cold-Boxes', '环保抗压保鲜盒与定制保温冷链箱耗材')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥86,000</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('Interstate Reefer Truck & Air Line Freight', '干线恒温冷藏车与长水机场航空货运费')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥124,000</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>• {t('Facility Depreciation & Infrastructure O&M', '园区设施折旧与智能硬件运维分摊')}</span>
                                                        <span style={{ color: '#f87171' }}>-¥120,000</span>
                                                    </div>
                                                </div>

                                                <div style={{ borderTop: '1px solid rgba(148,163,184,0.15)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(52,211,153,0.08)', borderRadius: 4 }}>
                                                    <span style={{ fontWeight: 800, color: '#f8fafc' }}>{t('Net Contribution Margin Today', '当日净贡献毛利')}</span>
                                                    <strong style={{ color: '#34d399', fontSize: '0.95rem' }}>+¥512,950</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Sentinel Value-Add Attribution */}
                                        <div className="card" style={{ background: '#090d16', border: '1px solid rgba(0,229,163,0.3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                <strong style={{ fontSize: '0.86rem', color: '#00e5a3' }}>
                                                    {t('Sentinel 7.2 Decision Core Value-Add', 'Sentinel 智能决策中枢当日价值实证')}
                                                </strong>
                                                <span style={{ fontSize: '0.72rem', color: '#00e5a3', background: 'rgba(0,229,163,0.15)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                                                    {t('VERIFIED ROI', '实证核验收益')}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.74rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 8, background: 'rgba(15,23,42,0.6)', borderRadius: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t('1. PHI Compliance Claim Elimination', '1. 规避农药安全期间隔 (PHI) 巨额索赔')}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 2 }}>{t('Plan B prevented 750kg Hema KA chemical rejection and penalty.', '方案 B 否决超标采收，规避盒马 750kg 抽检红线与违约索赔。')}</div>
                                                    </div>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥48,750</strong>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 8, background: 'rgba(15,23,42,0.6)', borderRadius: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t('2. Bloom Wax Integrity & Grade A Premium', '2. 气调库打冷果粉保护带来 A 级果溢价')}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 2 }}>{t('Pre-cooling within 90 min preserves 96.8% bloom, securing +12% premium.', '采后 90 分钟极速入库，果粉完整度超 96.8%，保住高端果溢价。')}</div>
                                                    </div>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥56,200</strong>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 8, background: 'rgba(15,23,42,0.6)', borderRadius: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t('3. Dynamic Crew Dispatch (Idle Waste Cut)', '3. 采收班组拂晓错峰排产工效节约')}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 2 }}>{t('Avoids afternoon heat fatigue, saving 22 idle worker-days.', '避开高温软果低效时段，人均工效提升 18%，减少 22 工日闲置。')}</div>
                                                    </div>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥3,960</strong>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 8, background: 'rgba(15,23,42,0.6)', borderRadius: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t('4. Precision VPD Closed-Loop Fertigation', '4. 基于 VPD 水肥闭环节水节肥')}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 2 }}>{t('VPD algorithm cuts water by 38% and fertilizer run-off by 24%.', '温室双蒸腾动态闭环调控，节水 38%，降低肥料流失 24%。')}</div>
                                                    </div>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥15,040</strong>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 8, background: 'rgba(15,23,42,0.6)', borderRadius: 6 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t('5. Multi-Order Delivery Smoothing (Loss Cut)', '5. 5大订单动态交错减损 (落果软果减损)')}</div>
                                                        <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: 2 }}>{t('Reduces dehydration loss by 2.8% across 12.45t throughput.', '平抑冷库与干线装运高峰，12.45 吨总吞吐减损 2.8%。')}</div>
                                                    </div>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥60,000</strong>
                                                </div>

                                                <div style={{ borderTop: '1px solid rgba(0,229,163,0.3)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(0,229,163,0.1)', borderRadius: 4 }}>
                                                    <span style={{ fontWeight: 800, color: '#00e5a3' }}>{t('Total Quantified Daily Value Captured', '当日累计实证价值创造')}</span>
                                                    <strong style={{ color: '#00e5a3', fontSize: '0.98rem' }}>+¥183,950</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════════════
                MODE 2: FOCAL DECISION CASE (750 KG HEMA FRESH)
               ════════════════════════════════════════════════════════════════════════════ */}
            {viewMode === 'focal' && (
                <div>
                    {/* Focal KPI Cards */}
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
                            value={`CNY ${focalTotalValue.toLocaleString()}`}
                            subtitle={`¥${ORDER_PRICE}/kg ${t('signed contract', '签约合同单价')}`}
                            status="low"
                            icon="dollar"
                        />
                        <MetricCard
                            label={t('Nominal Harvest Capacity', '3天标称采收产能')}
                            value={`${focalCapacity} kg`}
                            subtitle={`25 ${t('crew members', '人')} · 12 kg/${t('person-day', '工日')}`}
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

                    <div className="card" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                {t('Focal Scenario Alignment: 750kg KA Hema Fresh Order', '焦点场景推演：750kg 盒马鲜生 KA 订单批次分配表')}
                            </h3>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => navigate('/prescription')}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#00e5a3', color: '#090d16', fontWeight: 800, padding: '6px 12px', borderRadius: 4 }}
                            >
                                <Icon name="prescription" size={14} color="#090d16" />
                                {t('Resolve in Decision Room →', '前往方案决策室推演 →')}
                            </button>
                        </div>

                        <div className="table-responsive" style={{ overflowX: 'auto', marginBottom: 20 }}>
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

                        {/* Labor and Economics Comparison */}
                        <div className="grid grid-3" style={{ gap: 14 }}>
                            <div className="card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t('Plan A: Full Protection', '方案 A：全量常规采收')}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', marginTop: 4 }}>CNY 0</div>
                                <small style={{ color: '#ef4444' }}>{t('Blocked by PHI · Delivery missed', '安全期间隔冲突 · 强制否决')}</small>
                            </div>
                            <div className="card" style={{ background: 'rgba(0,229,163,0.06)', border: '1px solid rgba(0,229,163,0.3)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#00e5a3', fontWeight: 700 }}>{t('Plan B: Selective Release (Lead)', '方案 B：北区温室早班 (首选)')}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00e5a3', marginTop: 4 }}>CNY 48,750</div>
                                <small style={{ color: '#94a3b8' }}>¥48,750 {t('gross', '全额交付')} · 96.8% {t('bloom', '果粉保护')}</small>
                            </div>
                            <div className="card" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.1)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t('Plan C: Cold Storage Buffer', '方案 C：恒温冷库直发 (备选)')}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>CNY 45,000</div>
                                <small style={{ color: '#f59e0b' }}>{t('D-1 Qualified Stock · Weather immune', 'D-1 合格现货库存 · 免疫恶劣天气')}</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Order Dossier Modal */}
            <OrderDossierModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                locale={locale}
            />
        </div>
    );
}
