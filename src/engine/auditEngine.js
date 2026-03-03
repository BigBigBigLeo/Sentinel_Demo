// Sentinel Decision OS — Audit Engine
// Generates compliance records, responsibility chains, economic impact

import { v4 as uuid } from 'uuid';

// Generate audit record from prescription + execution
export const generateAuditRecord = (prescription, execution, riskBefore, riskAfter, field) => {
    const audId = 'AUD-' + uuid().slice(0, 4).toUpperCase();

    const fingerprintMatch = execution.executionFingerprint.match;
    const hasDeviations = execution.deviations.length > 0;

    // Responsibility logic: if fingerprint matches, system holds responsibility
    // If operator modified prescription OR execution deviated, responsibility shifts
    let responsibility = 'system';
    let responsibilityNote = 'Decision generated and executed as prescribed by Sentinel. Execution fingerprint matched — full system responsibility.';

    if (prescription.responsibilityBoundary === 'operator') {
        responsibility = 'operator';
        responsibilityNote = 'Prescription modified by operator before execution. Responsibility shifted to operator per terminal neutrality principle.';
    } else if (!fingerprintMatch || hasDeviations) {
        responsibility = 'operator';
        responsibilityNote = `Execution deviated from prescription (${execution.deviations.map(d => `${d.parameter}: ${d.delta}`).join(', ')}). Responsibility shifted to operator.`;
    }

    const gradeClasses = field.crop === 'blueberry'
        ? { A: 180, B: 95, C: 40 }
        : { A: 8.5, B: 4.2, C: 1.5 };

    const volume = field.estimatedVolume || 3600;
    const currentPrice = gradeClasses[field.gradeClass] || gradeClasses.A;
    const downgradePrice = gradeClasses[field.gradeClass === 'A' ? 'B' : 'C'] || gradeClasses.C;

    const revenueProtected = riskBefore > 50
        ? Math.round((currentPrice - downgradePrice) * volume * (riskBefore - riskAfter) / 100)
        : 0;

    const costOfAction = prescription.estimatedCost || 0;

    return {
        id: audId,
        prescriptionId: prescription.id,
        executionId: execution.id,
        fieldId: field.id,
        timestamp: execution.endTime || execution.startTime,
        decisionChain: {
            generatedBy: 'sentinel-engine-v4.2',
            approvedBy: prescription.responsibilityBoundary === 'operator' ? 'operator-modified' : 'auto-approved',
            executedBy: execution.operatorId,
        },
        fingerprintMatch,
        responsibilityAssignment: responsibility,
        responsibilityNote,
        compliance: {
            phi_compliant: prescription.constraintCheck?.violations?.filter(v => v.type === 'PHI').length === 0,
            gap_compliant: true,
            fsma204_compliant: true,
            pesticide_within_label: !hasDeviations || execution.deviations.every(d => d.severity !== 'critical'),
            wind_compliant: prescription.constraintCheck?.violations?.filter(v => v.type === 'WIND').length === 0,
        },
        beforeState: {
            riskScore: riskBefore,
            gradeClass: field.gradeClass,
            revenueAtRisk: Math.round((currentPrice - downgradePrice) * volume * riskBefore / 100),
        },
        afterState: {
            riskScore: riskAfter,
            gradeClass: riskAfter < 50 ? field.gradeClass : (field.gradeClass === 'A' ? 'B' : 'C'),
            revenueAtRisk: Math.round((currentPrice - downgradePrice) * volume * riskAfter / 100),
        },
        economicImpact: {
            revenueProtected,
            costOfAction,
            roi: costOfAction > 0 ? +((revenueProtected / costOfAction)).toFixed(1) : 0,
            decisionDensity: 1, // decisions per hectare this cycle
        },
        status: execution.status === 'failed' ? 'incomplete' : 'verified',
    };
};

// Compute compliance summary across all audit records
export const getComplianceSummary = (auditRecords) => {
    if (!auditRecords.length) return { total: 0, compliant: 0, rate: 100 };
    const compliant = auditRecords.filter(a =>
        a.compliance.phi_compliant &&
        a.compliance.gap_compliant &&
        a.compliance.fsma204_compliant &&
        a.compliance.pesticide_within_label
    ).length;
    return {
        total: auditRecords.length,
        compliant,
        rate: Math.round((compliant / auditRecords.length) * 100),
        badges: {
            phi: auditRecords.every(a => a.compliance.phi_compliant),
            gap: auditRecords.every(a => a.compliance.gap_compliant),
            fsma204: auditRecords.every(a => a.compliance.fsma204_compliant),
            label: auditRecords.every(a => a.compliance.pesticide_within_label),
            wind: auditRecords.every(a => a.compliance.wind_compliant),
        },
    };
};

// Decision loop stages for visualization
export const DECISION_LOOP_STAGES = [
    { id: 1, name: 'Perception', nameZh: '感知', icon: 'perception', description: 'Sensor telemetry ingestion' },
    { id: 2, name: 'Reasoning', nameZh: '推理', icon: 'reasoning', description: 'Risk assessment + decision window' },
    { id: 3, name: 'Prescription', nameZh: '处方', icon: 'prescription', description: 'Structured Rx generation' },
    { id: 4, name: 'Execution', nameZh: '执行', icon: 'drone', description: 'Autonomous or guided action' },
    { id: 5, name: 'Audit', nameZh: '审计', icon: 'audit-alt', description: 'Compliance + responsibility record' },
];
