import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PrescriptionCard from '../components/PrescriptionCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import ApprovalModal from '../components/ApprovalModal';
import DecisionMatrix from '../components/DecisionMatrix';
import DelayedTooltip from '../components/Tooltip';
import { pick, localeTag } from '../i18n/locale.js';

export default function Prescription() {
    const navigate = useNavigate();
    const {
        prescriptions, activePrescription, generateRx, modifyRx, executeRx,
        riskResults, fields, activeFieldId, eventLog, activeScenario,
        thinkingChain, isThinking, thinkingContext,
        startPrescriptionThinking, stopThinking,
        approvalQueue, approveDecision, rejectDecision,
        currentSnapshot, executions, auditRecords,
        locale,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    // Active selected plan in decision matrix ('A' | 'B' | 'C')
    const [activePlanId, setActivePlanId] = useState('B');
    const [showJson, setShowJson] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [selectedPreviousRxId, setSelectedPreviousRxId] = useState(null);
    const [selectedDecisionLogId, setSelectedDecisionLogId] = useState(null);

    // Dynamic 3-Round Multi-Agent Deduction Chain with full perspective clash & convergence
    const MULTI_AGENT_ROUNDS = [
        {
            round: 1,
            titleZh: '第 1 轮：初始农艺研判与合规一票否决拦截 (方案 A 拟定 → 72h PHI 违约阻断)',
            titleEn: 'Round 1: Initial Agronomic Formulation & Compliance Interception (Plan A Vetoed)',
            steps: [
                {
                    id: 1,
                    time: '14:30:12',
                    phase: 'REASONING',
                    phaseColor: '#ec4899',
                    agentId: 'A04',
                    agentNameZh: '植保病理 (A04) · 田间农艺 (A02)',
                    agentNameEn: 'Crop Protection (A04) · Field Agronomy (A02)',
                    titleZh: '化学点喷方案 A 拟定：Spinetoram 0.7x 靶向施用测算',
                    titleEn: 'Cost-Benefit Calculation: Precision Spot Spray Plan A',
                    contentZh: '针对南区边缘 LOT-03 灰霉病孢子萌发与蓟马激增风险，A04 植保病理联合 A02 田间农艺测算常规化学防治成本，提出 Spinetoram 0.7x 方案 A：靶向施用第 4-7 行，测算作业直接成本 ¥2,522（相比全域广播成本 ¥4,888 节省药剂 70%，ROI 14.4x），预期 72h 杀灭率 68%。',
                    contentEn: 'Targeting LOT-03 Botrytis and thrips risks, A04 Crop Protection and A02 Field Agronomy formulate precision spot spray Plan A with Spinetoram 0.7x. Precision cost: CNY 2,522 (vs broadcast CNY 4,888, saving 70% chemicals, ROI 14.4x). Expected 72h efficacy: 68%.',
                    badges: [
                        { label: 'PRECISION COST', value: 'CNY 2,522', color: '#38bdf8' },
                        { label: 'BROADCAST COST', value: 'CNY 4,888', color: '#64748b' },
                        { label: 'CHEMICAL SAVINGS', value: '70%', color: '#10b981' },
                        { label: 'PRECISION ROI', value: '14.4x', color: '#fbbf24' },
                    ]
                },
                {
                    id: 2,
                    time: '14:30:15',
                    phase: 'PERCEIVING',
                    phaseColor: '#06b6d4',
                    agentId: 'A13',
                    agentNameZh: '遥测感知 (A13)',
                    agentNameEn: 'Telemetry & Sensing (A13)',
                    titleZh: '全场遥测异常告警：南区 LOT-03 蓟马诱捕虫口突破预警线',
                    titleEn: 'Telemetry Anomaly: South LOT-03 Thrips Trap Count Crosses Warning Line',
                    contentZh: 'A13 遥测感知摄入南区 LOT-03 物联网微气象与 8 台光学诱捕测报箱数据：西花蓟马单板日增量突破 28 头/板（预警门限 15 头），夜间相对湿度持续高于 85% 达 3.8 小时，Broome-English 灰霉病侵染风险指数攀升至 0.68。',
                    contentEn: 'A13 Telemetry ingests LOT-03 IoT weather and optical spore trap telemetry: Thrips count jumps to 28/card (threshold 15/card), RH >85% for 3.8h, Broome-English Botrytis risk index climbs to 0.68.',
                    badges: [
                        { label: 'TRAP COUNT', value: '28 Thrips/Card', color: '#ef4444' },
                        { label: 'LEAF WETNESS', value: '3.8 Hours (>3h)', color: '#f59e0b' },
                        { label: 'BOTRYTIS RISK', value: '0.68 (HIGH)', color: '#ef4444' },
                    ]
                },
                {
                    id: 3,
                    time: '14:30:18',
                    phase: 'VERIFYING',
                    phaseColor: '#ef4444',
                    agentId: 'A08',
                    agentNameZh: '法规合规 (A08) · 刚性一票否决门禁',
                    agentNameEn: 'Regulatory Compliance (A08) · Rigid Veto Gate',
                    titleZh: '法定农药安全间隔期 (PHI) 冲突 · 刚性一票否决方案 A',
                    titleEn: 'GB 2763 Pre-Harvest Interval (PHI) Conflict: Rigid VETO on Plan A',
                    contentZh: '依据国家强制标准 GB 2763 农药残留限量，乙基多杀菌素法定安全间隔期 (PHI) 为 72 小时。LOT-03 施药仅 14 小时，距盒马鲜生今日 16:00 交付仅剩 1.5 小时，存在 -58 小时绝对赤字。强行采收必遭退货拒收与 20% 违约追索（损失超 ¥48,750）。A08 法规合规行使一票否决权，刚性阻断方案 A！',
                    contentEn: 'GB 2763 mandates a 72h PHI for Spinetoram. LOT-03 is at hour 14 with a -58h deficit before Hema 16:00 delivery. Harvesting guarantees MRL breach and 20% SLA default fine (¥48,750). A08 executes strict unilateral VETO against Plan A!',
                    badges: [
                        { label: 'STATUS', value: 'VETOED (刚性否决)', color: '#ef4444' },
                        { label: 'PHI DEFICIT', value: '-58 Hours Gap', color: '#f87171' },
                        { label: 'PENALTY AVOIDED', value: '¥48,750', color: '#10b981' },
                        { label: 'GATE DECISION', value: 'LOCKED & BLOCKED', color: '#ef4444' },
                    ]
                },
                {
                    id: 4,
                    time: '14:30:22',
                    phase: 'ANALYZING',
                    phaseColor: '#38bdf8',
                    agentId: 'A06',
                    agentNameZh: '销售履约 (A06)',
                    agentNameEn: 'Sales & Fulfillment (A06)',
                    titleZh: 'SLA 违约追索预警：盒马鲜生 750kg 交付交期红线排查',
                    titleEn: 'SLA Default Alert: Hema Fresh 750kg Delivery Deadline Audit',
                    contentZh: 'A06 销售履约核查 48 份长协配额：盒马鲜生 750kg 属于战略 S 级合同，约定今日 16:00 入华东冷链仓，交期延误超 4 小时将触发全单扣款 20%（违约金 ¥9,750）并降级商超供货排位，必须在全园重组安全现货产能。',
                    contentEn: 'A06 Sales Planner audits 48 long-term contracts: Hema 750kg is an S-grade contract due at 16:00. Delays over 4h incur a 20% SLA deduction (¥9,750) and tier demotion, requiring an immediate harvest plot reallocation.',
                    badges: [
                        { label: 'ORDER CODE', value: 'BB-2026-HM01', color: '#38bdf8' },
                        { label: 'ORDER VOLUME', value: '750 kg', color: '#10b981' },
                        { label: 'SLA PENALTY', value: '20% (¥9,750)', color: '#ef4444' },
                    ]
                }
            ]
        },
        {
            round: 2,
            titleZh: '第 2 轮：多视角协同重组与候选替代方案推演 (温室抢收方案 B + 气调库缓冲方案 C)',
            titleEn: 'Round 2: Multi-Perspective Recombination & Candidate Formulations (Plan B + Plan C)',
            steps: [
                {
                    id: 5,
                    time: '14:30:26',
                    phase: 'DECIDING',
                    phaseColor: '#fbbf24',
                    agentId: 'A03',
                    agentNameZh: '设施温室 (A03)',
                    agentNameEn: 'Greenhouse Agronomy (A03)',
                    titleZh: '空间重组方案 B 提出：转向北区智能日光温室避险采收',
                    titleEn: 'Spatial Recombination Plan B: Reallocate to North Solar Greenhouse',
                    contentZh: 'A03 设施温室联合 A02 田间农艺提出替代方案 B：将采收主力地块转移至北区智能连栋日光温室 (LOT-01 / LOT-02)，完全避开南区农残安全期敏感地块。北区环境受控，果实无农药施用记录，具备特级采收条件。',
                    contentEn: 'A03 Greenhouse Agronomy proposes Plan B: Reallocate harvest to North Smart Solar Greenhouse (LOT-01/02), fully bypassing the pesticide-treated South zone with zero chemical residues and optimal canopy vigor.',
                    badges: [
                        { label: 'TARGET ZONE', value: 'North LOT-01/02', color: '#38bdf8' },
                        { label: 'PULP TEMP', value: '16.5 C (Dawn)', color: '#10b981' },
                        { label: 'CHEMICAL PHI', value: '0 Days (Clean)', color: '#10b981' },
                    ]
                },
                {
                    id: 6,
                    time: '14:30:30',
                    phase: 'DECIDING',
                    phaseColor: '#ef4444',
                    agentId: 'A12',
                    agentNameZh: '采收调度 (A12)',
                    agentNameEn: 'Harvest Dispatch (A12)',
                    titleZh: 'CREW-25 白手套采收班组排产：锁定 05:00-08:30 拂晓低温窗口',
                    titleEn: 'CREW-25 White-Glove Harvest Shift: Lock 05:00-08:30 Dawn Window',
                    contentZh: 'A12 采收调度完成班组调度：调度 CREW-25 拂晓轻柔采摘队（25人编组）于明日 05:00 至 08:30 作业，佩戴无粉丁腈防静电手套，以 5.2 kg/(人·小时) 标准人效作业，在日照升温果皮前完成 750kg 特级采收。',
                    contentEn: 'A12 Harvest Dispatch schedules CREW-25 white-glove team (25 certified harvest technicians) for 05:00-08:30 dawn shift with powder-free nitrile gloves at 5.2 kg/(person*h) rate, completing 750kg harvest before fruit warms.',
                    badges: [
                        { label: 'SHIFT CREW', value: 'CREW-25 (25 Crew)', color: '#a78bfa' },
                        { label: 'LABOR RATE', value: '5.2 kg/(person*h)', color: '#10b981' },
                        { label: 'WINDOW', value: '05:00-08:30 Dawn', color: '#fbbf24' },
                    ]
                },
                {
                    id: 7,
                    time: '14:30:33',
                    phase: 'ANALYZING',
                    phaseColor: '#38bdf8',
                    agentId: 'A05',
                    agentNameZh: '品质追溯 (A05)',
                    agentNameEn: 'Quality & Traceability (A05)',
                    titleZh: '近红外光谱遥测核验：糖度 13.8° 与果粉白霜 96.8% 双达标',
                    titleEn: 'NIR Spectrometer Quality Validation: Brix 13.8° & Bloom 96.8%',
                    contentZh: 'A05 品质追溯调取北区 LOT-01/02 近红外光谱仪与高精视觉传感器数据：样本可溶性固形物 Brix 达 13.8°（盒马 SLA 标准 ≥13.5°），果粉蜡质层厚度 96.8%（标准 ≥95%），果径 ≥18mm 特级果占比 91.2%，满足商超特级免检标线。',
                    contentEn: 'A05 Quality pulls NIR spectrometer and camera data: Sample Brix reaches 13.8° (SLA >= 13.5°), bloom wax integrity 96.8% (SLA >= 95%), Grade A diameter >=18mm at 91.2%, meeting premium exemption protocols.',
                    badges: [
                        { label: 'SUGAR BRIX', value: '13.8° (PASS)', color: '#10b981' },
                        { label: 'BLOOM WAX', value: '96.8% (PASS)', color: '#10b981' },
                        { label: 'GRADE A RATIO', value: '91.2%', color: '#38bdf8' },
                    ]
                },
                {
                    id: 8,
                    time: '14:30:37',
                    phase: 'ANALYZING',
                    phaseColor: '#ef4444',
                    agentId: 'A11',
                    agentNameZh: '无人机作业 (A11)',
                    agentNameEn: 'Drone Operations (A11)',
                    titleZh: '大疆 T40 RTK 激光雷达与多光谱复扫：排除周边病斑侵染',
                    titleEn: 'DJI T40 RTK LiDAR & Multispectral Scan: Clear Surrounding Risks',
                    contentZh: 'A11 无人机作业调用大疆 T40 对北区温室周边 100 亩防风隔离带实施多光谱遥感巡航，NDVI 植被指数 0.82 正常，确认周边无病原菌丝漂移与虫害跳跃风险，航线净空安全。',
                    contentEn: 'A11 Drone Operations dispatches DJI T40 for a multispectral sweep over the North buffer perimeter: NDVI 0.82 healthy, confirming zero pathogen drift or pest migration.',
                    badges: [
                        { label: 'FLEET', value: 'DJI T40 RTK', color: '#ef4444' },
                        { label: 'NDVI INDEX', value: '0.82 (Healthy)', color: '#10b981' },
                        { label: 'DRIFT RISK', value: '0.0% Clear', color: '#10b981' },
                    ]
                },
                {
                    id: 9,
                    time: '14:30:41',
                    phase: 'DECIDING',
                    phaseColor: '#fbbf24',
                    agentId: 'A10',
                    agentNameZh: '环境自控 (A10) · 安全防灾 (A09)',
                    agentNameEn: 'Climate Automation (A10) · Safety (A09)',
                    titleZh: '备用方案 C 拟定：气调库 CA-02 锁定 800kg 缓冲以防午后 7 级大风',
                    titleEn: 'Resilient Plan C Staged: CA-02 800kg Cold Buffer Staged for Gale Defense',
                    contentZh: 'A09 安全防灾结合气象雷达预警明日 14:00-16:30 可能出现 7 级大风。A10 环境自控联动 A06 销售履约配置后备方案 C：在保税气调库 CA-02 锁定 800kg 储备鲜果（1.5°C，98% 氮气）。若极端大风迫使温室闭棚，可即刻切换出库。',
                    contentEn: 'A09 Safety alerts 14:00-16:30 convective gale risk. A10 Climate Automation and A06 stage backup Plan C: Pre-allocate 800kg from CA-02 cold storage (1.5°C, N2 98%). Delivery switches to cold stock if vents must seal.',
                    badges: [
                        { label: 'BUFFER STAGED', value: 'CA-02 800kg', color: '#38bdf8' },
                        { label: 'GALE TOLERANCE', value: 'Beaufort 7 Gale Safe', color: '#10b981' },
                        { label: 'SLA BACKUP', value: '100% Guaranteed', color: '#fbbf24' },
                    ]
                }
            ]
        },
        {
            round: 3,
            titleZh: '第 3 轮：边际净贡献精算、全网共识与门禁封签 (方案 B 胜出 · 7 项门禁签发放行)',
            titleEn: 'Round 3: Marginal Net Contribution Actuary, Consensus & Verification Gate',
            steps: [
                {
                    id: 10,
                    time: '14:30:45',
                    phase: 'REASONING',
                    phaseColor: '#ec4899',
                    agentId: 'A07',
                    agentNameZh: '财务核算 (A07)',
                    agentNameEn: 'Finance & Margin (A07)',
                    titleZh: '全流程边际净贡献精算：方案 B 净贡献 +¥45,800 经济性领跑',
                    titleEn: 'Incremental Net Margin Actuary: Plan B Net Contribution +¥45,800 Wins',
                    contentZh: 'A07 财务核算运行边际净贡献公式 Delta M：方案 B 创收 ¥48,750，扣除采摘人工费 ¥1,850、包装耗材 ¥120、冷链运输 ¥980 后，边际净贡献达 +¥45,800（毛利率 93.9%）；方案 C 产生气调冷藏能耗折损，边际净贡献 +¥45,000。方案 B 在帕累托前沿占优。',
                    contentEn: 'A07 Finance runs Delta M formula: Plan B secures ¥48,750 gross revenue at ¥2,950 direct cost, yielding net contribution +¥45,800 (93.9% margin); Plan C yields +¥45,000 net due to chilling energy. Plan B dominates Pareto frontier.',
                    badges: [
                        { label: 'PLAN B REVENUE', value: '¥48,750', color: '#10b981' },
                        { label: 'DIRECT COST', value: '¥2,950', color: '#64748b' },
                        { label: 'NET CONTRIBUTION', value: '+¥45,800 (93.9%)', color: '#38bdf8' },
                        { label: 'PLAN C MARGIN', value: '+¥45,000', color: '#fbbf24' },
                    ]
                },
                {
                    id: 11,
                    time: '14:30:49',
                    phase: 'REASONING',
                    phaseColor: '#8b5cf6',
                    agentId: 'A14',
                    agentNameZh: '算法模型 (A14)',
                    agentNameEn: 'Algorithms & Learning (A14)',
                    titleZh: '高维纳什均衡与因果回测：方案 B 综合置信度 94.5% 收敛',
                    titleEn: 'High-Dimensional Nash Equilibrium: Plan B Converges at 94.5% Confidence',
                    contentZh: 'A14 算法模型完成轻量化因果推理神经网络在线更新：多智能体非零和博弈纳什均衡收敛，方案 B 综合适应度得分 94.5 分（帕累托最优解），反事实回测显示方案 B 在历史 142 个相似气象周期的履约成功率达 99.2%。',
                    contentEn: 'A14 Algorithms completes causal neural surrogate graph update: Nash equilibrium converges on Plan B at 94.5 pts. Counterfactual audit demonstrates 99.2% historical SLA fulfillment across 142 similar weather cycles.',
                    badges: [
                        { label: 'NASH EQUILIBRIUM', value: 'CONVERGED', color: '#10b981' },
                        { label: 'CONFIDENCE', value: '94.5% (High)', color: '#38bdf8' },
                        { label: 'COUNTERFACTUAL', value: '99.2% Robust', color: '#a78bfa' },
                    ]
                },
                {
                    id: 12,
                    time: '14:30:52',
                    phase: 'DECIDING',
                    phaseColor: '#60a5fa',
                    agentId: 'A01',
                    agentNameZh: '运营管理 (A01)',
                    agentNameEn: 'Operations Management (A01)',
                    titleZh: '全域总编排终审裁决：批准方案 B 为主方案、方案 C 为应急后备',
                    titleEn: 'Global Orchestrator Decision: Authorize Plan B Lead & Plan C Gale Standby',
                    contentZh: 'A01 运营管理行使全局决策总调度权：综合 14 个专业职能研判意见，正式裁定以方案 B（北区日光温室拂晓抢收）作为主执行处方，方案 C（CA-02 气调调拨）作为强对流大风防御后备预案，指令下发至现场各作业终端。',
                    contentEn: 'A01 Operations Management exercises global orchestration authority: Authorizes Plan B (North Greenhouse Dawn Shift) as lead prescription and Plan C (CA-02 buffer) as gale contingency, dispatching work orders.',
                    badges: [
                        { label: 'LEAD PRESCRIPTION', value: 'PLAN B APPROVED', color: '#00e5a3' },
                        { label: 'BACKUP PREPARED', value: 'PLAN C STANDBY', color: '#38bdf8' },
                        { label: 'ORCHESTRATION', value: '14-AGENT CONSENSUS', color: '#10b981' },
                    ]
                },
                {
                    id: 13,
                    time: '14:30:56',
                    phase: 'VERIFYING',
                    phaseColor: '#10b981',
                    agentId: 'A08',
                    agentNameZh: '法规合规 (A08)',
                    agentNameEn: 'Regulatory Compliance (A08)',
                    titleZh: '7 项法定与质量安全门禁全票 PASS · 加盖 SHA-256 存证签名',
                    titleEn: 'All 7 Regulatory Gates PASSED · SHA-256 Cryptographic Notary Signed',
                    contentZh: 'A08 法规合规终审复核 7 大法定门禁：[1] 农残安全期间隔 PASS [2] 强对流大风联锁 PASS [3] 禁限用成分 0 检出 PASS [4] 采收标签规范 PASS [5] 附带生态无害 PASS [6] 应急回退预案就绪 PASS [7] 模型置信度 (94.5% ≥ 75%) PASS。加盖不可篡改存证哈希 1AAD49H2，正式签发放行！',
                    contentEn: 'A08 Regulatory Compliance audits 7 statutory gates: [1] PHI PASS [2] Gale interlock PASS [3] Zero banned chemical PASS [4] Label PASS [5] Ecological PASS [6] Rollback PASS [7] Confidence (94.5% >= 75%) PASS. Sealed with immutable SHA-256 hash 1AAD49H2.',
                    badges: [
                        { label: 'GATES PASSED', value: '7 / 7 ALL PASS', color: '#10b981' },
                        { label: 'STATUS', value: 'APPROVED (已签发放行)', color: '#00e5a3' },
                        { label: 'NOTARY HASH', value: 'SHA256:1AAD49H2..', color: '#38bdf8' },
                        { label: 'RETRAIN POINTS', value: '142 Telemetry Points', color: '#a78bfa' },
                    ]
                }
            ]
        }
    ];

    const [visibleStepCount, setVisibleStepCount] = useState(13);
    const [isSimulatingThinking, setIsSimulatingThinking] = useState(false);

    const handleReTriggerSimulation = () => {
        setIsSimulatingThinking(true);
        setVisibleStepCount(1);
        let s = 1;
        const timer = setInterval(() => {
            s++;
            setVisibleStepCount(s);
            if (s >= 13) {
                clearInterval(timer);
                setIsSimulatingThinking(false);
            }
        }, 350);
    };
    const field = fields[activeFieldId];
    const topRisk = riskResults[0];
    const now = new Date().toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Dynamic Plan Profiles for A, B, C
    const PLAN_DETAILS = {
        A: {
            titleEn: 'Plan A: South Border Conventional Harvest (Direct Picking)',
            titleZh: '方案 A：南区边缘直接常规采收（刚性一票否决）',
            status: 'veto',
            statusLabelEn: 'VETOED BY COMPLIANCE GATE (GB 2763 72h PHI)',
            statusLabelZh: 'A08 法规合规刚性否决拦截（GB 2763 农药安全间隔期）',
            statusColor: '#ef4444',
            summaryEn: 'LOT-03 received Spinetoram application only 14h ago. GB 2763 mandates a 72h Pre-Harvest Interval (PHI). Harvesting now guarantees pesticide residue detection, triggering contract cancellation and heavy penalty.',
            summaryZh: '南区边缘 LOT-03 处于乙基多杀菌素施用后第 14 小时，国家 GB 2763 规定农药安全间隔期 (PHI) 为 72 小时，距放行尚有 58 小时。强行采收将导致农残抽检超标，触发盒马拒收熔断与高额违约索赔！',
            workOrders: [
                { id: 'WO-LOCK-01', nameEn: 'Regulatory Lock on LOT-03', nameZh: 'LOT-03 采摘与打冷通道强制电子锁闭', actor: 'A08 法规合规', status: 'LOCKED', statusZh: '已锁定' },
                { id: 'WO-LOCK-02', nameEn: 'CREW-25 Dispatch Freeze', nameZh: 'CREW-25 采收班组进场禁令下发', actor: 'A09 安全防灾', status: 'FROZEN', statusZh: '已冻结' },
            ],
            financials: {
                grossSales: 0,
                harvestLabor: -1850,
                chemicalCost: -320,
                coldLogistics: 0,
                penalty: -9750,
                netMargin: -11920,
                netMarginRate: '-100%',
                roiText: 'Catastrophic Violation (-¥11,920 Loss)',
                roiTextZh: '合规严重违规（净亏损 ¥11,920 + 品牌毁损）',
            },
            gates: [
                { name: 'GB 2763 72h PHI (农药安全间隔期)', pass: false, note: '14h / 72h · 严重超标红线' },
                { name: 'Banned Pesticides Check (禁限用农药)', pass: true, note: '非禁限用成分' },
                { name: 'Fruit Bloom Wax Integrity (果粉完整度≥95%)', pass: false, note: '88.2% · 常规采收碰伤脱粉' },
                { name: 'Brix Sugar Standard (糖度≥13.5°)', pass: false, note: '12.8° · 未达特级要求' },
                { name: 'Worker Heat Limits (防暑安全)', pass: true, note: '合规' },
                { name: 'Drone Airspace Geofence (空域围栏)', pass: true, note: '无冲突' },
                { name: 'SHA-256 Lot Provenance (区块链存证)', pass: false, note: '拒绝放行签名' },
            ]
        },
        B: {
            titleEn: 'Plan B: North Smart Greenhouse Dawn Harvest & Priva HVAC Optimization',
            titleZh: '方案 B：北区连栋温室拂晓调优采摘（帕累托最优领跑）',
            status: 'optimal',
            statusLabelEn: 'PARATO OPTIMAL LEAD · SCORE 94.2 PTS',
            statusLabelZh: '帕累托最优领跑方案 · 综合评分 94.2 分',
            statusColor: '#00e5a3',
            summaryEn: 'Dispatches CREW-25 38 certified harvest technicians with nitrile gloves for dawn harvest (05:00-08:30) in North Zone (LOT-01 / LOT-02). Synchronizes Priva HVAC ridge vent staged ramp to suppress humidity. Preserves 96.8% bloom wax and achieves 13.8° Brix.',
            summaryZh: '调度 CREW-25 拂晓轻柔采收班组（38人佩戴食品级丁腈手套）抢收北区智能温室 LOT-01 / LOT-02。联动 Priva 环控总线天窗微开 12% 降湿阶梯（VPD 1.15 kPa）。果粉完好度达 96.8%，糖度 13.8°，100% 达成盒马 SLA。',
            workOrders: [
                { id: 'WO-B-01', nameEn: 'CREW-25 Dawn Soft-Touch Harvest (38 Technicians)', nameZh: 'CREW-25 拂晓轻柔采收（38人带丁腈手套）', actor: 'A12 采收调度', status: 'SCHEDULED', statusZh: '已排产 (05:00-08:30)' },
                { id: 'WO-B-02', nameEn: 'Priva RS-485 Roof Vent Ramp (12% Opening)', nameZh: 'Priva RS-485 环控总线天窗微开启 12% 排湿', actor: 'A10 环境自控', status: 'DISPATCHED', statusZh: '指令已下发' },
                { id: 'WO-B-03', nameEn: '1.5°C Pre-Cooling Slot Allocation (Bay #1)', nameZh: '300吨气调中心 1号预冷槽锁定 (1.5°C打冷)', actor: 'A05 品质追溯', status: 'RESERVED', statusZh: '机位已锁定' },
                { id: 'WO-B-04', nameEn: 'DJI T40 South Perimeter Patrol & Zero-Drift Barrier', nameZh: '大疆 T40 南区空域物理对靶巡检与防漂移隔离', actor: 'A11 无人机作业', status: 'ACTIVE', statusZh: '巡检警戒中' },
            ],
            financials: {
                grossSales: 48750,
                harvestLabor: -1850,
                chemicalCost: -120,
                coldLogistics: -980,
                penalty: 0,
                netMargin: 45800,
                netMarginRate: '93.9%',
                roiText: '+¥45,800 Net Margin (Peak Contribution)',
                roiTextZh: '+¥45,800 边际净贡献（全场峰值毛利）',
            },
            gates: [
                { name: 'GB 2763 72h PHI (农药安全间隔期)', pass: true, note: '零化学农药 · 生防无药残' },
                { name: 'Banned Pesticides Check (禁限用农药)', pass: true, note: '100% 清白合规' },
                { name: 'Fruit Bloom Wax Integrity (果粉完整度≥95%)', pass: true, note: '96.8% · 坚挺均匀白霜' },
                { name: 'Brix Sugar Standard (糖度≥13.5°)', pass: true, note: '13.8° · 糖酸比 12.4 优良' },
                { name: 'Worker Heat Limits (防暑安全)', pass: true, note: '拂晓早班 08:30 前完成，规避高温' },
                { name: 'Drone Airspace Geofence (空域围栏)', pass: true, note: '离地 1.2m 超微量对靶，无人员空域' },
                { name: 'SHA-256 Lot Provenance (区块链存证)', pass: true, note: 'GS1-128 批次哈希已上链锚定' },
            ]
        },
        C: {
            titleEn: 'Plan C: Controlled Atmosphere Cold Storage Emergency Buffer Dispatch',
            titleZh: '方案 C：气调恒温保鲜库直调保供（防灾备用方案）',
            status: 'buffer',
            statusLabelEn: 'RESILIENT CONTINGENCY BUFFER · SCORE 88.5 PTS',
            statusLabelZh: '防灾应急缓冲备用方案 · 综合评分 88.5 分',
            statusColor: '#38bdf8',
            summaryEn: 'Releases 750kg of pre-cooled Grade A blueberries from CA Cold Storage Room #2 (CA-02). Conducts rapid NIR non-destructive sugar testing and dispatches via refrigerated express truck. Ensures 100% on-time fulfillment if bad weather halts harvesting.',
            summaryZh: '动用集中气调恒温保鲜库 2号备用库 (CA-02) 直调 750kg 特级预冷果。近红外光谱仪极速无损复检合格后，接驳长水机场冷链专线装运发车。若滇中极端大风导致温室采摘停滞，系统即刻毫秒级自愈翻转至本方案！',
            workOrders: [
                { id: 'WO-C-01', nameEn: 'CA-02 Nitrogen Buffer De-Storage (750kg)', nameZh: '气调2号库高纯氮解封调出 750kg 储备果', actor: 'A05 品质追溯', status: 'STANDBY', statusZh: '待命准备' },
                { id: 'WO-C-02', nameEn: 'NIR Non-Destructive Brix & Firmness QC', nameZh: '近红外无损糖度光谱仪极速复测 (2.5t/h)', actor: 'A05 品质追溯', status: 'STANDBY', statusZh: '流水线待命' },
                { id: 'WO-C-03', nameEn: 'Reefer Express Trunk Dispatch (Plate 云A·8832冷)', nameZh: '干线恒温冷藏车调度接驳 (车号 云A·8832冷)', actor: 'A06 销售履约', status: 'STANDBY', statusZh: '运力锁定' },
            ],
            financials: {
                grossSales: 48750,
                harvestLabor: -650,
                chemicalCost: -1450,
                coldLogistics: -1200,
                penalty: 0,
                netMargin: 45450,
                netMarginRate: '93.2%',
                roiText: '+¥45,450 Net Margin (Resilient Fallback)',
                roiTextZh: '+¥45,450 边际净贡献（高韧性备选）',
            },
            gates: [
                { name: 'GB 2763 72h PHI (农药安全间隔期)', pass: true, note: '库内批次已出具国标检测合格证' },
                { name: 'Banned Pesticides Check (禁限用农药)', pass: true, note: '零化学残留' },
                { name: 'Fruit Bloom Wax Integrity (果粉完整度≥95%)', pass: true, note: '95.4% · 气调锁鲜良好' },
                { name: 'Brix Sugar Standard (糖度≥13.5°)', pass: true, note: '13.6° · 达标特级' },
                { name: 'Worker Heat Limits (防暑安全)', pass: true, note: '恒温库区作业，全天候安全' },
                { name: 'Drone Airspace Geofence (空域围栏)', pass: true, note: '无需空域飞行' },
                { name: 'SHA-256 Lot Provenance (区块链存证)', pass: true, note: '预冷入库批次数字指纹合规' },
            ]
        }
    };

    const currentPlan = PLAN_DETAILS[activePlanId] || PLAN_DETAILS.B;

    return (
        <div className="page" style={{ maxWidth: 1360, margin: '0 auto' }}>
            <PipelineBreadcrumb />

            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: 14 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.25rem' }}>
                        <Icon name="prescription" size={24} color="#38bdf8" />
                        {t('Prescription Decision Matrix Room', '处方决策矩阵室 · 方案生成与多主体协同编排')}
                    </h1>
                    <p className="page-subtitle" style={{ fontSize: '0.74rem' }}>
                        {t('Stage 4: Multi-Criteria Decision OS · Two-Stage Engine & Six-Step Conflict Resolution', '阶段 4：二级决策引擎与六级冲突消解 · 帕累托最优与刚性监管闸门')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleReTriggerSimulation}
                        disabled={isSimulatingThinking}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            background: isSimulatingThinking ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                            borderColor: '#38bdf8',
                            color: '#38bdf8',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                        }}
                    >
                        <Icon name="activity" size={14} color="#38bdf8" />
                        {isSimulatingThinking
                            ? t('Simulating 3-Round Multi-Agent Deduction...', '多智能体3轮方案推演中...')
                            : t('Re-trigger Multi-Agent Deduction (3 Rounds)', '重新触发多智能体方案推演 (3轮博弈收敛)')}
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate('/execution')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: '0.72rem', fontWeight: 800 }}
                    >
                        {t('Authorize & Enter Execution Dispatch →', '签发方案并进入自动化调度 →')}
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════
                1. 3.5-STYLE MULTI-ROUND PRESCRIPTION BUILDER DEDUCTIVE REASONING STREAM
               ══════════════════════════════════════════════════════════════════════════ */}
            <div className="card" style={{ marginBottom: 16, background: '#090d16', border: '1px solid #1e293b', borderRadius: 8, padding: '16px 20px' }}>
                {/* Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: isSimulatingThinking ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)',
                            border: `1px solid ${isSimulatingThinking ? '#fbbf24' : '#10b981'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSimulatingThinking ? '#fbbf24' : '#10b981' }} className={isSimulatingThinking ? 'status-dot pulse' : ''} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                                {isSimulatingThinking
                                    ? t('Multi-Agent Collaborative Reasoning Active...', '多智能体协同推演中 · 方案博弈与收敛...')
                                    : t('Analysis Complete - All Rounds', '分析完成 · 全轮次多智能体推演定稿')}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>
                                {t('Phase: Verifying | Round 3/3 | Sentinel Enterprise Core v7.6 · 13 Steps / 14 Functions Consensus', '阶段：合规校验放行 | 轮次 3/3 | 观衡企业级智能中枢 v7.6 · 13 步骤 / 14 大专业职能全景博弈')}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            {t('Round 3/3', '轮次 3/3')}
                        </span>
                        <span style={{ fontSize: '0.62rem', background: 'rgba(30,64,175,0.2)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.3)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                            Sentinel-Agri v7.6
                        </span>
                    </div>
                </div>

                {/* 5 Phase Progress Dots & Connecting Glowing Bar */}
                <div style={{ padding: '16px 0 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: 640, margin: '0 auto' }}>
                        <div style={{ position: 'absolute', top: 12, left: 30, right: 30, height: 2, background: 'linear-gradient(90deg, #38bdf8, #a78bfa, #ec4899, #fbbf24, #10b981)', zIndex: 1 }} />
                        {[
                            { id: 'p1', label: 'PERCEIVING', labelZh: '感知接入', color: '#38bdf8', icon: 'sensors' },
                            { id: 'p2', label: 'ANALYZING', labelZh: '拟合分析', color: '#a78bfa', icon: 'activity' },
                            { id: 'p3', label: 'REASONING', labelZh: '博弈推理', color: '#ec4899', icon: 'reasoning' },
                            { id: 'p4', label: 'DECIDING', labelZh: '方案决议', color: '#fbbf24', icon: 'layers' },
                            { id: 'p5', label: 'VERIFYING', labelZh: '门禁放行', color: '#10b981', icon: 'shield' },
                        ].map((phase) => (
                            <div key={phase.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 4 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    background: phase.color,
                                    border: '2px solid #090d16',
                                    boxShadow: `0 0 10px ${phase.color}60`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Icon name={phase.icon} size={12} color="#090d16" />
                                </div>
                                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: phase.color, letterSpacing: 0.5 }}>
                                    {isZh ? phase.labelZh : phase.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Multi-Agent 3-Round Deduction Stream */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {MULTI_AGENT_ROUNDS.map(r => {
                        const roundSteps = r.steps.filter(s => s.id <= visibleStepCount);
                        if (roundSteps.length === 0) return null;

                        return (
                            <div key={r.round} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Round Divider Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 2px' }}>
                                    <span style={{
                                        fontSize: '0.62rem',
                                        fontWeight: 800,
                                        background: 'rgba(56, 189, 248, 0.15)',
                                        border: '1px solid rgba(56, 189, 248, 0.4)',
                                        color: '#38bdf8',
                                        padding: '2px 8px',
                                        borderRadius: 999,
                                        letterSpacing: 0.5,
                                    }}>
                                        {`Round ${r.round}/3`}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1' }}>
                                        {isZh ? r.titleZh : r.titleEn}
                                    </span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                                </div>

                                {/* Step Cards */}
                                {roundSteps.map(step => (
                                    <div
                                        key={step.id}
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            border: `1px solid ${step.phaseColor}40`,
                                            borderLeft: `4px solid ${step.phaseColor}`,
                                            borderRadius: 6,
                                            padding: '10px 14px',
                                            animation: 'fadeIn 0.25s ease',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#64748b' }}>
                                                    [{step.time}]
                                                </span>
                                                <span style={{
                                                    fontSize: '0.58rem',
                                                    fontWeight: 800,
                                                    background: `${step.phaseColor}25`,
                                                    color: step.phaseColor,
                                                    border: `1px solid ${step.phaseColor}50`,
                                                    padding: '1px 6px',
                                                    borderRadius: 3
                                                }}>
                                                    {step.phase}
                                                </span>
                                                <strong style={{ fontSize: '0.78rem', color: '#f8fafc' }}>
                                                    {isZh ? step.titleZh : step.titleEn}
                                                </strong>
                                            </div>

                                            <span style={{
                                                fontSize: '0.65rem',
                                                color: '#38bdf8',
                                                background: 'rgba(56, 189, 248, 0.1)',
                                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontWeight: 600
                                            }}>
                                                {isZh ? step.agentNameZh : step.agentNameEn}
                                            </span>
                                        </div>

                                        <p style={{ margin: '4px 0 8px', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                                            {isZh ? step.contentZh : step.contentEn}
                                        </p>

                                        {/* Step Data Badges */}
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {step.badges.map(b => (
                                                <span
                                                    key={b.label}
                                                    style={{
                                                        fontSize: '0.58rem',
                                                        background: 'rgba(15, 23, 42, 0.9)',
                                                        border: `1px solid ${b.color}40`,
                                                        borderRadius: 3,
                                                        padding: '2px 6px',
                                                        display: 'inline-flex',
                                                        gap: 4
                                                    }}
                                                >
                                                    <span style={{ color: '#64748b' }}>{b.label}:</span>
                                                    <strong style={{ color: b.color }}>{b.value}</strong>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Validation Footer */}
                <div style={{
                    marginTop: 14,
                    padding: '8px 12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.72rem',
                    color: '#86efac',
                    fontWeight: 600
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="check-circle" size={14} color="#10b981" />
                        {t('Iterative reasoning chain validated - 3 rounds, 13 collaborative steps converged on Plan B', '迭代推演链条已验证 · 3 轮多智能体博弈收敛，13 个专业主体协同步骤已闭环')}
                    </span>
                    <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                        GS1-128 NOTARY: 1AAD49H2-OK
                    </span>
                </div>

                {/* Highest threat & AI Reasoning Factors */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #1e293b', borderRadius: 6 }}>
                        <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                            {t('Highest threat', '当前最高风险')}: <strong style={{ color: '#f8fafc' }}>灰霉病 (Botrytis) & 蓟马复合风险 (5/100)</strong>
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                            ● {t('LOW (Fully Mitigated by Plan B)', '低风险 (方案B已全额闭环对冲)')}
                        </span>
                    </div>

                    <div style={{ padding: '10px 14px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Icon name="reasoning" size={14} color="#38bdf8" />
                            {t('Active Prescription · Multi-Agent Factors Considered', '当前处方：多智能体决策研判考量要素')}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6, fontSize: '0.68rem', color: '#cbd5e1' }}>
                            <div><strong style={{ color: '#38bdf8' }}>#1 {t('Humidity', '空气相对湿度')}:</strong> 66.6% (门禁阈值 85% · 正常区间)</div>
                            <div><strong style={{ color: '#38bdf8' }}>#2 {t('Leaf Wetness', '叶面结露时长')}:</strong> 0.70h (阈值 3h · 未达孢子萌发条件)</div>
                            <div><strong style={{ color: '#38bdf8' }}>#3 {t('Growth Stage', '物候阶段')}:</strong> 萌芽坐果期 (中度抗性敏感期)</div>
                            <div><strong style={{ color: '#38bdf8' }}>#4 {t('Days to Harvest', '距采收安全期')}:</strong> 盒马鲜生 T0 采收在即 → 方案B合规放行</div>
                            <div><strong style={{ color: '#38bdf8' }}>#5 {t('Historical Events', '历史事件库对照')}:</strong> 2025年类似微气象3次，方案B证实最优</div>
                            <div><strong style={{ color: '#38bdf8' }}>#6 {t('Weather Forecast', '未来气象雷达')}:</strong> 48h干燥无雨窗口，午后防范局地大风</div>
                            <div><strong style={{ color: '#38bdf8' }}>#7 {t('Cost-Benefit ROI', '经济性投入产出')}:</strong> 投入成本 ¥2,950 锁定收益 ¥48,750 (ROI 16.5x)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════
                2. HERO DECISION MATRIX (Plans A, B, C Comparison Table & Specialist Perspectives)
               ══════════════════════════════════════════════════════════════════════════ */}
            <DecisionMatrix
                selectedPlan={activePlanId}
                onSelectPlan={(plan) => setActivePlanId(plan)}
            />

            {/* ══════════════════════════════════════════════════════════════════════════
                3. DYNAMIC PLAN-LINKED EXECUTION DOSSIER (100% Linked to Selected Plan A/B/C)
               ══════════════════════════════════════════════════════════════════════════ */}
            <div style={{ marginTop: 20 }}>
                {/* Dynamic Plan Title Banner */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${currentPlan.statusColor}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <h3 style={{ margin: 0, fontSize: '1.02rem', color: '#f8fafc', fontWeight: 800 }}>
                                {isZh ? currentPlan.titleZh : currentPlan.titleEn}
                            </h3>
                            <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 8px',
                                borderRadius: 4,
                                background: `${currentPlan.statusColor}20`,
                                color: currentPlan.statusColor,
                                fontWeight: 800,
                            }}>
                                {isZh ? currentPlan.statusLabelZh : currentPlan.statusLabelEn}
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#94a3b8', maxWidth: 880 }}>
                            {isZh ? currentPlan.summaryZh : currentPlan.summaryEn}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {['A', 'B', 'C'].map(pKey => (
                            <button
                                key={pKey}
                                type="button"
                                onClick={() => setActivePlanId(pKey)}
                                style={{
                                    padding: '5px 12px',
                                    borderRadius: 6,
                                    border: activePlanId === pKey ? `1px solid ${PLAN_DETAILS[pKey].statusColor}` : '1px solid rgba(100, 116, 139, 0.3)',
                                    background: activePlanId === pKey ? `${PLAN_DETAILS[pKey].statusColor}25` : 'rgba(30, 41, 59, 0.5)',
                                    color: activePlanId === pKey ? '#f8fafc' : '#94a3b8',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                {t(`Switch to Plan ${pKey}`, `切换至方案 ${pKey}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid 3: Work Orders | Cost Actuary P&L | 7 Regulatory Gates */}
                <div className="grid grid-3" style={{ gap: 14 }}>
                    {/* Column 1: Coordinated Dispatch Work Orders */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', padding: 14, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="execution" size={14} color="#38bdf8" />
                                {t('COORDINATED WORK ORDERS', '联锁协同执行工单')}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                                {currentPlan.workOrders.length} {t('Tasks', '项工单')}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {currentPlan.workOrders.map((wo, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(15, 23, 42, 0.5)',
                                    border: '1px solid rgba(51, 65, 85, 0.5)',
                                    borderRadius: 6,
                                    padding: '8px 10px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                        <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                                            {wo.id}
                                        </span>
                                        <span style={{ fontSize: '0.58rem', color: wo.status === 'LOCKED' ? '#ef4444' : '#00e5a3', fontWeight: 800 }}>
                                            {isZh ? wo.statusZh : wo.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 600 }}>
                                        {isZh ? wo.nameZh : wo.nameEn}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 3 }}>
                                        {t('Target Owner', '责任主体')}: {wo.actor}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Incremental Net Margin Financial Actuary */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', padding: 14, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#00e5a3', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="dollar" size={14} color="#00e5a3" />
                                {t('NET MARGIN FINANCIAL ACTUARY', '边际净贡献精算卡')}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: currentPlan.financials.netMargin > 0 ? '#00e5a3' : '#ef4444', fontWeight: 800 }}>
                                {currentPlan.financials.netMarginRate}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.7rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: 'rgba(56,189,248,0.05)', borderRadius: 4 }}>
                                <span style={{ color: '#cbd5e1' }}>{t('Gross Contract Revenue', '合同销售总收入')}</span>
                                <strong style={{ color: '#38bdf8' }}>+¥{currentPlan.financials.grossSales.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px' }}>
                                <span style={{ color: '#94a3b8' }}>• {t('Harvest / Crew Labor', '采摘与轻柔人工')}</span>
                                <span style={{ color: '#f87171' }}>¥{currentPlan.financials.harvestLabor.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px' }}>
                                <span style={{ color: '#94a3b8' }}>• {t('Agri / Biocontrol & HVAC', '植保物料与环控能耗')}</span>
                                <span style={{ color: '#f87171' }}>¥{currentPlan.financials.chemicalCost.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px' }}>
                                <span style={{ color: '#94a3b8' }}>• {t('Cold Chain Logistics & Chilling', '冷库打冷与干线冷链')}</span>
                                <span style={{ color: '#f87171' }}>¥{currentPlan.financials.coldLogistics.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px' }}>
                                <span style={{ color: '#94a3b8' }}>• {t('Delay Penalty Exposure', '违约金与罚款敞口')}</span>
                                <span style={{ color: currentPlan.financials.penalty < 0 ? '#ef4444' : '#64748b' }}>
                                    {currentPlan.financials.penalty === 0 ? '¥0 (零违约)' : `¥${currentPlan.financials.penalty.toLocaleString()}`}
                                </span>
                            </div>

                            <div style={{
                                marginTop: 4,
                                paddingTop: 6,
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '6px',
                                background: currentPlan.financials.netMargin > 0 ? 'rgba(0, 229, 163, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 4,
                            }}>
                                <span style={{ fontWeight: 800, color: '#f8fafc' }}>{t('Expected Net Contribution', '预期边际净贡献')}</span>
                                <strong style={{ color: currentPlan.financials.netMargin > 0 ? '#00e5a3' : '#ef4444', fontSize: '0.85rem' }}>
                                    {currentPlan.financials.netMargin >= 0 ? `+¥${currentPlan.financials.netMargin.toLocaleString()}` : `-¥${Math.abs(currentPlan.financials.netMargin).toLocaleString()}`}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: 7 Regulatory & Safety Gating Gates */}
                    <div className="card" style={{ background: '#090d16', border: '1px solid #1e293b', padding: 14, borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon name="shield" size={14} color="#a78bfa" />
                                {t('7 REGULATORY & SAFETY GATES', '7项法定与安全监管闸门')}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: currentPlan.gates.every(g => g.pass) ? '#00e5a3' : '#ef4444', fontWeight: 800 }}>
                                {currentPlan.gates.filter(g => g.pass).length} / 7 {t('Passed', '通过')}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {currentPlan.gates.map((gate, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 6px',
                                    background: gate.pass ? 'rgba(15, 23, 42, 0.4)' : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${gate.pass ? 'rgba(51, 65, 85, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    borderRadius: 4,
                                    fontSize: '0.65rem',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Icon name={gate.pass ? 'check-circle' : 'x-circle'} size={12} color={gate.pass ? '#00e5a3' : '#ef4444'} />
                                        <span style={{ color: gate.pass ? '#cbd5e1' : '#f87171', fontWeight: 600 }}>{gate.name}</span>
                                    </div>
                                    <span style={{ color: gate.pass ? '#64748b' : '#ef4444', fontSize: '0.58rem' }}>
                                        {gate.note}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {reviewItem && (
                <ApprovalModal
                    item={reviewItem}
                    onApprove={approveDecision}
                    onReject={rejectDecision}
                    onClose={() => setReviewItem(null)}
                />
            )}
        </div>
    );
}