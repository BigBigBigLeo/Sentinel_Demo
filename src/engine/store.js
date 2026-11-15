// Sentinel Decision OS 閳?Zustand Global Store v2
// Central state management for all modules

import { create } from 'zustand';
import { generate60DayData, getSnapshot } from './simulationEngine.js';
import { assessRisks, generatePrescription, calculateRevenueAtRisk } from './decisionEngine.js';
import { executePresciption } from './executionEngine.js';
import { generateAuditRecord } from './auditEngine.js';
import { SCENARIOS, ALL_SCENARIOS, FLAGSHIP_SCENARIOS_7 } from './scenarioEngine.js';
import { generateRiskThinkingChain, generatePrescriptionThinkingChain, generateExecutionThinkingChain, generateAuditThinkingChain } from './thinkingEngine.js';
import thresholds from '../data/thresholds.js';
import { normalizeLocale } from '../i18n/locale.js';

const DEFAULT_THRESHOLDS = JSON.parse(JSON.stringify(thresholds));

// 900-mu Chengjiang Super Agricultural Factory Ontology & Fields
const FIELDS = {
    'BS-B3': {
        id: 'BS-B3',
        name: 'Blueberry Zone B3 (Baseline Plot)',
        nameZh: 'BS-区B3号园 (基线田块)',
        zone: 'zone-b',
        crop: 'blueberry',
        variety: '开普-A',
        area_mu: 12,
        gradeClass: 'A',
        estimatedVolume: 3600,
    },
    'YN-A2': {
        id: 'YN-A2',
        name: 'Greenhouse A2 (Rose)',
        nameZh: 'YN-温室A2',
        zone: 'zone-a',
        crop: 'flower',
        area_mu: 5,
        gradeClass: 'A',
        estimatedVolume: 15000,
    },
    'ZONE-A': {
        id: 'ZONE-A',
        name: 'Zone A: Smart Continuous Greenhouse (350 mu)',
        nameZh: 'A区 智能高架连栋温室 (350亩)',
        zone: 'zone-a',
        crop: 'blueberry',
        variety: '华香 (早熟特级果)',
        area_mu: 350,
        gradeClass: 'AAA',
        targetMarket: '盒马/Ole\'特级直供',
        plots: ['LOT-A01', 'LOT-A02', 'LOT-A03', 'LOT-A04', 'LOT-A05'],
        estimatedVolume: 420000,
    },
    'ZONE-B': {
        id: 'ZONE-B',
        name: 'Zone B: Dual-Film Rain Shelter Greenhouse (400 mu)',
        nameZh: 'B区 双膜避雨保暖大棚 (400亩)',
        zone: 'zone-b',
        crop: 'blueberry',
        variety: '开普-A / 优瑞卡',
        area_mu: 400,
        gradeClass: 'A',
        targetMarket: '山姆会员店/百果园包销',
        plots: ['LOT-B01', 'LOT-B02', 'LOT-B03', 'LOT-B04', 'LOT-B05', 'LOT-B06'],
        estimatedVolume: 560000,
    },
    'ZONE-C': {
        id: 'ZONE-C',
        name: 'Zone C: CA Storage & Logistics Center (150 mu)',
        nameZh: 'C区 气调保鲜与深加工物流中心 (150亩)',
        zone: 'zone-c',
        crop: 'blueberry',
        area_mu: 150,
        gradeClass: 'A/B',
        staticCapacityTonnes: 300,
        rooms: ['CA_ROOM_01', 'CA_ROOM_02'],
        estimatedVolume: 220000,
    },
};

const AUTO_AGENT_ROSTER = [
    { id: 'A01', name: 'Operations Management', nameZh: '运营管理', role: 'manager', stream: 'decision', perspective: 'operations', traits: 'SLA control, escalation & decision card orchestration', traitsZh: 'SLA 管控与全局决策编排', activeTask: 'Orchestrating Hema 750kg fulfillment', activeTaskZh: '编排盒马750kg交付全闭环工单' },
    { id: 'A02', name: 'Field Agronomy', nameZh: '田间农艺', role: 'agronomist', stream: 'analysis', perspective: 'agronomy', traits: 'Canopy growth, phenology & fruit expansion', traitsZh: '田间物候研判与果径膨大监测', activeTask: 'Fitting phenology & Brix across 32 zones', activeTaskZh: '全园32地块物候与糖度拟合中' },
    { id: 'A03', name: 'Greenhouse Agronomy', nameZh: '设施温室', role: 'agronomist', stream: 'analysis', perspective: 'agronomy', traits: 'Protected microclimate & bloom wax preservation', traitsZh: '设施微环境 VPD 与果粉保全', activeTask: 'Aligning dawn RH & VPD in North solar greenhouse', activeTaskZh: '北区日光温室拂晓采收温湿度对齐' },
    { id: 'A04', name: 'Crop Protection', nameZh: '植保病理', role: 'chemist', stream: 'decision', perspective: 'agronomy', traits: 'Pathogen kinetics, MoA rotation & biocontrol', traitsZh: '侵染动力学、机制轮换与生防', activeTask: 'Monitoring Botrytis & thrips in LOT-03', activeTaskZh: 'LOT-03 灰霉病与西花蓟马抗性监测' },
    { id: 'A05', name: 'Quality & Traceability', nameZh: '品质追溯', role: 'sales', stream: 'analysis', perspective: 'sales_quality', traits: 'Fruit grade prediction, batch release & traceability', traitsZh: '商品果分级预测、批次放行与溯源', activeTask: 'Verifying NIR Brix 13.8° & bloom 96.8%', activeTaskZh: '近红外糖度 13.8° 与果粉 96.8% 核验' },
    { id: 'A06', name: 'Sales & Fulfillment', nameZh: '销售履约', role: 'sales', stream: 'analysis', perspective: 'sales_quality', traits: 'Annual contracts allocation & delivery SLA schedule', traitsZh: '48 份长协配额排产与交期对齐', activeTask: 'Scheduling 12 KA contracts with harvest batches', activeTaskZh: '盒马/山姆/Ole 12大订单排产对齐' },
    { id: 'A07', name: 'Finance & Margin', nameZh: '财务核算', role: 'finance', stream: 'audit', perspective: 'finance', traits: 'Incremental net margin actuary & penalty exposure', traitsZh: '边际净贡献精算与违约金测算', activeTask: 'Auditing Plan B marginal net margin +¥48,750', activeTaskZh: '方案B边际净利 +¥48,750 精算审核' },
    { id: 'A08', name: 'Regulatory & Compliance', nameZh: '法规合规', role: 'compliance', stream: 'audit', perspective: 'compliance', traits: 'GB 2763 MRL & 72h PHI rigid veto gate', traitsZh: 'GB 2763 农残安全期间隔刚性否决', activeTask: 'Locking 72h PHI gate under GB 2763 standard', activeTaskZh: 'GB 2763 农残安全期间隔 72h 电子锁闭' },
    { id: 'A09', name: 'Safety & Disaster Prevention', nameZh: '安全防灾', role: 'safety', stream: 'watchdog', perspective: 'safety', traits: 'Heat safety limits, gale interlocks & drone safety', traitsZh: '高温防暑禁令与大风天窗自锁', activeTask: 'Interlocking WBGT heat index & gale radar', activeTaskZh: 'WBGT 高温防暑与午后强对流大风联锁' },
    { id: 'A10', name: 'Climate Automation', nameZh: '环境自控', role: 'controller', stream: 'execution', perspective: 'operations', traits: 'Priva Modbus/TCP bus control & misting actuation', traitsZh: 'Priva 环控总线天窗与微喷自控', activeTask: 'Priva Modbus self-test & vent actuation', activeTaskZh: 'Priva 环控总线自检与天窗启闭控制' },
    { id: 'A11', name: 'Drone Operations', nameZh: '无人机作业', role: 'operator', stream: 'execution', perspective: 'operations', traits: 'DJI T40 RTK precision biocontrol flight lines', traitsZh: '大疆 T40 RTK 超微量生防航线', activeTask: 'DJI T40 RTK waypoint standby & airspace patrol', activeTaskZh: '大疆 T40 RTK 航线待命与空域巡航' },
    { id: 'A12', name: 'Harvest Dispatch', nameZh: '采收调度', role: 'operator', stream: 'execution', perspective: 'operations', traits: '120 picker crew dawn shifts & nitrile glove check', traitsZh: 'CREW-25 拂晓轻柔采收与手套质检', activeTask: 'Dispatching CREW-25 white-glove dawn harvest', activeTaskZh: 'CREW-25 白手套黎明采摘队任务下发' },
    { id: 'A13', name: 'Telemetry & Sensing', nameZh: '遥测感知', role: 'retriever', stream: 'perception', perspective: 'data', traits: 'Multimodal sensor fusion, telemetry interpolation & QC', traitsZh: '32 地块时序遥测清洗与质检', activeTask: 'Polling 32 weather stations & optical spore traps', activeTaskZh: '32 微气象站与光学诱捕器实时轮询' },
    { id: 'A14', name: 'Algorithms & Learning', nameZh: '算法模型', role: 'learning', stream: 'analysis', perspective: 'data', traits: 'Continuous model training, drift check & causal audit', traitsZh: '离线决策偏差回测与因果校验', activeTask: 'Updating causal neural surrogate model on edge', activeTaskZh: '轻量化因果推理神经网络在线更新' },
];

const AUTO_TASKS = {
    ingest: { id: 'ingest', label: 'Data Ingestion', labelZh: '数据接入', roles: ['retriever', 'controller', 'operator'] },
    analyze: { id: 'analyze', label: 'Multimodal Risk Reasoning', labelZh: '多模态风险推理', roles: ['agronomist', 'manager', 'sales', 'learning'] },
    compliance: { id: 'compliance', label: 'Compliance and Safety Gate', labelZh: '合规与安全闸门', roles: ['compliance', 'safety', 'chemist'] },
    prescribe: { id: 'prescribe', label: 'Prescription Planning', labelZh: '处方规划', roles: ['agronomist', 'chemist', 'manager'] },
    execute: { id: 'execute', label: 'Execution Orchestration', labelZh: '执行编排', roles: ['controller', 'operator', 'safety'] },
    audit: { id: 'audit', label: 'Audit and Reporting', labelZh: '审计与报告', roles: ['compliance', 'finance', 'manager'] },
    learn: { id: 'learn', label: 'Outcome Learning', labelZh: '结果学习', roles: ['learning', 'agronomist', 'finance'] },
    escalate: { id: 'escalate', label: 'Operator Escalation', labelZh: '人工升级处置', roles: ['manager', 'safety', 'compliance'] },
};

