// Sentinel Decision OS — Execution Engine
// Simulates prescription execution, generates execution fingerprints

import { v4 as uuid } from 'uuid';

// Simple hash function (browser-compatible, no crypto-js needed)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32-bit
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256:${hex}${hex.split('').reverse().join('')}`;
};

// Generate execution fingerprint from prescription parameters
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

// Simulate execution of a prescription
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
    const actualParams = {
        ...prescription,
        dosageRatio: actualDosage,
    };
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
    };

    return execution;
};

// Generate execution progress steps
const generateExecutionSteps = (rx, failed, delay) => {
    const base = new Date(rx.timestamp);
    const steps = [
        { id: 1, label: 'Prescription Queued', status: 'completed', time: new Date(base.getTime()).toISOString(), detail: `Rx ${rx.id} queued for execution` },
        { id: 2, label: 'Pre-flight Check', status: 'completed', time: new Date(base.getTime() + 10 * 60000).toISOString(), detail: 'Wind: OK, Battery: 98%, GPS: locked' },
        { id: 3, label: 'Dispatched to Field', status: 'completed', time: new Date(base.getTime() + (15 + delay) * 60000).toISOString(), detail: `Drone en route to ${rx.target}` },
        { id: 4, label: 'Spraying / Applying', status: failed ? 'failed' : 'completed', time: new Date(base.getTime() + (25 + delay) * 60000).toISOString(), detail: failed ? 'Execution aborted: battery critical' : `Coverage: ${rx.action}, dosage applied` },
        { id: 5, label: 'Verification Pending', status: failed ? 'skipped' : 'pending', time: null, detail: '72h post-application recheck scheduled' },
    ];
    return steps;
};

// Compute dosage comparison chart data
export const getDosageComparisonData = (execution) => {
    if (!execution) return [];
    return [
        { name: 'Sentinel Precision', dosage_ml: Math.round(execution.actualDosageRatio * 300), type: 'sentinel' },
        { name: 'Traditional Broadcast', dosage_ml: 300, type: 'traditional' },
    ];
};
