// Sentinel Decision OS — Decision Engine
// Rule-based risk assessment + prescription generation

import { v4 as uuid } from 'uuid';
import thresholds from '../data/thresholds.js';
import { phiConstraints, windConstraints, executionMethods, bannedPesticides } from '../data/constraints.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ───────────────────────────────── Risk Rules ─────────────────────────────────

const riskRules = {
    botrytis: (sensors, pests, stage) => {
        const t = thresholds.botrytis;
        if (!t.applicable_stages.includes(stage)) return { score: 5, trend: 'stable', status: 'low', factors: [] };
        const factors = [];
        let score = 0;
        if (sensors.humidity_pct > t.humidity_pct) { score += (sensors.humidity_pct - t.humidity_pct) * 2; factors.push(`Humidity ${sensors.humidity_pct}% > ${t.humidity_pct}%`); }
        if (sensors.leaf_wetness_hrs > t.leaf_wetness_hrs) { score += (sensors.leaf_wetness_hrs - t.leaf_wetness_hrs) * 6; factors.push(`Leaf wetness ${sensors.leaf_wetness_hrs}h > ${t.leaf_wetness_hrs}h`); }
        if (pests.botrytis_spore_index > 40) { score += pests.botrytis_spore_index * 0.4; factors.push(`Spore index ${pests.botrytis_spore_index}`); }
        score = clamp(Math.round(score), 0, 100);
        const status = score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low';
        const trend = pests.botrytis_spore_index > 50 ? 'rising' : pests.botrytis_spore_index > 30 ? 'stable' : 'falling';
        return { score, trend, status, factors, threatId: 'botrytis', name: 'Gray Mold (Botrytis)', nameZh: '灰霉病' };
    },

    aphids: (sensors, pests, stage) => {
        const t = thresholds.aphids;
        if (!t.applicable_stages.includes(stage)) return { score: 5, trend: 'stable', status: 'low', factors: [] };
        const factors = [];
        let score = 0;
        if (pests.aphids_per_leaf > t.per_leaf) { score += (pests.aphids_per_leaf - t.per_leaf) * 12; factors.push(`Aphids ${pests.aphids_per_leaf}/leaf > ${t.per_leaf}/leaf`); }
        if (pests.sticky_trap_whitefly > t.sticky_trap_daily) { score += 15; factors.push(`Trap count ${pests.sticky_trap_whitefly} > ${t.sticky_trap_daily}`); }
        score = clamp(Math.round(score), 0, 100);
        const status = score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low';
        const trend = pests.aphids_per_leaf > t.per_leaf ? 'rising' : 'stable';
        return { score, trend, status, factors, threatId: 'aphids', name: 'Aphids', nameZh: '蚜虫' };
    },

    anthracnose: (sensors, pests, stage) => {
        const t = thresholds.anthracnose;
        if (!t.applicable_stages.includes(stage)) return { score: 5, trend: 'stable', status: 'low', factors: [] };
        const factors = [];
        let score = 0;
        if (sensors.temp_C > t.temp_min && sensors.humidity_pct > t.humidity_pct) {
            score += 30; factors.push(`Warm + humid: ${sensors.temp_C}C, ${sensors.humidity_pct}%`);
        }
        score = clamp(Math.round(score + Math.random() * 20), 0, 100);
        const status = score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low';
        return { score, trend: 'stable', status, factors, threatId: 'anthracnose', name: 'Anthracnose', nameZh: '炭疽病' };
    },

    spider_mites: (sensors, pests, stage) => {
        const t = thresholds.spider_mites;
        if (!t.applicable_stages.includes(stage)) return { score: 5, trend: 'stable', status: 'low', factors: [] };
        const factors = [];
        let score = 0;
        if (pests.mite_density > t.mite_density) { score += (pests.mite_density - t.mite_density) * 10; factors.push(`Mite density ${pests.mite_density}`); }
        if (sensors.temp_C > t.temp_min && sensors.humidity_pct < t.humidity_max) { score += 20; factors.push('Hot + dry conditions'); }
        score = clamp(Math.round(score), 0, 100);
        const status = score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low';
        return { score, trend: pests.mite_density > t.mite_density ? 'rising' : 'stable', status, factors, threatId: 'spider_mites', name: 'Spider Mites', nameZh: '红蜘蛛' };
    },

    root_rot: (sensors, pests, stage) => {
        const t = thresholds.root_rot;
        if (!t.applicable_stages.includes(stage)) return { score: 5, trend: 'stable', status: 'low', factors: [] };
        const factors = [];
        let score = 0;
        if (sensors.soil_moist_pct > t.soil_moist_pct) { score += (sensors.soil_moist_pct - t.soil_moist_pct) * 3; factors.push(`Soil moisture ${sensors.soil_moist_pct}%`); }
        score = clamp(Math.round(score), 0, 100);
        const status = score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low';
        return { score, trend: 'stable', status, factors, threatId: 'root_rot', name: 'Root Rot', nameZh: '根腐病' };
    },
};

