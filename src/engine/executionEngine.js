// Sentinel Decision OS — Execution Engine v2
// Multi-actor, multi-zone precision execution with staggered timelines

import { v4 as uuid } from 'uuid';

// Simple hash function (browser-compatible)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:${hex}${hex.split('').reverse().join('')}`;
};

export const generateFingerprint = (params) => {
    const canonical = JSON.stringify({
        target: params.target,
        action: params.action,
        dosageRatio: params.dosageRatio,
        activeIngredient: params.activeIngredient?.name || 'none',
        constraints: params.constraints,
    });
    return simpleHash(canonical);
};

// Generate drone flight path (grid pattern with some randomness)
const generateFlightPath = (rows = 8, cols = 6) => {
    const path = [];
    for (let r = 0; r < rows; r++) {
        const direction = r % 2 === 0 ? 1 : -1;
        for (let c = 0; c < cols; c++) {
            const col = direction === 1 ? c : cols - 1 - c;
            path.push({
                x: col * 15 + Math.random() * 3,
                y: r * 12 + Math.random() * 2,
                altitude: 3.5 + Math.random() * 0.5,
                sprayActive: true,
            });
        }
    }
    return path;
};

// ─── Multi-Actor Execution Plan ─────────────────────────────────────────

export const generateExecutionPlan = (prescription) => {
    const base = new Date(prescription.timestamp || Date.now());
    const r = (min, max) => +(min + Math.random() * (max - min)).toFixed(1);

    return [
        {
            id: 'ACT-001',
            actor: 'Drone-01',
            actorType: 'drone',
            action: 'Precision spot spray',
            detail: `${prescription.activeIngredient?.name || 'Mancozeb'} at ${(prescription.dosageRatio || 0.7) * 100}% label rate`,
            targetZone: 'Rows 4-7, East',
            precision: 'Symptomatic canopy only, 2m altitude, droplet size 150-200μm',
            scheduledTime: new Date(base.getTime()).toISOString(),
            offsetLabel: 'T+0h',
            estimatedDuration: '42 min',
            status: 'completed',
            coverage: `${Math.round(88 + Math.random() * 10)}%`,
            chemicalUsed: `${r(1.2, 2.8)} L`,
        },
        {
            id: 'ACT-002',
            actor: 'Drone-02',
            actorType: 'drone',
            action: 'Aerial reconnaissance scan',
            detail: 'RGB + NDVI preventive scan for early detection',
            targetZone: 'Rows 1-3, West (preventive)',
            precision: 'Full coverage grid at 5m altitude, 2cm/px resolution',
            scheduledTime: new Date(base.getTime()).toISOString(),
            offsetLabel: 'T+0h',
            estimatedDuration: '28 min',
            status: 'completed',
            coverage: '100%',
            chemicalUsed: 'N/A (scan only)',
        },
        {
            id: 'ACT-003',
            actor: 'IoT Control',
            actorType: 'iot',
            action: 'Ventilation increase',
            detail: 'Fan speed → 80% to reduce ambient humidity below 80%',
            targetZone: 'Greenhouse Zones A-C',
            precision: 'Automated PID control, target: <80% RH within 2h',
            scheduledTime: new Date(base.getTime()).toISOString(),
            offsetLabel: 'T+0h',
            estimatedDuration: 'Continuous',
            status: 'in-progress',
            coverage: '100%',
            chemicalUsed: 'N/A (environmental)',
        },
        {
            id: 'ACT-004',
            actor: 'Field Team A',
            actorType: 'human',
            action: 'Manual pruning',
            detail: 'Remove infected tissue: 15+ lesion sites identified by drone scan',
            targetZone: 'Rows 4-5 (worst affected)',
            precision: 'Sterile shears, bag-and-remove protocol, prevent spore dispersal',
            scheduledTime: new Date(base.getTime() + 2 * 3600000).toISOString(),
            offsetLabel: 'T+2h',
            estimatedDuration: '3h',
            status: 'pending',
            coverage: 'Targeted',
            chemicalUsed: 'N/A (mechanical)',
        },
        {
            id: 'ACT-005',
            actor: 'Irrigation System',
            actorType: 'facility',
            action: 'Soil moisture reduction',
            detail: `Drip line valve adjustment: target moisture from current level to 28%`,
            targetZone: 'All zones',
            precision: 'Zone-specific valve control, TDR sensor feedback loop',
            scheduledTime: new Date(base.getTime() + 1 * 3600000).toISOString(),
            offsetLabel: 'T+1h',
            estimatedDuration: '6h ramp-down',
            status: 'in-progress',
            coverage: '100%',
            chemicalUsed: 'N/A (water management)',
        },
        {
            id: 'ACT-006',
            actor: 'Drone-03',
            actorType: 'drone',
            action: 'Post-treatment verification',
            detail: 'Hyperspectral re-scan to compare pre/post imagery, validate efficacy',
            targetZone: 'Rows 4-7 (treated area)',
            precision: '224-band hyperspectral at 3cm/px, comparative analysis',
            scheduledTime: new Date(base.getTime() + 72 * 3600000).toISOString(),
            offsetLabel: 'T+72h',
            estimatedDuration: '35 min',
            status: 'scheduled',
            coverage: '100%',
            chemicalUsed: 'N/A (verification)',
        },
    ];
};

