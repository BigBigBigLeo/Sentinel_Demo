import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
} from 'recharts';
import useStore from '../engine/store';
import MetricCard from '../components/MetricCard';
import IntelligenceDossierModal from '../components/IntelligenceDossierModal';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { previousActions, sensorThresholds } from '../data/mockData';
import { pick } from '../i18n/locale.js';
import { FOCAL_ORDER, PORTFOLIO_SUMMARY } from '../data/ordersData';

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export default function RiskAssessment() {
    const navigate = useNavigate();
    const {
        riskResults,
        revenueAtRisk,
        currentSnapshot,
        fields,
        activeFieldId,
        activeScenario,
        simulationData,
        currentDay,
        locale,
        policyConfig,
    } = useStore();

    const t = useCallback((en, zh) => pick(locale, en, zh), [locale]);
    const isZh = locale === 'zh';

    const [selectedConflictStep, setSelectedConflictStep] = useState(null);
    const [selectedGateDetail, setSelectedGateDetail] = useState(null);
    const [selectedSensorDetail, setSelectedSensorDetail] = useState(null);
    const field = fields[activeFieldId];
    const sensors = currentSnapshot?.sensors || {};
    const pests = currentSnapshot?.pests || {};
    const actions = previousActions[activeFieldId] || {};

    const safeRiskResults = Array.isArray(riskResults)
        ? riskResults.filter(item => item && typeof item === 'object')
        : [];

    const topRisk = safeRiskResults[0];

    // Multimodal Sensor Evidence
    const evidence = useMemo(() => {
        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        return [
            {
                title: t('Humidity Pressure', '相对湿度气压'),
                value: `${Number(sensors.humidity_pct || 68.2).toFixed(1)}%`,
                detail: t(`Threshold ${sensorThresholds.humidity?.max || 85}%`, `告警阈值 ${sensorThresholds.humidity?.max || 85}%`),
                impact: Number(sensors.humidity_pct || 68.2) > (sensorThresholds.humidity?.max || 85) ? 'high' : 'medium',
            },
            {
                title: t('Leaf Wetness', '叶面凝露时长'),
                value: `${num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs, 1.8).toFixed(1)}h`,
                detail: t(`Threshold ${sensorThresholds.leafWetness?.max || 3}h`, `萌发阈值 ${sensorThresholds.leafWetness?.max || 3}h`),
                impact: num(sensors.leaf_wetness_h ?? sensors.leaf_wetness_hrs, 1.8) > (sensorThresholds.leafWetness?.max || 3) ? 'high' : 'medium',
            },
            {
                title: t('Pest Trap Counts', '蓟马诱捕数量'),
                value: '14.0 只/板',
                detail: t('Daily trap inspection threshold: 12', '日诱捕警戒红线: 12只/板 (已越界)'),
                impact: 'high',
            },
            {
                title: t('Growth Stage', '蓝莓物候进程'),
                value: isZh ? '膨果期至成熟期 (VPD 1.15 kPa)' : 'Fruit Sizing & Ripening',
                detail: t('Stage-sensitive epicuticular wax protection', '高敏感果粉纳米针晶防护期'),
                impact: 'medium',
            },
            {
                title: t('Days To Harvest', '采收交付倒计时'),
                value: '14 小时 (今日16:00)',
                detail: t('Strict 72h PHI gate enforced (-58h conflict)', '触碰 72h PHI 刚性安全期 (缺口 -58h)'),
                impact: 'high',
            },
            {
                title: t('Recent Spray Record', '最近药剂喷施记录'),
                value: 'LOT-03 拟喷施乙基多杀菌素',
                detail: '因距离采收仅 14h，触发 A08 一票否决',
                impact: 'high',
            },
        ];
    }, [activeScenario?.daysToHarvest, isZh, sensors.humidity_pct, sensors.leaf_wetness_h, sensors.leaf_wetness_hrs, t]);

    // 7-Day Risk Trend Curve
    const riskTrend = useMemo(() => {
        const fieldData = simulationData[activeFieldId] || [];
        const slice = fieldData.slice(Math.max(0, currentDay - 7), currentDay);
        if (slice.length === 0) {
            return [
                { day: 'D-6', botrytis: 15, anthracnose: 12, thrips: 8, wind: 18 },
                { day: 'D-5', botrytis: 18, anthracnose: 14, thrips: 12, wind: 22 },
                { day: 'D-4', botrytis: 22, anthracnose: 15, thrips: 18, wind: 20 },
                { day: 'D-3', botrytis: 35, anthracnose: 20, thrips: 42, wind: 28 },
                { day: 'D-2', botrytis: 48, anthracnose: 25, thrips: 65, wind: 45 },
                { day: 'D-1', botrytis: 62, anthracnose: 30, thrips: 78, wind: 55 },
                { day: 'D0', botrytis: 78, anthracnose: 34, thrips: 88, wind: 65 },
            ];
        }
        return slice.map((d, i) => {
            const daySeed = Number(d?.day ?? i + 1);
            const jitter = (((daySeed * 13) % 7) - 3) / 3;
            return {
                day: `D${d?.day || i + 1}`,
                botrytis: clamp((d?.threats?.grayMold?.score ?? 10) + jitter),
                anthracnose: clamp((d?.threats?.anthracnose?.score ?? 8) + jitter),
                thrips: clamp((d?.threats?.aphids?.score ?? 6) * 1.5 + jitter + 12),
                wind: clamp(35 + jitter * 5),
            };
        });
    }, [simulationData, activeFieldId, currentDay]);

    const chartData = [
        { name: isZh ? '蓟马虫害侵染' : 'Frankliniella Thrips', score: 88, color: '#ef4444' },
        { name: isZh ? '灰霉病孢子萌发' : 'Botrytis (Gray Mold)', score: 76, color: '#f59e0b' },
        { name: isZh ? '午后强对流湖风' : 'Fuxian Lake Gale', score: 65, color: '#38bdf8' },
        { name: isZh ? '果面蜡质高温融化' : 'Wax Melt (>25°C)', score: 58, color: '#a855f7' },
        { name: isZh ? '炭疽病菌背景值' : 'Anthracnose', score: 34, color: '#10b981' },
    ];

    return (
        <div className="page risk-page" style={{ maxWidth: 1480, margin: '0 auto' }}>
            <PipelineBreadcrumb />

            {/* ══ Header ══ */}
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="risk" size={22} color="#f59e0b" />
                        {t('Multi-Dimensional Enterprise Risk Assessment & Conflict Center', '全域多维物理-生物-商业风险研判总控台')}
                    </h1>
                    <p className="page-subtitle">
                        {isZh ? '阶段 3：多源风险研判与冲突透视 · 云南澄江 900 亩园区 · 12 大重点订单 SLA 履约与法定门禁交叉核验' : 'Stage 3: Multi-Factor Risk Assessment · 900-Mu Facility · 12 Enterprise Orders SLA & Regulatory Gate Cross-Verification'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/sensors')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Icon name="sensor" size={14} />
                        {t('View Telemetry Bus', '查看环境遥测总线')}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/prescription')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #00e5a3 0%, #059669 100%)', color: '#090d16', fontWeight: 800 }}
                    >
                        <Icon name="prescription" size={15} color="#090d16" />
                        {t('Enter Decision Matrix Room (Plan B Lead) →', '前往方案决策室查看 14 智能体博弈 (Plan B 领跑) →')}
                    </button>
                </div>
            </div>

            {/* ══ Top 4 Hero Risk Telemetry KPIs ══ */}
            <div className="grid grid-4" style={{ gap: 12, marginBottom: 16 }}>
                <MetricCard
                    label={t('Highest Threat Level', '最高威胁研判级别')}
                    value="CRITICAL"
                    subtitle={t('Score: 88/100 · Frankliniella Alert', '综合评分 88/100 · 蓟马诱捕突增越界')}
                    status="critical"
                    icon="alert-triangle"
                >
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', color: '#f87171' }}>
                        LOT-03 诱捕器突破 14只/板警戒线 · 需紧急隔离
                    </div>
                </MetricCard>

                <MetricCard
                    label={t('Order SLA Revenue at Risk', '在手订单违约风险敞口')}
                    value="¥48,750"
                    subtitle={t('Hema Fresh KA · 750kg Grade A', '涉及盒马鲜生 750kg 订单 · 方案A违约')}
                    status="critical"
                    icon="dollar"
                >
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', color: '#fca5a5' }}>
                        若按常规喷药采收 面临 100% 农残退货与违约金
                    </div>
                </MetricCard>

                <MetricCard
                    label={t('Regulatory PHI Time Gap', '法定农药安全间隔期 (PHI) 缺口')}
                    value={policyConfig?.phiTolerance === 'relaxed' ? "-52 小时 (放行)" : "-58 小时 (闭锁)"}
                    subtitle={policyConfig?.phiTolerance === 'relaxed' ? "实验性 -6h 容忍已开启 · 34.2% 抽检风险" : t('Window 14h vs GB 2763 72h PHI', '离采收仅 14h vs 法定 72h · 严重倒挂')}
                    status={policyConfig?.phiTolerance === 'relaxed' ? "elevated" : "critical"}
                    icon="clock"
                >
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', color: policyConfig?.phiTolerance === 'relaxed' ? '#f59e0b' : '#34d399' }}>
                        {policyConfig?.phiTolerance === 'relaxed' ? '沙盘策略已启用实验性容忍放行方案 A' : 'A08 法规合规刚性一票否决方案 A (VETO)'}
                    </div>
                </MetricCard>

                <MetricCard
                    label={t('Microclimate Safe Window', '微气象安全采收时序窗口')}
                    value="仅剩 03h 15m"
                    subtitle={t('Dawn 05:00-08:30 · 14:00 Gale Interlock', '05:00-08:30 拂晓最佳 · 午后大风自锁')}
                    status="low"
                    icon="shield"
                >
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem', color: '#38bdf8' }}>
                        14:00 滇中抚仙湖 7 级阵风闭锁 · 必须上午入库
                    </div>
                </MetricCard>
            </div>

            {/* ══ MODULE 1: 焦点业务冲突深度透视 ══ */}
            <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)', border: '1px solid rgba(239, 68, 68, 0.35)', borderLeft: '4px solid #ef4444', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="alert-triangle" size={20} color="#ef4444" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                                    {t('Focal Conflict: LOT-03 Thrips Spike vs Hema Fresh 750kg Order PHI Harvest Gate', '焦点冲突透视：LOT-03 诱捕器蓟马告警与盒马 750kg 订单采收安全期间隔 (PHI) 刚性碰撞')}
                                </span>
                                <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.68rem', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                                    重大法定决策冲突
                                </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                                关联合同：{FOCAL_ORDER.id} · {isZh ? FOCAL_ORDER.customerZh : FOCAL_ORDER.customer} · {isZh ? FOCAL_ORDER.gradeZh : FOCAL_ORDER.grade} · 合同金额 ¥{FOCAL_ORDER.totalValue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/prescription')}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 6,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#f87171',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        查看冲突仲裁过程 →
                    </button>
                </div>

                {/* 5-Stage Conflict Propagation Chain */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 12 }}>
                    {[
                        {
                            step: '1. 传感器物理越界',
                            title: 'LOT-03 蓟马突破红线',
                            detail: 'TRAP-S02 光学诱捕器检测到蓟马 14 只/板，相对湿度连续 3.8h > 82.5%，灰霉病萌发风险上升。',
                            badge: '物理传感输入',
                            color: '#f59e0b',
                            deepDetailZh: '【机理深析】TRAP-S02 智能黄板光谱微距镜头在 LOT-03 蓝莓冠层边缘识别到西花蓟马 (Frankliniella occidentalis) 成虫密度陡增至 14 头/板（警戒阈值 8 头/板）。微距热成像显示幼嫩心叶与花萼处已发生微刺吸伤口，伤口分泌汁液在 82.5% 高湿环境下为灰霉病 (Botrytis cinerea) 孢子提供了绝佳侵染点。',
                            formulaZh: '种群增长模型: dN/dt = r*N*(1 - N/K), 当前繁殖率 r=0.28/day, 幼虫孵化加剧风险'
                        },
                        {
                            step: '2. 传统化防方案',
                            title: '农艺拟施乙基多杀菌素',
                            detail: '常规植保方案主张化学喷药保树，但该药剂针对蓝莓法定安全间隔期 (PHI) 严格标定为 72 小时。',
                            badge: '传统农艺拟案',
                            color: '#38bdf8',
                            deepDetailZh: '【药理与动力学】常规农艺初选 60g/L 乙基多杀菌素悬浮剂 (Spinetoram) 1500 倍液对靶喷雾。虽然对蓟马杀灭率达 94.5%，但该药剂在蓝莓表皮蜡质层具有较强吸附性。降解动力学模型表明：半衰期在冠层遮阴处长达 34.6 小时，施药后 14 小时表皮残留量为 0.082 mg/kg。',
                            formulaZh: '降解动力学方程: C(t) = C0 * exp(-0.028*t), 第14小时实测浓度仍高达 0.082 mg/kg'
                        },
                        {
                            step: '3. 关键时序冲突',
                            title: '离采收仅剩 14 小时',
                            detail: '盒马 750kg 特级果锁定今日 16:00 交付。72h PHI 与 14h 采收窗口产生 -58h 致命冲突倒挂。',
                            badge: '时序硬碰撞',
                            color: '#ef4444',
                            deepDetailZh: '【时序碰撞测算】盒马鲜生华东大仓合同 (BB-2026-HM01) 锁定交付时间为今日 16:00，采收倒计时仅剩 03:15:20。若在 LOT-03 实施化防，必须等待 72 小时法定降解期满（即后天上午 11:30）方可采摘，产生 -58 小时绝对不可调和的时间倒挂赤字。',
                            formulaZh: '安全时序赤字: ΔT = T_Harvest - (T_Chemical + 72h) = 14h - 72h = -58h (致命违约)'
                        },
                        {
                            step: '4. 法定门禁否决',
                            title: 'A08 合规一票否决',
                            detail: 'A08 法规合规依据 GB 2763 行使一票否决权，刚性阻断方案 A，杜绝一切化学农残检出与下架索赔。',
                            badge: '一票否决 VETO',
                            color: '#ef4444',
                            deepDetailZh: '【法律合规依据】依据《食品安全法》第148条及强制性国家标准 GB 2763-2021，供港及商超特级蓝莓乙基多杀菌素最大残留限量 (MRL) 严苛标定为 ≤ 0.01 mg/kg。0.082 mg/kg 浓度超出法定限量 820%！一旦被盒马入库农残快检筛查，将面临：全批拒收销毁 + 违约金扣罚 20% (¥48,750) + 商业信誉降级。',
                            formulaZh: '超标倍数: (0.082 - 0.01) / 0.01 = 720% 严重超标红线, A08 触发系统级物理锁死'
                        },
                        {
                            step: '5. 跨域协同收敛',
                            title: '方案 B 胜出保供',
                            detail: '指令北区无药残温室 LOT-01/02 拂晓轻柔采收，气调库现货（方案 C）应急备选，锁定 +¥45,800 边际贡献。',
                            badge: '全闭环解耦',
                            color: '#00e5a3',
                            deepDetailZh: '【解耦协同决策】Sentinel 14 智能体协同仲裁：将 750kg 盒马大单采摘地块自动解耦切换至北区无药残连栋智能温室 LOT-01 / LOT-02（早熟华香特级果）。锁定清晨 05:00~08:30 弱光低温期拂晓采摘，果粉完整度保持 96.8%，糖度 13.8°Bx。同时启用 300 吨气调库 D-1 预冷备货作为应急双保险，实现 0 违规、0 退款、+¥48,750 净边际收益！',
                            formulaZh: '边际净贡献: Gross ¥48,750 - Direct Cost ¥14,200 = Net ¥34,550 + 规避违约金 ¥48,750'
                        },
                    ].map((c, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedConflictStep(selectedConflictStep?.title === c.title ? null : c)}
                            style={{
                                background: selectedConflictStep?.title === c.title ? `${c.color}18` : 'rgba(15, 23, 42, 0.65)',
                                border: `1px solid ${selectedConflictStep?.title === c.title ? c.color : `${c.color}35`}`,
                                borderTop: `3px solid ${c.color}`,
                                borderRadius: 6,
                                padding: '10px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedConflictStep?.title === c.title ? `0 0 14px ${c.color}30` : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>{c.step}</span>
                                <span style={{ fontSize: '0.58rem', color: c.color, background: `${c.color}15`, padding: '1px 4px', borderRadius: 2, fontWeight: 700 }}>{c.badge}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>{c.title}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.35 }}>{c.detail}</div>
                        </div>
                    ))}
                </div>

                {/* Selected Stage Deep Inspector Drawer */}
                {selectedConflictStep && (
                    <div style={{
                        marginTop: 14,
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: `1px solid ${selectedConflictStep.color}`,
                        borderRadius: 8,
                        padding: 16,
                        boxShadow: `0 8px 30px ${selectedConflictStep.color}25`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.72rem', background: selectedConflictStep.color, color: '#090d16', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                                    {selectedConflictStep.step}
                                </span>
                                <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                                    {selectedConflictStep.title} · 科学机理与数学模型深度展开
                                </strong>
                            </div>
                            <button
                                onClick={() => setSelectedConflictStep(null)}
                                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                                <Icon name="x" size={12} color="#94a3b8" />
                                {t('Collapse', '收起详情')}
                            </button>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 8 }}>
                            {selectedConflictStep.deepDetailZh}
                        </div>
                        <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '8px 12px', borderRadius: 6, fontSize: '0.74rem', color: selectedConflictStep.color, fontFamily: 'monospace' }}>
                            {selectedConflictStep.formulaZh}
                        </div>
                    </div>
                )}
            </div>

            {/* ══ MODULE 2: 三方案多维风险权衡矩阵 ══ */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                        <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="layers" size={17} color="#38bdf8" />
                            {t('Tri-Plan Multi-Dimensional Risk Tradeoff Matrix', '候选处置方案多维风险权衡矩阵')}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#94a3b8' }}>
                            {t('Comprehensive evaluation across regulatory compliance, fruit bloom retention, weather safety, and net margin.', '贯穿法定农残合规、果粉蜡晶保留、澄江湖风安全、采收人工与全链路边际净贡献精算。')}
                        </p>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                        14 智能体博弈收敛结论：方案 B 胜出
                    </span>
                </div>

                <div className="grid grid-3" style={{ gap: 14 }}>
                    {/* Plan A */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(239, 68, 68, 0.35)', borderTop: '4px solid #ef4444', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800 }}>方案 A · 全量化防</span>
                                <h4 style={{ margin: '2px 0 0', fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>常规露天采收与化学防治</h4>
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                                强制否决 (VETO)
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>法定 PHI 合规风险：</span>
                                <strong style={{ color: '#ef4444' }}>100% 极危 (一票否决)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>果粉完整度预估：</span>
                                <strong style={{ color: '#f59e0b' }}>82.0% (午后高温融化)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>午后 7 级风阻规避：</span>
                                <strong style={{ color: '#ef4444' }}>未规避 (午后作业落果)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>锁定净边际贡献：</span>
                                <strong style={{ color: '#ef4444' }}>¥0 (退货并罚款 ¥9,750)</strong>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                            <strong>仲裁裁决：</strong>化学农残 100% 违背盒马直供协议及国家 GB 2763 规定，违规成本极高，已被 A08 法规合规刚性阻断。
                        </div>
                    </div>

                    {/* Plan B */}
                    <div style={{ background: 'rgba(0, 229, 163, 0.04)', border: '1px solid rgba(0, 229, 163, 0.45)', borderTop: '4px solid #00e5a3', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', color: '#00e5a3', fontWeight: 800 }}>方案 B · 推荐主案</span>
                                <h4 style={{ margin: '2px 0 0', fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>北区温室拂晓抢收 + 气调缓冲</h4>
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(0, 229, 163, 0.2)', color: '#00e5a3', border: '1px solid rgba(0, 229, 163, 0.4)' }}>
                                首选推荐 (LEAD)
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(0, 229, 163, 0.08)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>法定 PHI 合规风险：</span>
                                <strong style={{ color: '#00e5a3' }}>0% 零风险 (温室无药残)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>果粉完整度预估：</span>
                                <strong style={{ color: '#00e5a3' }}>96.8% (CREW-25轻柔手采)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>午后 7 级风阻规避：</span>
                                <strong style={{ color: '#00e5a3' }}>100% (08:30前入库打冷)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(0, 229, 163, 0.08)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>锁定净边际贡献：</span>
                                <strong style={{ color: '#00e5a3' }}>+¥45,800 (毛利率 93.9%)</strong>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                            <strong>仲裁裁决：</strong>指定北区无药残批次 LOT-01/02 承接 750kg 任务，彻底规避违约扣款 ¥9,750，为综合收益最高且全维合规的最优解。
                        </div>
                    </div>

                    {/* Plan C */}
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.35)', borderTop: '4px solid #f59e0b', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 800 }}>方案 C · 应急备用</span>
                                <h4 style={{ margin: '2px 0 0', fontSize: '0.9rem', color: '#f8fafc', fontWeight: 700 }}>D-1 保税气调库现货直接释放</h4>
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                应急缓冲 (BACKUP)
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>法定 PHI 合规风险：</span>
                                <strong style={{ color: '#34d399' }}>0% 零风险 (现货已过安全期)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>果粉完整度预估：</span>
                                <strong style={{ color: '#f59e0b' }}>95.0% (气调保鲜微损)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>午后 7 级风阻规避：</span>
                                <strong style={{ color: '#34d399' }}>100% 免疫 (室内库直接装车)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: 4 }}>
                                <span style={{ color: '#94a3b8' }}>锁定净边际贡献：</span>
                                <strong style={{ color: '#f59e0b' }}>+¥45,000 (折旧 -¥3,750)</strong>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 6, lineHeight: 1.4 }}>
                            <strong>仲裁裁决：</strong>完全合规且不受任何田间天气威胁。作为安全保障底牌，若滇中出现不可预测的极端强风，系统将毫秒级自愈切换至方案 C。
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ MODULE 3: 7 项法定安全与监管门禁联锁审计表 ══ */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="check-circle" size={17} color="#34d399" />
                        {t('7 Rigid Regulatory & Safety Gating Audits', '全园 7 项法定安全与合规门禁联锁审计')}
                    </h3>
                    <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                        7/7 门禁全部联锁生效 (方案 B 全票通过)
                    </span>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', color: '#64748b', background: 'rgba(15,23,42,0.4)' }}>
                                <th style={{ padding: '8px 10px' }}>门禁代号</th>
                                <th style={{ padding: '8px 10px' }}>法定/工程门禁名称</th>
                                <th style={{ padding: '8px 10px' }}>执行审查主体</th>
                                <th style={{ padding: '8px 10px' }}>校验指标与阈值基准</th>
                                <th style={{ padding: '8px 10px' }}>方案 A 审查结果</th>
                                <th style={{ padding: '8px 10px' }}>方案 B 审查结果</th>
                                <th style={{ padding: '8px 10px' }}>系统处置动作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { id: 'GATE-01', name: 'GB 2763 安全间隔期 (PHI)', actor: 'A08 法规合规', spec: '采收前禁施任何药剂 (缺口 0h)', rA: 'VETO (-58h 缺口)', rB: 'PASS (未施药)', action: '刚性一票否决方案 A，放行方案 B', colorA: '#ef4444', colorB: '#34d399' },
                                { id: 'GATE-02', name: '滇中大风与空域安全门禁', actor: 'A09 安全防灾', spec: '阵风风速 < 8.0 m/s', rA: 'FAIL (午后 14.2m/s)', rB: 'PASS (08:30前完成)', action: '锁定上午拂晓作业，午后大棚天窗闭锁', colorA: '#ef4444', colorB: '#34d399' },
                                { id: 'GATE-03', name: '禁限用化学物质名录门禁', actor: 'A08 法规合规', spec: '绿色食品禁用清单 0 检出', rA: 'PASS (乙基多杀菌素未禁用)', rB: 'PASS (纯物理采收)', action: '核对国家农药名录与商超黑名单', colorA: '#34d399', colorB: '#34d399' },
                                { id: 'GATE-04', name: '标签推荐施用剂量门禁', actor: 'A04 植保病理', spec: '剂量严格遵守 0.7x 标定上限', rA: 'PASS (对靶减量30%)', rB: 'PASS (免施药)', action: '大疆 T40 RTK 超低量精准喷雾参数核定', colorA: '#34d399', colorB: '#34d399' },
                                { id: 'GATE-05', name: '衍生生态环境影响门禁', actor: 'A02 田间农艺', spec: '抚仙湖径流保护红线无漂移', rA: 'WARNING (露天漂移风险)', rB: 'PASS (温室受控)', action: '大棚密闭循环水肥与避雨防护', colorA: '#f59e0b', colorB: '#34d399' },
                                { id: 'GATE-06', name: '应急回退熔断保障门禁', actor: 'A01 运营管理', spec: '必须具备不低于100%的备份方案', rA: 'FAIL (无备份直接断供)', rB: 'PASS (方案C随时接管)', action: '锁定气调库 D-1 现货作为兜底保障', colorA: '#ef4444', colorB: '#34d399' },
                                { id: 'GATE-07', name: '博弈决策综合置信度门禁', actor: 'A14 算法模型', spec: '综合博弈置信度 >= 85.0%', rA: 'FAIL (置信度 42.1%)', rB: 'PASS (置信度 96.4%)', action: '非对称纳什均衡收敛，输出方案 B 处方', colorA: '#ef4444', colorB: '#34d399' },
                            ].map((g, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => setSelectedGateDetail({
                                        id: g.id,
                                        titleZh: g.name,
                                        categoryZh: 'GB 2763 国家法定安全门禁',
                                        tone: g.rB.includes('PASS') ? '#10b981' : '#ef4444',
                                        primaryValue: g.rB,
                                        primaryUnit: `准入标准: ${g.spec}`,
                                        detailZh: `${g.name} (责任主体: ${g.actor})。国家强标规范要求：【${g.spec}】。方案 A 评定结果：【${g.rA}】；方案 B 评定结果：【${g.rB}】。联动闭环动作：【${g.action}】。`,
                                        slaImpactZh: '若违反门禁将面临买方拒收、扣款 20% 及国家市监通报下架。',
                                        financeImpactZh: '方案 B 严格过闸锁定全部销售款，杜绝违约金敞口 ¥48,750。',
                                        a01AdviceZh: '统筹全园生产，对未达标地块执行物理隔离与电子封锁。',
                                        a06AdviceZh: '向大客户商超提交附带该门禁通过记录的批次电子质检合格单。',
                                        a08AdviceZh: '系统刚性锁定现场自动化机组与采摘队伍的作业许可。'
                                    })}
                                    style={{ borderBottom: '1px solid rgba(148,163,184,0.06)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{g.id}</td>
                                    <td style={{ padding: '8px 10px', fontWeight: 600, color: '#f8fafc' }}>{g.name}</td>
                                    <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{g.actor}</td>
                                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>{g.spec}</td>
                                    <td style={{ padding: '8px 10px', color: g.colorA, fontWeight: 700 }}>{g.rA}</td>
                                    <td style={{ padding: '8px 10px', color: g.colorB, fontWeight: 700 }}>{g.rB}</td>
                                    <td style={{ padding: '8px 10px', color: '#cbd5e1' }}>{g.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══ MODULE 4: 微气象与生物动力学多维风险雷达 + 证据看板 ══ */}
            <div className="grid grid-2" style={{ gap: 14 }}>
                {/* Multimodal Evidence Board */}
                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Icon name="sensor" size={16} color="#38bdf8" />
                        {t('Multimodal Telemetry Evidence Board', '多模态传感器遥测证据面板')}
                    </h3>
                    <div className="evidence-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {evidence.map((e, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedSensorDetail({
                                    id: `SENSOR-${i + 1}`,
                                    titleZh: e.title,
                                    categoryZh: '多模态传感器实测遥测',
                                    tone: e.impact === 'high' ? '#ef4444' : '#38bdf8',
                                    primaryValue: e.value,
                                    primaryUnit: e.detail,
                                    detailZh: `传感器观测指标：${e.title}。当前实时采样读数：${e.value}。物理含义与农艺背景：${e.detail}。当前读数已通过边缘端卡尔曼滤波与五级时序插值补全质检。`,
                                    slaImpactZh: e.impact === 'high' ? '触发方案 A 刚性阻断与方案 B 动态激活。' : '参数在正常生理包络线之内，平稳受控。',
                                    financeImpactZh: '为全园 12 批大单品质定级提供物理数据底座。',
                                    a01AdviceZh: '校准环境总线控制阈值，维持拂晓采收最优温湿度。',
                                    a06AdviceZh: '将该传感器读数纳入溯源码区块链防篡改指纹存证。',
                                    a08AdviceZh: '核定物理传感器校准周期，杜绝数据漂移导致的误判。'
                                })}
                                className={`evidence-card ${e.impact}`}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: 6,
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: `1px solid ${e.impact === 'high' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.2)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                            >
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>{e.title}</div>
                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: e.impact === 'high' ? '#f87171' : '#38bdf8', fontFamily: 'monospace', margin: '2px 0' }}>{e.value}</div>
                                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{e.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Threat Score Bar Chart */}
                <div className="card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icon name="bar-chart" size={16} color="#38bdf8" />
                        {t('Composite Threat Vector Scoring', '多维物理-生物威胁向量分值对比')}
                    </h3>
                    <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={chartData} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
                            <Tooltip contentStyle={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 6, color: '#e2e8f0', fontSize: '0.75rem' }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ══ MODULE 5: 7-Day Risk Trend Curve ══ */}
            <div className="card" style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="activity" size={16} color="#38bdf8" />
                        {t('7-Day Biological & Weather Threat Evolution Trend', '全域 7 天微气象与生物病理演化时序曲线')}
                    </h3>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.65rem' }}>
                        <span style={{ color: '#ef4444' }}>● 蓟马虫情指数</span>
                        <span style={{ color: '#f59e0b' }}>● 灰霉病孢子萌发</span>
                        <span style={{ color: '#38bdf8' }}>● 抚仙湖风阻强度</span>
                        <span style={{ color: '#34d399' }}>● 炭疽病背景值</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={riskTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: 6, fontSize: '0.72rem' }} />
                        <Line type="monotone" dataKey="thrips" stroke="#ef4444" strokeWidth={2} dot={false} name={t('Thrips', '蓟马虫害')} />
                        <Line type="monotone" dataKey="botrytis" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('Gray Mold', '灰霉病')} />
                        <Line type="monotone" dataKey="wind" stroke="#38bdf8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name={t('Lake Gale', '抚仙湖风阻')} />
                        <Line type="monotone" dataKey="anthracnose" stroke="#34d399" strokeWidth={1} dot={false} name={t('Anthracnose', '炭疽病')} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Gate Inspector Modal */}
            <IntelligenceDossierModal
                item={selectedGateDetail}
                onClose={() => setSelectedGateDetail(null)}
                locale={locale}
            />

            {/* Sensor Evidence Modal */}
            <IntelligenceDossierModal
                item={selectedSensorDetail}
                onClose={() => setSelectedSensorDetail(null)}
                locale={locale}
            />
        </div>
    );
}
