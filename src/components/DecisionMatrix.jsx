import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';
import { DECISION_SCENARIOS } from '../data/decisionMatrixScenarios.js';

export default function DecisionMatrix({ customScenario = null, onAuthorize = null }) {
    const navigate = useNavigate();
    const { locale, activeScenario } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    // Determine active scenario configuration
    const activeScenarioId = customScenario?.id || activeScenario?.id || '';
    let scenarioKey = 'PEST_PHI';
    if (activeScenarioId.includes('02') || activeScenarioId.includes('HEATWAVE')) {
        scenarioKey = 'HEATWAVE';
    } else if (activeScenarioId.includes('03') || activeScenarioId.includes('COLDCHAIN')) {
        scenarioKey = 'COLDCHAIN';
    }
    const config = DECISION_SCENARIOS[scenarioKey] || DECISION_SCENARIOS.PEST_PHI;

    // Selected plan state: 'B' by default, or 'A', 'C'
    const [selectedPlan, setSelectedPlan] = useState('B');
    // Simulated boundary conditions
    const [boundaryConditions, setBoundaryConditions] = useState({
        droneDown: false,
        highNightHumidity: false,
        bufferLockedForOle: false,
        deadline1Day: false,
    });
    // Boundary simulation popover visible
    const [showBoundaryModal, setShowBoundaryModal] = useState(false);
    // Active specialist drawer: null or specialist ID
    const [activeSpecialist, setActiveSpecialist] = useState(null);
    // Dispatch receipt toast state
    const [dispatchReceipt, setDispatchReceipt] = useState(null);
    // Mobile active tab ('A', 'B', 'C') for small screens
    const [mobileTab, setMobileTab] = useState('B');

    // Effective lead plan calculation based on boundary conditions
    const effectiveLead = useMemo(() => {
        if (scenarioKey === 'PEST_PHI' && boundaryConditions.droneDown) return 'C';
        if (scenarioKey === 'HEATWAVE' && boundaryConditions.highNightHumidity) return 'C';
        if (scenarioKey === 'COLDCHAIN' && boundaryConditions.bufferLockedForOle) return 'C';
        return 'B';
    }, [scenarioKey, boundaryConditions]);

    // Active plan being inspected/selected
    const currentActivePlan = selectedPlan;

    // Gates evaluation based on currently selected plan and boundary conditions
    const gates = useMemo(() => {
        if (scenarioKey === 'HEATWAVE') {
            const quality = {
                label: t('QUALITY', '品质门禁'),
                value: currentActivePlan === 'A' ? t('FAIL: Bloom Loss >25%', '拦截: 果粉损耗超标') : t('VERIFIED (94% Bloom)', '质检通过 (94%果粉保持)'),
                status: currentActivePlan === 'A' ? 'BLOCKED' : 'VERIFIED',
                statusZh: currentActivePlan === 'A' ? '红牌拦截' : '质检通过',
                pass: currentActivePlan !== 'A',
                detail: currentActivePlan === 'A'
                    ? t('Daytime misting creates droplet lens burns, stripping epicuticular wax below 75%', '白天冠层微喷形成透镜效应加重灼伤，果粉脱落率超 25% 导致降级')
                    : t('75% shade screen and dawn picking maintain 94% bloom integrity', '75% 铝箔遮阳与清晨错峰采收确保果粉完整率达 94%'),
            };
            const compliance = {
                label: t('COMPLIANCE', '合规门禁'),
                value: t('Labor Law Cleared', '劳动防护合规放行'),
                status: 'CLEARED',
                statusZh: '检验放行',
                pass: true,
                detail: t('05:00-10:00 dawn shift completely avoids noon heat (>=35°C), 100% compliant', '清晨 05:00~10:00 拂晓抢收完全避开午间 35°C 高温劳动法红线'),
            };
            let capacity = {
                label: t('CAPACITY', '产能门禁'),
                value: t('28 Pickers Ready', '28人班组锁定'),
                status: 'RESERVED',
                statusZh: '资源锁定',
                pass: true,
                detail: t('Crew-28 on duty; fruit temperature <18°C entering 1.5°C precooling', 'CREW-28 班组就绪，果温低于 18°C 进预冷库'),
            };
            if (boundaryConditions.deadline1Day) {
                capacity = {
                    label: t('CAPACITY', '产能门禁'),
                    value: t('FAIL: 800kg Gap', '熔断: 产能短缺800kg'),
                    status: 'BLOCKED',
                    statusZh: '超限拦截',
                    pass: false,
                    detail: t('28 pickers can only harvest 400kg in morning hours; 1-day deadline causes 800kg shortfall', '28名工人单日晨间仅可抢收400kg，1天工期面临800kg缺口'),
                };
            }
            return { quality, compliance, capacity };
        }

        if (scenarioKey === 'COLDCHAIN') {
            const quality = {
                label: t('QUALITY', '品质门禁'),
                value: currentActivePlan === 'A' ? t('FAIL: Mixed Soft Berries', '拦截: 混入软果') : t('VERIFIED (750kg Grade A)', '质检通过 (750kg全额达标)'),
                status: currentActivePlan === 'A' ? 'BLOCKED' : 'VERIFIED',
                statusZh: currentActivePlan === 'A' ? '红牌拦截' : '质检通过',
                pass: currentActivePlan !== 'A',
                detail: currentActivePlan === 'A'
                    ? t('Mixing 50kg softened fruit into clamshells violates Grade A specs and causes full rejection', '严禁将 50kg 软果混装贴标，商超快检必全单拒收')
                    : t('700kg certified stock + 50kg Room #2 buffer completes 750kg Grade A order', '放行合格 700kg 并从 2号库调拨 50kg 预留库存补齐整单'),
            };
            const compliance = {
                label: t('COMPLIANCE', '合规门禁'),
                value: t('Cold Audit Sealed', '冷链异常审计封存'),
                status: 'CLEARED',
                statusZh: '检验放行',
                pass: true,
                detail: t('7.8°C excursion log permanently recorded in SHA-256 ledger, 100% transparent', '02:15~05:15 冷库温升记录已生成加密审计凭证，完全合规透明'),
            };
            let capacity = {
                label: t('CAPACITY', '产能门禁'),
                value: t('8 Techs + 14h Truck', '8名技工与干线车锁定'),
                status: 'RESERVED',
                statusZh: '资源锁定',
                pass: true,
                detail: t('8 packhouse techs ready; repackaging finishes 3h before 14:00 truck departure', '包装班组 35 分钟内完成分选补齐，发运前 3 小时完全就绪'),
            };
            if (boundaryConditions.deadline1Day) {
                capacity = {
                    label: t('CAPACITY', '产能门禁'),
                    value: t('FAIL: 4h Urgent Shift', '熔断: 发车倒计时不足'),
                    status: 'BLOCKED',
                    statusZh: '超限拦截',
                    pass: false,
                    detail: t('Truck departure in 2 hours cannot accommodate sorting and clamshell repacking', '发车时间提前至2小时内导致分选精装不及'),
                };
            }
            return { quality, compliance, capacity };
        }

        // Default PEST_PHI
        const quality = {
            label: t('QUALITY', '品质门禁'),
            value: t('≥750 kg', '≥750 kg 特级鲜果'),
            status: 'VERIFIED',
            statusZh: '质检通过',
            pass: true,
            detail: t('780 kg Grade A berries verified in LOT-01/02', '780 kg 特级精品果经质检放行'),
        };
        let compliance = {
            label: t('COMPLIANCE', '合规门禁'),
            value: t('Label + PHI valid', '药剂标号与 PHI 验证'),
            status: 'CLEARED',
            statusZh: '检验放行',
            pass: true,
            detail: t('0-day PHI Trichoderma biocontrol compliant with GB 2763', '哈茨木霉菌 0天 PHI，符合 GB 2763 绿色食品标准'),
        };
        let capacity = {
            label: t('CAPACITY', '产能门禁'),
            value: t('Crew + cold room', '工班与冷库锁定'),
            status: 'RESERVED',
            statusZh: '资源锁定',
            pass: true,
            detail: t('Crew-25 allocated; Cold Room #1 reserved at 1.5°C', '25人采摘队就绪，1号气调库 1.5°C 已锁定'),
        };
        if (currentActivePlan === 'A') {
            compliance = {
                label: t('COMPLIANCE', '合规门禁'),
                value: t('FAIL: PHI 14-day', '拦截: PHI 14天超标'),
                status: 'BLOCKED',
                statusZh: '红牌拦截',
                pass: false,
                detail: t('Mancozeb 14-day PHI strictly breaches 3-day harvest SLA', '代森锰锌 14天安全间隔期与 3天交付窗口严重冲突，上市抽检必超标'),
            };
        }
        if (boundaryConditions.deadline1Day) {
            capacity = {
                label: t('CAPACITY', '产能门禁'),
                value: t('FAIL: 450kg Gap', '熔断: 产能短缺450kg'),
                status: 'BLOCKED',
                statusZh: '超限拦截',
                pass: false,
                detail: t('25 pickers can only pick 300kg/day; 1-day deadline causes 450kg shortfall', '25名采工日产能仅300kg，1天工期短缺450kg'),
            };
        }
        return { quality, compliance, capacity };
    }, [scenarioKey, currentActivePlan, boundaryConditions, locale]);

    const allGatesPass = gates.quality.pass && gates.compliance.pass && gates.capacity.pass;
    const specialists = config.specialists;
    const plans = config.plans;

    // Authorize dispatch handler
    const handleAuthorize = () => {
        if (!allGatesPass) return;
        const receiptCode = `#AUTH-2026-0311-${currentActivePlan}01`;
        const shaHash = '7f8a3c2b9e1d4a0f8b6e2c5d1a9b3e7f';
        setDispatchReceipt({ code: receiptCode, hash: shaHash });

        if (onAuthorize) {
            onAuthorize({ plan: currentActivePlan, receiptCode, shaHash });
        } else {
            setTimeout(() => {
                navigate('/execution');
            }, 1200);
        }
    };

    // Export audit JSON-LD handler
    const handleExportAudit = () => {
        const auditData = {
            '@context': 'https://schema.org',
            '@type': 'AgriculturalDecisionRecord',
            system: 'Sentinel 7.0 Autonomous Operating Core (观衡智序)',
            identifier: config.auditInfo.identifier,
            timestamp: new Date().toISOString(),
            farmFacility: 'Yunnan Chengjiang 900-mu Blueberry Plant Factory (云南澄江900亩高科技蓝莓工厂)',
            targetBlock: 'Sector South-B3 (20 mu, 3,200 plants)',
            order: {
                id: 'BB-ORDER-750-001',
                customer: config.auditInfo.customer,
                quantity: config.auditInfo.orderVolume,
                contractValue: config.auditInfo.contractValue,
            },
            selectedPlan: currentActivePlan,
            leadPlan: effectiveLead,
            modeledNetMargin: currentActivePlan === 'B' ? plans.B.netZh : currentActivePlan === 'C' ? plans.C.netZh : plans.A.netZh,
            gates: {
                quality: gates.quality.status,
                compliance: gates.compliance.status,
                capacity: gates.capacity.status,
            },
            cryptographicSignature: 'SHA-256: 7f8a3c2b9e1d4a0f8b6e2c5d1a9b3e7f',
        };

        const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/ld+json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sentinel-audit-${config.id}-${currentActivePlan}.jsonld`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section className="decision-matrix-hero" style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 12, padding: 18, color: '#f8fafc', marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {/* Scenario Header Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.65rem', background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        {isZh ? config.badgeZh : config.badge}
                    </span>
                    <strong style={{ fontSize: '0.86rem', color: '#e2e8f0' }}>
                        {isZh ? config.titleZh : config.title}
                    </strong>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    {t('900-mu Yunnan Chengjiang Facility', '900亩云南澄江工厂')}
                </div>
            </div>

            {/* ── 1. Top 5 Operational Gold KPIs ── */}
            <div className="dm-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                {config.kpis.map((kpi, idx) => (
                    <div key={idx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1, color: '#94a3b8' }}>
                                {t(kpi.labelEn, kpi.labelZh)}
                            </span>
                            {kpi.delta && <span style={{ color: kpi.deltaColor || '#00e5a3', fontSize: '0.75rem' }}>{kpi.delta}</span>}
                        </div>
                        <div style={{ fontSize: idx === 4 ? '1.25rem' : '1.45rem', fontWeight: 800, color: kpi.dynamicColor ? kpi.dynamicColor(currentActivePlan) : kpi.valueColor, margin: '4px 0 2px' }}>
                            {kpi.dynamicValue ? kpi.dynamicValue(currentActivePlan, t) : kpi.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {t(kpi.noteEn, kpi.noteZh)}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 2. Specialist Consensus Matrix ── */}
            <div style={{ marginBottom: 16, background: '#0d1322', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: '#94a3b8' }}>
                            {t('SPECIALIST MULTI-AGENT CONSENSUS', '六维多智能体专家博弈')}
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#00e5a320', color: '#00e5a3', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            6 AGENTS
                        </span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {t('Click badge to inspect decision reasoning & evidence', '点击角标查看各智能体研判依据与论据')}
                    </span>
                </div>

                <div className="dm-specialists-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                    {specialists.map(s => {
                        const isSelected = activeSpecialist === s.id;
                        return (
                            <div
                                key={s.id}
                                onClick={() => setActiveSpecialist(isSelected ? null : s.id)}
                                style={{
                                    background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                                    border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                                    borderRadius: 6, padding: '8px 10px', cursor: 'pointer', transition: 'all 0.2s ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8' }}>
                                        {t(s.role, s.roleZh)}
                                    </span>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 800, background: `${s.badgeColor}20`, color: s.badgeColor, padding: '1px 4px', borderRadius: 3 }}>
                                        {s.badge}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#e2e8f0' }}>
                                    {t(s.question, s.questionZh)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Specialist Slide-out Drawer */}
                {activeSpecialist && (
                    <div style={{ marginTop: 12, padding: 12, background: '#0a0f1d', border: '1px solid #38bdf8', borderRadius: 6, animation: 'fadeIn 0.25s ease' }}>
                        {(() => {
                            const spec = specialists.find(s => s.id === activeSpecialist);
                            if (!spec) return null;
                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8' }}>
                                                {t(spec.role, spec.roleZh)}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                                {t(spec.question, spec.questionZh)}
                                            </span>
                                        </div>
                                        <button onClick={() => setActiveSpecialist(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}>
                                            ✕
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 6px 0' }}>
                                        {t(spec.evalEn, spec.evalZh)}
                                    </p>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: 4 }}>
                                        <strong>{t('Input Evidence: ', '输入论据：')}</strong>
                                        {t(spec.inputEn, spec.inputZh)}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Mobile Plan Tab Switcher */}
            <div className="dm-mobile-tabs" style={{ display: 'none', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6, background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid #1e293b' }}>
                    {['A', 'B', 'C'].map(p => (
                        <button
                            key={p}
                            onClick={() => { setMobileTab(p); setSelectedPlan(p); }}
                            style={{
                                flex: 1, padding: '8px 10px', fontSize: '0.75rem', fontWeight: 800, borderRadius: 6, border: 'none', cursor: 'pointer',
                                background: mobileTab === p ? (p === 'B' ? '#00e5a3' : p === 'C' ? '#f59e0b' : '#3b82f6') : 'transparent',
                                color: mobileTab === p ? '#090d16' : '#94a3b8',
                                transition: 'all 0.2s',
                            }}
                        >
                            {p === 'B' ? (effectiveLead === 'B' ? t('✔ Plan B (Lead)', '✔ 方案 B (首选)') : t('Plan B', '方案 B')) :
                             p === 'C' ? (effectiveLead === 'C' ? t('✔ Plan C (Lead)', '✔ 方案 C (首选)') : t('Plan C (Runner-up)', '方案 C (次优)')) :
                             t('Plan A', '方案 A')}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 3. Strategy Comparison Matrix ── */}
            <div className="dm-table-wrapper dm-strategy-table" style={{ border: '1px solid #1e293b', borderRadius: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 16 }}>
                {/* Header Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', background: '#0c1220', borderBottom: '1px solid #1e293b', padding: '10px 14px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 1, color: '#64748b' }}>{t('CRITERIA', '决策维度')}</span>
                    {/* Column A */}
                    <div
                        onClick={() => setSelectedPlan('A')}
                        style={{
                            cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: selectedPlan === 'A' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                            border: `1px solid ${selectedPlan === 'A' ? '#38bdf8' : 'transparent'}`,
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}>
                            {t(plans.A.titleEn, plans.A.titleZh)}
                        </span>
                    </div>
                    {/* Column B */}
                    <div
                        onClick={() => setSelectedPlan('B')}
                        style={{
                            cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: selectedPlan === 'B' ? 'rgba(0, 229, 163, 0.15)' : 'transparent',
                            border: `1px solid ${selectedPlan === 'B' ? '#00e5a3' : 'transparent'}`,
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00e5a3' }}>
                            {t(plans.B.titleEn, plans.B.titleZh)}
                        </span>
                        {effectiveLead === 'B' && (
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#090d16', background: '#00e5a3', padding: '2px 6px', borderRadius: 4 }}>
                                {t('OPTIMAL', '首选')}
                            </span>
                        )}
                    </div>
                    {/* Column C */}
                    <div
                        onClick={() => setSelectedPlan('C')}
                        style={{
                            cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: selectedPlan === 'C' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                            border: `1px solid ${selectedPlan === 'C' ? '#f59e0b' : 'transparent'}`,
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: effectiveLead === 'C' ? '#00e5a3' : '#f59e0b' }}>
                            {t(plans.C.titleEn, plans.C.titleZh)}
                        </span>
                        {effectiveLead === 'C' && (
                            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#090d16', background: '#00e5a3', padding: '2px 6px', borderRadius: 4 }}>
                                {t('OPTIMAL', '首选')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Row: ACTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', borderBottom: '1px solid #1e293b', padding: '12px 14px', alignItems: 'start', background: '#090e17' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{t('ACTION', '核心行动')}</span>
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4, paddingRight: 10 }}>
                        <strong style={{ color: '#f8fafc', display: 'block', marginBottom: 2 }}>{t(plans.A.actionHeadEn, plans.A.actionHeadZh)}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{t(plans.A.actionSubEn, plans.A.actionSubZh)}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4, paddingRight: 10 }}>
                        <strong style={{ color: '#00e5a3', display: 'block', marginBottom: 2 }}>{t(plans.B.actionHeadEn, plans.B.actionHeadZh)}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{t(plans.B.actionSubEn, plans.B.actionSubZh)}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                        <strong style={{ color: '#fbbf24', display: 'block', marginBottom: 2 }}>{t(plans.C.actionHeadEn, plans.C.actionHeadZh)}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{t(plans.C.actionSubEn, plans.C.actionSubZh)}</span>
                    </div>
                </div>

                {/* Row: ECONOMICS */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', borderBottom: '1px solid #1e293b', padding: '12px 14px', alignItems: 'center', background: '#0a101d' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{t('ECONOMICS*', '经济账核算')}</span>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        <div>{t(plans.A.salesEn, plans.A.salesZh)}</div>
                        <div>{t(plans.A.costEn, plans.A.costZh)}</div>
                        <div style={{ fontWeight: 800, color: '#cbd5e1' }}>{t(plans.A.netEn, plans.A.netZh)}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        <div>{t(plans.B.salesEn, plans.B.salesZh)}</div>
                        <div>{t(plans.B.costEn, plans.B.costZh)}</div>
                        <div style={{ fontWeight: 800, color: '#00e5a3', fontSize: '0.78rem' }}>
                            {t(plans.B.netEn, plans.B.netZh)}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
                        <div>{t(plans.C.salesEn, plans.C.salesZh)}</div>
                        <div>{t(plans.C.costEn, plans.C.costZh)}</div>
                        <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.76rem' }}>
                            {t(plans.C.netEn, plans.C.netZh)}
                        </div>
                    </div>
                </div>

                {/* Row: RISK & OBLIGATION */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', borderBottom: '1px solid #1e293b', padding: '12px 14px', alignItems: 'center', background: '#090e17' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{t('RISK & OBLIGATION', '履约与合规评级')}</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Crop {plans.A.scores.crop}</span>
                        <span style={{ fontSize: '0.62rem', background: plans.A.scores.comp.startsWith('5') ? 'rgba(0,229,163,0.15)' : 'rgba(239,68,68,0.2)', color: plans.A.scores.comp.startsWith('5') ? '#00e5a3' : '#f87171', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Compliance {plans.A.scores.comp}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Customer {plans.A.scores.cust}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Crop {plans.B.scores.crop}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(0,229,163,0.15)', color: '#00e5a3', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Compliance {plans.B.scores.comp}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(0,229,163,0.15)', color: '#00e5a3', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Customer {plans.B.scores.cust}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Crop {plans.C.scores.crop}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(0,229,163,0.15)', color: '#00e5a3', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Compliance {plans.C.scores.comp}</span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Customer {plans.C.scores.cust}</span>
                    </div>
                </div>

                {/* Row: EXECUTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', borderBottom: '1px solid #1e293b', padding: '12px 14px', alignItems: 'center', background: '#0a101d' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{t('EXECUTION', '执行复杂度')}</span>
                    <div>
                        <strong style={{ fontSize: '0.74rem', color: '#f8fafc', display: 'block' }}>{plans.A.easeEn}</strong>
                        <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{t(plans.A.easeSubEn, plans.A.easeSubZh)}</span>
                    </div>
                    <div>
                        <strong style={{ fontSize: '0.74rem', color: '#f59e0b', display: 'block' }}>{t(plans.B.easeEn, plans.B.easeZh || plans.B.easeEn)}</strong>
                        <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{t(plans.B.easeSubEn, plans.B.easeSubZh)}</span>
                    </div>
                    <div>
                        <strong style={{ fontSize: '0.74rem', color: '#00e5a3', display: 'block' }}>{t(plans.C.easeEn, plans.C.easeZh || plans.C.easeEn)}</strong>
                        <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{t(plans.C.easeSubEn, plans.C.easeSubZh)}</span>
                    </div>
                </div>

                {/* Row: WINS WHEN */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr', padding: '12px 14px', alignItems: 'start', background: '#090e17' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{t('WINS WHEN', '胜出翻转条件')}</span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4, paddingRight: 10 }}>
                        {t(plans.A.winsWhenEn, plans.A.winsWhenZh)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#00e5a3', lineHeight: 1.4, paddingRight: 10 }}>
                        {t(plans.B.winsWhenEn, plans.B.winsWhenZh)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', lineHeight: 1.4 }}>
                        {t(plans.C.winsWhenEn, plans.C.winsWhenZh)}
                    </div>
                </div>
            </div>

            {/* ── 4. Interlocked Gates & Authorization ── */}
            <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: '#f8fafc' }}>
                            {t('GATES & SIGN-OFF (DISPATCH BLOCKING)', '三道决策联锁门禁与放行条件')}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: allGatesPass ? '#00e5a320' : '#ef444420', color: allGatesPass ? '#00e5a3' : '#ef4444', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            {allGatesPass ? t('3/3 PASS (CLEAR TO DISPATCH)', '3/3 门禁全绿 (可放行)') : t('LOCKED (GATES BLOCKED)', '拦截锁定 (门禁受阻)')}
                        </span>
                    </div>
                    {/* Boundary Condition Trigger Button */}
                    <button
                        type="button"
                        onClick={() => setShowBoundaryModal(v => !v)}
                        style={{
                            background: (boundaryConditions.droneDown || boundaryConditions.highNightHumidity || boundaryConditions.bufferLockedForOle) ? '#f59e0b25' : '#1e293b',
                            border: `1px solid ${(boundaryConditions.droneDown || boundaryConditions.highNightHumidity || boundaryConditions.bufferLockedForOle) ? '#f59e0b' : '#334155'}`,
                            color: (boundaryConditions.droneDown || boundaryConditions.highNightHumidity || boundaryConditions.bufferLockedForOle) ? '#fbbf24' : '#cbd5e1',
                            padding: '4px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        <Icon name="gear" size={12} color={(boundaryConditions.droneDown || boundaryConditions.highNightHumidity || boundaryConditions.bufferLockedForOle) ? '#fbbf24' : '#cbd5e1'} />
                        {t('Simulate Boundary Conditions', '模拟边界翻转工况')}
                    </button>
                </div>

                {/* Boundary Modal */}
                {showBoundaryModal && (
                    <div style={{ background: '#090d16', border: '1px solid #334155', borderRadius: 8, padding: 12, marginBottom: 12, animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <strong style={{ fontSize: '0.75rem', color: '#f8fafc' }}>{t('Simulate Realistic Production Extremes', '模拟真实极限工况 (翻转测试)')}</strong>
                            <button onClick={() => setShowBoundaryModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {/* Scenario-specific primary flip flag */}
                            {config.boundaryFlipConfig && (
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#e2e8f0', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={boundaryConditions[config.boundaryFlipConfig.flag]}
                                        onChange={e => setBoundaryConditions(b => ({ ...b, [config.boundaryFlipConfig.flag]: e.target.checked }))}
                                        style={{ accentColor: '#00e5a3' }}
                                    />
                                    <span>
                                        {t(config.boundaryFlipConfig.labelEn, config.boundaryFlipConfig.labelZh)}
                                        <strong style={{ color: '#00e5a3', marginLeft: 6 }}>
                                            → {t('Flips Plan C to Lead!', '触发方案 C 翻转为第一首选！')}
                                        </strong>
                                    </span>
                                </label>
                            )}

                            {/* Deadline compression flag */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: '#e2e8f0', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={boundaryConditions.deadline1Day}
                                    onChange={e => setBoundaryConditions(b => ({ ...b, deadline1Day: e.target.checked }))}
                                    style={{ accentColor: '#ef4444' }}
                                />
                                <span>
                                    {t('Emergency Deadline Compression: 1-Day Window (D+1)', '紧急压缩交付周期：仅剩 1 天工期 (D+1)')}
                                    <strong style={{ color: '#ef4444', marginLeft: 6 }}>
                                        → {t('Trips Capacity Gate (短缺短截)', '触发产能门禁熔断！')}
                                    </strong>
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 3 Interlocked Gates Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {/* Gate 1: Quality */}
                    <div style={{ background: '#0f172a', border: `1px solid ${gates.quality.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.quality.label}</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: gates.quality.pass ? '#00e5a3' : '#ef4444', background: gates.quality.pass ? '#00e5a320' : '#ef444420', padding: '1px 6px', borderRadius: 3 }}>
                                {isZh ? gates.quality.statusZh : gates.quality.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: gates.quality.pass ? '#f8fafc' : '#ef4444', margin: '4px 0 2px' }}>
                            {gates.quality.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {gates.quality.detail}
                        </div>
                    </div>

                    {/* Gate 2: Compliance */}
                    <div style={{ background: '#0f172a', border: `1px solid ${gates.compliance.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.compliance.label}</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: gates.compliance.pass ? '#00e5a3' : '#ef4444', background: gates.compliance.pass ? '#00e5a320' : '#ef444420', padding: '1px 6px', borderRadius: 3 }}>
                                {isZh ? gates.compliance.statusZh : gates.compliance.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: gates.compliance.pass ? '#f8fafc' : '#ef4444', margin: '4px 0 2px' }}>
                            {gates.compliance.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {gates.compliance.detail}
                        </div>
                    </div>

                    {/* Gate 3: Capacity */}
                    <div style={{ background: '#0f172a', border: `1px solid ${gates.capacity.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.capacity.label}</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: gates.capacity.pass ? '#00e5a3' : '#ef4444', background: gates.capacity.pass ? '#00e5a320' : '#ef444420', padding: '1px 6px', borderRadius: 3 }}>
                                {isZh ? gates.capacity.statusZh : gates.capacity.status}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: gates.capacity.pass ? '#f8fafc' : '#ef4444', margin: '4px 0 2px' }}>
                            {gates.capacity.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {gates.capacity.detail}
                        </div>
                    </div>
                </div>

                {/* Dispatch Button & Export Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        <span>{t('Selected Action: ', '当前选中方案：')}</span>
                        <strong style={{ color: currentActivePlan === 'B' ? '#00e5a3' : currentActivePlan === 'C' ? '#fbbf24' : '#38bdf8' }}>
                            {currentActivePlan === 'B' ? t('Plan B (Selective Release + Biocontrol)', '方案 B (针对性隔离放行 + 生物控害)') :
                             currentActivePlan === 'C' ? t('Plan C (Harvest-First & Zero Spray)', '方案 C (抢收优先 + 零喷洒)') :
                             t('Plan A (Full Chemical Protection)', '方案 A (全区化学植保)')}
                        </strong>
                        {currentActivePlan !== effectiveLead && (
                            <span style={{ color: '#fbbf24', marginLeft: 8 }}>
                                ({t('Note: Current Lead is Plan ', '注：系统当前领跑首选为方案 ')}{effectiveLead})
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            type="button"
                            onClick={handleExportAudit}
                            className="btn btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '0.75rem', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <Icon name="clipboard" size={14} />
                            {t('Export Audit JSON-LD', '导出审计凭证 JSON-LD')}
                        </button>

                        <button
                            type="button"
                            onClick={handleAuthorize}
                            disabled={!allGatesPass}
                            className="btn btn-primary"
                            style={{
                                background: allGatesPass ? 'linear-gradient(135deg, #00e5a3 0%, #059669 100%)' : '#334155',
                                border: 'none',
                                color: allGatesPass ? '#090d16' : '#94a3b8',
                                padding: '8px 18px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                borderRadius: 6,
                                cursor: allGatesPass ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: allGatesPass ? '0 4px 16px rgba(0,229,163,0.3)' : 'none',
                            }}
                        >
                            <Icon name="bolt" size={14} color={allGatesPass ? '#090d16' : '#94a3b8'} />
                            {allGatesPass ? t('⚡ AUTHORIZE DISPATCH (INTERLOCKED)', '⚡ 联锁签署派单并分发') : t('🔒 EXECUTION LOCKED (FAIL GATES)', '🔒 派单已闭锁 (门禁未通过)')}
                        </button>
                    </div>
                </div>

                {/* Dispatch Receipt Toast */}
                {dispatchReceipt && (
                    <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,229,163,0.15)', border: '1px solid #00e5a3', borderRadius: 6, animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Icon name="check" size={16} color="#00e5a3" />
                            <strong style={{ fontSize: '0.8rem', color: '#00e5a3' }}>
                                {t('Dispatch Authorized & Cryptographically Signed', '派工指令已联锁授权并生成防篡改凭证')}
                            </strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                            <span>{t('Receipt Code: ', '数字凭单编号：')}<code>{dispatchReceipt.code}</code></span>
                            <span style={{ marginLeft: 16 }}>{t('SHA-256 Fingerprint: ', '防篡改指纹：')}<code>{dispatchReceipt.hash}</code></span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
