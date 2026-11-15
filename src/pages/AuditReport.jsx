import React, { useState } from 'react';
import useStore from '../engine/store';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import Icon from '../components/Icon';
import MLFeedbackPanel from '../components/MLFeedbackPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { pick, localeTag } from '../i18n/locale.js';
import { ENTERPRISE_ORDERS } from '../data/ordersData';
import OrderDossierModal from '../components/OrderDossierModal';

// 7/7 Legal & Food Safety Gates (GB 2763-2021 & Fuxian Lake Protection)
const PRE_AUDIT_CHECKS = [
    {
        id: 'phi',
        name: 'Pre-Harvest Interval (PHI) Lock',
        nameZh: '采前安全间隔期 (PHI) 刚性闭锁',
        detail: 'Plan B harvest batch in North Greenhouse had ZERO chemical spray (0-day PHI). Chemical spray on LOT-03 enforced 72h PHI lock, blocking Plan A.',
        detailZh: '方案 B 北区温室采收批次未进行化学施药 (0天 PHI 风险)；LOT-03 隔离区严格执行 72h PHI 闭锁，A08 法规合规一票否决方案 A。',
        status: 'pass',
        standard: 'GB 2763-2021',
    },
    {
        id: 'mrl',
        name: 'Maximum Residue Limit (MRL) Lab Test',
        nameZh: '农药最大残留限量 (MRL) 权威质检',
        detail: 'Spinetoram national statutory limit: 0.01 mg/kg. Plan B delivery lot lab test: 0.000 mg/kg (ND - Not Detected). Fully compliant.',
        detailZh: '乙基多杀菌素国家法定残留限量为 0.01 mg/kg；方案 B 交付批次实验室快速色谱抽检实测 0.000 mg/kg (未检出)，权威绿标放行。',
        status: 'pass',
        standard: 'GB 2763-2021',
    },
    {
        id: 'banned',
        name: 'MoA Prohibited Substance Screening',
        nameZh: '农业农村部禁限用农药筛查',
        detail: 'Screened against 2026 MoA Prohibited Pesticides list. All active biological & targeted ingredients 100% compliant.',
        detailZh: '经农业农村部禁限用农药清单比对，园区全域投入品均为绿标生防与微毒靶向制剂，零剧毒、零禁用有效成分。',
        status: 'pass',
        standard: 'MoA Announcement No. 2598',
    },
    {
        id: 'wind_interlock',
        name: 'Microclimate & Afternoon Gale Safety Interlock',
        nameZh: '微气象与午后大风机械闭锁',
        detail: 'Harvest concluded at 08:30 (wind 1.8 m/s, < 3.0 m/s limit). Afternoon 14:00 convective gust (14.2 m/s) avoided by automated schedule.',
        detailZh: '采收作业在 08:30 前全部结束 (实时风速 1.8 m/s，低于 3.0 m/s 阈值)；系统拂晓调度完美避开午后 14:00 抚仙湖 14.2 m/s 强对流大风。',
        status: 'pass',
        standard: 'GB/T 17980',
    },
    {
        id: 'cold_chain_temp',
        name: 'Cold-Chain Steady-State Temperature Integrity',
        nameZh: '全程气调冷链温控稳态合规',
        detail: 'Core berry temp precooling reached 1.5 +/- 0.2 C. SF Express refrigerated truck monitored at 1.5 C steady state. Zero dew formation.',
        detailZh: '气调库差压预冷槽迅速将果心温降至 1.5±0.2°C；顺丰冷藏车全程温控在 1.2~1.8°C 稳态区间，全程 0 脱温、0 凝露记录。',
        status: 'pass',
        standard: 'GB/T 28599',
    },
    {
        id: 'fuxian_buffer',
        name: 'Fuxian Lake Ecological Redline Buffer',
        nameZh: '抚仙湖一类水质保护红线与缓冲区',
        detail: '50m physical buffer along runoff channel strictly maintained. Hydroponic runoff 100% recirculated with zero chemical discharge.',
        detailZh: '抚仙湖径流区 50 米物理拦截生态缓冲区执行到位；基质盆栽废液 100% 封闭回流紫外杀菌净化，园区零面源化学排放。',
        status: 'pass',
        standard: 'Yunnan Fuxian Lake Reg. Art. 28',
    },
    {
        id: 'bloom_wax',
        name: 'Grade A Premium Quality & Wax Bloom Retention',
        nameZh: '特级果硬度与果粉完整度标准',
        detail: 'Hema Fresh KA QA standard: fruit diameter >= 18mm, hardness 3.8 kg/cm2, white-glove wax preservation rate 96.8% (standard >= 95%).',
        detailZh: '盒马鲜生 KA 级品质验货标准：果径>=18mm、硬度 3.8 kg/cm²、白手套采收果粉完整度达 96.8% (验货基准>=95%)，全票通关。',
        status: 'pass',
        standard: 'Hema Fresh Fresh-Produce QA v4.2',
    },
];