const ASSIGNMENT_LABEL_ZH = {
    lead: '主责',
    reviewer: '复核',
    executor: '执行',
};

const SCENARIO_ZH = {
    A: {
        descriptionZh: '花期湿度持续偏高触发灰霉病风险，且临近采收导致化学方案受 PHI 限制，系统自动切换生防回退方案。',
        primaryThreatZh: '灰霉病（Botrytis）',
    },
    B: {
        descriptionZh: '雨季温室湿度突增，人工迟延 6 小时导致部分花枝降级，演示“延迟执行”的真实成本。',
        primaryThreatZh: '灰霉病（Botrytis）',
    },
    C: {
        descriptionZh: '无人机执行剂量偏离处方，指纹不匹配触发审计追责，展示“可审计执行链路”。',
        primaryThreatZh: '炭疽病',
    },
    D: {
        descriptionZh: '先虫后病的级联风险叠加，系统采用阶段化复合策略进行跨主体协同处置。',
        primaryThreatZh: '多虫害级联风险',
    },
    E: {
        descriptionZh: '寒潮来袭前触发非化学三层防护，验证 Sentinel 的主动防御与应急协同能力。',
        primaryThreatZh: '霜冻风险',
    },
    F: {
        descriptionZh: '温室主风机故障叠加高湿，系统启动硬件故障应急协议并联动维修与作业资源。',
        primaryThreatZh: '硬件故障衍生病害风险',
    },
};

const localizeScenarioTextZh = (value) => {
    if (!value) return value;
    let text = String(value);
    const phraseMap = [
        ['Humidity Spike Detected', '检测到湿度突升'],
        ['Botrytis Risk Critical', '灰霉病风险升至高危'],
        ['Prescription Generated', '处方已生成'],
        ['Prescription Generated  - PHI Constraint Fires', '处方已生成｜触发 PHI 约束'],
        ['Biocontrol Execution', '生防执行'],
        ['48h Progress Check', '48 小时进展复核'],
        ['72h Verification  - Risk Drops', '72 小时验证｜风险回落'],
        ['Execution', '执行'],
        ['Verification', '验证'],
        ['Risk Assessment', '风险评估'],
        ['Decision Delay', '决策延迟'],
        ['No Action', '未执行动作'],
        ['Emergency', '应急'],
        ['Grade Downgrade', '等级降级'],
        ['Revenue impact', '营收影响'],
        ['Response time', '响应时长'],
        ['Relative humidity rises to', '相对湿度升至'],
        ['Leaf wetness duration reaches', '叶面湿润时长达到'],
        ['Overcast for 3 consecutive days', '连续阴天 3 天'],
        ['Spore index climbs to', '孢子指数升至'],
        ['System triggers risk assessment', '系统触发风险评估'],
        ['System generates fungicide Rx', '系统生成杀菌处方'],
        ['only 4d to harvest', '距采收仅 4 天'],
        ['System auto-falls back to biological control', '系统自动切换到生物防治回退方案'],
        ['Trichoderma harzianum released in target zone', '目标区域已释放哈茨木霉'],
        ['Ventilation increased to 85%', '通风已提升至 85%'],
        ['Execution fingerprint generated and matched', '执行指纹已生成并匹配'],
        ['Spore index declining', '孢子指数持续下降'],
        ['Humidity stabilized at', '湿度稳定在'],
        ['Risk score', '风险分值'],
        ['Grade A protected', 'A级品质已保护'],
        ['Revenue saved', '已保护收益'],
        ['lead action by', '主责动作｜'],
        ['reviewer action by', '复核动作｜'],
        ['executor action by', '执行动作｜'],
    ];
    phraseMap.forEach(([en, zh]) => {
        text = text.split(en).join(zh);
    });
    const tokenMap = [
        ['Humidity', '湿度'],
        ['Temperature', '温度'],
        ['Leaf Wetness', '叶面湿润'],
        ['Gray Mold', '灰霉病'],
        ['Botrytis', '灰霉病原'],
        ['Drone', '无人机'],
        ['Field Team', '田间团队'],
        ['IoT', 'IoT'],
        ['Mancozeb', '代森锰锌'],
        ['Trichoderma harzianum', '哈茨木霉'],
        ['PHI', 'PHI'],
        ['analysis', '分析'],
        ['decision', '决策'],
        ['execution', '执行'],
        ['audit', '审计'],
        ['watchdog', '看门狗'],
        ['Safety Officer', '安全防灾'],
        ['Control Engineer', '环境自控'],
        ['Field Operator', '采收调度'],
        ['Data Retriever', '遥测感知'],
        ['Remote Sensor Pilot', '遥测感知'],
        ['Drone Operator', '无人机作业'],
        ['Ops Manager', '运营管理'],
        ['Learning Engineer', '算法模型'],
        ['Compliance Officer', '法规合规'],
        ['Crop Chemist', '植保病理'],
        ['Field Agronomist', '田间农艺'],
        ['Greenhouse Agronomist', '设施温室'],
        ['Finance Analyst', '财务核算'],
        ['Sales Planner', '销售履约'],
    ];
    tokenMap.forEach(([en, zh]) => {
        text = text.replace(new RegExp(en, 'gi'), zh);
    });
    text = text.replace(/->/g, '→');
    return text;
};

