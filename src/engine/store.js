// Sentinel Decision OS 閳?Zustand Global Store v2
// Central state management for all modules

import { create } from 'zustand';
import { generate60DayData, getSnapshot } from './simulationEngine.js';
import { assessRisks, generatePrescription, calculateRevenueAtRisk } from './decisionEngine.js';
import { executePresciption } from './executionEngine.js';
import { generateAuditRecord } from './auditEngine.js';
import { SCENARIOS } from './scenarioEngine.js';
import { generateRiskThinkingChain, generatePrescriptionThinkingChain, generateExecutionThinkingChain, generateAuditThinkingChain } from './thinkingEngine.js';
import thresholds from '../data/thresholds.js';
import { normalizeLocale } from '../i18n/locale.js';

const DEFAULT_THRESHOLDS = JSON.parse(JSON.stringify(thresholds));

// Field definitions
const FIELDS = {
    'BS-B3': {
        id: 'BS-B3',
        name: 'Blueberry Zone B3',
        nameZh: 'BS-区B3号园',
        crop: 'blueberry',
        area_mu: 12,
        gradeClass: 'A',
        estimatedVolume: 3600,
    },
    'YN-A2': {
        id: 'YN-A2',
        name: 'Greenhouse A2 (Rose)',
        nameZh: 'YN-温室A2',
        crop: 'flower',
        area_mu: 5,
        gradeClass: 'A',
        estimatedVolume: 15000,
    },
};

const AUTO_AGENT_ROSTER = [
    { id: 'mgr-01', name: 'Ops Manager', nameZh: '运营经理', role: 'manager', stream: 'decision', traits: 'SLA control, escalation orchestration', traitsZh: 'SLA 管控与升级协调' },
    { id: 'agr-01', name: 'Field Agronomist', nameZh: '田间农艺师', role: 'agronomist', stream: 'analysis', traits: 'Disease and crop-stage reasoning', traitsZh: '病害与生育期联合推理' },
    { id: 'agr-02', name: 'Greenhouse Agronomist', nameZh: '温室农艺师', role: 'agronomist', stream: 'analysis', traits: 'Protected-crop microclimate planning', traitsZh: '设施作物微气候规划' },
    { id: 'chem-01', name: 'Crop Chemist', nameZh: '植保化学师', role: 'chemist', stream: 'decision', traits: 'MoA rotation and PHI constraints', traitsZh: '作用机制轮换与 PHI 约束' },
    { id: 'comp-01', name: 'Compliance Officer', nameZh: '合规官', role: 'compliance', stream: 'audit', traits: 'Regulatory and audit policy checks', traitsZh: '法规与审计策略校验' },
    { id: 'safe-01', name: 'Safety Officer', nameZh: '安全官', role: 'safety', stream: 'watchdog', traits: 'Wind/rain exposure and worker safety gates', traitsZh: '风雨暴露与人员安全闸门' },
    { id: 'fin-01', name: 'Finance Analyst', nameZh: '财务分析师', role: 'finance', stream: 'audit', traits: 'ROI and margin-at-risk scoring', traitsZh: 'ROI 与利润风险评分' },
    { id: 'sales-01', name: 'Sales Planner', nameZh: '销售规划师', role: 'sales', stream: 'analysis', traits: 'Demand timing and grade risk estimation', traitsZh: '需求时机与等级风险评估' },
    { id: 'ctrl-01', name: 'Control Engineer', nameZh: '控制工程师', role: 'controller', stream: 'execution', traits: 'Closed-loop IoT control and failover', traitsZh: 'IoT 闭环控制与故障切换' },
    { id: 'ops-01', name: 'Drone Operator', nameZh: '无人机作业员', role: 'operator', stream: 'execution', traits: 'Precision routes and spray execution', traitsZh: '精细航线与喷施执行' },
    { id: 'ops-02', name: 'Field Operator', nameZh: '田间作业员', role: 'operator', stream: 'execution', traits: 'Manual intervention and verification', traitsZh: '人工干预与复核' },
    { id: 'data-01', name: 'Data Retriever', nameZh: '数据采集员', role: 'retriever', stream: 'perception', traits: 'Sensor fusion and retrieval across feeds', traitsZh: '跨源传感融合与拉取' },
    { id: 'data-02', name: 'Remote Sensor Pilot', nameZh: '远程传感操控员', role: 'retriever', stream: 'perception', traits: 'Remote command for edge sensors/drones', traitsZh: '边缘传感与无人机远程操控' },
    { id: 'ml-01', name: 'Learning Engineer', nameZh: '学习工程师', role: 'learning', stream: 'analysis', traits: 'Continuous model update and drift checks', traitsZh: '模型持续更新与漂移校验' },
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
        ['Safety Officer', '安全官'],
        ['Control Engineer', '控制工程师'],
        ['Field Operator', '田间作业员'],
        ['Data Retriever', '数据采集员'],
        ['Remote Sensor Pilot', '远程传感操控员'],
        ['Drone Operator', '无人机作业员'],
        ['Ops Manager', '运营经理'],
        ['Learning Engineer', '学习工程师'],
        ['Compliance Officer', '合规官'],
        ['Crop Chemist', '植保化学师'],
        ['Field Agronomist', '田间农艺师'],
        ['Greenhouse Agronomist', '温室农艺师'],
        ['Finance Analyst', '财务分析师'],
        ['Sales Planner', '销售规划师'],
    ];
    tokenMap.forEach(([en, zh]) => {
        text = text.replace(new RegExp(en, 'gi'), zh);
    });
    text = text.replace(/->/g, '→');
    return text;
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

    // 閳光偓閳光偓閳光偓 Pipeline & Approval 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    pipelineStage: 1,          // 1=Dashboard, 2=Sensors, 3=Risk, 4=Rx, 5=Exec, 6=Audit, 7=History
    approvalQueue: [],         // critical decisions pending human sign-off

    // 閳光偓閳光偓閳光偓 UI State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    sidebarCollapsed: false,
    locale: 'en',

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

        set({ simulationData: simData, locale: savedLocale });

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

            const agentLogs = assignments.flatMap(asg => asg.members.map(member => ({
                timestamp: cycleAt,
                agent: member.stream,
                agentId: member.id,
                action: `${asg.taskLabel}: ${member.assignment} action by ${member.name}`,
                actionZh: `${asg.taskLabelZh || asg.taskLabel}：${member.assignmentZh || member.assignment}动作｜${member.nameZh || member.name}`,
                context: `Autonomous cycle ${cycleId}`,
                contextZh: `自治循环 ${cycleId}`,
                scenarioStep: state.scenarioStep,
                cycleId,
                agentRole: member.role,
            })));

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
                get().generateRx();
                const latest = get();
                const rx = latest.activePrescription;
                if (rx) {
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
            const operatorAlert = highRisk && latestRx ? {
                id: `ALT-${Date.now()}`,
                cycleId,
                timestamp: cycleAt,
                severity: 'critical',
                message: `Risk ${topRisk.name} at ${topRisk.score}/100 requires operator confirmation.`,
                messageZh: `风险项「${topRisk.nameZh || topRisk.name}」达到 ${topRisk.score}/100，需要人工确认。`,
                prescriptionId: latestRx.id,
            } : null;

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
                eventLog: clip([...prev.eventLog, cycleEvent], AUTO_MAX.events),
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

        const baseScenario = SCENARIOS[scenarioId];
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