// Comprehensive 7-Stage Audit Trail for Case BB-2026-HM01
const REPORT_SECTIONS = [
    {
        id: 'ingestion',
        title: '1. Multimodal Telemetry Ingestion Audit',
        titleZh: '1. 多模态遥测感知接入审计',
        icon: 'perception',
        timestamp: '2026-03-04T05:00:12+08:00',
        content: [
            {
                label: 'IoT Sensors Ingested',
                labelZh: 'IoT 传感网络接入量',
                value: '48 sensors across Zone A/B/C x 288 readings/day = 13,824 points',
                valueZh: '覆盖 A/B/C 三区 48 路智能传感器 x 288 次/日 = 13,824 条遥测数据',
            },
            {
                label: 'Smart Trap Telemetry',
                labelZh: '智能诱捕哨兵点位',
                value: 'TRAP-S01 to TRAP-S06 reporting (TRAP-S02 alert: 18 thrips/plate in LOT-03)',
                valueZh: 'TRAP-S01 至 S06 实时联网 (TRAP-S02 于 LOT-03 捕获 18 只蓟马/板，越过警戒阈值)',
            },
            {
                label: 'Multimodal Imagery',
                labelZh: '多模态无人机与近红外影像',
                value: 'DJI T50 multispectral + NIR sugar-acid optical sorting bench (6 spectrum bands)',
                valueZh: '大疆 T50 多光谱巡检 + 近红外在线糖酸无损检测台 (6 遥感波段联动比对)',
            },
            {
                label: 'Weather Microclimate Feed',
                labelZh: '抚仙湖微气象预报源',
                value: '3 localized meteorology stations + 48h gust velocity forecast model',
                valueZh: '3 座园区微气象站 + 48 小时抚仙湖午后阵风风速高精度数值预报',
            },
        ],
    },
    {
        id: 'risk',
        title: '2. Multi-Factor Risk Assessment & Conflict Arbitration',
        titleZh: '2. 多维风险研判与决策冲突仲裁',
        icon: 'alert-triangle',
        timestamp: '2026-03-04T05:02:14+08:00',
        content: [
            {
                label: 'Core Conflict Identified',
                labelZh: '核心冲突研判',
                value: 'LOT-03 thrips outbreak vs. Hema 750kg order delivery window (14h)',
                valueZh: 'LOT-03 蓟马局部爆发 vs 盒马 750kg 特级订单采收时效 (仅距 14 小时)',
            },
            {
                label: 'Biological vs Chemical PHI',
                labelZh: '生物与化学安全间隔期',
                value: 'Conventional spray requires 72h PHI. Spraying LOT-03 creates -58h statutory breach.',
                valueZh: '常规化学喷洒需严格执行 72h PHI，此时若全量喷药将导致 -58 小时法定违规倒挂。',
            },
            {
                label: 'Financial Exposure Avoided',
                labelZh: '阻断违约索赔敞口',
                value: 'CNY 48,750 direct contract value + CNY 150,000 KA penalty clause avoided',
                valueZh: '成功阻断 CNY 48,750 订单直接货值拒收及潜在 CNY 150,000 KA 惩罚性索赔',
            },
            {
                label: 'A08 Legal Gate Action',
                labelZh: 'A08 法规合规裁决动作',
                value: 'Absolute VETO issued against Plan A (Conventional Spray Harvest)',
                valueZh: '对【方案 A：常规喷药后采收】行使法定一票否决权 (VETO)',
            },
        ],
    },
    {
        id: 'prescription',
        title: '3. Multi-Agent Prescription Room Debate & Approval',
        titleZh: '3. 14 智能体博弈仲裁与处方生成记录',
        icon: 'prescription',
        timestamp: '2026-03-04T05:04:16+08:00',
        content: [
            { label: 'Prescription ID', labelZh: '批准处方工单号', value: 'RX-20260304-B3-HM01', valueZh: 'RX-20260304-B3-HM01' },
            {
                label: 'Approved Winning Strategy',
                labelZh: '仲裁胜出方案',
                value: 'Plan B: North Greenhouse Dawn Harvest + LOT-03 Physical Isolation + Plan C CA Buffer',
                valueZh: '方案 B：北区日光温室拂晓抢收 + LOT-03 物理隔离 + 气调保鲜库调峰缓冲 (方案 C 备份)',
            },
            {
                label: 'Agent Consensus Score',
                labelZh: '智能体协同共识度',
                value: '98.4% consensus across 14 specialized functional agent domains',
                valueZh: '14 业务领域智能体经过 3 轮博弈，达成 98.4% 加权共识评分',
            },
            {
                label: 'Economic Return',
                labelZh: '经济效益测算',
                value: 'Protected Revenue: CNY 48,750 | Net Margin: 93.9% | Zero Chemical Residue',
                valueZh: '保全销售额：¥48,750 ｜ 净毛利率：93.9% ｜ 全批次农残零超标',
            },
        ],
    },
    {
        id: 'approval',
        title: '4. Executive Authorization & Safety Gate Clearance',
        titleZh: '4. 执行授权与法定安全门禁联锁签署',
        icon: 'lock',
        timestamp: '2026-03-04T05:05:18+08:00',
        content: [
            {
                label: 'Authorization Mode',
                labelZh: '系统授权模式',
                value: 'Level 3+ Closed-Loop Semi-Autonomous Release (L3+ 自治放行)',
                valueZh: 'Level 3+ 条件自适应放行（全部 7 项安全门禁 100% PASS，触发自治签发）',
            },
            { label: 'Authorized Lead', labelZh: '签发负责主体', value: 'A01 运营管理 联合 A08 法规合规 电子验印', valueZh: 'A01 运营管理 联合 A08 法规合规 电子验印' },
            { label: 'Authorization Latency', labelZh: '授权时延', value: '42 seconds (System SLA < 60s)', valueZh: '42 秒（系统标准 SLA < 60 秒）' },
            { label: 'Regulatory Conclusion', labelZh: '门禁放行结论', value: 'PASSED (7/7 Rigid Statutory Safety Gates)', valueZh: '全票通过（7/7 项法定安全门禁全绿标）' },
        ],
    },
    {
        id: 'execution',
        title: '5. Multi-Actor Orchestrated Execution Record',
        titleZh: '5. 多主体协同现场派发执行记录',
        icon: 'play',
        timestamp: '2026-03-04T05:06:00+08:00',
        content: [
            {
                label: 'Work Orders Dispatched',
                labelZh: '派发联动工单',
                value: 'WO-B-01 (Harvest) | WO-B-02 (Drone Bio) | WO-B-03 (CA Cooling) | WO-B-04 (SF Transit)',
                valueZh: 'WO-B-01 (人工采收) ｜ WO-B-02 (无人机生防) ｜ WO-B-03 (气调打冷) ｜ WO-B-04 (冷链专车)',
            },
            {
                label: 'Field Crew Deployment',
                labelZh: '在岗人力班组',
                value: '38 skilled harvest crew in Zone A (White-glove harvest, wax retention 96.8%)',
                valueZh: 'A区智能温室 38 名专业技工班组（白手套采摘，保全 96.8% 坚挺天然果粉）',
            },
            {
                label: 'Drone Biological Spray',
                labelZh: '无人机生物防控',
                value: 'DJI T50 applied 0.5% Matrine + Neoseiulus predatory mites on isolated LOT-03',
                valueZh: '大疆 T50 针对 LOT-03 隔离区实施 0.5% 苦参碱水剂 + 加州新小绥螨靶向定点释放',
            },
            {
                label: 'Cold Storage Step-Cooling',
                labelZh: '气调预冷梯级降温',
                value: 'No. 1 Precooling Slot reduced core temperature to 1.5 C within 110 minutes',
                valueZh: '集中气调库 1号预冷槽在 110 分钟内完成果心温梯级下探至 1.5°C 稳态',
            },
        ],
    },
    {
        id: 'verification',
        title: '6. Post-Harvest Laboratory & Traceability Verification',
        titleZh: '6. 采后质检实验室与溯源链核验',
        icon: 'check',
        timestamp: '2026-03-04T09:35:00+08:00',
        content: [
            {
                label: 'Gas Chromatography Test',
                labelZh: '气相色谱农残质检',
                value: 'Spinetoram: 0.000 mg/kg | Chlorpyrifos: 0.000 mg/kg (100% Statutory Clearance)',
                valueZh: '乙基多杀菌素：0.000 mg/kg ｜ 毒死蜱：0.000 mg/kg (未检出，100% 法定达标)',
            },
            {
                label: 'NIR Sugar/Acid Optical Sorting',
                labelZh: '近红外光电糖酸分选',
                value: 'Avg Brix: 14.8% | Acid: 0.52% | Hardness: 3.8 kg/cm2 | 18mm+ Grade A: 96.4%',
                valueZh: '平均糖度：14.8 Brix ｜ 可滴定酸：0.52% ｜ 硬度：3.8 kg/cm² ｜ 18mm+ 特级率：96.4%',
            },
            {
                label: 'Transit Telemetry Status',
                labelZh: '冷链车厢在途遥测',
                value: 'Yun-A F7892: temp 1.5 C steady, RH 90%, GPS en-route to Kunming Chenggong Hub',
                valueZh: '云A·F7892 顺丰冷藏集卡：温控 1.5°C 稳态、RH 90%、已驶入昆明呈贡盒马生鲜大仓',
            },
            {
                label: 'GS1-128 Traceability Barcode',
                labelZh: 'GS1-128 批次数字防伪溯源码',
                value: '(01)06972841029381(10)LOT-20260304-B02(21)SN-900MU-HM750',
                valueZh: '(01)06972841029381(10)LOT-20260304-B02(21)SN-900MU-HM750',
            },
        ],
    },
    {
        id: 'evaluation',
        title: '7. AI System Review & Continuous Model Evolution',
        titleZh: '7. 系统复盘演进与算法知识沉淀',
        icon: 'reasoning',
        timestamp: '2026-03-04T10:00:00+08:00',
        content: [
            {
                label: 'System Response Latency',
                labelZh: '全流程处置时延',
                value: 'End-to-end closed-loop achieved in 18 minutes (vs 4.5 hours manual protocol)',
                valueZh: '从感知告警、处方决策至现场工单派发全程仅用时 18 分钟 (相比人工传统缩短 93%)',
            },
            {
                label: 'Economic Return Multiple',
                labelZh: '系统单日投资回报',
                value: 'System operational cost ¥3,400 vs Protected value ¥48,750 = 14.3x ROI',
                valueZh: '单次自治算力及调度成本 ¥3,400 对应挽回直接损失 ¥48,750，系统 ROI 达 14.3 倍',
            },
            {
                label: 'Continuous Model Retraining',
                labelZh: '模型知识图谱沉淀',
                value: 'Case appended to Sentinel Agri-Ontology Knowledge Graph (Sample #847,109)',
                valueZh: '完整决策博弈链条作为金标正样本沉淀至 Sentinel 农业知识图谱 (#847,109号样本)',
            },
            {
                label: 'Next Action Recommendation',
                labelZh: '后续作业排程建议',
                value: 'Keep TRAP-S02 under 2h high-frequency scan; monitor afternoon convective gusts',
                valueZh: '对 LOT-03 TRAP-S02 维持 2 小时高频诱捕复测；午后 14:00 准时触发全园天窗联动自锁',
            },
        ],
    },
];