export const AGENT_4D_ACTIONS = {
    A01: {
        ingest: { action: 'Verify 32-plot telemetry integrity & SLA time window', actionZh: '核查全场32地块遥测时序完整度与各客户SLA履约窗口', ruleId: 'RULE-SLA-ALIGN-01', conf: 0.99 },
        analyze: { action: 'Orchestrate multi-perspective debate on canopy disease vs harvest timing', actionZh: '编排农艺病害与采收时序跨专业多模态博弈推演', ruleId: 'RULE-ORCH-DEBATE-04', conf: 0.98 },
        compliance: { action: 'Evaluate operational SLA breach risk against safety gating constraints', actionZh: '对照刚性安全门禁评估订单交付SLA违约及索赔敞口', ruleId: 'RULE-SLA-GATE-02', conf: 0.97 },
        prescribe: { action: 'Assemble Multi-Criteria Decision Card for Plan A/B/C trade-off', actionZh: '统筹装配 A/B/C 方案多维度决策加权评估卡', ruleId: 'RULE-CARD-ASSEMBLY-01', conf: 0.99 },
        execute: { action: 'Issue coordinated dispatch order to Priva bus, DJI T40 and CREW-25', actionZh: '向 Priva 总线、大疆 T40 及 CREW-25 联合下发联锁协同工单', ruleId: 'RULE-DISPATCH-SYNC-01', conf: 0.98 },
        audit: { action: 'Sign off operational close-out ledger with SLA compliance score', actionZh: '会签作业闭环存证台账，评定各渠道订单 SLA 履约达标率', ruleId: 'RULE-AUDIT-SIGN-01', conf: 0.99 },
        learn: { action: 'Log decision outcome drift to calibrate cross-agent arbitration weights', actionZh: '记录决策收敛偏差与边际收益漂移，校准后续仲裁信任权重', ruleId: 'RULE-ARBITR-WEIGHT-02', conf: 0.96 },
        escalate: { action: 'Trigger Level-1 Emergency Escalation to Senior Farm Operations Director', actionZh: '触发一级紧急升级协议，推送决策卡至基地运营管理移动端审批', ruleId: 'RULE-ESCALATE-OPS-01', conf: 0.99 },
    },
    A02: {
        ingest: { action: 'Ingest open-field tensiometer, soil EC and canopy temperature feed', actionZh: '汇聚露地土壤张力计、EC及冠层红外温度多通道时序流', ruleId: 'RULE-SOIL-INGEST-02', conf: 0.97 },
        analyze: { action: 'Compute thermal accumulation (GDD) & phenological fruit expansion model', actionZh: '测算有效积温(GDD)与露地蓝莓物候生理膨大模型', ruleId: 'RULE-PHENOL-GDD-02', conf: 0.96 },
        prescribe: { action: 'Prescribe organic amino acid foliar biostimulant for fruit swelling', actionZh: '开具花后膨果期氨基酸多肽微量元素营养强化配方', ruleId: 'RULE-BIO-FOLIAR-01', conf: 0.95 },
        execute: { action: 'Calibrate variable-rate drip irrigation fertigation curve', actionZh: '标定水肥一体化变量滴灌施肥曲线与 EC 梯级下发', ruleId: 'RULE-DRIP-FERT-01', conf: 0.96 },
        audit: { action: 'Verify post-harvest canopy vigor & nutrient recovery indices', actionZh: '复核采后树势恢复指标与秋梢分化养分蓄积实测', ruleId: 'RULE-VIGOR-AUDIT-01', conf: 0.95 },
        learn: { action: 'Update chilling requirement (CR) model based on regional winter logs', actionZh: '根据历年实测需冷量(CR)动态修正露地品种破眠生理模型', ruleId: 'RULE-CHILL-MODEL-03', conf: 0.94 },
    },
    A03: {
        ingest: { action: 'Stream greenhouse VPD, PAR radiation and substrate moisture matrix', actionZh: '实时接入智能温室冠层 VPD、光合有效辐射(PAR)与基质水势矩阵', ruleId: 'RULE-GH-TELEMETRY-01', conf: 0.99 },
        analyze: { action: 'Evaluate canopy VPD microclimate & 95% bloom wax preservation index', actionZh: '评估冠层饱和气压差(VPD)与优质商品果95%果粉完整度指数', ruleId: 'RULE-VPD-WAX-03', conf: 0.98 },
        prescribe: { action: 'Prescribe high-roof ridge vent dehumidification to suppress Botrytis spores', actionZh: '制定大温室天窗微开启阶梯排湿方案以阻断灰霉病孢子萌发', ruleId: 'RULE-GREENHOUSE-VENT-02', conf: 0.97 },
        execute: { action: 'Modulate Priva climate screen shading & circulation fan speed', actionZh: '微调 Priva 内保温遮阳幕布开度与环流风机对流频率', ruleId: 'RULE-PRIVA-FAN-02', conf: 0.98 },
        audit: { action: 'Audit 24h thermal and humidity envelope variance inside Zone A', actionZh: '核定智能温室 A 区 24 小时温湿度包络线控制方差', ruleId: 'RULE-ENVELOPE-AUDIT-01', conf: 0.97 },
        learn: { action: 'Refine microclimate dynamic simulation parameters for rain-shelter tunnels', actionZh: '微调避雨大棚过渡季微气候多流体热力学仿真拟合参数', ruleId: 'RULE-TUNNEL-SIM-02', conf: 0.96 },
    },
    A04: {
        ingest: { action: 'Ingest optical spore-trap digital microscopy & sticky card imagery', actionZh: '接入高精光学孢子捕捉显微成像与智能黄板靶标虫情回传', ruleId: 'RULE-TRAP-INGEST-01', conf: 0.98 },
        analyze: { action: 'Model Botrytis cinerea & Frankliniella occidentalis infection kinetics', actionZh: '拟合灰霉病分生孢子萌发曲线与西花蓟马若虫激增动力学', ruleId: 'RULE-PATHOGEN-KINET-01', conf: 0.98 },
        compliance: { action: 'Audit IRAC/FRAC MoA rotation resistance limits for candidate actives', actionZh: '核定备选药剂 IRAC/FRAC 作用机理轮换抗性合规限度', ruleId: 'RULE-FRAC-ROTATION-03', conf: 0.99 },
        prescribe: { action: 'Formulate dual Bacillus subtilis + Trichoderma harzianum biocontrol mix', actionZh: '配制枯草芽孢杆菌与哈茨木霉菌超微量复合生物制剂处方', ruleId: 'RULE-BIOCONTROL-FORM-02', conf: 0.98 },
        audit: { action: 'Assess biocontrol microbial colonization rate & pest suppression delta', actionZh: '测算生防菌群叶表定殖率与蓟马虫口致死衰减增量', ruleId: 'RULE-SUPPRESS-DELTA-01', conf: 0.96 },
        learn: { action: 'Calibrate pathogen infection probability matrix under fluctuating RH', actionZh: '校准相对湿度高频波动工况下病原菌侵染概率传递矩阵', ruleId: 'RULE-RH-FLUCT-CALIB-01', conf: 0.97 },
    },
    A05: {
        ingest: { action: 'Verify NIR Brix spectrometer calibration & batch harvest lot metadata', actionZh: '核定近红外无损糖度光谱仪标定数据与待采批次批号元数据', ruleId: 'RULE-NIR-BRIX-QC-01', conf: 0.99 },
        analyze: { action: 'Predict grade distribution (18mm+ Premium vs 14-17mm Standard)', actionZh: '预测采收果径分布（特级果18mm+占比与优级果14-17mm占比）', ruleId: 'RULE-GRADE-DIST-02', conf: 0.97 },
        compliance: { action: 'Verify batch traceability integrity for export & premium supermarket SLAs', actionZh: '对照出口与高端商超标准核验采收批次全链条溯源档案链', ruleId: 'RULE-TRACE-BLOCK-01', conf: 0.99 },
        prescribe: { action: 'Specify soft-touch harvest criteria to guarantee ≥95% bloom integrity', actionZh: '设定轻柔采摘规程与预冷温控指标，确保蜡质果粉保留率≥95%', ruleId: 'RULE-WAX-HARVEST-01', conf: 0.98 },
        audit: { action: 'Generate GS1-128 digital lot certificate with SHA-256 fingerprint', actionZh: '生成含 SHA-256 哈希存证的 GS1-128 数字批次合格证与放行码', ruleId: 'RULE-GS1-LOT-HASH-01', conf: 0.99 },
        learn: { action: 'Correlate shelf-life decay with pre-harvest microclimate exposure', actionZh: '建立采前微环境应激暴露与采后货架期褐变软化因果关联模型', ruleId: 'RULE-SHELF-LIFE-CORR-01', conf: 0.96 },
    },
    A06: {
        ingest: { action: 'Synchronize 12-channel order pipeline & customer delivery SLAs', actionZh: '同步12大渠道客户订单履约排期、SLA规格与装车时效要求', ruleId: 'RULE-ERP-SYNC-01', conf: 0.99 },
        analyze: { action: 'Cross-reference 12 channel delivery schedules against yield forecast', actionZh: '比对12大重点渠道订单交付日程与各片区预测产出曲线', ruleId: 'RULE-SALES-SLA-03', conf: 0.97 },
        compliance: { action: 'Review customer contract penalty clauses for delivery delays', actionZh: '复核各渠道合同中延迟交付、果粉脱落与残次率的扣款违约条款', ruleId: 'RULE-PENALTY-CLAUSE-02', conf: 0.98 },
        prescribe: { action: 'Prioritize Cathay VIP & Sam\'s Club allocation to minimize delay penalties', actionZh: '排定国泰航空头等舱与山姆会员店优先供货配额以规避高额违约金', ruleId: 'RULE-ALLOC-PRIORITY-01', conf: 0.98 },
        audit: { action: 'Reconcile actual shipped tonnage with allocated contract quota', actionZh: '核对当日实际出货吨位与长协配额达成偏差，生成渠道交付报告', ruleId: 'RULE-RECONCILE-SHIP-01', conf: 0.99 },
        learn: { action: 'Optimize premium supermarket demand elasticity forecast models', actionZh: '基于季节促销与天气波动优化高端商超需求价格弹性预测', ruleId: 'RULE-DEMAND-ELAST-02', conf: 0.95 },
    },
    A07: {
        ingest: { action: 'Ingest daily agri-input wholesale rates, labor unit costs & spot prices', actionZh: '抓取当日农资批发价格指数、人工工时单价及产地现货交易牌价', ruleId: 'RULE-COST-FEED-01', conf: 0.99 },
        analyze: { action: 'Calculate net margin under yield degradation vs chemical input scenarios', actionZh: '精算果品降级损失、药剂投入成本与违约赔偿之综合净利润差', ruleId: 'RULE-FIN-MARGIN-04', conf: 0.98 },
        compliance: { action: 'Validate budget authorization thresholds for emergency agricultural inputs', actionZh: '校验应急植保物资与抢收用工采购的财务预算审批授权阈值', ruleId: 'RULE-BUDGET-AUTH-01', conf: 0.99 },
        prescribe: { action: 'Compute exact expected net margin formula for Plan A vs Plan B', actionZh: '套用期望边际净贡献公式对比 Plan A 生防与 Plan B 采前方案净收益', ruleId: 'RULE-NET-MARGIN-CALC-01', conf: 0.99 },
        audit: { action: 'Audit realized gross margin & input-cost ROI for executed prescription', actionZh: '复核已执行处方的单亩投入产出比与各订单毛利率达成实况', ruleId: 'RULE-ROI-AUDIT-02', conf: 0.99 },
        learn: { action: 'Feed cost-benefit actuals into automated economic trade-off engine', actionZh: '将实际损益数据回填至经济权衡引擎，动态修正各方案ROI置信度', ruleId: 'RULE-ROI-FEEDBACK-01', conf: 0.96 },
    },
    A08: {
        ingest: { action: 'Poll national food safety pesticide MRL database & export trade alerts', actionZh: '实时轮询国家食品安全 GB 2763 最大残留限量库与出口农残通报', ruleId: 'RULE-MRL-POLL-01', conf: 1.00 },
        analyze: { action: 'Simulate active ingredient degradation kinetics in blueberry peel', actionZh: '拟合氟啶虫胺腈与吡唑醚菌酯在蓝莓表皮的动态光解衰减半衰期', ruleId: 'RULE-DEGRADATION-KINET-02', conf: 0.99 },
        compliance: { action: 'Enforce rigid 72h Pre-Harvest Interval (PHI) veto gate per GB 2763', actionZh: '执行国标 GB 2763 农药安全间隔期 (72h PHI) 刚性一票否决门禁', ruleId: 'RULE-MRL-GB2763-VETO', conf: 1.00 },
        prescribe: { action: 'Mandate zero-residue organic biological agents for T-72h harvest zones', actionZh: '强制要求距离采收不足72小时地块必须采用零农残生物与天敌方案', ruleId: 'RULE-ZERO-RESIDUE-MANDATE', conf: 1.00 },
        audit: { action: 'Anchor chemical batch application records to cryptographic audit ledger', actionZh: '将农事投入品批次用药存证上链锚定，锁定不可篡改合规日志', ruleId: 'RULE-CRYPTO-LEDGER-01', conf: 1.00 },
        learn: { action: 'Update regional pesticide safety degradation curve based on lab HPLC tests', actionZh: '根据实验室 HPLC 高效液相色谱实测数据修正产地特异性降解曲线', ruleId: 'RULE-HPLC-CURVE-UPDATE', conf: 0.98 },
        escalate: { action: 'Block chemical authorization and notify Chief Quality Compliance Officer', actionZh: '拦截违规化学药剂签批，并触发 A08 法规合规违规熔断警报', ruleId: 'RULE-ESCALATE-COMPLIANCE', conf: 1.00 },
    },
    A09: {
        ingest: { action: 'Monitor real-time ultrasonic anemometers & wet-bulb globe temperature', actionZh: '监听高精超声波风速计阵风数据与工区湿球黑球温度(WBGT)热力监测', ruleId: 'RULE-WEATHER-SAFETY-01', conf: 0.99 },
        analyze: { action: 'Assess wind gust shear risk on greenhouse structure & drone stability', actionZh: '评估突发瞬时阵风对智能温室骨架剪切应力与无人机喷洒姿态扰动', ruleId: 'RULE-GUST-SHEAR-02', conf: 0.98 },
        compliance: { action: 'Check worker wet-bulb globe temperature & gust interlock protocols', actionZh: '核查作业人员湿球黑球温度(WBGT)热应激极限与阵风联锁规程', ruleId: 'RULE-SAFETY-WBGT-01', conf: 0.99 },
        prescribe: { action: 'Configure safety perimeter & automated roof vent retraction locks', actionZh: '制定作业空域半径50米安全警戒红线与温室天窗紧急防风自锁指令', ruleId: 'RULE-LOCK-VENT-01', conf: 0.99 },
        execute: { action: 'Deploy real-time geo-fencing & ground personnel clear warning', actionZh: '发布大疆 T40 无人机作业空域地理围栏与地表采摘人员撤离禁令', ruleId: 'RULE-GEOFENCE-CLEAR-01', conf: 0.99 },
        audit: { action: 'Verify zero incidents in worker heat-stress and equipment operating telemetry', actionZh: '核定防灾与避险全流程零事故记录，归档设备姿态遥测安全日志', ruleId: 'RULE-SAFETY-ZERO-INCIDENT', conf: 0.99 },
        learn: { action: 'Refine microclimate turbulence safety buffer margins around ridge vents', actionZh: '结合地形紊流风阻实测数据优化大棚天窗开度防风安全缓冲裕度', ruleId: 'RULE-TURB-MARGIN-02', conf: 0.96 },
        escalate: { action: 'Issue red wind alert and freeze all high-altitude & airborne operations', actionZh: '发布大风红色预警，即时冻结全场无人机作业与高空检修作业', ruleId: 'RULE-ESCALATE-SAFETY', conf: 1.00 },
    },
    A10: {
        ingest: { action: 'Poll Priva RS-485/Modbus-TCP bus registers for vent & pump states', actionZh: '高频轮询 Priva 环控主机 RS-485/Modbus-TCP 总线天窗与水泵寄存器', ruleId: 'RULE-PRIVA-POLL-01', conf: 0.99 },
        analyze: { action: 'Calculate air exchange rate (ACH) vs sensible heat dissipation velocity', actionZh: '换算温室自然通风换气率(ACH)与显热对流消解速率', ruleId: 'RULE-ACH-CALC-02', conf: 0.98 },
        compliance: { action: 'Verify electrical load limits before sequencing heavy axial fan banks', actionZh: '在启动大功率负压风机群组前核查变压器当前用电负荷安全冗余', ruleId: 'RULE-POWER-LOAD-01', conf: 0.99 },
        prescribe: { action: 'Sequence 3-stage roof vent opening & 40Hz variable frequency fan ramp', actionZh: '生成天窗三级阶梯开启与40Hz变频环流风机平滑加速调控时序', ruleId: 'RULE-VENT-RAMP-01', conf: 0.98 },
        execute: { action: 'Transmit Modbus/TCP command to Priva bus for top vent & fan staged ramp', actionZh: '向 Priva 总线发送 Modbus/TCP 指令阶梯开启顶窗与4组负压风机', ruleId: 'RULE-PRIVA-MODBUS-02', conf: 0.99 },
        audit: { action: 'Compare PLC execution telemetry response curves with command targets', actionZh: '比对 PLC 动作反馈曲线与下发开度目标，评估阀门执行位移精度', ruleId: 'RULE-PLC-ACCURACY-01', conf: 0.98 },
        learn: { action: 'Identify mechanical backlash and actuator hysteresis across greenhouse bays', actionZh: '辨识不同开间天窗机械传动齿条间隙回差，更新执行机构滞后补偿', ruleId: 'RULE-BACKLASH-COMP-01', conf: 0.97 },
    },
    A11: {
        ingest: { action: 'Check DJI RTK base station fix status, satellite count and battery health', actionZh: '检视大疆 RTK 移动基站差分定位状态、卫星信噪比及作业电池健康度', ruleId: 'RULE-RTK-CHECK-01', conf: 0.99 },
        analyze: { action: 'Compute droplet drift trajectory under ambient wind vector & flight altitude', actionZh: '根据当前环境风速矢量与飞行高度计算离心喷头雾滴漂移沉降场', ruleId: 'RULE-DRIFT-TRAJ-02', conf: 0.97 },
        compliance: { action: 'Verify civil aviation low-altitude corridor authorization & no-fly zones', actionZh: '核验民航超低空空域飞行报备状态及澄江抚仙湖生态保护禁飞红线', ruleId: 'RULE-AIRSPACE-AUTH-01', conf: 1.00 },
        prescribe: { action: 'Generate 1.2m canopy clearance variable-rate ultra-low volume flight plan', actionZh: '规划离冠层1.2米对靶超低容量变量喷雾航线及50微米雾滴规格', ruleId: 'RULE-FLIGHT-PLAN-01', conf: 0.98 },
        execute: { action: 'Upload RTK centimeter-precision waypoint flight line to DJI T40 flock', actionZh: '向大疆 T40 机队注入 RTK 厘米级对靶超低空避障航线与微滴参数', ruleId: 'RULE-T40-FLIGHT-01', conf: 0.99 },
        audit: { action: 'Verify RTK flight log trajectory overlay and flowmeter volume reconciliation', actionZh: '校验 RTK 飞行轨迹覆盖重合度与流量计总耗药量闭环对账单', ruleId: 'RULE-FLIGHT-AUDIT-01', conf: 0.99 },
        learn: { action: 'Optimize cross-ridge aerodynamic flight speeds to maximize canopy penetration', actionZh: '根据不同冠层厚度优化跨垄飞行速度，最大化生物制剂下潜穿透率', ruleId: 'RULE-PENETR-OPT-02', conf: 0.96 },
    },
    A12: {
        ingest: { action: 'Sync crew check-in rosters, RFID collection baskets & transport carts', actionZh: '同步班组签到人脸台账、RFID采摘篮分配与地头周转冷藏车就绪状态', ruleId: 'RULE-CREW-CHECKIN-01', conf: 0.98 },
        analyze: { action: 'Assess harvest rate (kg/technician/hour) against sun angle & temperature rise', actionZh: '比对采收效率(kg/人/时)与太阳光照升温曲线，测算最佳采摘窗口期', ruleId: 'RULE-PICKING-RATE-02', conf: 0.96 },
        compliance: { action: 'Inspect food-grade nitrile gloves & sanitize harvest clippers', actionZh: '严查食品级丁腈手套佩戴与专用采果剪75%酒精定点消毒规范', ruleId: 'RULE-GLOVE-HYGIENE-01', conf: 0.99 },
        prescribe: { action: 'Schedule 2-stage dawn picking roster targeting high-Brix micro-zones', actionZh: '排定拂晓分批轻柔采收工单，优先采摘高糖积累优势向阳垄行', ruleId: 'RULE-DAWN-ROSTER-01', conf: 0.97 },
        execute: { action: 'Dispatch 120 certified harvest crew with nitrile gloves for dawn harvest', actionZh: '调度 CREW-25 拂晓轻柔采收班组（120人带丁腈手套保全果粉）', ruleId: 'RULE-CREW-DISPATCH-03', conf: 0.98 },
        audit: { action: 'Inspect harvest basket sorting ratio, fruit bruising & bloom retention', actionZh: '地头质检抽测采摘筐破损率、碰伤褐变率与表皮白霜果粉完好度', ruleId: 'RULE-BASKET-QC-01', conf: 0.98 },
        learn: { action: 'Analyze technician experience curve and fruit handling speed variations', actionZh: '统计熟练工与临时工采收损耗方差，优化采收技能专项培训排课', ruleId: 'RULE-PICKER-TRAIN-01', conf: 0.95 },
    },
    A13: {
        ingest: { action: 'Poll 32 IoT environmental stations & calibrate optical spore trap imagery', actionZh: '轮询32套物联网微气象站并对靶标定高精光学孢子捕捉仪显微图像', ruleId: 'RULE-IOT-POLL-CALIB-01', conf: 0.99 },
        analyze: { action: 'Run Kalman filter for sensor noise suppression & spatial Kriging interpolation', actionZh: '执行卡尔曼滤波消除温湿度传感器噪声并进行空间克里金网格插值', ruleId: 'RULE-KALMAN-KRIGING-02', conf: 0.99 },
        compliance: { action: 'Audit sensor telemetry latency & drop-packet redundancy limits', actionZh: '核定边缘传感器数据回传时延与LoRaWAN基站丢包冗余阈值', ruleId: 'RULE-TELEMETRY-SLA-01', conf: 0.99 },
        prescribe: { action: 'Reconfigure high-frequency polling on suspect micro-plots experiencing spikes', actionZh: '对出现温湿度异动的疑似微区自适应动态提升遥测采样频次至每30秒', ruleId: 'RULE-DYNAMIC-POLL-01', conf: 0.98 },
        execute: { action: 'Trigger edge gateway data buffer flush & LoRaWAN channel hop', actionZh: '下发边缘网关本地缓存冲刷指令并执行 LoRaWAN 动态跳频抗干扰', ruleId: 'RULE-GATEWAY-FLUSH-01', conf: 0.99 },
        audit: { action: 'Certify raw sensor data packet cryptographic validity and timestamping', actionZh: '签发底层传感器原始遥测数据包密文完整性与时戳校验认证', ruleId: 'RULE-TIMESTAMP-CERT-01', conf: 1.00 },
        learn: { action: 'Detect drift in calibrated soil moisture probes against gravimetric samples', actionZh: '比对烘干称重真值自动辨识土壤水分时域反射仪(TDR)读数漂移', ruleId: 'RULE-TDR-DRIFT-01', conf: 0.97 },
    },
    A14: {
        ingest: { action: 'Aggregate historical prescription execution logs and actual yield outcomes', actionZh: '聚类历史处方下发日志、环境消解轨迹与最终采收商品果分级产出', ruleId: 'RULE-HIST-INGEST-01', conf: 0.99 },
        analyze: { action: 'Retrain Bayesian causal graph on microclimate dampening & pathogen latency', actionZh: '基于温湿度消解实测重拟合贝叶斯因果图，更新病害潜育期先验权重', ruleId: 'RULE-BAYES-RETRAIN-01', conf: 0.97 },
        compliance: { action: 'Check model feature attribution fairness and eliminate spurious correlations', actionZh: '执行模型特征归因显著性检验，剔除偶发噪声引起的虚假决策相关性', ruleId: 'RULE-SHAP-FAIRNESS-01', conf: 0.98 },
        prescribe: { action: 'Recommend updating decision matrix weight parameters for seasonal transitions', actionZh: '向战略决策委员会提交换季工况下决策矩阵权重调整建议书', ruleId: 'RULE-WEIGHT-RECOM-01', conf: 0.97 },
        execute: { action: 'Deploy updated neural surrogate weights to edge inferencing pipeline', actionZh: '将轻量化神经网络代理模型权重平滑热更新至边缘端推理管线', ruleId: 'RULE-HOTSWAP-WEIGHTS-01', conf: 0.99 },
        audit: { action: 'Generate offline counterfactual replay audit verifying decision safety bounds', actionZh: '生成反事实决策回放对照审计，验证算法在历史极端工况下的安全边界', ruleId: 'RULE-COUNTERFACT-AUDIT-01', conf: 0.99 },
        learn: { action: 'Fine-tune end-to-end multi-agent collaborative game theory parameters', actionZh: '微调端到端多智能体非零和协同博弈纳什均衡收敛超参数', ruleId: 'RULE-GAME-NASH-02', conf: 0.97 },
        escalate: { action: 'Flag sudden model distribution shift exceeding 3-sigma tolerance limit', actionZh: '标记系统出现超过 3-sigma 容差极限的严重数据分布漂移并暂停全自动决策', ruleId: 'RULE-DRIFT-ESCALATE-01', conf: 1.00 },
    },
};

