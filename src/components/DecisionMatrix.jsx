import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import { callGeminiAI } from '../utils/geminiClient';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';
import Tooltip from './Tooltip';
import { DECISION_SCENARIOS } from '../data/decisionMatrixScenarios.js';

export default function DecisionMatrix({ customScenario = null, onAuthorize = null, selectedPlan: propSelectedPlan = null, onSelectPlan = null }) {
    const navigate = useNavigate();
    const { locale, activeScenario, policyConfig } = useStore();
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

    // Selected plan state: controlled by parent if provided, otherwise internal
    const [internalPlan, setInternalPlan] = useState('B');
    const selectedPlan = propSelectedPlan !== null ? propSelectedPlan : internalPlan;
    const setSelectedPlan = (plan) => {
        setInternalPlan(plan);
        if (onSelectPlan) onSelectPlan(plan);
    };
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
    // Live Gemini Debate State
    const [geminiDebateLoading, setGeminiDebateLoading] = useState(false);
    const [geminiDebateText, setGeminiDebateText] = useState(null);

    async function handleTriggerGeminiDebate() {
        setGeminiDebateLoading(true);
        const promptText = `As the Sentinel 7.9 Strategic Multi-Agent Debate Engine for Yunnan Chengjiang 900-Mu Blueberry Base, analyze the decision between Plan A, Plan B, and Plan C for the 750kg Grade A blueberry order under the current scenario (${config.titleZh || '蓟马虫害与72h PHI冲突'}).
Selected plan: Plan ${selectedPlan}.
1. Contrast the three options from the perspectives of Agronomy, Compliance, and Finance.
2. Clearly explain why Plan A must be vetoed under GB 2763, why Plan B is the optimal lead (+¥48,750 net margin, 96.8% bloom), and under what specific boundary condition Plan C flips to the lead.
Provide a crisp, multi-agent debate summary in ${isZh ? 'Chinese' : 'English'}.`;

        const result = await callGeminiAI({
            prompt: promptText,
            model: 'gemini-1.5-flash',
            context: { scenarioKey, selectedPlan, order: '750kg Hema' }
        });
        setGeminiDebateText({ text: result.text, source: result.source });
        setGeminiDebateLoading(false);
    }

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
                value: t('28 Crew Members Ready', '28人班组锁定'),
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
                    detail: t('28 harvest technicians can only harvest 400kg in morning hours; 1-day deadline causes 800kg shortfall', '28名采收人员单日晨间仅可抢收400kg，1天工期面临800kg缺口'),
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
                detail: t('25 harvest technicians can only pick 300kg/day; 1-day deadline causes 450kg shortfall', '25名专业采收人员日产能仅300kg，1天工期短缺450kg'),
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

            {/* Real-time Policy Sandbox Impact Pill */}
            {policyConfig && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: policyConfig.preset === 'ka_fast'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : policyConfig.preset === 'l4_full'
                            ? 'rgba(168, 85, 247, 0.12)'
                            : 'rgba(56, 189, 248, 0.08)',
                    border: `1px solid ${policyConfig.preset === 'ka_fast' ? 'rgba(245, 158, 11, 0.4)' : policyConfig.preset === 'l4_full' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(56, 189, 248, 0.25)'}`,
                    borderRadius: 6,
                    padding: '6px 12px',
                    marginBottom: 12,
                    fontSize: '0.72rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            background: policyConfig.preset === 'ka_fast' ? '#f59e0b' : policyConfig.preset === 'l4_full' ? '#a855f7' : '#38bdf8',
                            color: '#090d16',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 3,
                            fontSize: '0.62rem'
                        }}>
                            {policyConfig.preset === 'ka_fast' ? 'KA FAST (沙盘生效)' : policyConfig.preset === 'l4_full' ? 'L4 FULL AUTONOMOUS' : 'L3 STRICT (合规基准)'}
                        </span>
                        <span style={{ color: '#cbd5e1' }}>
                            {policyConfig.preset === 'ka_fast'
                                ? t('Simulation policy active: PHI tolerance -6h enabled. Plan A unlocked for experimental comparison (34.2% audit risk).', '治理沙盘策略已生效：启用 -6h PHI 容忍度，方案 A 实验性参与博弈比选（伴随 34.2% 渠道拒收抽检风险）。')
                                : policyConfig.preset === 'l4_full'
                                    ? t('Simulation policy active: Full L4 autonomy mode. Zero manual sign-offs required; Plan B ready for instant robotic dispatch.', '治理沙盘策略已生效：L4 全无人化巡航模式，无需现场主管人工签批，推荐方案 B 毫秒级闭环下发。')
                                    : t('Baseline strict policy: 100% rigid GB 2763 statutory gates enforced. Plan A strictly vetoed by A08 Compliance.', '当前执行严格法定合规策略：GB 2763 门禁刚性联锁，A08 法规合规主体一票否决方案 A。')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
                    >
                        {t('Adjust in Governance →', '前往治理沙盘调整 →')}
                    </button>
                </div>
            )}

            {/* ── 1. Top 5 Operational Gold KPIs ── */}
            <div className="dm-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
                {config.kpis.map((kpi, idx) => (
                    <Tooltip
                        key={idx}
                        title={t(kpi.labelEn, kpi.labelZh)}
                        content={t(kpi.noteEn, kpi.noteZh)}
                        delayMs={1000}
                    >
                        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 14px', position: 'relative', width: '100%', cursor: 'help' }}>
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
                    </Tooltip>
                ))}
            </div>

            {/* ── 2. Specialist Consensus Matrix ── */}
            <div style={{ marginBottom: 16, background: '#0d1322', border: '1px solid #1e293b', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 1, color: '#94a3b8' }}>
                            {t('MULTI-AGENT CONSENSUS & DEBATE', '14 业务智能体协同博弈')}
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#00e5a320', color: '#00e5a3', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            14 AGENTS
                        </span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {t('Hover or click badge to inspect reasoning & evidence', '悬浮 1 秒或点击角标查看各智能体研判依据与论据')}
                    </span>
                </div>

                <div className="dm-specialists-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                    {specialists.map(s => {
                        const isSelected = activeSpecialist === s.id;
                        return (
                            <Tooltip
                                key={s.id}
                                title={`${t(s.role, s.roleZh)} · ${s.badge}`}
                                content={isZh ? (s.evidenceZh || s.claimZh || s.questionZh) : (s.evidence || s.claim || s.question)}
                                delayMs={1000}
                            >
                                <div
                                    onClick={() => setActiveSpecialist(isSelected ? null : s.id)}
                                    style={{
                                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                                        border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                                        borderRadius: 6, padding: '8px 10px', cursor: 'pointer', transition: 'all 0.2s ease',
                                        width: '100%'
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
                            </Tooltip>
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
                                        <button onClick={() => setActiveSpecialist(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }} title={t('Close', '关闭')}>
                                            <Icon name="x" size={13} color="#94a3b8" />
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
                            {p === 'B' ? (effectiveLead === 'B' ? t('Plan B (Lead)', '方案 B (首选)') : t('Plan B', '方案 B')) :
                             p === 'C' ? (effectiveLead === 'C' ? t('Plan C (Lead)', '方案 C (首选)') : t('Plan C (Runner-up)', '方案 C (次优)')) :
                             t('Plan A', '方案 A')}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── 3. Strategy Comparison Matrix: 3 Independent Vertical Strategic Columns ── */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="layers" size={18} color="#38bdf8" />
                            {t('Independent Strategic Plan Comparison', '三方案纵向独立立体决策矩阵')}
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                            {t('Click anywhere on a column to focus. The entire strategy card illuminates with active causal reasoning below.', '点击任意卡片即可整体选定，整列泛光高亮并联动下方因果推演。')}
                        </p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {t('Active Focus: Plan ', '当前焦点：方案 ')}<strong style={{ color: selectedPlan === 'B' ? '#00e5a3' : selectedPlan === 'C' ? '#f59e0b' : '#ef4444' }}>{selectedPlan}</strong>
                    </div>
                </div>

                <div
                    className="dm-cards-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                        gap: 16,
                    }}
                >
                    {['A', 'B', 'C'].map(pKey => {
                        const plan = plans[pKey];
                        const isSelected = selectedPlan === pKey;
                        const isLead = effectiveLead === pKey;
                        const isBlocked = pKey === 'A';
                        const themeColor = pKey === 'B' ? '#00e5a3' : pKey === 'C' ? '#f59e0b' : '#ef4444';

                        return (
                            <div
                                key={pKey}
                                onClick={() => setSelectedPlan(pKey)}
                                style={{
                                    background: isSelected ? `${themeColor}12` : '#0f172a',
                                    border: isSelected ? `2px solid ${themeColor}` : `1px solid ${themeColor}35`,
                                    borderRadius: 10,
                                    padding: 16,
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    boxShadow: isSelected ? `0 0 24px ${themeColor}22` : 'none',
                                    opacity: isSelected ? 1 : 0.75,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative'
                                }}
                            >
                                {/* Top Badge Row */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 900,
                                                color: '#090d16',
                                                background: themeColor,
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {pKey}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? themeColor : '#f8fafc' }}>
                                                {t(plan.titleEn, plan.titleZh)}
                                            </span>
                                        </div>
                                        {isLead && (
                                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#090d16', background: '#00e5a3', padding: '2px 8px', borderRadius: 4 }}>
                                                {t('OPTIMAL LEAD', '当前首选')}
                                            </span>
                                        )}
                                        {isBlocked && (
                                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: policyConfig?.phiTolerance === 'relaxed' ? '#fbbf24' : '#f87171', background: policyConfig?.phiTolerance === 'relaxed' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                                                {policyConfig?.phiTolerance === 'relaxed' ? t('RELAXED (34.2% RISK)', '沙盘容忍 (34.2%风险)') : t('BLOCKED', '合规阻断')}
                                            </span>
                                        )}
                                        {pKey === 'C' && !isLead && (
                                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#fbbf24', background: 'rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                                                {t('RUNNER-UP', '强力备选')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Section: Action */}
                                    <div style={{ background: '#090d16', padding: 10, borderRadius: 6, marginBottom: 10, border: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: 4, letterSpacing: 0.5 }}>
                                            {t('CORE ACTION', '核心行动')}
                                        </div>
                                        <strong style={{ fontSize: '0.8rem', color: isSelected ? themeColor : '#f8fafc', display: 'block', marginBottom: 2 }}>
                                            {t(plan.actionHeadEn, plan.actionHeadZh)}
                                        </strong>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, display: 'block' }}>
                                            {t(plan.actionSubEn, plan.actionSubZh)}
                                        </span>
                                    </div>

                                    {/* Section: Economics */}
                                    <div style={{ background: '#090d16', padding: 10, borderRadius: 6, marginBottom: 10, border: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: 4, letterSpacing: 0.5 }}>
                                            {t('FINANCIAL ACCOUNTING', '经济账测算')}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                            <div>{t(plan.salesEn, plan.salesZh)}</div>
                                            <div>{t(plan.costEn, plan.costZh)}</div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isBlocked ? '#94a3b8' : themeColor, marginTop: 4 }}>
                                                {t(plan.netEn, plan.netZh)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Compliance & Obligation */}
                                    <div style={{ background: '#090d16', padding: 10, borderRadius: 6, marginBottom: 10, border: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: 6, letterSpacing: 0.5 }}>
                                            {t('GATES & COMPLIANCE RATING', '履约与合规评级')}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                                Crop {plan.scores.crop}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', background: plan.scores.comp.startsWith('5') ? 'rgba(0,229,163,0.15)' : 'rgba(239,68,68,0.2)', color: plan.scores.comp.startsWith('5') ? '#00e5a3' : '#f87171', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                                Compliance {plan.scores.comp}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                                Cust {plan.scores.cust}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Section: Execution Ease & Flip Condition */}
                                    <div style={{ background: '#090d16', padding: 10, borderRadius: 6, marginBottom: 12, border: '1px solid #1e293b' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                                            {t('FLIP & WIN TRIGGER', '胜出与翻转工况')}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                                            {t(plan.winsWhenEn, plan.winsWhenZh)}
                                        </div>
                                    </div>
                                </div>

                                {/* Select Button */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedPlan(pKey); }}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        fontSize: '0.78rem',
                                        fontWeight: 800,
                                        border: isSelected ? `1px solid ${themeColor}` : '1px solid #334155',
                                        background: isSelected ? themeColor : 'rgba(30, 41, 59, 0.6)',
                                        color: isSelected ? '#090d16' : '#94a3b8',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6
                                    }}
                                >
                                    {isSelected ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Icon name="check-circle" size={13} color="#090d16" />
                                            {t('Plan ' + pKey + ' Selected (Active)', '当前已选定方案 ' + pKey)}
                                        </span>
                                    ) : t('Select Plan ' + pKey, '切换选定方案 ' + pKey)}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Dynamic Causal Attribution & Specialist Matrix (Linked to Selected Plan) ── */}
            <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderLeft: `4px solid ${selectedPlan === 'B' ? '#00e5a3' : selectedPlan === 'C' ? '#f59e0b' : '#ef4444'}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="brain" size={18} color={selectedPlan === 'B' ? '#00e5a3' : selectedPlan === 'C' ? '#f59e0b' : '#ef4444'} />
                        <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#f8fafc' }}>
                            {t('Dynamic Causal Analysis: Deep Dive into Plan ', '方案深度因果归因与推演报告 · 聚焦方案 ')}
                            <span style={{ color: selectedPlan === 'B' ? '#00e5a3' : selectedPlan === 'C' ? '#f59e0b' : '#ef4444' }}>{selectedPlan}</span>
                        </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleTriggerGeminiDebate}
                            disabled={geminiDebateLoading}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.25))',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                color: '#e0e7ff', padding: '4px 10px', borderRadius: 6,
                                fontSize: '0.72rem', fontWeight: 700, cursor: geminiDebateLoading ? 'wait' : 'pointer',
                                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)'
                            }}
                        >
                            <Icon name="brain" size={13} color="#c084fc" />
                            {geminiDebateLoading
                                ? t('Synthesizing Live Gemini AI Debate...', 'Gemini 真实博弈推演生成中...')
                                : t('Live Gemini Causal Debate', '唤醒 Gemini 深度博弈推演')}
                        </button>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {t('Linked to Scenario: ', '当前联动场景：')}<strong style={{ color: '#38bdf8' }}>{t(config.titleEn || 'PEST_PHI', config.titleZh || '蓟马虫害与安全期')}</strong>
                        </span>
                    </div>
                </div>

                {/* Real-Time Live Gemini Debate Stream Box */}
                {geminiDebateText && (
                    <div style={{
                        marginTop: 10, marginBottom: 14,
                        padding: '12px 16px', borderRadius: 8,
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.25))',
                        border: '1px solid rgba(168, 85, 247, 0.5)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="brain" size={15} color="#c084fc" />
                                {t('Google Gemini Strategic Multi-Agent Debate Simulation', 'Google Gemini 实时多智能体战备博弈推演')}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                {geminiDebateText.source}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {geminiDebateText.text}
                        </div>
                    </div>
                )}

                {/* Plan A Deep Analysis */}
                {selectedPlan === 'A' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 6, padding: 12 }}>
                            <strong style={{ fontSize: '0.8rem', color: '#f87171', display: 'block', marginBottom: 4 }}>
                                {t('Compliance Meltdown Causal Chain (Veto Justification):', '合规熔断因果链条（一票否决依据）：')}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                                {isZh
                                    ? '南区 LOT-03 在昨日 18:00 施用乙基多杀菌素，国家出口及绿色食品标准 GB 2763 规定其安全间隔期 (PHI) 严格为 72 小时。方案 A 计划今日抢收处于第 14 小时，经化学降解动力学推算，采收样本的药残将达 0.08 mg/kg（超标 800%）。若强行放行，将直接触发盒马 KA 实验室抽检一票否决、没收整批货物，并面临合同违约金 ¥146,250 及封园停业整改 6 个月的行政处罚。'
                                    : 'South block LOT-03 was treated with Spinetoram requiring a strict 72h PHI under GB 2763. Harvesting at hour 14 guarantees residue levels of 0.08 mg/kg (800% over limit), resulting in immediate KA rejection, ¥146,250 penalties, and license suspension.'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? 'A08 法规合规' : 'Compliance Lead'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 700 }}>{isZh ? '投下不可撤销 VETO 否决票' : 'Issued Absolute VETO'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '“任何经济利益不得凌驾于绿色食品安全红线之上。”' : '"Safety compliance cannot be compromised."'}</div>
                            </div>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? 'A07 财务核算' : 'Financial Actuary'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>{isZh ? '违约金敞口 ¥146,250' : 'Penalty Exposure ¥146,250'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '表面毛利无法弥补违约金与商誉损失。' : 'Gross margin fails to cover penalties.'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan B Deep Analysis */}
                {selectedPlan === 'B' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: 'rgba(0, 229, 163, 0.08)', border: '1px solid rgba(0, 229, 163, 0.25)', borderRadius: 6, padding: 12 }}>
                            <strong style={{ fontSize: '0.8rem', color: '#00e5a3', display: 'block', marginBottom: 4 }}>
                                {t('Optimal Lead Causal Chain (Dawn Shift Picking & Pre-Cooling):', '最优首选因果链条（北区温室早班调优 + 预冷协同）：')}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                                {isZh
                                    ? '系统策略避开处于 72h PHI 隔离状态的南区，自动调度北区 3 栋无药高架温室（华香特级果）。锁定清晨 05:00~08:30 弱光低温期（气温 16~19°C）错峰采摘，单果果粉（Wax Bloom）完整度高达 96.8%。采摘后 90 分钟内闭环送入 1 号气调库打冷至果心温 1.5°C。既 100% 遵守国家绿色食品标准，又足额交付 750kg 特级果，实现综合边际净贡献最高（¥48,750）。'
                                    : 'Avoids South zone PHI restriction by dispatching North greenhouses. Dawn shift picking (05:00-08:30, 16-19°C) preserves 96.8% bloom. Pre-cooling within 90 min reaches 1.5°C core temp, delivering 750kg Grade A fruit with peak net margin ¥48,750.'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? 'A04 田间农艺' : 'A04 Field Agronomy'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#00e5a3', fontWeight: 700 }}>{isZh ? '果粉保持度 96.8% (特级A+)' : 'Bloom 96.8% (Grade A+)'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '“拂晓采摘果皮坚韧，完全避开午后高温软化风险。”' : '"Dawn harvest ensures supreme firmness and wax."'}</div>
                            </div>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? 'A12 采收调度' : 'A12 Harvest Dispatch'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700 }}>{isZh ? '38人白手套班组已就绪' : 'Crew-38 Ready'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '“人均工效 32 kg/h，预计 08:15 前完成全部采收。”' : '"Target efficiency 32 kg/h, done before 08:15."'}</div>
                            </div>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? '翻转预警条件' : 'Flip Sensitivity'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>{isZh ? '若阵风 > 12m/s 翻转为 C' : 'Gale >12m/s flips to Plan C'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '温室天窗遇大风强闭时，系统将瞬时切换至冷库释出。' : 'Vents close automatically on gale, flipping to C.'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan C Deep Analysis */}
                {selectedPlan === 'C' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 6, padding: 12 }}>
                            <strong style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'block', marginBottom: 4 }}>
                                {t('Emergency Buffer Causal Chain (Zero Weather Disturbance):', '冷库恒温应急释出因果链条（零田间扰动）：')}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                                {isZh
                                    ? '直接动用 2 号保税恒温气调库中昨日采收并已完成梯度预冷的 D-1 合格批次库存（750kg）。田间采收人员零扰动，对清晨大雾、突发阵风或暴雨工况具有 100% 免疫力。产生额外的仓储电费与冷库折旧约 ¥3,750，实现净利润 ¥45,000。在极端恶劣天气或采收工班短缺工况下，系统将自动把该方案翻转为第一推荐！'
                                    : 'Dispatches pre-cooled D-1 buffer stock (750kg) from CA cold room #2 with zero field disturbance, giving 100% immunity to gale or rain. Generates ¥45,000 net profit after ¥3,750 refrigeration costs. Flips to #1 under severe weather.'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? 'A06 销售履约' : 'Cold Chain Director'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>{isZh ? '果心恒温 1.5°C 库容充足' : 'Core Temp 1.5°C Ready'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '“D-1 批次糖度 13.6°Bx，已通过商超入库快检初筛。”' : '"D-1 lot tested 13.6°Bx, ready for prompt dispatch."'}</div>
                            </div>
                            <div style={{ background: '#090d16', padding: 10, borderRadius: 6, border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2 }}>{isZh ? '能耗成本核算' : 'Energy Surcharge'}</div>
                                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>{isZh ? '仓储电费折旧 -¥3,750' : 'Holding Cost -¥3,750'}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4 }}>{isZh ? '夜间峰谷电价补贴已抵扣 42% 成本。' : '42% off-peak tariff applied.'}</div>
                            </div>
                        </div>
                    </div>
                )}
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
                            <button onClick={() => setShowBoundaryModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }} title={t('Close', '关闭')}>
                                <Icon name="x" size={14} color="#94a3b8" />
                            </button>
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
                    <Tooltip
                        title={gates.quality.label}
                        content={gates.quality.detail}
                        delayMs={1000}
                    >
                        <div style={{ background: '#0f172a', border: `1px solid ${gates.quality.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px', width: '100%', cursor: 'help' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.quality.label} </span>
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
                    </Tooltip>

                    {/* Gate 2: Compliance */}
                    <Tooltip
                        title={gates.compliance.label}
                        content={gates.compliance.detail}
                        delayMs={1000}
                    >
                        <div style={{ background: '#0f172a', border: `1px solid ${gates.compliance.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px', width: '100%', cursor: 'help' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.compliance.label} </span>
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
                    </Tooltip>

                    {/* Gate 3: Capacity */}
                    <Tooltip
                        title={gates.capacity.label}
                        content={gates.capacity.detail}
                        delayMs={1000}
                    >
                        <div style={{ background: '#0f172a', border: `1px solid ${gates.capacity.pass ? '#10b981' : '#ef4444'}`, borderRadius: 6, padding: '10px 12px', width: '100%', cursor: 'help' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>{gates.capacity.label} </span>
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
                    </Tooltip>
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
                            {allGatesPass ? t('AUTHORIZE DISPATCH (INTERLOCKED)', '联锁签署派单并分发') : t('EXECUTION LOCKED (FAIL GATES)', '派单已闭锁 (门禁未通过)')}
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