// ─── Original execution function (preserved) ───────────────────────────

export const executePresciption = (prescription, options = {}) => {
    const {
        deviateDosage = false,
        deviationFactor = 1.0,
        simulateFailure = false,
        delayMinutes = 0,
    } = options;

    const exId = 'EX-' + uuid().slice(0, 4).toUpperCase();
    const startTime = new Date(prescription.timestamp);
    startTime.setMinutes(startTime.getMinutes() + 25 + delayMinutes);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 42);

    const actualDosage = deviateDosage
        ? +(prescription.dosageRatio * deviationFactor).toFixed(2)
        : prescription.dosageRatio;

    const prescribedFingerprint = generateFingerprint(prescription);
    const actualParams = { ...prescription, dosageRatio: actualDosage };
    const actualFingerprint = generateFingerprint(actualParams);
    const match = prescribedFingerprint === actualFingerprint;

    const deviations = [];
    if (deviateDosage) {
        deviations.push({
            parameter: 'dosageRatio',
            prescribed: prescription.dosageRatio,
            actual: actualDosage,
            delta: +((actualDosage - prescription.dosageRatio) * 100).toFixed(0) + '%',
            severity: Math.abs(actualDosage - prescription.dosageRatio) > 0.3 ? 'critical' : 'warning',
        });
    }

    const flightPath = prescription.action.includes('spray') ? generateFlightPath() : null;
    const executionPlan = generateExecutionPlan(prescription);

    const execution = {
        id: exId,
        prescriptionId: prescription.id,
        fieldId: prescription.fieldId,
        startTime: startTime.toISOString(),
        endTime: simulateFailure ? null : endTime.toISOString(),
        method: prescription.action.includes('spray') ? 'drone_spray' : prescription.action === 'biocontrol' ? 'manual_release' : 'iot_control',
        actualDosageRatio: actualDosage,
        actualCoverage_pct: simulateFailure ? 34 : Math.round(88 + Math.random() * 10),
        flightPath,
        executionPlan,
        executionFingerprint: {
            prescribed: prescribedFingerprint,
            actual: actualFingerprint,
            match,
        },
        deviations,
        operatorId: 'FIELD-TEAM-01',
        status: simulateFailure ? 'failed' : 'completed',
        dosageComparison: {
            sentinel: actualDosage,
            traditional: 1.0,
            savings_pct: Math.round((1 - actualDosage) * 100),
            costSentinel: Math.round(actualDosage * 3000),
            costTraditional: 3000,
        },
        steps: generateExecutionSteps(prescription, simulateFailure, delayMinutes),
        precisionMetrics: {
            chemicalReduction: `${Math.round((1 - actualDosage) * 100)}%`,
            areaTargeted: `${Math.round(25 + Math.random() * 15)}%`,
            areaSpared: `${Math.round(60 + Math.random() * 15)}%`,
            actorsUsed: executionPlan.length,
            timelineSpan: '72h',
        },
    };

    return execution;
};

// Generate execution progress steps
const generateExecutionSteps = (rx, failed, delay) => {
    const base = new Date(rx.timestamp);
    const steps = [
        { id: 1, label: 'Prescription Queued', status: 'completed', time: new Date(base.getTime()).toISOString(), detail: `Rx ${rx.id} queued — multi-actor execution plan generated` },
        { id: 2, label: 'Pre-flight Check', status: 'completed', time: new Date(base.getTime() + 10 * 60000).toISOString(), detail: 'Drone-01: Battery 98%, GPS locked | Drone-02: Battery 95%, GPS locked' },
        { id: 3, label: 'IoT Systems Activated', status: 'completed', time: new Date(base.getTime() + 12 * 60000).toISOString(), detail: 'Ventilation → 80% | Irrigation target → 28%' },
        { id: 4, label: 'Drones Dispatched', status: 'completed', time: new Date(base.getTime() + (15 + delay) * 60000).toISOString(), detail: `Drone-01 → Rows 4-7 (spray) | Drone-02 → Rows 1-3 (recon)` },
        { id: 5, label: 'Precision Spray Complete', status: failed ? 'failed' : 'completed', time: new Date(base.getTime() + (25 + delay) * 60000).toISOString(), detail: failed ? 'Execution aborted: battery critical' : `Coverage: ${Math.round(88 + Math.random() * 10)}% | Chemical used: ${(rx.dosageRatio * 3).toFixed(1)} L` },
        { id: 6, label: 'Field Team Dispatched', status: failed ? 'skipped' : 'completed', time: new Date(base.getTime() + 2 * 3600000).toISOString(), detail: 'Team A → Rows 4-5 for manual pruning of infected tissue' },
        { id: 7, label: 'Verification Scan Scheduled', status: 'scheduled', time: new Date(base.getTime() + 72 * 3600000).toISOString(), detail: 'Drone-03: Hyperspectral re-scan at T+72h for efficacy validation' },
    ];
    return steps;
};

export const getDosageComparisonData = (execution) => {
    if (!execution) return [];
    return [
        { name: 'Sentinel Precision', dosage_ml: Math.round(execution.actualDosageRatio * 300), type: 'sentinel' },
        { name: 'Traditional Broadcast', dosage_ml: 300, type: 'traditional' },
    ];
};