const AUTO_MAX = {
    logs: 800,
    events: 800,
    assignments: 240,
    alerts: 120,
};

let autonomousLoopTimer = null;
let autonomousCycleRunning = false;

const clip = (arr, max) => (arr.length > max ? arr.slice(arr.length - max) : arr);

const nextClock = (day, hour, maxDay = 60) => {
    const nextHour = (hour + 1) % 24;
    const dayInc = nextHour === 0 ? 1 : 0;
    return { day: ((day - 1 + dayInc) % maxDay) + 1, hour: nextHour };
};

const pickUnique = (items, n) => {
    const pool = [...items];
    const out = [];
    while (pool.length > 0 && out.length < n) {
        const idx = Math.floor(Math.random() * pool.length);
        out.push(pool.splice(idx, 1)[0]);
    }
    return out;
};

const selectAgentsForTask = (task, roster) => {
    const preferred = roster.filter(a => task.roles.includes(a.role));
    const selectedPreferred = pickUnique(preferred, Math.min(2, preferred.length));
    const fallback = pickUnique(
        roster.filter(a => !selectedPreferred.some(s => s.id === a.id)),
        Math.max(0, 3 - selectedPreferred.length),
    );
    return [...selectedPreferred, ...fallback];
};

const makeCycleId = () => `AUTO-${Date.now().toString(36).toUpperCase().slice(-7)}`;

