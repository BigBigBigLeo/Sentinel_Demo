// Sentinel Decision OS — Zustand Global Store
// Central state management for all modules

import { create } from 'zustand';
import { generate60DayData, getSnapshot } from './simulationEngine.js';
import { assessRisks, generatePrescription, calculateRevenueAtRisk } from './decisionEngine.js';
import { executePresciption } from './executionEngine.js';
import { generateAuditRecord } from './auditEngine.js';
import { SCENARIOS } from './scenarioEngine.js';
import { generateRiskThinkingChain, generatePrescriptionThinkingChain } from './thinkingEngine.js';

// Field definitions
const FIELDS = {
    'BS-B3': {
        id: 'BS-B3', name: 'Blueberry Zone B3', nameZh: 'BS-区B3号园',
        crop: 'blueberry', area_mu: 12, gradeClass: 'A',
        estimatedVolume: 3600,
    },
    'YN-A2': {
        id: 'YN-A2', name: 'Greenhouse A2 (Rose)', nameZh: 'YN-温棚A2',
        crop: 'flower', area_mu: 5, gradeClass: 'A',
        estimatedVolume: 15000,
    },
};

const useStore = create((set, get) => ({
    // ─── Core State ───────────────────────────────────────────────────
    fields: { ...FIELDS },
    activeFieldId: 'BS-B3',
    simulationData: {},       // { fieldId: 60DayData[] }
    currentDay: 18,
    currentHour: 10,

    // ─── Scenario State ───────────────────────────────────────────────
    activeScenario: null,      // SCENARIOS.A / B / C
    scenarioStep: 0,
    scenarioEvents: [],        // processed events log

    // ─── Engine State ─────────────────────────────────────────────────
    currentSnapshot: null,     // latest telemetry snapshot
    riskResults: [],           // assessed risks
    revenueAtRisk: null,       // revenue-at-risk calculation

    // ─── Prescription State ───────────────────────────────────────────
    prescriptions: [],
    activePrescription: null,

    // ─── Execution State ──────────────────────────────────────────────
    executions: [],
    activeExecution: null,

    // ─── Audit State ──────────────────────────────────────────────────
    auditRecords: [],

    // ─── Event Log ────────────────────────────────────────────────────
    eventLog: [],

    // ─── Pipeline & Approval ──────────────────────────────────────────
    pipelineStage: 1,          // 1=Dashboard, 2=Sensors, 3=Risk, 4=Rx, 5=Exec, 6=Audit, 7=History
    approvalQueue: [],         // critical decisions pending human sign-off

    // ─── UI State ─────────────────────────────────────────────────────
    sidebarCollapsed: false,

    // ─── AI Thinking State ────────────────────────────────────────────
    thinkingChain: [],
    isThinking: false,
    thinkingContext: null,     // 'risk' | 'prescription' | 'audit'

    // ─── Actions ──────────────────────────────────────────────────────

    // Initialize simulation data for all fields
    initSimulation: () => {
        const simData = {};
        for (const [fieldId, field] of Object.entries(FIELDS)) {
            simData[fieldId] = generate60DayData(fieldId, field.crop);
        }
        set({ simulationData: simData });

        // Run initial assessment
        get().updateSnapshot();
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

    // ─── Scenario Actions ────────────────────────────────────────────

    loadScenario: (scenarioId) => {
        const scenario = SCENARIOS[scenarioId];
        if (!scenario) return;

        // Reset state
        const field = { ...FIELDS[scenario.field], ...scenario.initialState };
        const fields = { ...get().fields, [scenario.field]: field };

        set({
            activeScenario: scenario,
            scenarioStep: 0,
            scenarioEvents: [],
            activeFieldId: scenario.field,
            fields,
            currentDay: scenario.startDay,
            prescriptions: [],
            activePrescription: null,
            executions: [],
            activeExecution: null,
            auditRecords: [],
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

        set(state => ({
            ...updates,
            scenarioEvents: [...state.scenarioEvents, newEvent],
            eventLog: [...state.eventLog, { ...newEvent, type: 'scenario_event' }],
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

    // ─── Prescription Actions ─────────────────────────────────────────

    generateRx: () => {
        const { currentSnapshot, riskResults, activeFieldId, activeScenario } = get();
        if (!currentSnapshot) return;

        const daysToHarvest = activeScenario?.daysToHarvest || 30;
        const rx = generatePrescription(activeFieldId, currentSnapshot, riskResults, daysToHarvest);
        if (!rx) return;

        const topRisk = riskResults.reduce((max, r) => r.score > (max?.score || 0) ? r : max, null);
        const isCritical = topRisk && topRisk.score >= 70;

        if (isCritical) {
            // Critical: route to approval queue
            const approvalItem = {
                id: `APR-${Date.now()}`,
                timestamp: new Date().toISOString(),
                prescription: rx,
                riskScore: topRisk.score,
                threat: topRisk.name,
                evidence: (topRisk.factors || []).map((f, i) => ({ description: f, points: Math.round((topRisk.score / (topRisk.factors?.length || 1))), impact: topRisk.score >= 70 ? 'high' : 'medium' })),
                status: 'pending',
            };
            set(state => ({
                activePrescription: rx,
                prescriptions: [...state.prescriptions, rx],
                approvalQueue: [...state.approvalQueue, approvalItem],
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'prescription',
                    message: `Rx ${rx.id} generated: ${rx.actionLabel} for ${rx.threatName} — ⚠ CRITICAL: routed to human approval queue`,
                }],
            }));
        } else {
            set(state => ({
                activePrescription: rx,
                prescriptions: [...state.prescriptions, rx],
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'prescription',
                    message: `Rx ${rx.id} generated: ${rx.actionLabel} for ${rx.threatName}${rx.usedFallback ? ' (fallback — PHI constraint)' : ''} — auto-approved (low risk)`,
                }],
            }));
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

    // ─── Execution Actions ────────────────────────────────────────────

    executeRx: (rxId, options = {}) => {
        const rx = get().prescriptions.find(r => r.id === rxId);
        if (!rx) return;

        const execution = executePresciption(rx, options);

        set(state => ({
            activeExecution: execution,
            executions: [...state.executions, execution],
            prescriptions: state.prescriptions.map(r => r.id === rxId ? { ...r, status: execution.status === 'failed' ? 'failed' : 'executing' } : r),
            eventLog: [...state.eventLog, {
                timestamp: new Date().toISOString(),
                type: execution.executionFingerprint.match ? 'execution' : 'deviation',
                message: execution.executionFingerprint.match
                    ? `Execution ${execution.id} completed. Fingerprint: MATCH.`
                    : `Execution ${execution.id} — FINGERPRINT MISMATCH. Deviations: ${execution.deviations.map(d => `${d.parameter} ${d.delta}`).join(', ')}`,
            }],
        }));
    },

    // ─── Audit Actions ────────────────────────────────────────────────

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
                message: `Audit ${audit.id} generated. Responsibility: ${audit.responsibilityAssignment}. Revenue protected: ¥${audit.economicImpact.revenueProtected.toLocaleString()}.`,
            }],
        }));
    },

    // ─── Approval Actions ──────────────────────────────────────────────

    approveDecision: (approvalId) => {
        set(state => {
            const item = state.approvalQueue.find(a => a.id === approvalId);
            if (!item) return state;
            return {
                approvalQueue: state.approvalQueue.filter(a => a.id !== approvalId),
                eventLog: [...state.eventLog, {
                    timestamp: new Date().toISOString(),
                    type: 'approval',
                    message: `Decision ${approvalId} APPROVED by operator. Rx ${item.prescription?.id} cleared for execution.`,
                }],
            };
        });
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

    setPipelineStage: (stage) => set({ pipelineStage: stage }),

    // ─── UI Actions ───────────────────────────────────────────────────

    toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

    // ─── AI Thinking Actions ──────────────────────────────────────────

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

    stopThinking: () => {
        set({ isThinking: false });
    },

    clearThinking: () => {
        set({ thinkingChain: [], isThinking: false, thinkingContext: null });
    },
}));

export default useStore;
