import React, { useState } from 'react';
import Icon from './Icon';
import { pick } from '../i18n/locale.js';
import { useNavigate } from 'react-router-dom';

export default function OrderDossierModal({ order, onClose, locale = 'zh' }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('contract'); // 'contract' | 'gantt' | 'risk' | 'financial' | 'certificate'
    const isZh = locale === 'zh';
    const t = (en, zh) => pick(locale, en, zh);

    if (!order) return null;

    // Derived Financials
    const revenue = order.totalValue || (order.volumeKg * order.unitPrice);
    const laborCost = Math.round(order.volumeKg * 2.45);
    const energyCost = Math.round(order.volumeKg * 0.14);
    const packCost = Math.round(order.volumeKg * 1.44);
    const logisticsCost = Math.round(order.volumeKg * 1.35);
    const totalVariableCost = laborCost + energyCost + packCost + logisticsCost;
    const netMargin = revenue - totalVariableCost;
    const marginPct = ((netMargin / revenue) * 100).toFixed(1);
    const penaltyAmount = Math.round(revenue * 0.20);

    const tabs = [
        { id: 'contract', labelZh: '合同与履约档案', labelEn: 'Contract & SLA' },
        { id: 'gantt', labelZh: '采收与冷链五阶甘特图', labelEn: 'Harvest & Cold-Chain Gantt' },
        { id: 'risk', labelZh: '多维风险研判矩阵', labelEn: 'Multi-Factor Risk Matrix' },
        { id: 'financial', labelZh: '全链路边际财务精算', labelEn: 'Marginal Financial PnL' },
        { id: 'certificate', labelZh: '区块链与质检存证', labelEn: 'Certificates & GS1 Notary' },
    ];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(3, 7, 18, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#090d16',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: 12,
                    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 30px rgba(56, 189, 248, 0.12)',
                    width: 'min(980px, 96vw)',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ══ Modal Header ══ */}
                <div
                    style={{
                        padding: '16px 20px',
                        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.7) 100%)',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                    }}
                >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace', color: '#00e5a3' }}>
                                {order.id}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                }}
                            >
                                {order.category === 't0' ? '当日急单 (T0)' : order.category === 't1_t3' ? '跨日干线 (T+1~T+3)' : order.category === 'quarter' ? '季度大单' : '战略长协 (6-12M)'}
                            </span>
                            {order.isFocal && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                                    重点决策订单 · 方案B胜出
                                </span>
                            )}
                        </div>
                        <h2 style={{ margin: '4px 0 0', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800 }}>
                            {isZh ? order.customerZh : order.customer}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('Contract Gross Value', '合同成交总额')}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                                ¥{revenue.toLocaleString()}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '1px solid rgba(148, 163, 184, 0.3)',
                                borderRadius: 6,
                                color: '#94a3b8',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = '#f8fafc';
                                e.currentTarget.style.borderColor = '#ef4444';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = '#94a3b8';
                                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                            }}
                        >
                            <Icon name="x" size={14} color="#94a3b8" />
                        </button>
                    </div>
                </div>

                {/* ══ Tab Navigation ══ */}
                <div
                    style={{
                        display: 'flex',
                        background: '#0f172a',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                        padding: '0 16px',
                        overflowX: 'auto',
                    }}
                >
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 18px',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                                    background: 'transparent',
                                    color: isActive ? '#38bdf8' : '#94a3b8',
                                    fontSize: '0.78rem',
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {isZh ? tab.labelZh : tab.labelEn}
                            </button>
                        );
                    })}
                </div>

                {/* ══ Tab Body (Scrollable) ══ */}
                <div
                    className="scrollbar-themed"
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                    }}
                >
                    {/* TAB 1: 合同与履约档案 */}
                    {activeTab === 'contract' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Key Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>签约客户与主体</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                                        {isZh ? order.customerZh : order.customer}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>上海冷链总仓 / 直营统采</div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>履约标的与规格</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                                        {isZh ? order.gradeZh : order.grade}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>优质鲜食蓝莓 · 特级18mm+</div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>锁定单价与签约量</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                                        ¥{order.unitPrice}/kg × {order.volumeKg.toLocaleString()} kg
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>锁定出厂交货价</div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>交付截止与倒计时</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginTop: 4, fontFamily: 'monospace' }}>
                                        {isZh ? order.dueTime : order.dueTimeEn}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#f59e0b', marginTop: 2 }}>倒计时: {order.countdown || '03:15:20'}</div>
                                </div>
                            </div>

                            {/* Contractual SLA Specs */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 8, padding: '14px 16px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>合同约定质量验收标准 (SLA Specifications)</span>
                                    <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Icon name="check-circle" size={11} color="#34d399" />
                                        符合 GB 2763 全项法规认证
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px 10px', borderRadius: 6 }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>最低含糖量 (Brix)</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginTop: 2 }}>{order.sla?.brix || '≥13.5°'}</div>
                                    </div>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px 10px', borderRadius: 6 }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>表皮果粉完整率</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00e5a3', marginTop: 2 }}>{order.sla?.bloom || '≥95%'}</div>
                                    </div>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px 10px', borderRadius: 6 }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>果面平均硬度</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>≥3.5 kg/cm²</div>
                                    </div>
                                    <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '8px 10px', borderRadius: 6 }}>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>农药残留标准 (MRL)</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>{order.sla?.mrl || 'GB 2763 (0检出)'}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
                                        <span style={{ color: '#94a3b8' }}>违约扣罚条款：</span>
                                        <strong>{order.sla?.penalty || '延迟交付超2h扣罚合同款20%；农残不合规全额退货并承担冷链空置费'}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        <span>指派保供基地：</span>
                                        <strong style={{ color: '#e2e8f0' }}>{isZh ? order.zone : order.zoneEn}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: 采收与冷链五阶甘特图 */}
                    {activeTab === 'gantt' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                订单标准作业程序 (SOP) 全流程时间线排程：
                            </div>
                            {[
                                {
                                    stage: '1. 拂晓手工轻柔采收',
                                    time: '05:00 - 08:30',
                                    actor: 'A12 采收调度 · CREW-25 拂晓班组 (25人)',
                                    detail: '避开清晨凝露，露水干后手工佩戴无粉食品级丁腈手套提摘；单框单层平铺≤2层果粒防压伤，保护果粉纳米针晶结构。',
                                    status: 'DONE',
                                    statusColor: '#34d399',
                                },
                                {
                                    stage: '2. 90min 差压预冷梯级打冷',
                                    time: '08:30 - 10:00',
                                    actor: 'A10 环境自控 · 1号地头差压机房',
                                    detail: '果温在 90 分钟内由田间 21.5°C 强制预冷至 1.5°C；Q10=3.2 呼吸跃变抑制率达 78%，鲜果失重率 <0.12%。',
                                    status: 'ACTIVE',
                                    statusColor: '#38bdf8',
                                },
                                {
                                    stage: '3. 近红外光电智能双通道分选',
                                    time: '10:00 - 12:30',
                                    actor: 'A05 品质追溯 · 绿萌 4 通道光电分选线',
                                    detail: '高光谱逐粒分选 18mm+ 特级果，剔除微瑕、软果与糖酸比不达标单果，保证 Brix ≥ 13.5° 与硬度 ≥ 3.5 kg/cm²。',
                                    status: 'PENDING',
                                    statusColor: '#f59e0b',
                                },
                                {
                                    stage: '4. 气调充氮气锁鲜装盒',
                                    time: '12:30 - 13:30',
                                    actor: 'A05 品质追溯 · 万级洁净恒温包装车间',
                                    detail: '125g 独立小盒充氮密封包装 (CO2 10-12%, O2 2-3%)，抑制乙烯生成，自动喷印 GS1-128 二维追溯码。',
                                    status: 'PENDING',
                                    statusColor: '#64748b',
                                },
                                {
                                    stage: '5. 全程 0~2°C 冷链干线发车交付',
                                    time: '13:30 - 16:00',
                                    actor: 'A06 销售履约 · 顺丰温控冷藏专车 (云A·K8821)',
                                    detail: '昆明长水机场/干线冷链直发上海冷链仓，在途温湿度及 GPS 轨迹全程上链，16:00 准时抵达交付。',
                                    status: 'SCHEDULED',
                                    statusColor: '#64748b',
                                },
                            ].map((step, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(148, 163, 184, 0.12)',
                                        borderLeft: `4px solid ${step.statusColor}`,
                                        borderRadius: 8,
                                        padding: '12px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{step.stage}</span>
                                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>{step.time}</span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background: `${step.statusColor}20`,
                                                color: step.statusColor,
                                                border: `1px solid ${step.statusColor}40`,
                                            }}
                                        >
                                            {step.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                                        <strong style={{ color: '#94a3b8' }}>主责主体：</strong>{step.actor}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                        {step.detail}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB 3: 多维风险研判矩阵 */}
                    {activeTab === 'risk' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                基于田间微气象、病理动力学与法定门禁的多维风险推演：
                            </div>
                            {[
                                {
                                    title: '风险 1：GB 2763 农药安全间隔期 (72h PHI) 刚性拦截',
                                    level: '刚性一票否决 (VETO)',
                                    levelColor: '#ef4444',
                                    detail: '露天片区 LOT-03 发生蓟马/灰霉告警，若采用喷药方案，距离当前采收窗口仅剩 14h，严重违背 72h PHI 法定安全期。',
                                    decision: '【系统处置】A08 法规合规刚性阻断方案 A！转由无农残风险的北区日光温室 LOT-01/02 保供，彻底杜绝农残检出下架风险。',
                                },
                                {
                                    title: '风险 2：午后澄江湖风 7 级风阻与微气候自锁',
                                    level: '中高物理风险 (HIGH)',
                                    levelColor: '#f59e0b',
                                    detail: '下午 14:00 后抚仙湖畔阵风风力上升至 14.2 m/s (7级)，气温升至 26.5°C。露天采摘将造成果面蜡质晶体融化并诱发落果。',
                                    decision: '【系统处置】A09 安全防灾与 A10 环境自控联锁锁定上午 05:00-08:30 拂晓采收窗口；下午大棚天窗自动闭锁防风防尘。',
                                },
                                {
                                    title: '风险 3：夜间凝露与高湿灰霉孢子萌发窗口',
                                    level: '生物病理风险 (ELEVATED)',
                                    levelColor: '#38bdf8',
                                    detail: '夜间棚外高湿 (RH 82.5%) 持续 3.8 小时。早晨露水未蒸发前严禁碰触果粒，否则果粉极易脱落且密闭包装内易诱发烂果。',
                                    decision: '【系统处置】A02 田间农艺指令待叶面干燥仪归零后准许开采；采后立即进行 90min 差压预冷打冷至 1.5°C 抑制病菌活性。',
                                },
                            ].map((risk, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(148, 163, 184, 0.15)',
                                        borderRadius: 8,
                                        padding: '14px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{risk.title}</span>
                                        <span
                                            style={{
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                background: `${risk.levelColor}20`,
                                                color: risk.levelColor,
                                                border: `1px solid ${risk.levelColor}40`,
                                            }}
                                        >
                                            {risk.level}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                        {risk.detail}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(52,211,153,0.08)', padding: '6px 10px', borderRadius: 4, borderLeft: '3px solid #34d399' }}>
                                        {risk.decision}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TAB 4: 全链路边际财务精算 */}
                    {activeTab === 'financial' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>总销售收入 (Gross Revenue)</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace', marginTop: 4 }}>
                                        ¥{revenue.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>单价 ¥{order.unitPrice}/kg × {order.volumeKg} kg</div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>全链路变动成本合计</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f87171', fontFamily: 'monospace', marginTop: 4 }}>
                                        -¥{totalVariableCost.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>人工、包装、电耗与干线运费</div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 8, padding: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>净边际贡献率 (Margin Rate)</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', marginTop: 4 }}>
                                        {marginPct}% (+¥{netMargin.toLocaleString()})
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#38bdf8', marginTop: 2 }}>极高履约盈利水平</div>
                                </div>
                            </div>

                            {/* Detailed PnL Ledger Table */}
                            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 8, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(30, 41, 59, 0.6)', color: '#94a3b8', borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
                                            <th style={{ padding: '8px 12px' }}>成本费用科目</th>
                                            <th style={{ padding: '8px 12px' }}>计算基准与定额</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>金额 (CNY)</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>占收入比</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                                            <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>1. 采收人工工时费 (CREW-25)</td>
                                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>¥2.45/kg (手采、防压框装、地头搬运)</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f87171', fontFamily: 'monospace' }}>-¥{laborCost.toLocaleString()}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#94a3b8' }}>{((laborCost / revenue) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                                            <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>2. 预冷与光电分选工业电费</td>
                                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>¥0.14/kg (差压机房 1.5°C 恒温 + 光电线)</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f87171', fontFamily: 'monospace' }}>-¥{energyCost.toLocaleString()}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#94a3b8' }}>{((energyCost / revenue) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                                            <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>3. 充氮气调包装盒耗材</td>
                                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>¥1.44/kg (125g 呼吸膜微孔盒 + 食品级氮气)</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f87171', fontFamily: 'monospace' }}>-¥{packCost.toLocaleString()}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#94a3b8' }}>{((packCost / revenue) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                                            <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>4. 全程冷链温控干线运费</td>
                                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>¥1.35/kg (昆明-上海 0~2°C 专车冷藏分摊)</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#f87171', fontFamily: 'monospace' }}>-¥{logisticsCost.toLocaleString()}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#94a3b8' }}>{((logisticsCost / revenue) * 100).toFixed(1)}%</td>
                                        </tr>
                                        <tr style={{ background: 'rgba(52, 211, 153, 0.06)', fontWeight: 700 }}>
                                            <td style={{ padding: '10px 12px', color: '#34d399' }}>全链路净边际贡献 (ΔM)</td>
                                            <td style={{ padding: '10px 12px', color: '#34d399' }}>扣减变动成本后直接现金净贡献</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#34d399', fontSize: '0.88rem', fontFamily: 'monospace' }}>+¥{netMargin.toLocaleString()}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#34d399' }}>{marginPct}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Avoided Loss Box */}
                            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
                                    <strong>Sentinel 自治决策价值：</strong>成功规避延迟超期违约赔偿金 <strong>¥{penaltyAmount.toLocaleString()}</strong> (合同额 20%) 及商业信誉评级下调。
                                </span>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: 区块链与质检存证 */}
                    {activeTab === 'certificate' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                国家农产品质量安全追溯与分布式存证凭证：
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>GS1-128 国际商品物流条码</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace', marginTop: 4 }}>
                                        (01)06974829100234(10)LOT-B3-2026(17)260315
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>
                                        赋码时间：2026-11-14 06:30 | 批次状态：已封签
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>农业区块链 SHA-256 存证哈希</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
                                        1AAD49H2C89F4B7E0012A5E78D321F55C9A312DE
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>
                                        区块高度：#184,920 | 节点状态：7/7 门禁全票存证不可篡改
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>SGS 第三方质检报告</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                                        SGS-CN-YUN-2026-03189 (全项 48 种农残 0 检出)
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#34d399', marginTop: 4 }}>
                                        检测合格判定：GB 2763-2021 绿通免检标准
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', borderRadius: 8, padding: '12px 14px' }}>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>澄江绿色食品产地认证</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>
                                        证书号 GF530422260199 (中国绿色食品发展中心)
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 4 }}>
                                        环境认证：抚仙湖 I 类水质径流保护区生态基地
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ Modal Footer ══ */}
                <div
                    style={{
                        padding: '12px 20px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                    }}
                >
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        工单状态：<strong style={{ color: '#e2e8f0' }}>{order.statusLabel || '已排程'}</strong> · 批次锁定义务已生效
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {order.isFocal && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate('/prescription');
                                }}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: 6,
                                    background: 'linear-gradient(135deg, #00e5a3, #059669)',
                                    border: 'none',
                                    color: '#090d16',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                }}
                            >
                                前往方案决策室查看多主体博弈 (Plan B) →
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                background: 'rgba(30, 41, 59, 0.6)',
                                border: '1px solid rgba(148, 163, 184, 0.3)',
                                color: '#94a3b8',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                            }}
                        >
                            关闭窗口
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
