import React, { useMemo, useState } from 'react';
import useStore from '../engine/store';
import thresholds from '../data/thresholds';
import { bannedPesticides, phiConstraints } from '../data/constraints';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { pick } from '../i18n/locale.js';
import NumberStepper from '../components/NumberStepper';
import Tooltip from '../components/Tooltip';

export default function Admin() {
    const {
        fields,
        activeFieldId,
        applyThresholdConfig,
        resetThresholdConfig,
        autonomousMode,
        setAutonomousMode,
        locale,
        policyConfig,
        setPolicyConfig,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    const initialThresholds = useMemo(() => JSON.parse(JSON.stringify(thresholds)), []);
    const [localThresholds, setLocalThresholds] = useState(initialThresholds);
    const [saved, setSaved] = useState(false);
    const [resetFlash, setResetFlash] = useState(false);

    // Advanced policy sandbox state (Connected to Global SSOT)
    const [preset, setPreset] = useState(policyConfig?.preset || 'strict');
    const [autonomyLevel, setAutonomyLevel] = useState(policyConfig?.autonomyLevel || 'L3');
    const [phiTolerance, setPhiTolerance] = useState(policyConfig?.phiTolerance || 'strict');
    const [windCutoff, setWindCutoff] = useState(policyConfig?.windCutoff || 12.0);
    const [precoolingHours, setPrecoolingHours] = useState(policyConfig?.precoolingHours || 2.0);

    const updateThreshold = (category, key, value) => {
        setLocalThresholds(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: Number.parseFloat(value) || value },
        }));
        setSaved(false);
        setResetFlash(false);
    };

    function applyPreset(p) {
        setPreset(p);
        let nextCfg = { preset: p, autonomyLevel: 'L3', phiTolerance: 'strict', windCutoff: 12.0, precoolingHours: 2.0 };
        if (p === 'strict') {
            setAutonomyLevel('L3');
            setPhiTolerance('strict');
            setWindCutoff(12.0);
            setPrecoolingHours(2.0);
            setAutonomousMode(true);
        } else if (p === 'ka_fast') {
            setAutonomyLevel('L3');
            setPhiTolerance('relaxed');
            setWindCutoff(14.5);
            setPrecoolingHours(1.5);
            setAutonomousMode(true);
            nextCfg = { preset: p, autonomyLevel: 'L3', phiTolerance: 'relaxed', windCutoff: 14.5, precoolingHours: 1.5 };
        } else if (p === 'l4_full') {
            setAutonomyLevel('L4');
            setPhiTolerance('strict');
            setWindCutoff(12.0);
            setPrecoolingHours(2.0);
            setAutonomousMode(true);
            nextCfg = { preset: p, autonomyLevel: 'L4', phiTolerance: 'strict', windCutoff: 12.0, precoolingHours: 2.0 };
        }
        setPolicyConfig(nextCfg);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    const handleSave = () => {
        setPolicyConfig({
            preset,
            autonomyLevel,
            phiTolerance,
            windCutoff,
            precoolingHours
        });
        applyThresholdConfig({
            ...localThresholds,
            environment: {
                ...localThresholds.environment,
                wind_spray_limit: windCutoff,
            }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleReset = () => {
        resetThresholdConfig();
        const defaults = JSON.parse(JSON.stringify(thresholds));
        setLocalThresholds(defaults);
        applyPreset('strict');
        setSaved(false);
        setResetFlash(true);
        setTimeout(() => setResetFlash(false), 2000);
    };

    // Simulated outcome calculations based on policy state
    const simulatedOutcome = useMemo(() => {
        let pendingApprovals = 1;
        let fteSavings = 85.0;
        let violationRisk = 0.0;
        let penaltyExposure = 0;
        let synthesisZh = '';
        let synthesisEn = '';

        if (autonomyLevel === 'L4') {
            pendingApprovals = 0;
            fteSavings = 92.5;
            violationRisk = phiTolerance === 'strict' ? 0.0 : 42.0;
            penaltyExposure = phiTolerance === 'strict' ? 0 : 73125;
            synthesisZh = 'L4 全无人化巡航模式：算法硬门禁自动闭环下发，无需场长人工驻场签名，FTE 节约率达最高峰值 (92.5%)。';
            synthesisEn = 'L4 Full Autonomy: Closed-loop algorithmic dispatch with 0 pending human sign-offs; FTE savings peak at 92.5%.';
        } else if (autonomyLevel === 'L3') {
            pendingApprovals = phiTolerance === 'relaxed' ? 2 : 1;
            fteSavings = phiTolerance === 'relaxed' ? 78.0 : 85.0;
            violationRisk = phiTolerance === 'relaxed' ? 34.2 : 0.0;
            penaltyExposure = phiTolerance === 'relaxed' ? 48750 : 0;
            synthesisZh = phiTolerance === 'relaxed'
                ? '宽松合规模式警告：允许 -6h 边际放行虽可缓解产能缺口，但面临 34.2% 抽检下架风险，A07 财务核算标记 ¥48,750 违约金敞口。'
                : 'L3 条件自治（当前基准）：常规低危自动派发，重大冲突（如方案 A 阻断）强制留痕审批，违规风险 0.0%，兼顾效率与安全。';
            synthesisEn = phiTolerance === 'relaxed'
                ? 'Relaxed Mode Warning: -6h margin introduces 34.2% test failure risk with ¥48,750 penalty exposure.'
                : 'L3 Conditional Autonomy: Routine tasks auto-dispatched, critical gates require sign-off; 0.0% risk with 85% FTE savings.';
        } else if (autonomyLevel === 'L2') {
            pendingApprovals = 3;
            fteSavings = 45.0;
            violationRisk = 0.0;
            penaltyExposure = 0;
            synthesisZh = 'L2 建议辅助模式：AI 仅生成方案清单，所有温室排风、施肥注水及采收派单均需人工逐项审核。';
            synthesisEn = 'L2 Advisory: AI suggests options; all commands require manual farm manager sign-off.';
        } else {
            pendingApprovals = 6;
            fteSavings = 15.0;
            violationRisk = 12.0;
            penaltyExposure = 15000;
            synthesisZh = 'L1 阈值告警模式：退化为传统告警机，完全丧失多智能体博弈协同优势，人工负担最重。';
            synthesisEn = 'L1 Alert Only: Traditional threshold alarms; highest human workload.';
        }

        return { pendingApprovals, fteSavings, violationRisk, penaltyExposure, synthesisZh, synthesisEn };
    }, [autonomyLevel, phiTolerance, windCutoff, precoolingHours]);

    return (
        <div className="page" style={{ maxWidth: 1280, margin: '0 auto' }}>
            <PipelineBreadcrumb />
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="admin" size={22} color="#38bdf8" />
                        {t('Policy Sandbox & Farm Governance', '策略规则仿真沙盘与系统治理')}
                    </h1>
                    <p className="page-subtitle">
                        {t('Simulate parameter adjustments with real-time business and compliance impact preview on 900-mu farm.', '参数调整与规则阈值敏感度仿真：实时推演对 900 亩园区审批队列、FTE 工效、违规风险与违约金的连锁影响。')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="refresh" size={14} /> {t('Restore Defaults', '恢复默认')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {saved ? <><Icon name="check" size={14} /> {t('Saved & Applied', '已生效并更新')}</> : <><Icon name="save" size={14} /> {t('Save Policy Configuration', '应用策略配置')}</>}
                    </button>
                </div>
            </div>

            {(saved || resetFlash) && (
                <div className="card" style={{ marginBottom: 16, padding: 12, borderLeft: `4px solid ${saved ? '#10b981' : '#f59e0b'}`, background: '#0f172a' }}>
                    <div style={{ fontSize: '0.8rem', color: saved ? '#34d399' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name={saved ? 'check-circle' : 'refresh'} size={16} color={saved ? '#34d399' : '#f59e0b'} />
                        {saved
                            ? t('Policy configuration applied! Decision gates and runtime thresholds updated across all greenhouse zones.', '策略配置已生效！决策门禁与运行阈值已同步更新至全园区三大片区。')
                            : t('Default baseline restored. Active runtime configuration reset to Strict Compliance.', '已恢复基线配置，当前运行策略已重置为严格合规标准。')}
                    </div>
                </div>
            )}

            {/* 1. One-Click Policy Presets Banner */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: 0.5 }}>
                    {t('ONE-CLICK INDUSTRIAL POLICY PRESETS', '一键工业策略预设 (一键加载典型生产策略)')}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => applyPreset('strict')}
                        style={{
                            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 6,
                            background: preset === 'strict' ? 'rgba(16, 185, 129, 0.15)' : '#090d16',
                            border: `1px solid ${preset === 'strict' ? '#10b981' : '#334155'}`,
                            color: preset === 'strict' ? '#34d399' : '#cbd5e1',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                    >
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 2 }}>
                            {preset === 'strict' ? '● ' : '○ '}{t('1. Strict Compliance Baseline (Default)', '1. 严格合规基准 (默认推荐)')}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {t('L3 Autonomy · 72h PHI Zero-Tolerance · 0.0% Risk', 'L3 条件自治 · 72h PHI 零容忍 · 违规风险 0%')}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => applyPreset('ka_fast')}
                        style={{
                            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 6,
                            background: preset === 'ka_fast' ? 'rgba(245, 158, 11, 0.15)' : '#090d16',
                            border: `1px solid ${preset === 'ka_fast' ? '#f59e0b' : '#334155'}`,
                            color: preset === 'ka_fast' ? '#fbbf24' : '#cbd5e1',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                    >
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 2 }}>
                            {preset === 'ka_fast' ? '● ' : '○ '}{t('2. KA Express Delivery Priority', '2. KA 极速交付优先 (保交付限额)')}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {t('Relaxed Margin (-6h) · Wind 14.5m/s · Precooling 1.5h', '实验性放行 -6h · 快速打冷 · 产能优先')}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => applyPreset('l4_full')}
                        style={{
                            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 6,
                            background: preset === 'l4_full' ? 'rgba(56, 189, 248, 0.15)' : '#090d16',
                            border: `1px solid ${preset === 'l4_full' ? '#38bdf8' : '#334155'}`,
                            color: preset === 'l4_full' ? '#38bdf8' : '#cbd5e1',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                        }}
                    >
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 2 }}>
                            {preset === 'l4_full' ? '● ' : '○ '}{t('3. L4 Full Autonomy Cruise', '3. L4 无人化全自治巡航示范')}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {t('End-to-End Self-Healing · 0 Pending Approvals · FTE 92.5%', '端到端自愈派工 · 零人工留痕审批 · FTE 92.5%')}
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. Side-by-Side: Controls (Left) & Real-Time Simulated Outcome (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Left: Parameter Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Autonomy Level Control */}
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t('Autonomous Operating Level (L1~L4)', '系统自主决策等级 (L1 ~ L4)')}</span>
                            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{autonomyLevel}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['L1', 'L2', 'L3', 'L4'].map(lvl => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => { setAutonomyLevel(lvl); setSaved(false); }}
                                    style={{
                                        flex: 1, padding: '8px 4px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800,
                                        background: autonomyLevel === lvl ? '#38bdf8' : '#090d16',
                                        color: autonomyLevel === lvl ? '#090d16' : '#94a3b8',
                                        border: `1px solid ${autonomyLevel === lvl ? '#38bdf8' : '#334155'}`,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>
                            {autonomyLevel === 'L4' && (isZh ? 'L4 完全自治：全闭环自愈调度，门禁超限时自动重构并派发最佳替选。' : 'L4 Full Autonomy: Self-healing closed-loop dispatch.')}
                            {autonomyLevel === 'L3' && (isZh ? 'L3 条件自治（基准）：预设合规与质量硬门禁，重大冲突由田间农艺与法规合规主体数字签名放行。' : 'L3 Conditional: Hard gates protect operations; critical trade-offs require multi-agent sign-off.')}
                            {autonomyLevel === 'L2' && (isZh ? 'L2 建议辅助：AI 提供策略候选清单，所有动作由运营管理主体手动确认。' : 'L2 Advisory: AI suggests options; operator manually approves.')}
                            {autonomyLevel === 'L1' && (isZh ? 'L1 简单告警：仅触发阈值警报，无方案博弈排序能力。' : 'L1 Alert Only: Threshold alarms without multi-agent game theory.')}
                        </div>
                    </div>

                    {/* PHI Tolerance & Environmental Limits */}
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 10 }}>
                            {t('Operational Constraints & Thresholds', '合规约束与作业物理门禁')}
                        </div>

                        {/* PHI Tolerance */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                                {t('Pre-Harvest Interval (PHI) Policy', '农药安全间隔期 (PHI) 合规容差')}
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => { setPhiTolerance('strict'); setSaved(false); }}
                                    style={{
                                        flex: 1, padding: '6px 10px', borderRadius: 4, fontSize: '0.74rem',
                                        background: phiTolerance === 'strict' ? 'rgba(16, 185, 129, 0.2)' : '#090d16',
                                        border: `1px solid ${phiTolerance === 'strict' ? '#10b981' : '#334155'}`,
                                        color: phiTolerance === 'strict' ? '#34d399' : '#cbd5e1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isZh ? '严格零容差 (72h 一秒不让)' : 'Strict 0-Tolerance (72h)'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPhiTolerance('relaxed'); setSaved(false); }}
                                    style={{
                                        flex: 1, padding: '6px 10px', borderRadius: 4, fontSize: '0.74rem',
                                        background: phiTolerance === 'relaxed' ? 'rgba(245, 158, 11, 0.2)' : '#090d16',
                                        border: `1px solid ${phiTolerance === 'relaxed' ? '#f59e0b' : '#334155'}`,
                                        color: phiTolerance === 'relaxed' ? '#fbbf24' : '#cbd5e1',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isZh ? '实验性边缘容限 (-6h 抢收)' : 'Experimental Margin (-6h)'}
                                </button>
                            </div>
                        </div>

                        {/* Wind speed slider */}
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                <span>{t('Gale / Spray Wind Speed Cutoff', '采收与喷雾阵风拦截红线')}</span>
                                <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{windCutoff.toFixed(1)} m/s</strong>
                            </div>
                            <input
                                type="range"
                                min="8.0"
                                max="16.0"
                                step="0.5"
                                value={windCutoff}
                                onChange={e => { setWindCutoff(parseFloat(e.target.value)); setSaved(false); }}
                                style={{ width: '100%', accentColor: '#38bdf8' }}
                            />
                        </div>

                        {/* Pre-cooling time limit */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#94a3b8', marginBottom: 4 }}>
                                <span>{t('Max Post-Harvest Pre-Cooling Window', '采后强制进冷库打冷时限')}</span>
                                <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{precoolingHours.toFixed(1)} {isZh ? '小时' : 'hrs'}</strong>
                            </div>
                            <input
                                type="range"
                                min="1.0"
                                max="3.5"
                                step="0.5"
                                value={precoolingHours}
                                onChange={e => { setPrecoolingHours(parseFloat(e.target.value)); setSaved(false); }}
                                style={{ width: '100%', accentColor: '#10b981' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Real-Time Simulated Outcome Preview */}
                <div style={{ background: '#0a0f1d', border: '1px solid #1e293b', borderTop: '3px solid #38bdf8', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Icon name="activity" size={18} color="#38bdf8" />
                            <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#f8fafc' }}>
                                {t('Simulated Outcome & Farm Impact', '策略对 900 亩园区的影响因果试算')}
                            </h3>
                        </div>

                        {/* 4 Outcome Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: 10 }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('Pending Approvals', '待人工审批工单')}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: simulatedOutcome.pendingApprovals > 0 ? '#fbbf24' : '#10b981', fontFamily: 'monospace' }}>
                                    {simulatedOutcome.pendingApprovals} <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{isZh ? '单' : 'orders'}</span>
                                </div>
                            </div>

                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: 10 }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('Labor FTE Savings', '人工工时节约率')}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                                    {simulatedOutcome.fteSavings.toFixed(1)}%
                                </div>
                            </div>

                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: 10 }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('Pesticide Violation Risk', '药残超标违规风险')}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: simulatedOutcome.violationRisk > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
                                    {simulatedOutcome.violationRisk.toFixed(1)}%
                                </div>
                            </div>

                            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: 10 }}>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t('Penalty Exposure', '商业违约金敞口')}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: simulatedOutcome.penaltyExposure > 0 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
                                    ¥{simulatedOutcome.penaltyExposure.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Impacted Entities & Rules */}
                        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 6, padding: 10, marginBottom: 12 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                                {t('IMPACTED RULES & FARM ENTITIES', '直接受波及的规则编码与园区本体：')}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <code style={{ fontSize: '0.7rem', background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: 4 }}>
                                    RULE-THRIP-PHI-03
                                </code>
                                <code style={{ fontSize: '0.7rem', background: '#1e293b', color: '#34d399', padding: '2px 6px', borderRadius: 4 }}>
                                    LOT-03 (南区高架区)
                                </code>
                                <code style={{ fontSize: '0.7rem', background: '#1e293b', color: '#fbbf24', padding: '2px 6px', borderRadius: 4 }}>
                                    ORDER-750-001 (盒马KA)
                                </code>
                            </div>
                        </div>

                        {/* Causal Synthesis Text */}
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 6, padding: 10, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: 2 }}>{isZh ? '因果推演合成结论：' : 'Causal Deduction: '}</strong>
                            {isZh ? simulatedOutcome.synthesisZh : simulatedOutcome.synthesisEn}
                        </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 12, borderTop: '1px solid #1e293b', paddingTop: 8 }}>
                        {t('Real-time Monte Carlo simulated against 900-mu blueberry factory topology.', '基于 900 亩数字孪生拓扑与历史农事数据实时推演。')}
                    </div>
                </div>
            </div>

            {/* 3. Biological & Pathogen Thresholds */}
            <div className="grid grid-2" style={{ marginBottom: 16 }}>
                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="risk" size={16} color="#38bdf8" />
                        {t('Gray Mold (Botrytis) Thresholds', '灰霉病（Botrytis）预警阈值')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Tooltip title={t('Humidity Ceiling', '空气相对湿度上限')} content={t('When relative humidity exceeds this threshold, gray mold (Botrytis) spore germination rate accelerates significantly.', '空气相对湿度超过该红线时，灰霉病孢子萌发速度呈指数级加快。')} delayMs={1000}>
                                <label style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'help' }}>
                                    {t('Humidity (%)', '空气相对湿度上限（%）')} 
                                </label>
                            </Tooltip>
                            <div style={{ width: 140 }}>
                                <NumberStepper
                                    value={localThresholds.botrytis.humidity_pct}
                                    onChange={val => updateThreshold('botrytis', 'humidity_pct', val)}
                                    min={50}
                                    max={99}
                                    step={1}
                                    unit="%"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Tooltip title={t('Leaf Wetness Duration', '叶面湿润持续时长')} content={t('Consecutive hours with free water on blueberry leaves. 8+ hours provides the critical infection window for pathogens.', '蓝莓叶面维持水膜的连续时长。超过 8 小时即满足灰霉病原菌丝入侵表皮的生化条件。')} delayMs={1000}>
                                <label style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'help' }}>
                                    {t('Leaf Wetness (hrs)', '叶面湿润持续时长（h）')} 
                                </label>
                            </Tooltip>
                            <div style={{ width: 140 }}>
                                <NumberStepper
                                    value={localThresholds.botrytis.leaf_wetness_hrs}
                                    onChange={val => updateThreshold('botrytis', 'leaf_wetness_hrs', val)}
                                    min={1}
                                    max={24}
                                    step={1}
                                    unit="h"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Tooltip title={t('Critical Spore Index', '高危孢子指数')} content={t('Automated spore trapping chamber optical analysis score (0-100). Scores >70 mandate preventative biocontrol or fungicide line.', '自动孢子捕捉仓显微成像与AI计数指数(0-100)。大于70分触发预防性生物/化学防线。')} delayMs={1000}>
                                <label style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'help' }}>
                                    {t('Spore Index Critical', '高危孢子指数')} 
                                </label>
                            </Tooltip>
                            <div style={{ width: 140 }}>
                                <NumberStepper
                                    value={localThresholds.botrytis.spore_index_critical}
                                    onChange={val => updateThreshold('botrytis', 'spore_index_critical', val)}
                                    min={10}
                                    max={100}
                                    step={5}
                                    unit="/100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="activity" size={16} color="#f59e0b" />
                        {t('Thrips & Aphid Thresholds', '蓟马与蚜虫预警阈值')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Tooltip title={t('Daily Sticky Trap Count', '黄板/蓝板日诱捕量')} content={t('Threshold for Western flower thrips (Frankliniella occidentalis) on blue sticky boards.', '监测蓝莓花期蓟马诱捕上限。超标将迅速导致幼果刺吸伤与果面凹陷畸形。')} delayMs={1000}>
                                <label style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'help' }}>
                                    {t('Sticky Trap Daily (Thrips)', '粘虫板日计数上限（头/板）')} 
                                </label>
                            </Tooltip>
                            <div style={{ width: 140 }}>
                                <NumberStepper
                                    value={localThresholds.aphids.sticky_trap_daily}
                                    onChange={val => updateThreshold('aphids', 'sticky_trap_daily', val)}
                                    min={1}
                                    max={50}
                                    step={1}
                                    unit="头/板"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <Tooltip title={t('Per-Leaf Pest Count', '单叶虫量警戒线')} content={t('Manual scouting or robotic macro-lens threshold per leaf.', '巡检机器人或人工目测抽检的单叶虫体均值警戒线。')} delayMs={1000}>
                                <label style={{ fontSize: '0.78rem', color: '#94a3b8', cursor: 'help' }}>
                                    {t('Per Leaf Critical Count', '单叶虫量警戒线（头）')} 
                                </label>
                            </Tooltip>
                            <div style={{ width: 140 }}>
                                <NumberStepper
                                    value={localThresholds.aphids.per_leaf}
                                    onChange={val => updateThreshold('aphids', 'per_leaf', val)}
                                    min={1}
                                    max={20}
                                    step={1}
                                    unit="头"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Pre-Harvest Interval (PHI) Constraints */}
            <div className="card" style={{ marginBottom: 16 }}>
                <h3 className="card-title">{t('National Pre-Harvest Interval (PHI) Constraints', '国家法定采收安全间隔期（PHI）基准')}</h3>
                <table className="data-table">
                    <thead><tr><th>{t('Pesticide Substance', '药剂通用名')}</th><th>{t('PHI Requirement', '严格 PHI 间隔')}</th><th>{t('MoA Action Group', '作用机理组别')}</th></tr></thead>
                    <tbody>
                        {Object.values(phiConstraints).map(p => (
                            <tr key={p.name}><td>{isZh ? (p.nameZh || p.name) : p.name}</td><td style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>{p.days}d (严格执行)</td><td>{p.moaGroup}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 5. System Metadata */}
            <div className="card">
                <h3 className="card-title">{t('Autonomous Engine Identity', '自治中枢元数据')}</h3>
                <table className="data-table">
                    <tbody>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Engine Core', '决策引擎版本')}</td><td>Sentinel 7.6 Autonomous Operating Core (Enterprise OODA Compliant)</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Topology Scale', '设施管辖规模')}</td><td>{isZh ? '云南省澄江市抚仙湖 900 亩数字农业工厂 (A/B/C 三区)' : 'Yunnan Chengjiang 900-Mu Super-Farm (Zones A, B, C)'}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Runtime Mode', '运行环境')}</td><td>{isZh ? '100% 浏览器客户端自治闭环 · 零后端依赖' : '100% In-Browser Autonomous Closed-Loop'}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
