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
    { id: 'mgr-01', name: 'Ops Manager', role: 'manager', stream: 'decision', traits: 'SLA control, escalation orchestration' },
    { id: 'agr-01', name: 'Field Agronomist', role: 'agronomist', stream: 'analysis', traits: 'Disease and crop-stage reasoning' },
    { id: 'agr-02', name: 'Greenhouse Agronomist', role: 'agronomist', stream: 'analysis', traits: 'Protected-crop microclimate planning' },
    { id: 'chem-01', name: 'Crop Chemist', role: 'chemist', stream: 'decision', traits: 'MoA rotation and PHI constraints' },
    { id: 'comp-01', name: 'Compliance Officer', role: 'compliance', stream: 'audit', traits: 'Regulatory and audit policy checks' },
    { id: 'safe-01', name: 'Safety Officer', role: 'safety', stream: 'watchdog', traits: 'Wind/rain exposure and worker safety gates' },
    { id: 'fin-01', name: 'Finance Analyst', role: 'finance', stream: 'audit', traits: 'ROI and margin-at-risk scoring' },
    { id: 'sales-01', name: 'Sales Planner', role: 'sales', stream: 'analysis', traits: 'Demand timing and grade risk estimation' },
    { id: 'ctrl-01', name: 'Control Engineer', role: 'controller', stream: 'execution', traits: 'Closed-loop IoT control and failover' },
    { id: 'ops-01', name: 'Drone Operator', role: 'operator', stream: 'execution', traits: 'Precision routes and spray execution' },
    { id: 'ops-02', name: 'Field Operator', role: 'operator', stream: 'execution', traits: 'Manual intervention and verification' },
    { id: 'data-01', name: 'Data Retriever', role: 'retriever', stream: 'perception', traits: 'Sensor fusion and retrieval across feeds' },
    { id: 'data-02', name: 'Remote Sensor Pilot', role: 'retriever', stream: 'perception', traits: 'Remote command for edge sensors/drones' },
    { id: 'ml-01', name: 'Learning Engineer', role: 'learning', stream: 'analysis', traits: 'Continuous model update and drift checks' },
];

const AUTO_TASKS = {
    ingest: { id: 'ingest', label: 'Data Ingestion', roles: ['retriever', 'controller', 'operator'] },
    analyze: { id: 'analyze', label: 'Multimodal Risk Reasoning', roles: ['agronomist', 'manager', 'sales', 'learning'] },
    compliance: { id: 'compliance', label: 'Compliance and Safety Gate', roles: ['compliance', 'safety', 'chemist'] },
    prescribe: { id: 'prescribe', label: 'Prescription Planning', roles: ['agronomist', 'chemist', 'manager'] },
    execute: { id: 'execute', label: 'Execution Orchestration', roles: ['controller', 'operator', 'safety'] },
    audit: { id: 'audit', label: 'Audit and Reporting', roles: ['compliance', 'finance', 'manager'] },
    learn: { id: 'learn', label: 'Outcome Learning', roles: ['learning', 'agronomist', 'finance'] },
    escalate: { id: 'escalate', label: 'Operator Escalation', roles: ['manager', 'safety', 'compliance'] },
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
    autonomousTickMs: 9000,
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

    // 閳光偓閳光偓閳光偓 UI State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    sidebarCollapsed: false,

    // 閳光偓閳光偓閳光偓 AI Thinking State 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓
    thinkingChain: [],
    isThinking: false,
    thinkingContext: null,     // 'risk' | 'prescription' | 'execution' | 'audit'

    // 閳光偓閳光偓閳光偓 Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

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
        set({ simulationData: simData });

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
                { score: 0, name: 'No active threat', status: 'low' },
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
                    members: members.map((m, idx) => ({
                        id: m.id,
                        name: m.name,
                        role: m.role,
                        stream: m.stream,
                        traits: m.traits,
                        assignment: idx === 0 ? 'lead' : idx === 1 ? 'reviewer' : 'executor',
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
                context: `Autonomous cycle ${cycleId}`,
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
                prescriptionId: latestRx.id,
            } : null;

            const cycleEvent = {
                timestamp: cycleAt,
                type: 'autonomy',
                message: highRisk
                    ? `Autonomous cycle ${cycleId}: high-risk gate activated for ${topRisk.name} (${topRisk.score}/100), waiting for operator approval.`
                    : `Autonomous cycle ${cycleId}: end-to-end loop completed for ${topRisk.name} (${topRisk.score}/100).`,
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

        const scenario = SCENARIOS[scenarioId];
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
            message: event.description,
            day: event.day,
        };

        // Log AI agent actions for this event
        const agentActions = event.aiAgentActions || [];
        const newAgentLogs = agentActions.map(a => ({
            timestamp: new Date().toISOString(),
            agent: a.agent,
            action: a.action,
            context: event.title,
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
        if (event.expectedAction === 'prescription_with_fallback' || event.expectedAction === 'prescription_normal') {
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
            }],
        }));
    },

    // 閳光偓閳光偓閳光偓 UI Actions 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

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