// ────────────────────────── Full Risk Assessment ──────────────────────────────

export const assessRisks = (snapshot) => {
    const { sensors, pests, stage } = snapshot;
    const ruleNames = {
        botrytis: { name: 'Gray Mold (Botrytis)', nameZh: '灰霉病' },
        aphids: { name: 'Aphids', nameZh: '蚜虫' },
        anthracnose: { name: 'Anthracnose', nameZh: '炭疽病' },
        spider_mites: { name: 'Spider Mites', nameZh: '红蜘蛛' },
        root_rot: { name: 'Root Rot', nameZh: '根腐病' },
    };
    const results = [];
    for (const [key, ruleFn] of Object.entries(riskRules)) {
        const result = ruleFn(sensors, pests, stage);
        // Always ensure threatId and name are set
        result.threatId = result.threatId || key;
        result.name = result.name || ruleNames[key]?.name || key;
        result.nameZh = result.nameZh || ruleNames[key]?.nameZh || '';
        results.push(result);
    }
    return results.sort((a, b) => b.score - a.score);
};

// ─────────────────────────── Constraint Checking ─────────────────────────────

export const checkConstraints = (action, sensors, daysToHarvest) => {
    const violations = [];
    const warnings = [];

    // PHI check
    if (action.activeIngredient && action.activeIngredient.key) {
        const phi = phiConstraints[action.activeIngredient.key];
        if (phi && daysToHarvest < phi.days) {
            violations.push({ type: 'PHI', message: `${phi.name}: requires ${phi.days}d PHI, only ${daysToHarvest}d to harvest`, severity: 'critical' });
        }
    }

    // Wind check
    if (action.method && windConstraints[action.method]) {
        const wc = windConstraints[action.method];
        if (sensors.wind_speed_ms > wc.maxWindMs) {
            violations.push({ type: 'WIND', message: `${wc.description}: current ${sensors.wind_speed_ms} m/s`, severity: 'warning' });
        }
    }

    // Banned substance check
    if (action.activeIngredient) {
        const banned = bannedPesticides.find(b => b.name.toLowerCase().includes(action.activeIngredient.name?.toLowerCase()));
        if (banned) {
            violations.push({ type: 'BANNED', message: `${banned.name}: ${banned.reason}`, severity: 'critical' });
        }
    }

    // Rain check
    if (sensors.rainfall_mm > thresholds.environment.rainfall_spray_limit && (action.method === 'spot_spray' || action.method === 'broadcast_spray')) {
        warnings.push({ type: 'RAIN', message: `Rainfall ${sensors.rainfall_mm}mm — spray effectiveness reduced`, severity: 'warning' });
    }

    return { violations, warnings, canProceed: violations.filter(v => v.severity === 'critical').length === 0 };
};

// ─────────────────────────── Prescription Generator ──────────────────────────

const prescriptionTemplates = {
    botrytis: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'mancozeb', name: 'Mancozeb (代森锰锌)', moaGroup: 'M03' }, dosageRatio: 0.7 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Trichoderma harzianum (木霉菌)', moaGroup: 'BCA' }, dosageRatio: 1.0 },
        ventilation: { action: 'ventilation', activeIngredient: null, dosageRatio: 0 },
    },
    aphids: {
        primary: { action: 'broadcast_spray', activeIngredient: { key: 'imidacloprid', name: 'Imidacloprid 2000x (吡虫啉)', moaGroup: '4A' }, dosageRatio: 0.8 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Coccinellidae release (瓢虫释放)', moaGroup: 'BCA' }, dosageRatio: 1.0 },
    },
    anthracnose: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'chlorothalonil', name: 'Chlorothalonil (百菌清)', moaGroup: 'M05' }, dosageRatio: 0.7 },
        fallback: { action: 'manual_removal', activeIngredient: null, dosageRatio: 0 },
    },
    spider_mites: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'abamectin', name: 'Abamectin (阿维菌素)', moaGroup: '6' }, dosageRatio: 0.6 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Phytoseiulus persimilis (智利小植绥螨)', moaGroup: 'BCA' }, dosageRatio: 1.0 },
    },
    root_rot: {
        primary: { action: 'irrigation', activeIngredient: null, dosageRatio: 0 },
    },
};