const statusFromScore = (score) => {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'elevated';
    if (score >= 30) return 'monitoring';
    return 'low';
};

const useStore = create((set, get) => ({
    // 閳光偓閳光偓閳光偓 Core State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    fields: { ...FIELDS },
    activeFieldId: 'BS-B3',
    simulationData: {},       // { fieldId: 60DayData[] }
    currentDay: 18,
    currentHour: 10,

    // 閳光偓閳光偓閳光偓 Scenario State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    activeScenario: null,      // SCENARIOS.A / B / C
    scenarioStep: 0,
    scenarioEvents: [],        // processed events log

    // 閳光偓閳光偓閳光偓 Engine State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    currentSnapshot: null,     // latest telemetry snapshot
    riskResults: [],           // assessed risks
    revenueAtRisk: null,       // revenue-at-risk calculation

    // 閳光偓閳光偓閳光偓 Prescription State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    prescriptions: [],
    activePrescription: null,

    // 閳光偓閳光偓閳光偓 Execution State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    executions: [],
    activeExecution: null,

    // 閳光偓閳光偓閳光偓 Audit State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    auditRecords: [],

    // 閳光偓閳光偓閳光偓 Event Log 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    eventLog: [],

    // 閳光偓閳光偓閳光偓 AI Agent Log 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    aiAgentLog: [],            // { timestamp, agent, action, context, scenarioStep }
    scenarioHistory: [],       // completed scenario records with outcome data
    agentRoster: AUTO_AGENT_ROSTER,
    agentAssignments: [],
    policyConfig: {
        preset: 'strict',
        autonomyLevel: 'L3',
        phiTolerance: 'strict',
        windCutoff: 12.0,
        precoolingHours: 2.0,
    },
    operatorAlerts: [],
    autonomousMode: true,
    autonomousTickMs: 5000,
    autonomousState: {
        status: 'idle',
        cycleCount: 0,
        lowRiskCycles: 0,
        escalations: 0,
        approvalsRequested: 0,
        autoExecutions: 0,
        auditsGenerated: 0,
        trainingSamples: 0,
        estimatedSavings: 0,
        lastCycleAt: null,
    },

    // 閳光偓閳光偓閳光偓 Pipeline & Approval 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    pipelineStage: 1,          // 1=Dashboard, 2=Sensors, 3=Risk, 4=Rx, 5=Exec, 6=Audit, 7=History

    approvalQueue: [],         // critical decisions pending human sign-off

    // 閳光偓閳光偓閳光偓 UI State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    sidebarCollapsed: false,
    locale: 'en',
    spatialScope: 'all', // 'all' | 'zone-a' | 'zone-b' | 'zone-c'

    // 閳光偓閳光偓閳光偓 AI Thinking State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    thinkingChain: [],
    isThinking: false,
    thinkingContext: null,     // 'risk' | 'prescription' | 'execution' | 'audit'

    // Iterative Reasoning State (for Video)
    iterationRound: 0,
    iterationStage: null,      // 'perceiving' | 'analyzing' | 'reasoning' | 'deciding' | 'verifying'
    iterationLog: [],
    isIterating: false,


    // 閳光偓閳光偓閳光偓 Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    // Initialize simulation data for all fields
    initSimulation: () => {
        const savedThresholds = globalThis?.localStorage?.getItem('sentinel_thresholds_v1');
        if (savedThresholds) {
            try {
                const parsed = JSON.parse(savedThresholds);
                Object.assign(thresholds, parsed);
            } catch {
                // Ignore malformed local storage values and continue with defaults.
            }
        }

        const simData = {};
        for (const [fieldId, field] of Object.entries(FIELDS)) {
            simData[fieldId] = generate60DayData(fieldId, field.crop);
        }
        let savedLocale = 'en';
        try {
            savedLocale = normalizeLocale(globalThis?.localStorage?.getItem('sentinel_locale_v1'));
        } catch {
            savedLocale = 'en';
        }

        let savedPolicy = null;
        try {
            const rawPolicy = globalThis?.localStorage?.getItem('sentinel_policy_config');
            if (rawPolicy) savedPolicy = JSON.parse(rawPolicy);
        } catch (_) {}

        set(state => ({
            simulationData: simData,
            locale: savedLocale,
            policyConfig: savedPolicy ? { ...state.policyConfig, ...savedPolicy } : state.policyConfig
        }));

        // Run initial assessment
        get().updateSnapshot();
        if (get().autonomousMode) {
            get().startAutonomousLoop();
        }
    },

    // Update current telemetry snapshot from simulation data
    updateSnapshot: () => {
        const { simulationData, activeFieldId, currentDay, currentHour, activeScenario, scenarioStep } = get();
        const fieldData = simulationData[activeFieldId];
        if (!fieldData || !fieldData[currentDay - 1]) return;

        let snapshot = getSnapshot(fieldData[currentDay - 1], currentHour);

        // Apply scenario overrides if active
        if (activeScenario && scenarioStep > 0) {
            const event = activeScenario.events[scenarioStep - 1];
            if (event) {
                if (event.sensorOverrides) {
                    snapshot.sensors = { ...snapshot.sensors, ...event.sensorOverrides };
                }
                if (event.pestOverrides) {
                    snapshot.pests = { ...snapshot.pests, ...event.pestOverrides };
                }
            }
        }

        // Run risk assessment
        const risks = assessRisks(snapshot);
        const field = get().fields[activeFieldId];
        const revenue = calculateRevenueAtRisk(field, risks);

        set({ currentSnapshot: snapshot, riskResults: risks, revenueAtRisk: revenue });
    },

    // Switch active field
    setActiveField: (fieldId) => {
        set({ activeFieldId: fieldId });
        get().updateSnapshot();
    },

    setAutonomousMode: (enabled) => {
        set(state => ({
            autonomousMode: enabled,
            autonomousState: {
                ...state.autonomousState,
                status: enabled ? 'running' : 'paused',
            },
        }));
        if (enabled) get().startAutonomousLoop();
        else get().stopAutonomousLoop();
    },

    startAutonomousLoop: () => {
        if (autonomousLoopTimer) return;
        get().runAutonomousCycle();
        const intervalMs = get().autonomousTickMs || 9000;
        autonomousLoopTimer = setInterval(() => {
            const { autonomousMode } = get();
            if (!autonomousMode) return;
            get().runAutonomousCycle();
        }, intervalMs);

        set(state => ({
            autonomousState: {
                ...state.autonomousState,
                status: 'running',
            },
        }));
    },

    stopAutonomousLoop: () => {
        if (autonomousLoopTimer) {
            clearInterval(autonomousLoopTimer);
            autonomousLoopTimer = null;
        }
        set(state => ({
            autonomousState: {
                ...state.autonomousState,
                status: 'stopped',
            },
        }));
    },

    runAutonomousCycle: () => {
        if (autonomousCycleRunning) return;
        autonomousCycleRunning = true;

        try {
            const before = get();
            const cycleId = makeCycleId();
            const clock = nextClock(before.currentDay, before.currentHour);
            set({ currentDay: clock.day, currentHour: clock.hour });
            get().updateSnapshot();

            const state = get();
            const topRisk = (state.riskResults || []).reduce(
                (max, r) => ((r.score || 0) > (max.score || 0) ? r : max),
                { score: 0, name: 'No active threat', nameZh: '当前无高危威胁', status: 'low' },
            );
            const highRisk = (topRisk.score || 0) >= 70;
            const cycleAt = new Date().toISOString();

            const taskPlan = highRisk
                ? [AUTO_TASKS.ingest, AUTO_TASKS.analyze, AUTO_TASKS.compliance, AUTO_TASKS.prescribe, AUTO_TASKS.escalate]
                : [AUTO_TASKS.ingest, AUTO_TASKS.analyze, AUTO_TASKS.compliance, AUTO_TASKS.prescribe, AUTO_TASKS.execute, AUTO_TASKS.audit, AUTO_TASKS.learn];

            const assignments = taskPlan.map(task => {
                const members = selectAgentsForTask(task, state.agentRoster);
                return {
                    id: `${cycleId}-${task.id}`,
                    cycleId,
                    taskId: task.id,
                    taskLabel: task.label,
                    taskLabelZh: task.labelZh,
                    members: members.map((m, idx) => ({
                        id: m.id,
                        name: m.name,
                        nameZh: m.nameZh,
                        role: m.role,
                        stream: m.stream,
                        traits: m.traits,
                        traitsZh: m.traitsZh,
                        assignment: idx === 0 ? 'lead' : idx === 1 ? 'reviewer' : 'executor',
                        assignmentZh: idx === 0 ? ASSIGNMENT_LABEL_ZH.lead : idx === 1 ? ASSIGNMENT_LABEL_ZH.reviewer : ASSIGNMENT_LABEL_ZH.executor,
                    })),
                    status: highRisk && task.id === 'escalate' ? 'operator_gate' : 'completed',
                    timestamp: cycleAt,
                };
            });

            const agentLogs = assignments.flatMap(asg => asg.members.map(member => {
                const actionMeta = AGENT_4D_ACTIONS[member.id]?.[asg.taskId] || {
                    action: `${asg.taskLabel}: ${member.assignment} action by ${member.name}`,
                    actionZh: `${asg.taskLabelZh || asg.taskLabel}：${member.assignmentZh || member.assignment}动作｜${member.nameZh || member.name}`,
                    ruleId: `RULE-${member.id}-${asg.taskId.toUpperCase()}`,
                    conf: 0.95,
                };
                return {
                    timestamp: cycleAt,
                    agent: member.stream,
                    agentId: member.id,
                    taskId: asg.taskId,
                    action: actionMeta.action,
                    actionZh: actionMeta.actionZh,
                    ruleId: actionMeta.ruleId,
                    confidence: actionMeta.conf,
                    assignment: member.assignment,
                    assignmentZh: member.assignmentZh,
                    context: `Autonomous cycle ${cycleId} · ${actionMeta.ruleId}`,
                    contextZh: `自治循环 ${cycleId} · 规则 ${actionMeta.ruleId}`,
                    scenarioStep: state.scenarioStep,
                    cycleId,
                    agentRole: member.role,
                };
            }));

            let executionCreated = false;
            let auditCreated = false;
            let approvalsRequested = 0;
            let escalations = 0;
            let estimatedSavings = 0;

            if (highRisk) {
                if (state.approvalQueue.length === 0) {
                    get().generateRx();
                    approvalsRequested = 1;
                }
                escalations = 1;
            } else {
                const previousRxId = state.activePrescription?.id;
                get().generateRx();
                const latest = get();
                const rx = latest.activePrescription;
                if (rx && rx.id !== previousRxId) {
                    const execution = get().executeRx(rx.id);
                    if (execution) {
                        executionCreated = true;
                        get().completeExecution();
                        get().generateAudit();
                        auditCreated = true;
                        estimatedSavings = Math.max(0, Math.round((latest.revenueAtRisk?.total || 12000) * 0.35));
                    }
                }
            }

            const post = get();
            const latestRx = post.activePrescription;
            const evidence = {
                ingest: [`${state.activeFieldId} · day ${clock.day}, hour ${clock.hour}`, `${Object.keys(state.currentSnapshot?.sensors ?? {}).length} sensor channels loaded`],
                analyze: ['Current sensor snapshot and crop risk rules', `${topRisk.name}: ${topRisk.score}/100`],
                compliance: [`Escalation threshold: 70/100`, highRisk ? 'Operator approval required' : 'Below operator escalation threshold'],
                prescribe: ['Ranked threats and current crop constraints', latestRx ? `${latestRx.id} · ${latestRx.actionLabel}` : 'No prescription produced'],
                execute: [latestRx?.id ?? 'No prescription', executionCreated ? `Execution ${post.activeExecution?.id} recorded` : 'No execution created'],
                audit: [post.activeExecution?.id ?? 'No execution record', auditCreated ? 'Audit record created' : 'No audit record created'],
                learn: ['Execution and audit outcome', auditCreated ? 'Outcome available for review' : 'Waiting for audit evidence'],
                escalate: [`${topRisk.name}: ${topRisk.score}/100`, 'Waiting for operator review'],
            };
            for (const assignment of assignments) {
                const [input, outcome] = evidence[assignment.taskId];
                assignment.evidence = { input, outcome };
                if ((assignment.taskId === 'execute' && !executionCreated) ||
                    (['audit', 'learn'].includes(assignment.taskId) && !auditCreated)) assignment.status = 'waiting';
            }
            for (const log of agentLogs) {
                log.evidenceOutcome = evidence[log.taskId][1];
                log.action += ` [${evidence[log.taskId][1]}]`;
                log.actionZh += ` [${evidence[log.taskId][1]}]`;
            }
            const operatorAlert = highRisk && latestRx ? {
                id: `ALT-${Date.now()}`,
                cycleId,
                timestamp: cycleAt,
                severity: 'critical',
                message: `Risk ${topRisk.name} at ${topRisk.score}/100 requires operator confirmation.`,
                messageZh: `风险项「${topRisk.nameZh || topRisk.name}」达到 ${topRisk.score}/100，需要人工确认。`,
                prescriptionId: latestRx.id,
            } : null;

                        const routineMicroEvents = [
                {
                    timestamp: cycleAt,
                    type: 'autonomy',
                    message: '[AUTO-EXEC] Heat & Humidity Spike (82.5%): Axial fans #3 & #4 activated at 60% power. Relieved to 71.0% in 15 mins.',
                    messageZh: '[自主闭环] 午后湿热积聚预警 (湿度 82.5%)：3/4 号轴流风机自适应启动排风 20 分钟，湿度平稳回落至 71.0%。',
                },
                {
                    timestamp: cycleAt,
                    type: 'autonomy',
                    message: '[AUTO-EXEC] Substrate Moisture Deficit (27.2%): Pulse fertigation line #2 active for 12 mins. Restored to 33.2%.',
                    messageZh: '[自主闭环] 基质微亏水预警 (含水率 27.2%)：2号压力补偿滴灌电磁阀补水 12 分钟，基质含水率恢复至 33.2%。',
                },
                {
                    timestamp: cycleAt,
                    type: 'autonomy',
                    message: '[AUTO-EXEC] Local Wind Gust (4.6 m/s): Multispectral drone inspection flight deferred by 30 mins.',
                    messageZh: '[自主闭环] 澄江局部短时阵风规避 (4.6 m/s)：多光谱无人机巡检任务自动顺延 30 分钟，风速平稳后自动起飞。',
                },
                {
                    timestamp: cycleAt,
                    type: 'autonomy',
                    message: '[AUTO-EXEC] Low Thrip Count (3 thrips on TRAP-S02): Marked for tomorrow ground scouting. Chemical treatment prohibited.',
                    messageZh: '[自主闭环] 智能诱虫板低密度预警 (捕获3只蓟马)：自动派发明日人工巡检标记，维持零用药绿色标准。',
                },
            ];
            const routineEvent = !highRisk ? routineMicroEvents[state.autonomousState.cycleCount % routineMicroEvents.length] : null;

            const cycleEvent = {
                timestamp: cycleAt,
                type: 'autonomy',
                message: highRisk
                    ? `Autonomous cycle ${cycleId}: high-risk gate activated for ${topRisk.name} (${topRisk.score}/100), waiting for operator approval.`
                    : `Autonomous cycle ${cycleId}: end-to-end loop completed for ${topRisk.name} (${topRisk.score}/100).`,
                messageZh: highRisk
                    ? `自治循环 ${cycleId}：已触发高风险闸门（${topRisk.nameZh || topRisk.name}，${topRisk.score}/100），等待人工审批。`
                    : `自治循环 ${cycleId}：已完成端到端闭环（${topRisk.nameZh || topRisk.name}，${topRisk.score}/100）。`,
            };

            set(prev => ({
                aiAgentLog: clip([...prev.aiAgentLog, ...agentLogs], AUTO_MAX.logs),
                agentAssignments: clip([...prev.agentAssignments, ...assignments], AUTO_MAX.assignments),
                operatorAlerts: clip(operatorAlert ? [...prev.operatorAlerts, operatorAlert] : prev.operatorAlerts, AUTO_MAX.alerts),
                eventLog: clip([...prev.eventLog, cycleEvent, ...(routineEvent ? [routineEvent] : [])], AUTO_MAX.events),
                autonomousState: {
                    ...prev.autonomousState,
                    status: prev.autonomousMode ? 'running' : 'paused',
                    cycleCount: prev.autonomousState.cycleCount + 1,
                    lowRiskCycles: prev.autonomousState.lowRiskCycles + (highRisk ? 0 : 1),
                    escalations: prev.autonomousState.escalations + escalations,
                    approvalsRequested: prev.autonomousState.approvalsRequested + approvalsRequested,
                    autoExecutions: prev.autonomousState.autoExecutions + (executionCreated ? 1 : 0),
                    auditsGenerated: prev.autonomousState.auditsGenerated + (auditCreated ? 1 : 0),
                    trainingSamples: prev.autonomousState.trainingSamples + (highRisk ? 35 : 65),
                    estimatedSavings: prev.autonomousState.estimatedSavings + estimatedSavings,
                    lastCycleAt: cycleAt,
                },
            }));
        } finally {
            autonomousCycleRunning = false;
        }
    },

    // 閳光偓閳光偓閳光偓 Scenario Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    loadScenario: (scenarioId) => {
        if (!scenarioId) {
            set({
                activeScenario: null,
                scenarioStep: 0,
                scenarioEvents: [],
                aiAgentLog: [],
                agentAssignments: [],
                operatorAlerts: [],
            });
            get().updateSnapshot();
            return;
        }

        const baseScenario = (typeof ALL_SCENARIOS !== 'undefined' && ALL_SCENARIOS[scenarioId]) || SCENARIOS[scenarioId];
        const zhOverrides = SCENARIO_ZH[scenarioId] || {};
        const scenario = baseScenario ? {
            ...baseScenario,
            descriptionZh: baseScenario.descriptionZh || zhOverrides.descriptionZh || baseScenario.description,
            primaryThreatZh: baseScenario.primaryThreatZh || zhOverrides.primaryThreatZh || baseScenario.primaryThreat,
        } : null;
        if (!scenario) return;

        // Reset state
        const field = { ...FIELDS[scenario.field], ...scenario.initialState };
        const updatedFields = {
            ...get().fields,
            [scenario.field]: field,
        };

        set({
            activeScenario: scenario,
            scenarioStep: 0,
            scenarioEvents: [],
            activeFieldId: scenario.field,
            fields: updatedFields,
            currentDay: scenario.startDay,
            prescriptions: [],
            activePrescription: null,
            executions: [],
            activeExecution: null,
            auditRecords: [],
            aiAgentLog: [],
            agentAssignments: [],
            operatorAlerts: [],
            thinkingChain: [],
            isThinking: false,
            thinkingContext: null,
            eventLog: [{
                timestamp: new Date().toISOString(),
                type: 'scenario',
                message: `Scenario ${scenario.id} loaded: ${scenario.name}`,
                messageZh: `已加载场景 ${scenario.id}：${scenario.nameZh || scenario.name}`,
            }],
        });

        get().updateSnapshot();
    },

    advanceScenario: () => {
        const { activeScenario, scenarioStep } = get();
        if (!activeScenario) return;
        if (scenarioStep >= activeScenario.events.length) return;

        const nextStep = scenarioStep + 1;
        const event = activeScenario.events[nextStep - 1];

        // Update day if event specifies different day
        const updates = {
            scenarioStep: nextStep,
            currentDay: event.day || get().currentDay,
        };

        // Log event
        const newEvent = {
            timestamp: new Date().toISOString(),
            step: nextStep,
            type: event.expectedAction || 'observation',
            title: event.title,
            titleZh: event.titleZh || localizeScenarioTextZh(event.title),
            message: event.description,
            messageZh: event.descriptionZh || localizeScenarioTextZh(event.description),
            day: event.day,
        };

        // Log AI agent actions for this event
        const agentActions = event.aiAgentActions || [];
        const newAgentLogs = agentActions.map(a => ({
            timestamp: new Date().toISOString(),
            agent: a.agent,
            action: a.action,
            actionZh: a.actionZh || localizeScenarioTextZh(a.action),
            context: event.title,
            contextZh: event.titleZh || localizeScenarioTextZh(event.title),
            scenarioStep: nextStep,
        }));

        set(state => ({
            ...updates,
            scenarioEvents: [...state.scenarioEvents, newEvent],
            eventLog: [...state.eventLog, { ...newEvent, type: 'scenario_event' }],
            aiAgentLog: [...state.aiAgentLog, ...newAgentLogs],
        }));

        // Update snapshot with overrides
        get().updateSnapshot();

        // Auto-trigger appropriate actions based on event type
        if (['prescription_with_fallback', 'prescription_normal', 'prescription_emergency'].includes(event.expectedAction)) {
            get().generateRx();
        }
        if (event.expectedAction === 'execution') {
            const rx = get().activePrescription;
            if (rx) get().executeRx(rx.id);
        }
        if (event.expectedAction === 'execution_deviated') {
            const rx = get().activePrescription;
            if (rx) get().executeRx(rx.id, { deviateDosage: true, deviationFactor: event.deviationFactor || 1.714 });
        }
        if (event.expectedAction === 'execution_delayed') {
            const rx = get().activePrescription;
            if (rx) get().executeRx(rx.id, { delayMinutes: (event.delayHours || 6) * 60 });
        }
        if (event.expectedAction === 'audit' || event.expectedAction === 'audit_deviation' || event.expectedAction === 'audit_with_downgrade') {
            get().generateAudit();

            // Handle grade downgrade
            if (event.gradeDowngrade) {
                set(state => ({
                    fields: {
                        ...state.fields,
                        [state.activeFieldId]: {
                            ...state.fields[state.activeFieldId],
                            gradeClass: event.gradeDowngrade.to,
                        },
                    },
                }));
            }
        }
    },

    // 閳光偓閳光偓閳光偓 Prescription Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    generateRx: (options = {}) => {
        const { autoExecuteLowImpact = false } = options;
        const { currentSnapshot, riskResults, activeFieldId, activeScenario } = get();
        if (!currentSnapshot) return;

        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        const rx = generatePrescription(activeFieldId, currentSnapshot, riskResults, daysToHarvest);
        if (!rx) return;

        const topRisk = riskResults.reduce((max, r) => r.score > (max?.score || 0) ? r : max, null);
        const isCritical = topRisk && topRisk.score >= 70;

        if (isCritical) {
            const approvalItem = {
                id: `APR-${Date.now()}`,
                timestamp: new Date().toISOString(),
                prescription: rx,
                riskScore: topRisk.score,
                threat: topRisk.name,
                threatZh: topRisk.nameZh || topRisk.name,
                evidence: (topRisk.factors || []).map(f => ({
                    description: f,
                    points: Math.round((topRisk.score / (topRisk.factors?.length || 1))),
                    impact: topRisk.score >= 70 ? 'high' : 'medium',
                })),
                status: 'pending',
            };
            set(state => ({
                activePrescription: rx,
                prescriptions: [...state.prescriptions, rx],
                approvalQueue: [...state.approvalQueue, approvalItem],
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'prescription',
                    message: `Rx ${rx.id} generated: ${rx.actionLabel} for ${rx.threatName} - CRITICAL: routed to human approval queue`,
                    messageZh: `处方 ${rx.id} 已生成：${rx.actionLabelZh || rx.actionLabel}｜威胁 ${rx.threatNameZh || rx.threatName}｜高风险，已进入人工审批队列`,
                }],
            }));
            return;
        }

        set(state => ({
            activePrescription: rx,
            prescriptions: [...state.prescriptions, rx],
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'prescription',
                message: `Rx ${rx.id} generated: ${rx.actionLabel} for ${rx.threatName}${rx.usedFallback ? ' (fallback - PHI constraint)' : ''} - auto-approved (low risk)`,
                messageZh: `处方 ${rx.id} 已生成：${rx.actionLabelZh || rx.actionLabel}｜威胁 ${rx.threatNameZh || rx.threatName}${rx.usedFallback ? '（PHI 约束触发回退）' : ''}｜低风险自动通过`,
            }],
        }));

        if (autoExecuteLowImpact) {
            const execution = get().executeRx(rx.id);
            if (execution) {
                get().completeExecution();
                get().generateAudit();
                set(state => ({
                    eventLog: [...state.eventLog, {
                        timestamp: new Date().toISOString(),
                        type: 'execution',
                        message: `Rx ${rx.id} low-impact auto execution completed with report.`,
                        messageZh: `处方 ${rx.id} 低影响任务已自动执行并生成报告。`,
                    }],
                }));
            }
        }
    },

    modifyRx: (rxId, modifications) => {
        set(state => {
            const rx = state.prescriptions.find(r => r.id === rxId);
            if (!rx) return state;
            const modified = { ...rx, ...modifications, responsibilityBoundary: 'operator' };
            return {
                prescriptions: state.prescriptions.map(r => r.id === rxId ? modified : r),
                activePrescription: state.activePrescription?.id === rxId ? modified : state.activePrescription,
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'modification',
                    message: `Rx ${rxId} modified by operator. Responsibility shifted to operator.`,
                    messageZh: `处方 ${rxId} 已由人工修改，责任边界已切换为人工。`,
                }],
            };
        });
    },

    // 閳光偓閳光偓閳光偓 Execution Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    executeRx: (rxId, options = {}) => {
        const state = get();
        const rx = state.prescriptions.find(r => r.id === rxId);
        if (!rx) return null;

        // Critical prescriptions are blocked until human approval clears the queue item.
        const pendingApproval = state.approvalQueue.some(item => item.prescription?.id === rxId);
        if (pendingApproval) return null;

        const execution = executePresciption(rx, options);

        set(prev => ({
            activeExecution: execution,
            executions: [...prev.executions, execution],
            prescriptions: prev.prescriptions.map(r => r.id === rxId ? { ...r, status: execution.status === 'failed' ? 'failed' : 'executing' } : r),
            eventLog: [...prev.eventLog, {
                timestamp: new Date().toISOString(),
                type: execution.executionFingerprint.match ? 'execution' : 'deviation',
                message: execution.executionFingerprint.match
                    ? `Execution ${execution.id} completed. Fingerprint: MATCH.`
                    : `Execution ${execution.id} - FINGERPRINT MISMATCH. Deviations: ${execution.deviations.map(d => `${d.parameter} ${d.delta}`).join(', ')}`,
                messageZh: execution.executionFingerprint.match
                    ? `执行 ${execution.id} 已完成。执行指纹：匹配。`
                    : `执行 ${execution.id} 指纹不匹配。偏差：${execution.deviations.map(d => `${d.parameterZh || d.parameter} ${d.deltaZh || d.delta}`).join('，')}`,
            }],
        }));
        return execution;
    },

    // Audit Actions
    completeExecution: () => {
        const state = get();
        const exec = state.activeExecution;
        const rx = state.prescriptions.find(r => r.id === exec?.prescriptionId);
        if (!exec || exec.status === 'completed') return;

        // Generate comparison metrics
        const dosageAccuracy = exec.executionFingerprint?.match ? 98 + Math.random() * 2 : 72 + Math.random() * 15;
        const coverageAccuracy = (exec.actualCoverage_pct || 95) + (Math.random() * 5 - 2);
        const timingAccuracy = 85 + Math.random() * 15;
        const overallScore = (dosageAccuracy * 0.4 + Math.min(coverageAccuracy, 100) * 0.35 + timingAccuracy * 0.25);
        const grade = overallScore >= 95 ? 'A' : overallScore >= 85 ? 'B' : overallScore >= 75 ? 'C' : overallScore >= 60 ? 'D' : 'F';

        const scenarioReport = state.activeScenario?.prescriptionReport;
        const comparisonReport = {
            dosage: { prescribed: rx?.dosageRatio || 1, actual: exec.actualDosageRatio || (rx?.dosageRatio || 1) * (exec.executionFingerprint?.match ? 1 : 1.2), accuracy: dosageAccuracy },
            coverage: { prescribed: 100, actual: exec.actualCoverage_pct || 95, accuracy: Math.min(coverageAccuracy, 100) },
            timing: { prescribed: rx?.timing || 'Dawn (05:30-08:00)', actual: 'Executed within window', accuracy: timingAccuracy },
            actors: { prescribed: scenarioReport?.actors?.length || 3, actual: exec.precisionMetrics?.actorsUsed || scenarioReport?.actors?.length || 3 },
            methods: { prescribed: scenarioReport?.methods?.length || 1, actual: scenarioReport?.methods?.length || 1 },
            chemicals: { prescribed: scenarioReport?.chemicals?.map(c => c.name).join(', ') || rx?.chemical || 'N/A', actual: scenarioReport?.chemicals?.map(c => c.name).join(', ') || rx?.chemical || 'N/A' },
            overallScore, grade,
            riskBefore: state.riskResults?.[0]?.score || 75,
            riskAfter: Math.max(10, (state.riskResults?.[0]?.score || 75) - 35 - Math.random() * 20),
        };

        const completedExec = {
            ...exec,
            status: 'completed',
            completedAt: new Date().toISOString(),
            comparisonReport,
        };

        set(state => ({
            activeExecution: completedExec,
            executions: state.executions.map(e => e.id === exec.id ? completedExec : e),
            prescriptions: state.prescriptions.map(item => item.id === exec.prescriptionId ? { ...item, status: 'completed' } : item),
            riskResults: state.riskResults.map((risk, idx) => {
                const dampenedScore = idx === 0
                    ? Math.max(8, Math.round(comparisonReport.riskAfter))
                    : Math.max(5, Math.round((risk.score || 0) * 0.7));
                return {
                    ...risk,
                    score: dampenedScore,
                    status: statusFromScore(dampenedScore),
                    trend: idx === 0 ? 'falling' : risk.trend,
                };
            }),
            operatorAlerts: state.operatorAlerts.filter(alert => alert.prescriptionId !== exec.prescriptionId),
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'execution_complete',
                message: `Execution ${exec.id} completed. Grade: ${grade} (${overallScore.toFixed(1)}%). Dosage accuracy: ${dosageAccuracy.toFixed(1)}%.`,
                messageZh: `执行 ${exec.id} 已完成。等级：${grade}（${overallScore.toFixed(1)}%）；剂量准确率 ${dosageAccuracy.toFixed(1)}%。`,
            }],
        }));
    },


    generateAudit: () => {
        const { activePrescription, activeExecution, riskResults, fields, activeFieldId } = get();
        if (!activePrescription || !activeExecution) return;

        const field = fields[activeFieldId];
        const riskBefore = activePrescription.riskScore || 82;
        const topRisk = riskResults[0];
        const riskAfter = topRisk ? topRisk.score : riskBefore * 0.5;

        const audit = generateAuditRecord(activePrescription, activeExecution, riskBefore, riskAfter, field);

        set(state => ({
            auditRecords: [...state.auditRecords, audit],
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'audit',
                message: `Audit ${audit.id} generated. Responsibility: ${audit.responsibilityAssignment}. Revenue protected: CNY ${audit.economicImpact.revenueProtected.toLocaleString()}.`,
                messageZh: `审计 ${audit.id} 已生成。责任归属：${audit.responsibilityAssignmentZh || audit.responsibilityAssignment}；已保护收益 CNY ${audit.economicImpact.revenueProtected.toLocaleString()}。`,
            }],
        }));
    },

    // 閳光偓閳光偓閳光偓 Approval Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    approveDecision: (approvalId) => {
        let approvedPrescriptionId = null;
        set(state => {
            const item = state.approvalQueue.find(a => a.id === approvalId);
            if (!item) return state;
            approvedPrescriptionId = item.prescription?.id || null;
            return {
                approvalQueue: state.approvalQueue.filter(a => a.id !== approvalId),
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'approval',
                    message: `Decision ${approvalId} APPROVED by operator. Rx ${item.prescription?.id} cleared for execution.`,
                    messageZh: `决策 ${approvalId} 已人工通过。处方 ${item.prescription?.id} 已放行执行。`,
                }],
            };
        });

        if (approvedPrescriptionId) {
            const execution = get().executeRx(approvedPrescriptionId);
            if (execution) {
                get().completeExecution();
                get().generateAudit();
            }
        }
    },

    rejectDecision: (approvalId) => {
        set(state => {
            const item = state.approvalQueue.find(a => a.id === approvalId);
            if (!item) return state;
            return {
                approvalQueue: state.approvalQueue.filter(a => a.id !== approvalId),
                activePrescription: state.activePrescription?.id === item.prescription?.id ? null : state.activePrescription,
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'rejection',
                    message: `Decision ${approvalId} REJECTED by operator. Rx ${item.prescription?.id} cancelled.`,
                    messageZh: `决策 ${approvalId} 已人工驳回。处方 ${item.prescription?.id} 已取消。`,
                }],
            };
        });
    },

    startActionRequiredFlow: () => {
        const state = get();
        const topRisk = state.riskResults?.[0];
        if (!topRisk || topRisk.score < 70) return;

        set(prev => ({
            eventLog: [...prev.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'autonomy',
                message: `ACTION REQUIRED acknowledged by operator for ${topRisk.name} (${topRisk.score}/100).`,
                messageZh: `已由人工确认“需要处理”：${topRisk.nameZh || topRisk.name}（${topRisk.score}/100）。`,
            }],
        }));

        get().startRiskThinking();
        setTimeout(() => get().startPrescriptionThinking(), 450);
        setTimeout(() => {
            get().generateRx({ autoExecuteLowImpact: true });
            const post = get();
            const latestRx = post.activePrescription;
            const pendingApproval = post.approvalQueue.find(a => a.prescription?.id === latestRx?.id);
            if (pendingApproval) {
                // User-triggered flow acts as explicit manual approval.
                get().approveDecision(pendingApproval.id);
            }
        }, 900);
    },

    // Iterative Actions
    setIterationRound: (round) => set({ iterationRound: round }),
    setIterationStage: (stage) => set({ iterationStage: stage }),
    setIterating: (isIterating) => set({ isIterating }),
    addIterationLog: (entry) => set(prev => ({ iterationLog: [...prev.iterationLog, entry] })),
    clearIteration: () => set({ iterationRound: 0, iterationStage: null, iterationLog: [], isIterating: false }),

    setPipelineStage: (stage) => set({ pipelineStage: stage }),

    setPolicyConfig: (nextPolicy) => {
        set(state => {
            const merged = { ...state.policyConfig, ...nextPolicy };
            try {
                globalThis?.localStorage?.setItem('sentinel_policy_config', JSON.stringify(merged));
            } catch (_) {}
            return { policyConfig: merged };
        });
    },
    applyThresholdConfig: (nextThresholds) => {
        if (!nextThresholds || typeof nextThresholds !== 'object') return;
        Object.assign(thresholds, nextThresholds);
        try {
            globalThis?.localStorage?.setItem('sentinel_thresholds_v1', JSON.stringify(nextThresholds));
        } catch {
            // Best effort persistence only.
        }
        get().updateSnapshot();
        set(state => ({
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'scenario_event',
                message: 'Admin updated threshold configuration and re-ran risk assessment.',
                messageZh: '管理员已更新阈值配置并重新计算风险评估。',
            }],
        }));
    },

    resetThresholdConfig: () => {
        Object.assign(thresholds, JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS)));
        try {
            globalThis?.localStorage?.removeItem('sentinel_thresholds_v1');
        } catch {
            // Ignore storage failures.
        }
        get().updateSnapshot();
        set(state => ({
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: 'scenario_event',
                message: 'Admin reset thresholds to default values.',
                messageZh: '管理员已将阈值恢复为默认值。',
            }],
        }));
    },

    // 閳光偓閳光偓閳光偓 UI Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setLocale: (nextLocale) => {
        const locale = normalizeLocale(nextLocale);
        try {
            globalThis?.localStorage?.setItem('sentinel_locale_v1', locale);
        } catch {
            // Ignore storage failures.
        }
        set({ locale });
    },
    setSpatialScope: (spatialScope) => set({ spatialScope }),
    pushAgentLog: (logEntry) => set(state => ({
        aiAgentLog: [logEntry, ...state.aiAgentLog].slice(0, 800),
    })),

    // 閳光偓閳光偓閳光偓 AI Thinking Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    startRiskThinking: () => {
        const { currentSnapshot, fields, activeFieldId, riskResults } = get();
        const field = fields[activeFieldId];
        const chain = generateRiskThinkingChain(currentSnapshot, field, riskResults);
        set({ thinkingChain: chain, isThinking: true, thinkingContext: 'risk' });
    },

    startPrescriptionThinking: () => {
        const { currentSnapshot, fields, activeFieldId, riskResults, activePrescription } = get();
        const field = fields[activeFieldId];
        const chain = generatePrescriptionThinkingChain(currentSnapshot, field, riskResults, activePrescription);
        set({ thinkingChain: chain, isThinking: true, thinkingContext: 'prescription' });
    },

    startExecutionThinking: () => {
        const { currentSnapshot, fields, activeFieldId, activePrescription, activeExecution } = get();
        const field = fields[activeFieldId];
        const chain = generateExecutionThinkingChain(currentSnapshot, field, activePrescription, activeExecution);
        set({ thinkingChain: chain, isThinking: true, thinkingContext: 'execution' });
    },

    startAuditThinking: () => {
        const { currentSnapshot, fields, activeFieldId, activePrescription, activeExecution, riskResults } = get();
        const field = fields[activeFieldId];
        const chain = generateAuditThinkingChain(currentSnapshot, field, activePrescription, activeExecution, riskResults);
        set({ thinkingChain: chain, isThinking: true, thinkingContext: 'audit' });
    },

    stopThinking: () => {
        set({ isThinking: false });
    },

    clearThinking: () => {
        set({ thinkingChain: [], isThinking: false, thinkingContext: null });
    },
}));

export default useStore;