// Audit trail notarization timeline
const DECISION_TRAIL = [
    {
        timestamp: '05:00:12',
        event: 'TRAP-S02 anomaly: thrips count exceeded 14/plate threshold in LOT-03',
        eventZh: 'TRAP-S02 传感器告警：LOT-03 蓟马捕获数超 14只/板警戒线',
        actor: 'A03 遥测感知',
        actorZh: 'A03 遥测感知',
        hash: '0x7f3a..c1e2',
    },
    {
        timestamp: '05:02:14',
        event: 'Risk assessment initiated - 72h PHI conflict with Hema 14h harvest window',
        eventZh: '风险研判触发：常规药剂 72h PHI 与盒马 14h 采收窗口发生刚性时间倒挂',
        actor: 'A02 植保病理',
        actorZh: 'A02 植保病理',
        hash: '0x8d2b..f4a1',
    },
    {
        timestamp: '05:03:00',
        event: 'Plan A (Conventional Spray) vetoed due to GB 2763 statutory non-compliance',
        eventZh: '方案 A (常规化学喷洒) 因违反 GB 2763 法定门禁被刚性一票否决 (VETO)',
        actor: 'A08 法规合规',
        actorZh: 'A08 法规合规',
        hash: '0x91c3..d5b7',
    },
    {
        timestamp: '05:04:16',
        event: 'Prescription Plan B selected with 98.4% multi-agent consensus',
        eventZh: '方案 B (北区温室早采+生物防控) 获 14 智能体 98.4% 共识高分通过',
        actor: 'A14 算法模型',
        actorZh: 'A14 算法模型',
        hash: '0xa4e5..e8c3',
    },
    {
        timestamp: '05:05:18',
        event: '7/7 Rigid Statutory Gates verified - L3+ Semi-Autonomous release authorized',
        eventZh: '7/7 项法定安全门禁全票 PASS - 签署 L3+ 自治放行指令',
        actor: 'A01 运营管理',
        actorZh: 'A01 运营管理',
        hash: '0xb2f1..09a4',
    },
    {
        timestamp: '05:06:00',
        event: 'Work orders WO-B-01 to WO-B-04 dispatched to field crews and IoT bus',
        eventZh: '现场联动工单 WO-B-01~B-04 下发至采收班组、大疆无人机及气调中控',
        actor: 'A12 采收调度',
        actorZh: 'A12 采收调度',
        hash: '0xc3d2..3b71',
    },
    {
        timestamp: '09:30:00',
        event: 'Lab MRL test: 0.000 mg/kg ND - GS1-128 immutable digital notary hash minted',
        eventZh: '化验室实测药残 0.000 mg/kg 未检出 - 铸造 GS1-128 不可篡改溯源存证',
        actor: 'A05 品质追溯',
        actorZh: 'A05 品质追溯',
        hash: '0xd4e3..6a82',
    },
];