export const generatePrescription = (fieldId, snapshot, riskResults, daysToHarvest = 30) => {
    // Find highest critical risk
    const topRisk = riskResults.find(r => r.status === 'critical' || r.status === 'elevated');
    if (!topRisk) return null;

    const template = prescriptionTemplates[topRisk.threatId];
    if (!template) return null;

    // Try primary action first, fall back if constraints violated
    let chosen = template.primary;
    let constraintResult = checkConstraints({ ...chosen, method: chosen.action }, snapshot.sensors, daysToHarvest);

    let usedFallback = false;
    if (!constraintResult.canProceed && template.fallback) {
        chosen = template.fallback;
        constraintResult = checkConstraints({ ...chosen, method: chosen.action }, snapshot.sensors, daysToHarvest);
        usedFallback = true;
    }

    // Also add ventilation if available
    const supportAction = template.ventilation ? 'ventilation_adjust' : null;

    const rxId = 'RX-' + uuid().slice(0, 4).toUpperCase();
    const methodInfo = executionMethods[chosen.action] || {};
    const baseCost = (chosen.dosageRatio || 0) * 3000 * (methodInfo.costMultiplier || 1);

    return {
        id: rxId,
        fieldId,
        timestamp: snapshot.timestamp,
        target: fieldId === 'BS-B3' ? '棚区B-3 第4号垄' : '温棚A-2 东区',
        threatId: topRisk.threatId,
        threatName: topRisk.name,
        riskScore: topRisk.score,
        action: chosen.action,
        actionLabel: methodInfo.label || chosen.action,
        activeIngredient: chosen.activeIngredient,
        dosageRatio: chosen.dosageRatio,
        constraints: {
            wind_max_ms: windConstraints[chosen.action]?.maxWindMs || null,
            phi_days: chosen.activeIngredient?.key ? (phiConstraints[chosen.activeIngredient.key]?.days || 0) : 0,
            soil_moisture_max_pct: 40,
            banned_substances: bannedPesticides.map(b => b.name),
        },
        constraintCheck: constraintResult,
        usedFallback,
        supportAction,
        verification: {
            recheckAfterHours: 72,
            targetReduction: 'Lesion area / spore count reduction >= 30%',
            photoRequired: true,
        },
        expectedOutcome: {
            riskReduction: Math.round(topRisk.score * 0.55),
            gradeProtection: topRisk.score >= 70 ? 'A' : null,
        },
        confidence: usedFallback ? 0.65 : 0.82,
        responsibilityBoundary: 'system',
        estimatedCost: Math.round(baseCost),
        status: 'pending',
    };
};

// ─────────────────────────── Revenue at Risk ─────────────────────────────────

export const calculateRevenueAtRisk = (field, riskResults) => {
    const topRisk = riskResults[0];
    if (!topRisk || topRisk.score < 30) return { total: 0, breakdown: [] };

    const gradeClasses = field.crop === 'blueberry'
        ? { A: 180, B: 95, C: 40 }
        : { A: 8.5, B: 4.2, C: 1.5 };

    const volume = field.estimatedVolume || 3600;
    const currentPrice = gradeClasses[field.gradeClass] || gradeClasses.A;
    const downgradePrice = gradeClasses[field.gradeClass === 'A' ? 'B' : 'C'] || gradeClasses.C;
    const downgradeProbability = Math.min(topRisk.score / 100, 0.95);

    const revenueAtRisk = Math.round((currentPrice - downgradePrice) * volume * downgradeProbability);

    return {
        total: revenueAtRisk,
        currentGrade: field.gradeClass,
        currentPrice,
        downgradePrice,
        downgradeProbability: +(downgradeProbability * 100).toFixed(0),
        volume,
        breakdown: riskResults.filter(r => r.score >= 30).map(r => ({
            threat: r.name,
            contribution: Math.round(revenueAtRisk * (r.score / riskResults.reduce((s, x) => s + x.score, 0))),
        })),
    };
};
