import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import DelayedTooltip from '../components/Tooltip';
import AIAgentPanel from '../components/AIAgentPanel';
import OrderDossierModal from '../components/OrderDossierModal';
import MetricDrillDownModal from '../components/MetricDrillDownModal';
import SystemActivityRail from '../components/SystemActivityRail';
import { aiWatchdog } from '../data/mockData';
import { pick } from '../i18n/locale.js';
import { ENTERPRISE_ORDERS, ORDER_CATEGORIES, PORTFOLIO_SUMMARY, FOCAL_ORDER } from '../data/ordersData';

const DASHBOARD_ORDERS = ENTERPRISE_ORDERS;

// 900-Mu Spatial Plot Matrix Data (Calibrated Agricultural CEA Terminology)
const SPATIAL_PLOTS = [
    // Zone A (350 mu Smart Greenhouse)
    { id: 'LOT-01', zone: 'A', name: 'A-01 智能温室', nameEn: 'A-01 Smart Greenhouse', cultivar: '华香 (Huaxiang)', readyKg: 420, gradeA: 420, status: 'pass', statusZh: '特级放行', statusEn: 'Grade A Cleared', temp: '18.2°C', vpd: '1.15 kPa', rh: '68%', leafWet: '0.4h', note: '无药残 · 拂晓采收窗口已开启', noteEn: 'Zero residue · Dawn harvest window open' },
    { id: 'LOT-02', zone: 'A', name: 'A-02 智能温室', nameEn: 'A-02 Smart Greenhouse', cultivar: '法新 (Faxin)', readyKg: 360, gradeA: 360, status: 'pass', statusZh: '特级放行', statusEn: 'Grade A Cleared', temp: '18.5°C', vpd: '1.12 kPa', rh: '70%', leafWet: '0.5h', note: '果粉保持度 96.8% · 预冷槽锁定', noteEn: '96.8% wax bloom · Pre-cooling slot reserved' },
    { id: 'LOT-03', zone: 'A', name: 'A-03 智能温室 (边缘)', nameEn: 'A-03 Smart Greenhouse (Border)', cultivar: '华香 (Huaxiang)', readyKg: 120, gradeA: 0, status: 'blocked', statusZh: '虫害隔离中', statusEn: 'Pest Isolated', temp: '21.4°C', vpd: '0.92 kPa', rh: '79%', leafWet: '1.8h', note: 'TRAP-S02 蓟马越界 · PHI 72h 隔离红牌', noteEn: 'Thrips threshold breached · PHI 72h Veto' },
    { id: 'LOT-A04', zone: 'A', name: 'A-04 高架基质棚', nameEn: 'A-04 Elevated Substrate Bay', cultivar: '绿宝石 (Emerald)', readyKg: 280, gradeA: 260, status: 'growing', statusZh: '营养生长期', statusEn: 'Vegetative Growth', temp: '19.0°C', vpd: '1.20 kPa', rh: '65%', leafWet: '0.0h', note: '水肥一体机 EC 1.4 / pH 5.2 闭环调控', noteEn: 'Auto fertigation EC 1.4 / pH 5.2' },

    // Zone B (400 mu Thermal High-Tunnel)
    { id: 'LOT-B01', zone: 'B', name: 'B-01 双层保温大棚', nameEn: 'B-01 Thermal High-Tunnel', cultivar: '绿宝石 (Emerald)', readyKg: 1200, gradeA: 1050, status: 'pass', statusZh: '山姆直供采收', statusEn: 'Sam\'s KA Harvest', temp: '20.1°C', vpd: '1.25 kPa', rh: '62%', leafWet: '0.2h', note: '采收完成度 85% · 准备转场 B-02', noteEn: '85% harvested · Shifting to B-02' },
    { id: 'LOT-B02', zone: 'B', name: 'B-02 双层保温大棚', nameEn: 'B-02 Thermal High-Tunnel', cultivar: '珠宝 (Jewel)', readyKg: 1100, gradeA: 980, status: 'pass', statusZh: '山姆直供采收', statusEn: 'Sam\'s KA Harvest', temp: '19.8°C', vpd: '1.28 kPa', rh: '64%', leafWet: '0.1h', note: '62名专业采收技术员流水线推进中', noteEn: '62 harvest technicians active on line' },
    { id: 'LOT-B05', zone: 'B', name: 'B-05 大棚综合区', nameEn: 'B-05 Multi-Span Tunnel Section', cultivar: '综合大果', readyKg: 2400, gradeA: 1800, status: 'pass', statusZh: '批发大宗连续采', statusEn: 'Wholesale Bulk Harvest', temp: '22.0°C', vpd: '1.40 kPa', rh: '58%', leafWet: '0.0h', note: '集装箱挂车现场过磅装运', noteEn: 'Container truck weighbridge loading on site' },

    // Zone C (150 mu CA Cold Storage & Trial Base)
    { id: 'CA-01', zone: 'C', name: '1号 气调恒温保鲜库', nameEn: 'CA Cold Storage Room #1', cultivar: '精选冷藏库', readyKg: 50000, gradeA: 48000, status: 'pass', statusZh: '1.5°C 预冷达标', statusEn: '1.5°C Precooled', temp: '1.5°C', vpd: 'N/A', rh: '92%', leafWet: '0.0h', note: '高纯氮 98.2% · 果心温 1.5°C 稳定', noteEn: '98.2% N2 gas · 1.5°C core temp stable' },
    { id: 'CA-02', zone: 'C', name: '2号 备用气调库', nameEn: 'CA Standby Storage Room #2', cultivar: '调峰应急库', readyKg: 45000, gradeA: 42000, status: 'buffer', statusZh: '方案C 备选释出', statusEn: 'Plan C Contingency Buffer', temp: '1.8°C', vpd: 'N/A', rh: '90%', leafWet: '0.0h', note: '方案 C 触发时可 30 分钟内调拨出库', noteEn: 'Ready for 30-min emergency buffer dispatch' },
    { id: 'CA-03', zone: 'C', name: '3号 常温分选预检库', nameEn: 'Optical Sorting & Grading Facility #3', cultivar: '分拣流水线', readyKg: 50000, gradeA: 45000, status: 'pass', statusZh: '光电分选运转', statusEn: 'Optical Sorter Active', temp: '12.0°C', vpd: 'N/A', rh: '75%', leafWet: '0.0h', note: '近红外光电糖度/硬度分选 2.5t/h', noteEn: 'NIR sugar/firmness sorting 2.5 t/h' },
];

