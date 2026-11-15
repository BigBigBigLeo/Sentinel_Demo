import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { pick } from '../i18n/locale.js';
import useStore from '../engine/store';

/**
 * Sentinel 7.10 Executive Metric Drill-Down Modal
 * Industrial telemetry deep-dive for 8 Dashboard Hero KPIs.
 * Provides granular mathematical breakdown, hourly time series, KA allocation, and direct workflow jumps.
 */
export default function MetricDrillDownModal({ metric, onClose }) {
    const navigate = useNavigate();
    const { locale, policyConfig } = useStore();
    const isZh = locale === 'zh';
    const t = (en, zh) => pick(locale, en, zh);

    if (!metric) return null;

    // Direct configuration mapping for each hero metric
    const METRIC_CONFIG = {
        FULFILLMENT: {
            title: t('Outbound Fulfillment Progress & Daily Load', '全园当日交付进度与产能负荷'),
            subtitle: t('Dispatched throughput across all 12 enterprise contracts · 900-mu Chengjiang Super-Facility', '覆盖 900 亩澄江核心基地全部在岗采收班组、包装产线与气调库出库履约'),
            value: '74.2%',
            unit: ' (9,240 / 12,450 kg)',
            status: 'normal',
            accent: '#00e5a3',
            route: '/farm-business',
            routeLabel: t('View Enterprise Contract P&L Ledger →', '进入全景产销经营台账查看 12 批大单 →'),
            heroStats: [
                { label: t('Daily Dispatched', '已出库交付量'), val: '9,240 kg', sub: t('Across 12 orders', '已履约 9/12 订单') },
                { label: t('Daily Target', '全天保供目标'), val: '12,450 kg', sub: t('12.45 Tons gross', '12.45 吨额定产能') },
                { label: t('Facility Load', '产能负荷率'), val: '93.6%', sub: t('High efficiency state', '高负荷稳态运行') },
                { label: t('Active Harvesters', '在岗采收人员'), val: '120 人', sub: t('Crew-25 Rate: 5.2kg/h', '标准人效 5.2 kg/h') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Hourly Harvest & Packing Curve */}
                    <div style={{ background: '#0c1322', padding: 14, borderRadius: 6, border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f8fafc' }}>
                                {t('Hourly Outbound Throughput Curve (05:00 - 18:00)', '05:00 - 18:00 分时段采收出库时序曲线')}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#00e5a3', fontWeight: 600 }}>
                                {t('Peak: 06:00~07:00 (Dawn Shift · 96.8% Bloom)', '05:00~08:30 拂晓黄金采收期 · 白霜完整度 96.8%')}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: 68, gap: 8, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            {[
                                { time: '05:00', kg: 1420, pct: 75, highlight: true },
                                { time: '06:00', kg: 1850, pct: 95, highlight: true },
                                { time: '07:00', kg: 1950, pct: 100, highlight: true },
                                { time: '08:30', kg: 1560, pct: 80, highlight: true },
                                { time: '10:00', kg: 680, pct: 35, highlight: false },
                                { time: '12:00', kg: 420, pct: 20, highlight: false },
                                { time: '14:00', kg: 880, pct: 45, highlight: false },
                                { time: '16:00', kg: 480, pct: 25, highlight: false },
                            ].map(item => (
                                <div key={item.time} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 }}>
                                    <span style={{ fontSize: '0.6rem', color: item.highlight ? '#00e5a3' : '#64748b', fontWeight: 700 }}>
                                        {item.kg}k
                                    </span>
                                    <div style={{
                                        width: '100%',
                                        height: `${item.pct}%`,
                                        background: item.highlight ? 'linear-gradient(180deg, #00e5a3, #059669)' : 'rgba(56, 189, 248, 0.4)',
                                        borderRadius: '3px 3px 0 0'
                                    }} />
                                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone Breakdown Table */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.72rem' }}>
                        <div style={{ background: '#0c1322', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                            <div style={{ color: '#38bdf8', fontWeight: 700 }}>{t('Zone A: Smart Greenhouse (350 mu)', 'A区：智能温室 (350亩)')}</div>
                            <div style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, margin: '4px 0' }}>780 kg</div>
                            <div style={{ color: '#64748b', fontSize: '0.65rem' }}>{t('Huaxiang / Faxin · High-sugar premium', '华香/法新 · 拂晓抢收特级果')}</div>
                        </div>
                        <div style={{ background: '#0c1322', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                            <div style={{ color: '#10b981', fontWeight: 700 }}>{t('Zone B: Thermal High-Tunnel (400 mu)', 'B区：双层保温大棚 (400亩)')}</div>
                            <div style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, margin: '4px 0' }}>4,700 kg</div>
                            <div style={{ color: '#64748b', fontSize: '0.65rem' }}>{t('Emerald / Jewel · Sam\'s KA harvest', '绿宝石/珠宝 · 山姆长协主力采收')}</div>
                        </div>
                        <div style={{ background: '#0c1322', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                            <div style={{ color: '#a78bfa', fontWeight: 700 }}>{t('Zone C: CA Cold Storage (150 mu)', 'C区：气调恒温保鲜库 (150亩)')}</div>
                            <div style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800, margin: '4px 0' }}>3,760 kg</div>
                            <div style={{ color: '#64748b', fontSize: '0.65rem' }}>{t('1.5°C pre-cooled · Direct wholesale', '1.5°C 预冷达标 · 调峰大宗出库')}</div>
                        </div>
                    </div>
                </div>
            )
        },
        SALES: {
            title: t('Locked Contractual Gross Revenue', '全园当日合同总销售额'),
            subtitle: t('Locked direct supply contracts across 6 Key Accounts (KA) and wholesale markets', '基于锁定直供长协单价（盒马¥65、山姆¥58、Ole\'¥88、国泰航空¥82、百果园¥55、批发¥37.5）的单日销售总额'),
            value: '¥898,150',
            unit: t(' · Avg ¥72.1/kg', ' · 综合均价 ¥72.1/kg'),
            status: 'normal',
            accent: '#38bdf8',
            route: '/farm-business',
            routeLabel: t('Inspect All 12 Contract SLA Dossiers →', '查看 12 批大客户直供合同与锁价台账 →'),
            heroStats: [
                { label: t('Total Revenue', '合同销售总额'), val: '¥898,150', sub: t('12 Contracts Locked', '12 份长协锁价') },
                { label: t('Weighted Avg Price', '综合加权单价'), val: '¥72.1 / kg', sub: t('Tier-1 Premium +92%', '特级溢价率 +92%') },
                { label: t('KA Locked Ratio', '长协客户锁定率'), val: '95.5%', sub: t('Wholesale spot 4.5%', '大宗现货仅占 4.5%') },
                { label: t('Payment Security', '回款信用保障'), val: '100% 履约', sub: t('0 Bad debt risk', '对公结算 0 违约') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ background: '#0c1322', borderRadius: 6, border: '1px solid #1e293b', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                                    <th style={{ padding: '8px 12px' }}>{t('Key Account Customer', '直供大客户')}</th>
                                    <th style={{ padding: '8px 12px' }}>{t('Target Volume', '今日履约量')}</th>
                                    <th style={{ padding: '8px 12px' }}>{t('Locked Price', '锁定单价')}</th>
                                    <th style={{ padding: '8px 12px' }}>{t('Contract Value', '合同货值')}</th>
                                    <th style={{ padding: '8px 12px' }}>{t('Revenue Share', '货值占比')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { client: 'Ole\' 华润万家精品超市', kg: '4,500 kg', price: '¥88.0 / kg', val: '¥396,000', pct: '44.1%', color: '#38bdf8' },
                                    { client: '山姆会员商店 (Sam\'s Club)', kg: '5,000 kg', price: '¥58.0 / kg', val: '¥290,000', pct: '32.3%', color: '#10b981' },
                                    { client: '国泰航空食品配餐 (Cathay)', kg: '1,500 kg', price: '¥82.0 / kg', val: '¥123,000', pct: '13.7%', color: '#a78bfa' },
                                    { client: '盒马鲜生 (Hema Fresh - 重点单)', kg: '750 kg', price: '¥65.0 / kg', val: '¥48,750', pct: '5.4%', color: '#f59e0b' },
                                    { client: '昆明金马正昌大宗现货批发', kg: '700 kg', price: '¥57.7 / kg', val: '¥40,400', pct: '4.5%', color: '#64748b' },
                                ].map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '7px 12px', fontWeight: 600, color: '#f8fafc' }}>{row.client}</td>
                                        <td style={{ padding: '7px 12px', color: '#cbd5e1' }}>{row.kg}</td>
                                        <td style={{ padding: '7px 12px', color: '#38bdf8', fontWeight: 700 }}>{row.price}</td>
                                        <td style={{ padding: '7px 12px', color: '#00e5a3', fontWeight: 700 }}>{row.val}</td>
                                        <td style={{ padding: '7px 12px' }}>
                                            <span style={{ color: row.color, fontWeight: 700 }}>{row.pct}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        MARGIN: {
            title: t('Net Contribution Margin & Direct Cost Breakdown', '综合直接成本与净边际贡献管理会计精算'),
            subtitle: t('Direct variable costs: harvest labor, fertigation energy, CA cold storage, packaging, and reefer logistics', '直接变动成本严密核算：120人采收工时、水肥一体机电耗、气调库打冷、食品级环保包装与在途冷链干线物流'),
            value: '¥512,950',
            unit: t(' · Margin 57.1%', ' · 毛利率 57.1%'),
            status: 'normal',
            accent: '#10b981',
            route: '/farm-business',
            routeLabel: t('Open Management Accounting Model →', '进入经营精算查看成本与单公斤模型 →'),
            heroStats: [
                { label: t('Net Contribution', '单日净毛利贡献'), val: '¥512,950', sub: t('EBITDA Baseline', '核心经营利润基盘') },
                { label: t('Total Direct OPEX', '直接变动总成本'), val: '¥385,200', sub: t('Cost ratio 42.9%', '成本费用率 42.9%') },
                { label: t('Gross Margin Ratio', '综合毛利率'), val: '57.1%', sub: t('Target: >= 55.0%', '超额完成 55% 目标') },
                { label: t('Unit Margin / kg', '单公斤净边际贡献'), val: '¥41.2 / kg', sub: t('Cost ¥30.9 / kg', '单公斤综合成本 ¥30.9') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Waterfall structure */}
                    <div style={{ background: '#0c1322', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                            {t('Enterprise Daily P&L Waterfall (EBITDA)', '企业级单日 P&L 财务瀑布精算')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 4 }}>
                                <span style={{ fontWeight: 700, color: '#f8fafc' }}>{t('1. Gross Sales Revenue (12.45 Tons)', '1. 全园营业销售总额 (12.45 吨)')}</span>
                                <strong style={{ color: '#38bdf8' }}>+¥898,150</strong>
                            </div>
                            <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4, color: '#94a3b8', fontSize: '0.68rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Harvest Crew Labor (120 Harvesters · 5.2kg/h)', '采收作业人工 (120名采收技术员 · 5.2kg/h)')}</span>
                                    <span style={{ color: '#f87171' }}>-¥55,200</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Fertigation & Greenhouse HVAC Electricity', '精准水肥一体机灌溉 + 温室环控电耗')}</span>
                                    <span style={{ color: '#f87171' }}>-¥28,400</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('CA Storage Nitrogen & Deep Cooling Power', '气调恒温保鲜库高纯氮与差压打冷电耗')}</span>
                                    <span style={{ color: '#f87171' }}>-¥32,800</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Food-Grade Biodegradable Clamshell Packaging', '出口级环保透气保鲜盒及标签纸耗材')}</span>
                                    <span style={{ color: '#f87171' }}>-¥48,500</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• {t('Reefer Trunk Freight & Air Hub Direct Cargo', '5 辆在途温控干线物流及空港航空直运')}</span>
                                    <span style={{ color: '#f87171' }}>-¥220,300</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4, borderTop: '1px solid rgba(16, 185, 129, 0.3)', marginTop: 2 }}>
                                <span style={{ fontWeight: 800, color: '#f8fafc' }}>{t('Net Operating Contribution Margin (57.1%)', '综合净边际贡献 (毛利率 57.1%)')}</span>
                                <strong style={{ color: '#00e5a3', fontSize: '0.85rem' }}>+¥512,950</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        ROI: {
            title: t('Sentinel Autonomous Decision Alpha & Value-Add', 'SENTINEL 决策增益与风控挽损定量归因'),
            subtitle: t('Empirical verification of autonomous multi-agent decision advantage over baseline human scheduling', '系统单日 14.2 倍投资回报率实证：农残刚性门禁阻断、拂晓果粉溢价保全、精准节水节肥与分流减损'),
            value: '+¥183,950',
            unit: t(' · 14.2x Daily ROI', ' · 14.2 倍单日回报'),
            status: 'normal',
            accent: '#f59e0b',
            route: '/prescription',
            routeLabel: t('Enter Prescription Decision Room (Plan B Lead) →', '进入全闭环处方决策室查看方案 B 领跑依据 →'),
            heroStats: [
                { label: t('Total Value-Add', '决策系统单日增益'), val: '+¥183,950', sub: t('Quantitative Alpha', '可量化净超额收益') },
                { label: t('Daily System ROI', '单日投资回报率'), val: '14.2x', sub: t('Based on SaaS allocation', '基于每日系统投入成本') },
                { label: t('Plan B Margin Lead', '方案 B 净贡献优势'), val: '+¥45,800', sub: t('93.9% net margin', '毛利率 93.9% 领跑') },
                { label: t('Default Penalty Averted', '阻断违约赔偿敞口'), val: '¥48,750', sub: t('100% PHI Risk Defused', '规避盒马 20% 刚性罚款') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: 700 }}>
                                <span>{t('1. Avoided Claim Penalty', '1. 阻断违约索赔敞口')}</span>
                                <span>+¥48,750</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: 4 }}>
                                {t('Vetoed Plan A in LOT-03 (72h PHI conflict). Prevented Hema 20% penalty and batch confiscation.', '一票否决 LOT-03 化学喷药方案 A，完全规避 72h PHI 严重倒挂导致的盒马 20% 刚性索赔与全批下架。')}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                                <span>{t('2. Epicuticular Wax Bloom Premium', '2. 果粉保全特级溢价')}</span>
                                <span>+¥56,200</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: 4 }}>
                                {t('Locked 05:00~08:30 dawn harvest window. 96.8% intact wax bloom secured Grade A price tier.', '锁定清晨 05:00-08:30 拂晓弱光低温窗口，果粉保持度达 96.8%，保全商超直供 +¥15/kg 特级溢价。')}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 700 }}>
                                <span>{t('3. Precision Fertigation Energy Savings', '3. 精准节水水肥电耗')}</span>
                                <span>+¥15,040</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: 4 }}>
                                {t('Closed-loop VPD & substrate moisture matching. Reduced 18% nutrient waste and off-peak power.', '闭环 VPD 与基质含水率反馈，水肥一体化机节省 18% 肥料与 25% 灌溉水，并充分利用谷电避峰蓄冷。')}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
                                <span>{t('4. Dynamic Triage Shrink Reduction', '4. 动态分流定纲减损')}</span>
                                <span>+¥63,960</span>
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.65rem', marginTop: 4 }}>
                                {t('Optical sorting triage routed sub-standard berries to deep processing, stopping shelf rot.', '近红外光电分选动态将小果/软果快速分流至深加工冻干产线，阻断常温货架衰减损耗与批次拒收。')}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        GRADE_A: {
            title: t('NIR Optical Sorting Grade A Quality Ratio', '近红外光电在线分选特级优果率'),
            subtitle: t('Real-time grading: berry diameter >=18mm, firmness >=3.8 kg/cm², Brix >=13.8, bloom intact >=95%', '基于近红外 (NIR) 光电在线分选标定：果径 18mm+ 特级果、果实硬度 3.8 kg/cm²、糖度 13.8°Bx 与果粉保持度 96.8%'),
            value: '91.4%',
            unit: t(' · Firmness 3.8', ' · 硬度 3.8 kg/cm²'),
            status: 'normal',
            accent: '#38bdf8',
            route: '/farm-business',
            routeLabel: t('View Optical Sorting & Crop Yield Report →', '进入产销经营台账查看分级报告与糖酸比 →'),
            heroStats: [
                { label: t('Grade A Proportion', '全域特级果比例'), val: '68.2%', sub: t('Diameter >= 18mm', '果径 >= 18mm 奢果') },
                { label: t('Grade 1 Proportion', '一级果比例'), val: '23.2%', sub: t('Diameter 14-17mm', '果径 14-17mm 标果') },
                { label: t('Berry Firmness', '果实平均硬度'), val: '3.8 kg/cm²', sub: t('High shelf endurance', '耐储运抗压指标极佳') },
                { label: t('Soluble Solids (TSS)', '平均可溶性固形物'), val: '13.8 °Bx', sub: t('TSS/TA Ratio: 28.4', '糖酸比 28.4 黄金口感') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: '#0c1322', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                            {t('Fruit Size & Quality Tier Distribution (NIR Calibrated)', '果实规格与品质等级分布（近红外光电在线标定）')}
                        </div>
                        <div style={{ display: 'flex', height: 12, borderRadius: 4, overflow: 'hidden', background: '#1e293b', marginBottom: 8 }}>
                            <div style={{ width: '68.2%', background: '#38bdf8' }} title="特级果 18mm+: 68.2%" />
                            <div style={{ width: '23.2%', background: '#10b981' }} title="一级果 14-17mm: 23.2%" />
                            <div style={{ width: '8.6%', background: '#64748b' }} title="深加工级 <14mm: 8.6%" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>● 特级果 (18mm+) 68.2% (¥88/kg 溢价)</span>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>● 一级果 (14-17mm) 23.2% (¥58/kg)</span>
                            <span style={{ color: '#94a3b8' }}>● 深加工标果 8.6% (速冻转流)</span>
                        </div>
                    </div>
                </div>
            )
        },
        PHI_GATE: {
            title: t('GB 2763 Statutory PHI Compliance Gate', 'GB 2763 国家标准农残与安全间隔期刚性门禁'),
            subtitle: t('Enforcing 7/7 rigid regulatory safety gates across all harvests. Zero chemical residue tolerance.', '7/7 法定食品安全门禁刚性联锁；LOT-03 西花蓟马超标触发 72h PHI 闭锁，A08 法规合规坚决行使一票否决权'),
            value: policyConfig?.phiTolerance === 'relaxed' ? '94.2% (实验放行)' : '100% 严防',
            unit: policyConfig?.phiTolerance === 'relaxed' ? t(' · Relaxed -6h', ' · 容忍 -6h') : t(' · 7/7 Gates Locked', ' · 7/7 门禁全部联锁'),
            status: policyConfig?.phiTolerance === 'relaxed' ? 'elevated' : 'low',
            accent: policyConfig?.phiTolerance === 'relaxed' ? '#f59e0b' : '#10b981',
            route: '/risk',
            routeLabel: t('Inspect Regulatory Hard Gates in Risk Assessment →', '进入风险研判查看法定门禁与农残检测凭据 →'),
            heroStats: [
                { label: t('Regulatory Gate Status', '法定门禁状态'), val: policyConfig?.phiTolerance === 'relaxed' ? 'RELAXED' : '100% PASS', sub: t('Zero tolerance', '全批次 0 药残超标') },
                { label: t('LOT-03 Cyantraniliprole', 'LOT-03 溴氰虫酰胺'), val: '72h PHI 闭锁', sub: t('-58h absolute conflict', '绝对倒挂 -58 小时') },
                { label: t('SGS 480-Screening', 'SGS 480 项微量筛查'), val: 'ND (未检出)', sub: t('KA mutual recognition', '盒马/山姆互认免检') },
                { label: t('Interlock Compliance', '闭环干预合规率'), val: '100.0%', sub: t('0 Default records', '无违约通报记录') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: 12, borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontWeight: 800, fontSize: '0.78rem' }}>
                            <Icon name="warning" size={16} color="#f87171" />
                            <span>{t('LOT-03 Mandatory Compliance Veto Evidence', 'LOT-03 地块法定合规一票否决实证')}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', marginTop: 4, lineHeight: 1.45 }}>
                            {t('Pest trap TRAP-S02 breached threshold (14 thrips/trap). If chemical spray applied, statutory 72h Pre-Harvest Interval (PHI) conflicts with Hema 750kg deadline (-58h). Plan A vetoed by A08 Compliance Agent.', '智能诱捕器 TRAP-S02 检出蓟马 14头/板突破控制线。若实施化学喷药，国家强制 72h 采前安全间隔期 (PHI) 距盒马 14:00 出库产生 -58 小时严重倒挂。系统坚决一票否决方案 A，避免 ¥48,750 违约罚金与全批下架。')}
                        </div>
                    </div>
                </div>
            )
        },
        MICROCLIMATE: {
            title: t('Microclimate Safe Harvest Window & Gust Interlock', '微气象安全采收时序与温室天窗物理联锁'),
            subtitle: t('Fuxian Lake thermal inertia and afternoon wind velocity model. Gust threshold: 8.0 m/s.', '抚仙湖畔微气象物理模型：清晨拂晓弱光微风适宜采收，午后 14:00 阵风超 14m/s 风险，天窗紧急自锁系统处于热备状态'),
            value: '03h 15m',
            unit: t(' Remaining', ' 拂晓采摘倒计时'),
            status: 'normal',
            accent: '#38bdf8',
            route: '/sensors',
            routeLabel: t('Open Environmental Telemetry Sensor Stream →', '进入农事与环境遥测网查看传感器流 →'),
            heroStats: [
                { label: t('Current Wind Speed', '当前抚仙湖风速'), val: '4.2 m/s', sub: t('Threshold: 8.0 m/s', '自锁红线阈值 8.0 m/s') },
                { label: t('Canopy Air Temp', '温室冠层气温'), val: '21.4 °C', sub: t('Root temp 18.2 °C', '基质根区温度 18.2 °C') },
                { label: t('Canopy VPD', '饱和气压亏缺'), val: '1.15 kPa', sub: t('Optimal 0.8~1.2 kPa', '最佳蒸腾生理区间') },
                { label: t('Relative Humidity', '相对空气湿度'), val: '68% RH', sub: t('Zero dew risk', '无果面结露霉变风险') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: '#0c1322', padding: 12, borderRadius: 6, border: '1px solid #1e293b' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                            {t('Fuxian Lake Afternoon Wind Forecast & Automated Interlock', '抚仙湖午后阵风预测与天窗联动自锁时序')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                            {t('Forecast indicates wind speeds escalating to 14.5 m/s after 14:00 due to lake-land thermal convection. The greenhouse ventilation louvers will auto-lock. Morning picking (05:00~08:30) completed 100% of open-field quota safely.', '气象雷达显示 14:00 抚仙湖热力对流加剧，阵风将突破 14.5 m/s。智能温室天窗自锁模块已就绪；早间 05:00-08:30 拂晓采摘已提前完成露天采收配额，避免强风造成果枝磨损擦伤。')}
                        </div>
                    </div>
                </div>
            )
        },
        COLD_CHAIN: {
            title: t('In-Transit Cold Chain Steady-State Rate', '在途冷链温控稳态履约率与北斗温控专车'),
            subtitle: t('5 refrigerated trucks in transit monitored via GPS and Honeywell dual-zone temperature sensors', '5 辆在途干线专车全程北斗定位与双温区记录仪上链，0 脱温记录，差压快速预冷抑制呼吸热 Q10=3.2'),
            value: '99.8%',
            unit: t(' · 1.5°C Steady', ' · 1.5°C 稳态恒温'),
            status: 'normal',
            accent: '#00e5a3',
            route: '/execution',
            routeLabel: t('Inspect All 5 Reefer Fleet Dispatches in Execution →', '进入指令执行中心查看冷链车队与派发指令 →'),
            heroStats: [
                { label: t('Fleet in Transit', '在途温控专车'), val: '5 辆干线', sub: t('0 Temp breaches', '全程 0 脱温记录') },
                { label: t('Core Berry Temp', '在途果心温度'), val: '1.5 °C', sub: t('Deviation: ±0.3°C', '控温波动极差 ±0.3°C') },
                { label: t('Pre-Cooling Rate', '差压预冷呼吸商'), val: 'Q10 = 3.2', sub: t('Metabolism cut by 78%', '呼吸热损耗直降 78%') },
                { label: t('Shelf Life Buffer', '冷链保鲜货架期'), val: '21 天', sub: t('Air freight direct', '航空空港次日达') },
            ],
            renderDetail: () => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: '#0c1322', borderRadius: 6, border: '1px solid #1e293b', overflow: 'hidden' }}>
                        <div style={{ padding: '8px 12px', background: '#0f172a', borderBottom: '1px solid #1e293b', fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc' }}>
                            {t('Active In-Transit Reefer Fleet Roster', '在途 5 辆温控干线专车实时遥测名册')}
                        </div>
                        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem' }}>
                            {[
                                { truck: '沪A·B8821 (1号车)', dest: '上海 Ole\' 配送中心', temp: '1.5°C', rh: '90%', load: '3,500 kg', status: 'G60沪昆高速在途 (正常)' },
                                { truck: '粤A·C9233 (2号车)', dest: '广州华润万家生鲜枢纽', temp: '1.4°C', rh: '92%', load: '2,800 kg', status: 'G80广昆高速在途 (正常)' },
                                { truck: '京A·E7710 (3号车)', dest: '北京新发地直供专柜', temp: '1.6°C', rh: '89%', load: '3,000 kg', status: 'G56杭瑞高速在途 (正常)' },
                                { truck: '川A·K1102 (4号车)', dest: '成都山姆会员店', temp: '1.5°C', rh: '91%', load: '1,900 kg', status: 'G85渝昆高速在途 (正常)' },
                                { truck: '云A·S0091 (空港专线)', dest: '昆明长水国际机场货运站', temp: '1.3°C', rh: '92%', load: '1,250 kg', status: '航食板集装完毕，准备起飞' },
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#090d16', borderRadius: 4, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div>
                                        <strong style={{ color: '#38bdf8' }}>{row.truck}</strong>
                                        <span style={{ color: '#94a3b8', marginLeft: 8 }}>{row.dest}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <span style={{ color: '#00e5a3', fontFamily: 'monospace', fontWeight: 700 }}>{row.temp} · {row.rh}</span>
                                        <span style={{ color: '#cbd5e1' }}>{row.load}</span>
                                        <span style={{ color: '#10b981' }}>{row.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }
    };

    const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.FULFILLMENT;

    return (
        <div
            className="metric-drilldown-backdrop"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.78)',
                backdropFilter: 'blur(4px)',
                zIndex: 10005,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
            }}
        >
            <div style={{
                background: '#090d16',
                border: `1px solid ${cfg.accent}`,
                boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 25px ${cfg.accent}25`,
                borderRadius: 10,
                maxWidth: 820,
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 22, 0.95) 100%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.accent, boxShadow: `0 0 8px ${cfg.accent}` }} />
                            <h2 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800 }}>
                                {cfg.title}
                            </h2>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {cfg.subtitle}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: cfg.accent, fontFamily: 'monospace', lineHeight: 1 }}>
                                {cfg.value}<span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{cfg.unit}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="metric-drilldown-close"
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: 6,
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '6px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#38bdf8'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
                        >
                            <Icon name="x" size={16} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* 4 Hero Stats Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {cfg.heroStats.map((st, i) => (
                            <div key={i} style={{ background: '#0c1322', padding: '10px 12px', borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{st.label}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '3px 0', fontFamily: 'monospace' }}>{st.val}</div>
                                <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{st.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Custom Visual Section */}
                    {cfg.renderDetail()}
                </div>

                {/* Footer Bar */}
                <div style={{
                    padding: '12px 20px',
                    background: '#070b12',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {t('Sentinel Enterprise Telemetry · Real-time Causal Attribution Engine', 'Sentinel 工业级决策遥测中枢 · 实时因果归因与硬性门禁')}
                    </span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            style={{ fontSize: '0.72rem', padding: '6px 12px' }}
                        >
                            {t('Close', '关闭')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => { onClose(); navigate(cfg.route); }}
                            style={{ fontSize: '0.72rem', padding: '6px 14px', background: `linear-gradient(135deg, ${cfg.accent} 0%, #059669 100%)`, color: '#090d16', fontWeight: 800, border: 'none' }}
                        >
                            {cfg.routeLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