export default function AuditReport() {
    const { locale } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';

    const [activeTab, setActiveTab] = useState('sections');
    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div className="page">
            <PipelineBreadcrumb />

            {/* Header */}
            <div className="page-header" style={{ marginBottom: 16 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="audit" size={22} color="#10b981" />
                        {t('Statutory Audit & Blockchain Traceability Center', '法定审计与不可篡改数字存证中心')}
                    </h1>
                    <p className="page-subtitle">
                        {t('Stage 6: Autonomous Audit Trail · Yunnan Chengjiang 900-Mu Modern Agriculture Base', '阶段 6：自治审计追踪与司法存证 · 云南澄江 900 亩现代农业产业园 · 12 大重点企业直供订单合规总台账')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {t('Merkle Root:', '存证根哈希：')} <code style={{ color: '#00e5a3' }}>0x9e8a..3f1d</code>
                    </span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => window.print()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <Icon name="printer" size={14} />
                        {t('Print Certificate', '打印出库合规存证函')}
                    </button>
                </div>
            </div>

            {/* Top 4 Hero Audit Metrics */}
            <div className="grid grid-4" style={{ gap: 12, marginBottom: 16 }}>
                <MetricCard
                    label={t('Statutory Gate Pass Rate', '法定安全门禁通过率')}
                    value="100% PASS"
                    subtitle={t('7/7 Rigid Gates Verified · Zero Risk', '7/7 项法定刚性门禁联锁通过')}
                    status="low"
                    icon="shield"
                />
                <MetricCard
                    label={t('Chemical MRL Compliance', '农残最高残留 (MRL) 检出')}
                    value="0.000 mg/kg"
                    subtitle={t('Statutory limit 0.01 mg/kg · ND Passed', '法定限值 0.01 mg/kg · 实际未检出')}
                    status="low"
                    icon="check-circle"
                />
                <MetricCard
                    label={t('Focal Order SLA Protection', '焦点订单履约保全额')}
                    value="¥48,750"
                    subtitle={t('Hema 750kg Grade A · 96.8% Wax Intact', '盒马 750kg 特级单 · 96.8% 天然果粉')}
                    status="low"
                    icon="dollar"
                />
                <MetricCard
                    label={t('Enterprise Orders Audited', '全园企业直供订单合规率')}
                    value="12 / 12 批"
                    subtitle={t('12,450 kg Dispatched · Zero Violations', '12,450 kg 出库 · 100% 绿通免检')}
                    status="low"
                    icon="award"
                />
            </div>

            {/* Official Notary Certificate Banner (GS1-128 Digital Certificate) */}
            <div className="card" style={{
                marginBottom: 16,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.8) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderLeft: '4px solid #10b981',
                padding: '16px 20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                                {t('GS1-128 Certificate of Agricultural Product Quality & Chemical Safety Notarization', '国家农产品质量安全合规与农残免检数字出库公证书')}
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700 }}>
                                存证编号 CERT-2026-HM01-B
                            </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: 8, lineHeight: 1.6 }}>
                            本出库批次对应 <strong>盒马鲜生 (中国) 有限公司</strong> 750kg 特级蓝莓采购订单（工单号：<code>WO-B3-2026-001</code>）。全流程经过 Sentinel 自治运营中枢多模态研判，实施【方案 B：北区日光温室拂晓采收】。已刚性阻断 LOT-03 蓟马施药批次，经气相色谱抽检确认有效成分乙基多杀菌素未检出 (0.000 mg/kg)，符合 GB 2763-2021 法定最高限量。
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 10, fontSize: '0.72rem', color: '#94a3b8' }}>
                            <span><strong>数字防伪溯源码：</strong><code style={{ color: '#38bdf8' }}>(01)06972841029381(10)LOT-20260304-B02(21)SN-900MU-HM750</code></span>
                            <span><strong>联合电子签名：</strong><code style={{ color: '#34d399' }}>A08 法规合规 [ED25519: 9F2A..84B1]</code> | <code style={{ color: '#38bdf8' }}>A05 品质追溯 [ED25519: 3D1C..77E0]</code></span>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(15,23,42,0.6)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid rgba(148,163,184,0.2)',
                        textAlign: 'center',
                        minWidth: 160
                    }}>
                        <Icon name="check-circle" size={28} color="#10b981" />
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                            司法存证验真通过
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                            7/7 法定门禁闭锁联保
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs for Audit Views */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                    { id: 'checks', label: t('7/7 Legal Safety Gates', '7/7 法定安全门禁闭环检验'), icon: 'shield' },
                    { id: 'sections', label: t('7-Stage Full Lifecycle Audit Trail', '7 阶段全流程证据链报告'), icon: 'layers' },
                    { id: 'ledger', label: t('12 Enterprise Orders Audit Ledger', '12 批企业直供订单合规台账'), icon: 'file-text' },
                    { id: 'blockchain', label: t('Immutable Notary Hash Timeline', '时间戳不可篡改溯源链'), icon: 'clock' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                    >
                        <Icon name={tab.icon} size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: 7/7 Legal Safety Gates */}
            {activeTab === 'checks' && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 className="card-title" style={{ margin: 0 }}>
                            {t('7/7 Rigid Legal & Environmental Safety Gate Inspections', '7/7 项法定安全与生态红线刚性门禁检验明细')}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                            100% COMPLIANT · ALL GATES PASS
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {PRE_AUDIT_CHECKS.map(gate => (
                            <div
                                key={gate.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    borderRadius: 6,
                                    background: 'rgba(15,23,42,0.4)',
                                    border: '1px solid rgba(148,163,184,0.12)',
                                    gap: 16
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'rgba(16,185,129,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Icon name="check" size={16} color="#10b981" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>
                                            {isZh ? gate.nameZh : gate.name}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                                            {isZh ? gate.detailZh : gate.detail}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', minWidth: 120 }}>
                                    <span style={{
                                        padding: '3px 8px',
                                        borderRadius: 4,
                                        background: 'rgba(16,185,129,0.15)',
                                        color: '#34d399',
                                        fontSize: '0.72rem',
                                        fontWeight: 800
                                    }}>
                                        PASS
                                    </span>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>
                                        {gate.standard}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: 7-Stage Full Lifecycle Audit Trail */}
            {activeTab === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                    {REPORT_SECTIONS.map(sec => (
                        <div key={sec.id} className="card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid rgba(148,163,184,0.1)', paddingBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Icon name={sec.icon} size={18} color="#38bdf8" />
                                    <h3 className="card-title" style={{ margin: 0, fontSize: '0.92rem' }}>
                                        {isZh ? sec.titleZh : sec.title}
                                    </h3>
                                </div>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                                    {new Date(sec.timestamp).toLocaleTimeString(localeTag(locale))}
                                </span>
                            </div>

                            <div className="grid grid-2" style={{ gap: 10 }}>
                                {sec.content.map((item, idx) => (
                                    <div key={idx} style={{
                                        padding: '8px 12px',
                                        background: 'rgba(15,23,42,0.4)',
                                        borderRadius: 6,
                                        border: '1px solid rgba(148,163,184,0.08)'
                                    }}>
                                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                            {isZh ? item.labelZh : item.label}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginTop: 2 }}>
                                            {isZh ? item.valueZh : item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 3: 12 Enterprise Orders Audit Ledger */}
            {activeTab === 'ledger' && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Icon name="file-text" size={18} color="#38bdf8" />
                            <h3 className="card-title" style={{ margin: 0 }}>
                                {t('900-Mu Facility: 12 Enterprise Orders Daily Compliance & Traceability Ledger', '云南澄江 900 亩基地 12 批重点企业直供订单每日合规溯源总台账')}
                            </h3>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {t('All 12 orders 100% verified against GB 2763-2021 standards', '全部 12 批订单 100% 通过 GB 2763-2021 法定质检')}
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.15)', background: 'rgba(15,23,42,0.6)', color: '#94a3b8' }}>
                                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Order / Client', '订单编号 / 采购方')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('Specs & Quantity', '规格 / 交付量')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('GS1 Barcode Hash', 'GS1-128 数字溯源码')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('MRL Lab Result', '气相色谱药残实测')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>{t('PHI Safety Status', 'PHI 采前间隔状态')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>{t('7/7 Gates', '法定门禁')}</th>
                                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>{t('Action', '操作')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ENTERPRISE_ORDERS.map(order => (
                                    <tr
                                        key={order.id}
                                        style={{
                                            borderBottom: '1px solid rgba(148,163,184,0.08)',
                                            background: order.id === 'BB-2026-HM01' ? 'rgba(0, 229, 163, 0.05)' : 'transparent',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{order.id}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>{isZh ? order.clientZh : order.client}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{order.quantityKg?.toLocaleString()} kg</div>
                                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{isZh ? order.gradeZh : order.grade}</div>
                                        </td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#a78bfa', fontSize: '0.7rem' }}>
                                            {order.id === 'BB-2026-HM01' ? '(01)06972841029381(10)...' : `(01)06972841${order.id.slice(-4)}...`}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ color: '#34d399', fontWeight: 700 }}>0.000 mg/kg</span>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>未检出 (ND)</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ color: '#38bdf8' }}>0天 PHI 风险</span>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>未施药批次放行</div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 800, fontSize: '0.68rem' }}>
                                                PASS 7/7
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    border: '1px solid rgba(56,189,248,0.4)',
                                                    background: 'rgba(56,189,248,0.1)',
                                                    color: '#38bdf8',
                                                    fontSize: '0.68rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {t('View Dossier', '查阅存证')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: Immutable Notary Hash Timeline */}
            {activeTab === 'blockchain' && (
                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h3 className="card-title" style={{ margin: 0 }}>
                            {t('Cryptographic Merkle Proof & SHA-256 Decision Log', '密码学 Merkle 证明与 SHA-256 不可篡改决策证据链')}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontFamily: 'monospace' }}>
                            Merkle Root: 0x9e8a7c2b5d4e1f8a
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {DECISION_TRAIL.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 14px',
                                    borderRadius: 6,
                                    background: 'rgba(15,23,42,0.4)',
                                    border: '1px solid rgba(148,163,184,0.08)',
                                    fontSize: '0.74rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.timestamp}</span>
                                    <span style={{ color: '#cbd5e1' }}>{isZh ? item.eventZh : item.event}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        background: 'rgba(56,189,248,0.12)',
                                        color: '#38bdf8',
                                        fontSize: '0.68rem'
                                    }}>
                                        {isZh ? item.actorZh : item.actor}
                                    </span>
                                    <code style={{ color: '#00e5a3', fontSize: '0.7rem' }}>{item.hash}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom ML Feedback & Model Continuous Evaluation */}
            <MLFeedbackPanel />

            {/* Global Order Dossier Modal */}
            <OrderDossierModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                locale={locale}
            />
        </div>
    );
}