const plotStatusColors = {
    pass: {
        border: '#10b981',
        glow: 'rgba(16, 185, 129, 0.25)',
        bg: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(9, 13, 22, 0.95) 100%)',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeColor: '#34d399',
        text: '#10b981',
        btnBg: '#059669',
        btnBorder: '#10b981',
        btnColor: '#ffffff'
    },
    blocked: {
        border: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.35)',
        bg: 'linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(9, 13, 22, 0.95) 100%)',
        badgeBg: 'rgba(239, 68, 68, 0.2)',
        badgeColor: '#f87171',
        text: '#ef4444',
        btnBg: '#dc2626',
        btnBorder: '#ef4444',
        btnColor: '#ffffff'
    },
    growing: {
        border: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.25)',
        bg: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(9, 13, 22, 0.95) 100%)',
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        badgeColor: '#38bdf8',
        text: '#38bdf8',
        btnBg: '#0284c7',
        btnBorder: '#38bdf8',
        btnColor: '#ffffff'
    },
    buffer: {
        border: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.25)',
        bg: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(9, 13, 22, 0.95) 100%)',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeColor: '#fbbf24',
        text: '#f59e0b',
        btnBg: '#d97706',
        btnBorder: '#f59e0b',
        btnColor: '#ffffff'
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const {
        locale,
        autonomousState,
        autonomousMode,
        approvalQueue,
        spatialScope,
        policyConfig,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    const CARD_STYLE = {
        width: '100%',
        height: 148,
        minHeight: 148,
        maxHeight: 148,
        padding: '12px 14px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(9, 13, 22, 0.95) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.14)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
    };

    // Zone filter in spatial matrix: 'ALL' | 'A' | 'B' | 'C'
    const [zoneFilter, setZoneFilter] = useState('ALL');
    // Active inspecting plot for detailed microclimate modal/popover
    const [inspectingPlot, setInspectingPlot] = useState(null);
    // Active inspecting hero metric for comprehensive industrial drill-down modal
    const [inspectingMetric, setInspectingMetric] = useState(null);
    // Order category filter: 'ALL' | 'T0' | 'T1_T3' | 'QUARTER' | 'LONGTERM'
    const [orderCategoryFilter, setOrderCategoryFilter] = useState('ALL');
    // Active inspecting order for detailed SLA dossier drawer
    const [selectedOrder, setSelectedOrder] = useState(null);

    const filteredPlots = zoneFilter === 'ALL'
        ? SPATIAL_PLOTS
        : SPATIAL_PLOTS.filter(p => p.zone === zoneFilter);

    const filteredOrders = DASHBOARD_ORDERS.filter(order => {
        if (spatialScope && spatialScope !== 'all') {
            if (order.zoneId !== 'all' && order.zoneId !== spatialScope) return false;
        }
        if (orderCategoryFilter === 'ALL') return true;
        if (orderCategoryFilter === 'T0') return order.category === 't0';
        if (orderCategoryFilter === 'T1_T3') return order.category === 't1_t3';
        if (orderCategoryFilter === 'QUARTER') return order.category === 'quarter';
        if (orderCategoryFilter === 'LONGTERM') return order.category === 'longterm';
        return true;
    });

    return (
        <div className="page dashboard-page" style={{ maxWidth: 1680, margin: '0 auto' }}>
            {/* Top Level 0 Executive Breadcrumb Banner */}
            <PipelineBreadcrumb />

            {/* ════════════════════════════════════════════════════════════════════════════
                1. TOP EXECUTIVE TELEMETRY PULSE DECK (8 HERO KPIS + WATCHDOG + EMERGENCY CAPSULE)
               ════════════════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 16 }}>
                {/* 8 Hero Enterprise Telemetry KPIs Grid (High-Density Dual-Row) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
                    {/* 1. Daily Fulfillment Volume */}
                    <DelayedTooltip
                        title={t('Enterprise Total Output (Click to Drill Down)', '全园当日交付进度与总量 (点击穿透下钻)')}
                        content={t('Dispatched output across all 12 enterprise orders for today. Click to inspect hourly throughput curve and harvest crew allocation.', '全园当日采收出库进度，覆盖 900 亩澄江核心基地全部在岗采收班组与气调库。点击展开分时出库曲线与工效分析。已完成 9,240 kg / 目标 12,450 kg。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('FULFILLMENT')}
                            label={t('Daily Fulfillment Progress', '全园当日交付进度')}
                            value="74.2%"
                            subtitle={t('9,240 / 12,450 kg · Load 93.6%', '已出库 9,240 / 12,450 kg · 负荷 93.6%')}
                            status="low"
                            icon="box"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 22, gap: 3 }}>
                                    {[
                                        { time: '05:00', val: 75, highlight: true },
                                        { time: '06:00', val: 95, highlight: true },
                                        { time: '07:00', val: 100, highlight: true },
                                        { time: '08:30', val: 80, highlight: true },
                                        { time: '10:00', val: 35, highlight: false },
                                        { time: '12:00', val: 20, highlight: false },
                                        { time: '14:00', val: 45, highlight: false },
                                        { time: '16:00', val: 30, highlight: false },
                                    ].map(b => (
                                        <div key={b.time} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${b.val}%`,
                                                background: b.highlight ? 'linear-gradient(180deg, #00e5a3, #059669)' : 'rgba(56, 189, 248, 0.35)',
                                                borderRadius: '2px 2px 0 0',
                                            }} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#64748b', marginTop: 3 }}>
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>05:00 拂晓采收峰值</span>
                                    <span>16:00 预冷归仓</span>
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 2. Gross Contract Revenue */}
                    <DelayedTooltip
                        title={t('Gross Sales Value (Click to Drill Down)', '全园当日合同总销售额 (点击穿透下钻)')}
                        content={t('Locked direct contractual revenue across 12 enterprise contracts. Click to view KA pricing matrix and order weights.', '基于锁定直供合同单价(盒马¥65、山姆¥58、Ole¥88、国泰¥82、百果园¥55、批发¥37.5)计算的单日销售总额。点击查看各大单客户分配表。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('SALES')}
                            label={t('Gross Daily Sales Value', '全园当日合同总额')}
                            value="¥898,150"
                            subtitle={t('Avg ¥72.1/kg · 12 Orders Locked', '综合均价 ¥72.1/kg · 锁定价格')}
                            status="low"
                            icon="dollar"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', height: 7, borderRadius: 3, overflow: 'hidden', background: '#1e293b' }}>
                                    <div style={{ width: '44.1%', background: '#38bdf8' }} title="Ole' 华润: ¥396K (44.1%)" />
                                    <div style={{ width: '32.3%', background: '#10b981' }} title="山姆会员店: ¥290K (32.3%)" />
                                    <div style={{ width: '13.7%', background: '#a78bfa' }} title="国泰航空: ¥123K (13.7%)" />
                                    <div style={{ width: '5.4%', background: '#f59e0b' }} title="盒马鲜生: ¥48.8K (5.4%)" />
                                    <div style={{ width: '4.5%', background: '#64748b' }} title="大宗批发: ¥40.4K (4.5%)" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', marginTop: 4 }}>
                                    <span>Ole' 44%</span>
                                    <span>山姆 32%</span>
                                    <span>航线 14%</span>
                                    <span>盒马 5%</span>
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 3. Direct Cost & Net Contribution */}
                    <DelayedTooltip
                        title={t('Direct Cost & Net Margin (Click to Drill Down)', '当日综合成本与净毛利 (点击穿透下钻)')}
                        content={t('Direct costs include labor (120 harvest crew), fertigation energy, cold storage, packaging, and freight. Click to open P&L waterfall.', '直接变动成本包含采收班组人工(120人)、水肥能耗、气调库打冷、环保保鲜盒及冷链运费。点击查看 EBITDA 瀑布精算图。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('MARGIN')}
                            label={t('Cost & Net Contribution', '综合成本与毛利')}
                            value="¥512,950"
                            subtitle={t('Cost ¥385.2K · Margin 57.1%', '成本 ¥38.5万 · 毛利率 57.1%')}
                            status="low"
                            icon="activity"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', height: 7, borderRadius: 3, overflow: 'hidden', background: '#1e293b' }}>
                                    <div style={{ width: '57.1%', background: 'linear-gradient(90deg, #10b981, #059669)' }} title="净毛利: ¥512.9K (57.1%)" />
                                    <div style={{ width: '42.9%', background: 'rgba(239, 68, 68, 0.65)' }} title="直接总成本: ¥385.2K (42.9%)" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', marginTop: 4 }}>
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>净毛利 57.1% (¥51.3万)</span>
                                    <span style={{ color: '#f87171' }}>直接成本 42.9%</span>
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 4. Sentinel Value Captured */}
                    <DelayedTooltip
                        title={t('Sentinel AI Value Captured (Click to Drill Down)', 'SENTINEL 决策增益与挽损 (点击穿透下钻)')}
                        content={t('Quantified value captured today: PHI compliance claim avoidance, cold-storage wax retention, crew efficiency, water/fertilizer savings, and shrink reduction.', '今日实证增益：规避农残索赔(+¥48,750)、气调库保鲜溢价(+¥56,200)、水肥节约(+¥15,040)、减损控病(+¥63,960)。点击查看四维归因分析。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('ROI')}
                            label={t('Sentinel Value-Add Captured', 'SENTINEL 决策增益挽损')}
                            value="+¥183,950"
                            subtitle={t('14.2x Daily System ROI · Avoided Claims', '单日投资回报 14.2x · 阻断索赔 ¥48.8K')}
                            status="low"
                            icon="award"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: '0.58rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(239,68,68,0.1)', padding: '2px 4px', borderRadius: 2 }}>
                                        <span style={{ color: '#94a3b8' }}>规避索赔:</span>
                                        <span style={{ color: '#fca5a5', fontWeight: 700 }}>+¥48.8K</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16,185,129,0.1)', padding: '2px 4px', borderRadius: 2 }}>
                                        <span style={{ color: '#94a3b8' }}>果粉溢价:</span>
                                        <span style={{ color: '#86efac', fontWeight: 700 }}>+¥56.2K</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(56,189,248,0.1)', padding: '2px 4px', borderRadius: 2 }}>
                                        <span style={{ color: '#94a3b8' }}>节水水肥:</span>
                                        <span style={{ color: '#7dd3fc', fontWeight: 700 }}>+¥15.0K</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(245,158,11,0.1)', padding: '2px 4px', borderRadius: 2 }}>
                                        <span style={{ color: '#94a3b8' }}>减损控病:</span>
                                        <span style={{ color: '#fde047', fontWeight: 700 }}>+¥63.9K</span>
                                    </div>
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 5. Grade A Premium Quality Ratio */}
                    <DelayedTooltip
                        title={t('Grade A Premium Ratio (Click to Drill Down)', '全域特级优果率 (点击穿透下钻)')}
                        content={t('NIR optical sorting calibrated Grade A proportion (18mm+ diameter, TSS/TA ratio >= 25, bloom intact >= 95%). Click to view sorting breakdown.', '近红外光电在线分选标定：18mm+特级大果与坚挺果粉占比，优果率达到 91.4%。点击查看光电分选规格与糖度明细。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('GRADE_A')}
                            label={t('Grade A Premium Ratio', '全域综合特级优果率')}
                            value="91.4%"
                            subtitle={t('18mm+ Premium: 68.2% · Hardness 3.8', '特级果 68.2% · 硬度 3.8 kg/cm²')}
                            status="low"
                            icon="shield"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', height: 7, borderRadius: 3, overflow: 'hidden', background: '#1e293b' }}>
                                    <div style={{ width: '68.2%', background: '#38bdf8' }} title="特级果 18mm+: 68.2%" />
                                    <div style={{ width: '23.2%', background: '#34d399' }} title="一级果 14-17mm: 23.2%" />
                                    <div style={{ width: '8.6%', background: '#64748b' }} title="加工级: 8.6%" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#94a3b8', marginTop: 4 }}>
                                    <span style={{ color: '#38bdf8' }}>特级 68.2%</span>
                                    <span style={{ color: '#34d399' }}>一级 23.2%</span>
                                    <span>标果 8.6%</span>
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 6. GB 2763 Safety Gate */}
                    <DelayedTooltip
                        title={t('GB 2763 Compliance Gate (Click to Drill Down)', 'GB 2763 农药安全间隔期门禁 (点击穿透下钻)')}
                        content={t('Rigid 72h PHI gate enforced. 100% compliant across all active harvests. Click to inspect compliance proof.', '7/7 法定门禁刚性联锁；LOT-03 触发 72h PHI 闭锁，A08 法规合规一票否决方案 A，全园无违规药残。点击查看法定依据。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('PHI_GATE')}
                            label={t('Regulatory PHI Compliance', 'GB 2763 法定门禁合规率')}
                            value={policyConfig?.phiTolerance === 'relaxed' ? "94.2% (放行)" : "100% 严防"}
                            subtitle={policyConfig?.phiTolerance === 'relaxed' ? "容忍 -6h 已生效 · 方案A实验放行" : t('7/7 Rigid Gates Armed · 0 Risk', '7/7 门禁全部联锁 · 方案A否决')}
                            status={policyConfig?.phiTolerance === 'relaxed' ? "elevated" : "low"}
                            icon="check-circle"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem' }}>
                                    <span style={{ color: policyConfig?.phiTolerance === 'relaxed' ? '#f59e0b' : '#34d399', fontWeight: 700 }}>
                                        {policyConfig?.phiTolerance === 'relaxed' ? '● 实验性容忍开启' : '● 72h PHI 闭锁生效'}
                                    </span>
                                    <span style={{ background: policyConfig?.phiTolerance === 'relaxed' ? 'rgba(245,158,11,0.15)' : 'rgba(52,211,153,0.15)', color: policyConfig?.phiTolerance === 'relaxed' ? '#fbbf24' : '#34d399', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>
                                        {policyConfig?.phiTolerance === 'relaxed' ? 'RELAXED' : '7/7 PASS'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 3 }}>
                                    {policyConfig?.phiTolerance === 'relaxed' ? '预警：面临 34.2% 渠道药残抽检拒收风险' : '阻断违约敞口 ¥48,750 · 绿通免检'}
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 7. Microclimate & Wind Interlock */}
                    <DelayedTooltip
                        title={t('Microclimate Safe Harvest Window (Click to Drill Down)', '微气象安全采收时序 (点击穿透下钻)')}
                        content={t('Fuxian Lake thermal inertia and afternoon wind velocity model. Gust threshold: 8.0 m/s. Click to view 24h weather model.', '抚仙湖畔微气象：上午拂晓稳定，午后 14:00 阵风超 14m/s 风险，系统已联动锁定拂晓采收。点击查看气象趋势图。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('MICROCLIMATE')}
                            label={t('Microclimate Harvest Window', '微气象安全采收时序')}
                            value="03h 15m"
                            subtitle={t('Dawn Window Remaining · 14:00 Gust Veto', '拂晓采摘倒计时 · 14:00 阵风自锁')}
                            status="low"
                            icon="clock"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                                    <span style={{ color: '#38bdf8' }}>当前风速 4.2m/s (阈值 8.0)</span>
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>天窗联锁就绪</span>
                                </div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 3 }}>
                                    气温 21.4°C · RH 68% · 露天抢收完毕
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>

                    {/* 8. Cold Chain Fulfillment */}
                    <DelayedTooltip
                        title={t('Cold Chain On-Time & Temp (Click to Drill Down)', '在途冷链温控稳态率 (点击穿透下钻)')}
                        content={t('Real-time GPS and temperature monitoring across all 5 refrigerated trucks in transit. Click to inspect reefer fleet telematics.', '5 辆在途温控干线专车全程 GPS 北斗与霍尼韦尔双温区记录仪上链，0 脱温记录。点击查看在途专车名册与轨迹。')}
                        delayMs={1000}
                    >
                        <MetricCard
                            style={CARD_STYLE}
                            onClick={() => setInspectingMetric('COLD_CHAIN')}
                            label={t('Cold Chain Steady-State Rate', '在途冷链温控稳态率')}
                            value="99.8%"
                            subtitle={t('5 Trucks in Transit · 1.5°C Steady', '5 辆专车在途 · 1.5°C 稳态恒温')}
                            status="low"
                            icon="refresh"
                        >
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem' }}>
                                    <span style={{ color: '#34d399' }}>● 差压预冷抑制 Q10=3.2</span>
                                    <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>0 脱温记录</span>
                                </div>
                                <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: 3 }}>
                                    西南干线(成渝/贵阳/南宁) + 长水空港航空专线直达
                                </div>
                            </div>
                        </MetricCard>
                    </DelayedTooltip>
                </div>

                {/* 7x24 Autonomous AI Watchdog Status Strip */}
                <div className="ai-watchdog-bar" style={{ borderRadius: 6, margin: '0 0 10px 0', padding: '8px 14px' }}>
                    <div className="watchdog-dot" />
                    <span className="watchdog-label">{t('Autonomous Sentinel Operating Core: Active 24x7', 'Sentinel 自治决策中枢：7×24 在线巡航')}</span>
                    <div className="watchdog-divider" />
                    <span className="watchdog-stat">{t('Scans today', '今日扫描')}: <strong>{aiWatchdog.totalScansToday.toLocaleString()}</strong></span>
                    <div className="watchdog-divider" />
                    <span className="watchdog-stat">{t('Anomalies', '异常锁定')}: <strong style={{ color: '#ef4444' }}>1 (LOT-03)</strong></span>
                    <div className="watchdog-divider" />
                    <span className="watchdog-stat">{t('Pending Sign-offs', '待审批')}: <strong style={{ color: '#10b981' }}>0 (L3 Closed Loop)</strong></span>
                    <div className="watchdog-divider" />
                    <span className="watchdog-stat">{t('Autonomy Baseline', '策略基准')}: <strong style={{ color: policyConfig?.preset === 'ka_fast' ? '#fbbf24' : '#38bdf8' }}>{policyConfig?.preset === 'ka_fast' ? 'KA 极速优先 (放行-6h)' : policyConfig?.preset === 'l4_full' ? 'L4 全无人化巡航' : 'L3 严格合规基准'}</strong></span>
                    <div style={{ flex: 1 }} />
                    <span className="watchdog-stat" style={{ color: '#64748b' }}>Sentinel Enterprise Ontology v7.9</span>
                </div>

                {/* Emergency Alert Breakthrough Capsule (Direct Drill-Down into Prescription Room) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.08))',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: 8,
                    padding: '10px 16px',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
                    flexWrap: 'wrap',
                    gap: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <Icon name="warning" size={12} color="#fff" />
                            {t('HARVEST SAFETY & COMPLIANCE ALERT', '采收安全与合规预警')}
                        </span>
                        <div>
                            <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                                {t('LOT-03 Thrips Alert breaches Hema 750kg Order PHI Harvest Window', 'LOT-03 智能诱捕器蓟马告警与盒马 750kg 订单采收安全期间隔 (PHI) 冲突')}
                            </strong>
                            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 2 }}>
                                {t('Plan A vetoed by Compliance Gate; Plan B (North Greenhouse Dawn Shift) takes lead. Model net contribution: CNY 48,750.', '方案 A 被法定安全期门禁否决；方案 B (北区日光温室拂晓抢收) 综合领跑，锁定净贡献 CNY 48,750。')}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/prescription')}
                        style={{
                            background: 'linear-gradient(135deg, #00e5a3 0%, #059669 100%)',
                            color: '#090d16',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            boxShadow: '0 4px 12px rgba(0, 229, 163, 0.3)',
                            transition: 'all 0.15s'
                        }}
                    >
                        <span>{t('Enter Prescription Room (Plan B Lead) →', '进入处方决策中心 (推荐方案B) →')}</span>
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════════════
                2. OPERATIONAL DECK & LIVE ACTIVITY STREAM
               ════════════════════════════════════════════════════════════════════════════ */}
            <div className="dashboard-layout">
                <section className="dashboard-main-column">
                    {/* CORE 2-COLUMN OPERATING DECK (LEFT: SPATIAL & RESOURCES; RIGHT: ORDERS & FINANCIALS) */}
                    <div className="grid grid-2" style={{ gap: 16, marginBottom: 20, alignItems: 'start' }}>
                {/* ────────────────────────────────────────────────────────────
                    LEFT COLUMN: SPATIAL TOPOLOGY & PHYSICAL RESOURCE FLEET
                   ──────────────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Card A: 900-Mu Spatial Plot Matrix */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon name="layers" size={17} color="#38bdf8" />
                                    {t('900-Mu 3-Zone Production Plot Map', '900 亩生产地块监控与排产一张图')}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    {t('Real-time agronomic status, microclimate sensors, and readiness of all plots.', '全园各生产单元生化长势、环境遥测与采收准备度一张图。')}
                                </p>
                            </div>

                            {/* Zone filter tabs */}
                            <div style={{ display: 'flex', gap: 4, background: '#0f172a', padding: 2, borderRadius: 6, border: '1px solid #1e293b' }}>
                                {[
                                    { key: 'ALL', label: t('All (10)', '全部 (10)') },
                                    { key: 'A', label: t('Zone A Smart Greenhouse (4)', 'A区 智能温室 (4)') },
                                    { key: 'B', label: t('Zone B High-Tunnel (3)', 'B区 保温大棚 (3)') },
                                    { key: 'C', label: t('Zone C CA Storage (3)', 'C区 气调保鲜库 (3)') },
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setZoneFilter(tab.key)}
                                        style={{
                                            padding: '4px 9px',
                                            borderRadius: 4,
                                            border: 'none',
                                            fontSize: '0.66rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            background: zoneFilter === tab.key ? '#38bdf8' : 'transparent',
                                            color: zoneFilter === tab.key ? '#090d16' : '#94a3b8',
                                            transition: 'all 0.15s'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plots Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                            {filteredPlots.map(p => {
                                const isBlocked = p.status === 'blocked';
                                const isSelected = inspectingPlot?.id === p.id;
                                const theme = plotStatusColors[p.status] || plotStatusColors.pass;
                                const borderColor = theme.border;
                                const bgTint = isSelected
                                    ? theme.bg
                                    : isBlocked
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(15, 23, 42, 0.6)';

                                return (
                                    <div
                                        key={p.id}
                                        className="spatial-plot-card"
                                        data-plot-id={p.id}
                                        onClick={() => setInspectingPlot(p)}
                                        style={{
                                            background: bgTint,
                                            border: isSelected ? `2px solid ${borderColor}` : `1px solid ${borderColor}`,
                                            boxShadow: isSelected ? `0 0 14px ${theme.glow}` : 'none',
                                            borderRadius: 6,
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.18s',
                                            transform: isSelected ? 'scale(1.02)' : 'none',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isBlocked ? '#f87171' : '#f8fafc', fontFamily: 'monospace' }}>
                                                {p.id}
                                            </span>
                                            <span style={{
                                                fontSize: '0.6rem',
                                                fontWeight: 800,
                                                padding: '1px 5px',
                                                borderRadius: 3,
                                                background: theme.badgeBg,
                                                color: theme.badgeColor
                                            }}>
                                                {isZh ? p.statusZh : p.statusEn}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>
                                            {isZh ? p.name : p.nameEn}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', margin: '2px 0 6px' }}>
                                            {p.cultivar}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: 6 }}>
                                            <span>{p.temp} · {p.vpd}</span>
                                            <strong style={{ color: p.readyKg > 0 ? (isBlocked ? '#f87171' : '#38bdf8') : '#64748b' }}>
                                                {p.readyKg.toLocaleString()} kg
                                            </strong>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Plot Inspection Modal Drawer with Dynamic Status Theming */}
                        {inspectingPlot && (() => {
                            const theme = plotStatusColors[inspectingPlot.status] || plotStatusColors.pass;
                            const isBlocked = inspectingPlot.status === 'blocked';
                            const isBuffer = inspectingPlot.status === 'buffer';

                            return (
                                <div style={{
                                    marginTop: 12,
                                    background: theme.bg,
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px ${theme.glow}`,
                                    borderRadius: 6,
                                    padding: 12,
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: theme.text, fontFamily: 'monospace' }}>
                                                {inspectingPlot.id} - {isZh ? inspectingPlot.name : inspectingPlot.nameEn}
                                            </span>
                                            <span style={{
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: 3,
                                                background: theme.badgeBg,
                                                color: theme.badgeColor
                                            }}>
                                                {isZh ? inspectingPlot.statusZh : inspectingPlot.statusEn}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                                {inspectingPlot.cultivar}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setInspectingPlot(null)}
                                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                                            title={t('Close', '关闭')}
                                        >
                                            <Icon name="x" size={14} color="#94a3b8" />
                                        </button>
                                    </div>

                                    {/* Critical Veto Banner if Blocked */}
                                    {isBlocked && (
                                        <div style={{
                                            margin: '8px 0',
                                            padding: '6px 10px',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid rgba(239, 68, 68, 0.35)',
                                            borderRadius: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.68rem',
                                            color: '#fca5a5'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Icon name="warning" size={13} color="#ef4444" />
                                                <strong>{t('CRITICAL COMPLIANCE LOCKOUT: 72h PHI Pre-Harvest Interval Active', '刚性合规闭锁：72小时法定采前安全间隔期 (PHI) 生效中')}</strong>
                                            </div>
                                            <span style={{ color: '#fecaca', fontSize: '0.62rem' }}>
                                                {t('-58h conflict with Hema order · Vetoed Plan A', '距盒马订单履约倒挂 -58 小时 · 绝对否决方案 A')}
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8, fontSize: '0.7rem' }}>
                                        <div style={{ background: '#0f172a', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ color: '#64748b' }}>{t('Air Temp', '空气温度')}</div>
                                            <div style={{ fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>{inspectingPlot.temp}</div>
                                        </div>
                                        <div style={{ background: '#0f172a', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ color: '#64748b' }}>{t('Humidity / VPD', '湿度 / VPD')}</div>
                                            <div style={{ fontWeight: 700, color: theme.text, marginTop: 2 }}>{inspectingPlot.rh} · {inspectingPlot.vpd}</div>
                                        </div>
                                        <div style={{ background: '#0f172a', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ color: '#64748b' }}>{t('Leaf Wetness Duration', '叶面湿润时长')}</div>
                                            <div style={{ fontWeight: 700, color: '#fbbf24', marginTop: 2 }}>{inspectingPlot.leafWet}</div>
                                        </div>
                                        <div style={{ background: '#0f172a', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ color: '#64748b' }}>{t('Grade A Ready', 'A级待采')}</div>
                                            <div style={{ fontWeight: 700, color: isBlocked ? '#ef4444' : '#00e5a3', marginTop: 2 }}>{inspectingPlot.gradeA.toLocaleString()} kg</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                        <span style={{ fontSize: '0.68rem', color: isBlocked ? '#f87171' : '#94a3b8' }}>
                                            {isZh ? inspectingPlot.note : inspectingPlot.noteEn}
                                        </span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {isBlocked && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/prescription')}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        border: '1px solid #ef4444',
                                                        borderRadius: 4,
                                                        color: '#f87171',
                                                        padding: '4px 10px',
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t('Inspect Plan A Veto in Prescription →', '查看处方室方案 A 否决依据 →')}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => navigate('/sensors')}
                                                style={{
                                                    background: theme.btnBg,
                                                    border: `1px solid ${theme.btnBorder}`,
                                                    borderRadius: 4,
                                                    color: theme.btnColor,
                                                    padding: '4px 10px',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {isBuffer
                                                    ? t('Inspect CA Buffer Cold Telemetry →', '调阅气调保鲜库调峰遥测 →')
                                                    : t('Open Plot Telemetry Detail →', '调阅该地块完整环境遥测 →')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Card B: Operations Fleet, Labor & Cold Storage Grid */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="users" size={17} color="#34d399" />
                                {t('Labor Force, CA Cold Storage & Reefer Fleet Status', '全园生产要素网络：工班、气调库与冷链车队')}
                            </h3>
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                                {t('91.5% Resource Efficiency', '综合运转负荷 91.5%')}
                            </span>
                        </div>

                        <div className="grid grid-3" style={{ gap: 10 }}>
                            {/* Labor Crews */}
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {t('Harvest Crew', '采收班组在岗')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0 2px' }}>
                                    120 {t('Workers', '人')}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    {t('A: 38 (Wax Gloves) | B: 62 | QA: 20', 'A组:38人(白手套) | B组:62人 | 质检:20人')}
                                </div>
                            </div>

                            {/* CA Cold Storage */}
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {t('300t CA Cold Storage', '300吨集中气调库')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00e5a3', margin: '4px 0 2px' }}>
                                    145 / 300 t
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    {t('Room #1 at 1.5°C · N2 98.2% · 48.3% Occ.', '1号库 1.5°C · 氮气98.2% · 库容48.3%')}
                                </div>
                            </div>

                            {/* Reefer Fleet */}
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                                    {t('Reefer Logistics Trucks', '在途冷链干线挂车')}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', margin: '4px 0 2px' }}>
                                    5 {t('Trucks In Transit', '辆在途')}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                    {t('Airport Express (1.5°C) · Chengdu (1.4°C) · Chongqing (1.6°C) · Guiyang (1.5°C) · Nanning (1.8°C)', '长水空港(1.5°C) · 成都(1.4°C) · 重庆(1.6°C) · 贵阳(1.5°C) · 南宁(1.8°C)')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ────────────────────────────────────────────────────────────
                    RIGHT COLUMN: ENTERPRISE ORDERS & FINANCIAL LEDGER
                   ──────────────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Card C: Enterprise Commercial Order Runway */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon name="box" size={17} color="#fbbf24" />
                                    {t('Enterprise Order Fulfillment Control Deck (12 Orders Runway)', '全园12大重点订单履约跑道与动态SLA倒计时')}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    {t('Reconciles volume, delivery deadline, contract value, and execution state across all zones.', '全片区覆盖：当日急单、跨日干线、季度大单与半年长协交付看板。')}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/business')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#38bdf8',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                }}
                            >
                                <span>{t('View Full Ledger →', '前往经营大盘 →')}</span>
                            </button>
                        </div>

                        {/* Order Category Filter Tabs */}
                        <div style={{ display: 'flex', gap: 4, marginBottom: 10, background: '#0f172a', padding: 3, borderRadius: 6, border: '1px solid #1e293b', flexWrap: 'wrap' }}>
                            {[
                                { id: 'ALL', labelEn: 'All (12)', labelZh: '全部订单 (12)' },
                                { id: 'T0', labelEn: 'Same-day T0 (4)', labelZh: '当日急单 T0 (4)' },
                                { id: 'T1_T3', labelEn: 'Trunk T+1~T+3 (3)', labelZh: '跨日干线 T+1~T+3 (3)' },
                                { id: 'QUARTER', labelEn: 'Quarterly (2)', labelZh: '季度大单 (2)' },
                                { id: 'LONGTERM', labelEn: 'Strategic 6-12M (3)', labelZh: '半年/年度长协 (3)' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setOrderCategoryFilter(tab.id)}
                                    style={{
                                        padding: '3px 8px',
                                        borderRadius: 4,
                                        border: 'none',
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        background: orderCategoryFilter === tab.id ? '#38bdf8' : 'transparent',
                                        color: orderCategoryFilter === tab.id ? '#090d16' : '#94a3b8',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {isZh ? tab.labelZh : tab.labelEn}
                                </button>
                            ))}
                        </div>

                        {/* Orders List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }} className="scrollbar-themed">
                            {filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    style={{
                                        background: order.isFocal ? 'rgba(0, 229, 163, 0.06)' : '#0f172a',
                                        border: order.isFocal ? '1px solid #00e5a3' : '1px solid #1e293b',
                                        borderRadius: 6,
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = order.isFocal ? '#00e5a3' : '#38bdf8';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = order.isFocal ? '#00e5a3' : '#1e293b';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.74rem', fontWeight: 800, fontFamily: 'monospace', color: order.isFocal ? '#00e5a3' : '#38bdf8' }}>
                                                    {order.id}
                                                </span>
                                                <strong style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                                                    {isZh ? order.customerZh : order.customer}
                                                </strong>
                                                {order.isFocal && (
                                                    <span style={{ fontSize: '0.58rem', background: '#00e5a320', color: '#00e5a3', padding: '1px 5px', borderRadius: 3, fontWeight: 800 }}>
                                                        [重点] {t('Priority Order', '重点协调订单')}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                                                {isZh ? order.gradeZh : order.grade} · {order.volumeKg.toLocaleString()} kg @ ¥{order.unitPrice}/kg
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>
                                                ¥{order.totalValue.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontFamily: 'monospace' }}>
                                                {order.countdown}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Details: Assigned Plot, Strict SLA Chips, Penalty, and Crew */}
                                    <div style={{ margin: '6px 0', padding: '6px 8px', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.62rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>• {order.zone}</span>
                                            <span style={{ color: '#94a3b8' }}>{t('Due', '交期')}: <strong style={{ color: '#f8fafc' }}>{isZh ? order.dueTime : order.dueTimeEn}</strong></span>
                                        </div>

                                        {/* SLA Requirement Chips */}
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '1px 5px', borderRadius: 3 }}>
                                                糖度 {order.sla?.brix || '≥13.5°'}
                                            </span>
                                            <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: 3 }}>
                                                果粉 {order.sla?.bloom || '≥95%'}
                                            </span>
                                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '1px 5px', borderRadius: 3 }}>
                                                农残: {order.sla?.mrl || 'GB 2763 0检出'}
                                            </span>
                                        </div>

                                        {/* Penalty Clause & Crew/Logistics */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', paddingTop: 2, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                                            <span style={{ color: '#fca5a5' }}>
                                                违约条款: {order.sla?.penalty || '按供货协议扣款'}
                                            </span>
                                            <span style={{ color: '#cbd5e1' }}>
                                                班组: {order.isFocal ? 'CREW-25 黎明队' : '标准采摘组'} · 0~2°C 冷链
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress bar and drill-down action */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 6, borderTop: '1px solid rgba(148,163,184,0.08)', paddingTop: 6 }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 5, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${order.progress}%`, background: order.isFocal ? '#00e5a3' : '#38bdf8', borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontSize: '0.62rem', color: '#64748b', minWidth: 32 }}>
                                                {order.progress}%
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: '0.65rem', color: order.status === 'deciding' ? '#fbbf24' : order.status === 'cleared' ? '#00e5a3' : '#94a3b8' }}>
                                                {isZh ? order.statusLabel : order.statusLabelEn}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', color: '#38bdf8' }}>
                                                {t('Dossier →', '卷宗 →')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overall Progress */}
                        <div style={{ marginTop: 12, padding: '8px 10px', background: '#0a0f1d', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                            <span style={{ color: '#94a3b8' }}>{t('Total Daily Fulfillment Progress', '全园单日交付总履约率')}: <strong style={{ color: '#00e5a3' }}>74.2% (9,240 / 12,450 kg)</strong></span>
                            <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Icon name="check-circle" size={13} color="#10b981" />
                                0.0% {t('Default Risk', '违约赔偿风险')}
                            </span>
                        </div>
                    </div>

                    {/* Card D: Enterprise Daily P&L Ledger & Sentinel ROI */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="dollar" size={17} color="#00e5a3" />
                                {t('Enterprise Daily P&L Ledger & Sentinel ROI', '900 亩企业级当日财务平衡与系统增益')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => navigate('/business')}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#38bdf8',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('Reconcile P&L →', '财务核算详情 →')}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.74rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(56, 189, 248, 0.06)', borderRadius: 4 }}>
                                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{t('Gross Sales Revenue (12.45t)', '1. 全园营业销售总额 (12.45吨)')}</span>
                                <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>+¥898,150</strong>
                            </div>

                            <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4, color: '#94a3b8', fontSize: '0.7rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Labor, Power & Cold Storage', '采收人工(120人) + 水肥灌溉电耗 + 气调库打冷')}</span>
                                    <span style={{ color: '#f87171' }}>-¥55,200</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Packaging, Logistics & Depreciation', '环保保鲜盒耗材 + 冷链干线货运 + 设施折旧')}</span>
                                    <span style={{ color: '#f87171' }}>-¥330,000</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(52, 211, 153, 0.08)', borderRadius: 4 }}>
                                <span style={{ fontWeight: 800, color: '#f8fafc' }}>{t('Net Contribution Margin (57.1%)', '当日净贡献毛利 (毛利率 57.1%)')}</span>
                                <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>+¥512,950</strong>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(0, 229, 163, 0.25)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(0, 229, 163, 0.1)', borderRadius: 4 }}>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#00e5a3' }}>{t('Sentinel 7.3 Quantified Value-Add', 'Sentinel 智能决策实证增益')}</div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{t('PHI claim avoidance + Bloom premium + Loss cut', '规避农残索赔 + 果粉溢价 + 动态平抑减损')}</div>
                                </div>
                                <strong style={{ color: '#00e5a3', fontSize: '0.95rem' }}>+¥183,950</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                    {/* ════════════════════════════════════════════════════════════════════════════
                        3. BOTTOM THIRD RAIL: AUTONOMOUS MULTI-AGENT DECISION SWARM (14 AGENTS)
                       ════════════════════════════════════════════════════════════════════════════ */}
                    <AIAgentPanel />
                </section>

                {/* ════════════════════════════════════════════════════════════════════════════
                    4. RIGHT COLUMN: CONTINUOUSLY ROLLING 7X24 AGENT WORKFLOW & ACTIVITY STREAM
                   ════════════════════════════════════════════════════════════════════════════ */}
                <SystemActivityRail />
            </div>

            {/* ════════════════════════════════════════════════════════════════════════════
                GLOBAL ORDER DOSSIER MODAL (5 Comprehensive Tabs)
               ════════════════════════════════════════════════════════════════════════════ */}
            <OrderDossierModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                locale={locale}
            />

            {/* Global Metric Drill-Down Modal (8 Hero KPIs) */}
            <MetricDrillDownModal
                metric={inspectingMetric}
                onClose={() => setInspectingMetric(null)}
            />
        </div>
    );
}
