// Sentinel Decision OS - Decision Engine
// Rule-based risk assessment + prescription generation

import { v4 as uuid } from 'uuid';
import thresholds from '../data/thresholds.js';
import { phiConstraints, windConstraints, executionMethods, bannedPesticides } from '../data/constraints.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const num = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};
const getLeafWetnessHours = (sensors) => num(sensors.leaf_wetness_hrs ?? sensors.leaf_wetness_h, 0);
const riskStatus = (score) => (score >= 70 ? 'critical' : score >= 50 ? 'elevated' : score >= 30 ? 'monitoring' : 'low');
const lowBaselineRisk = (threatId, name, nameZh) => ({
    threatId,
    name,
    nameZh,
    score: 5,
    trend: 'stable',
    status: 'low',
    factors: [],
});

const riskRules = {
    botrytis: (sensors, pests, stage) => {
        const t = thresholds.botrytis;
        if (!t.applicable_stages.includes(stage)) return lowBaselineRisk('botrytis', 'Gray Mold (Botrytis)', '灰霉病');

        const humidity = num(sensors.humidity_pct);
        const leafWetness = getLeafWetnessHours(sensors);
        const sporeIndex = num(pests.botrytis_spore_index);

        let score = 0;
        const factors = [];

        if (humidity > t.humidity_pct) {
            score += (humidity - t.humidity_pct) * 1.6;
            factors.push(`Humidity ${humidity.toFixed(1)}% > ${t.humidity_pct}%`);
        }
        if (leafWetness > t.leaf_wetness_hrs) {
            score += (leafWetness - t.leaf_wetness_hrs) * 5.5;
            factors.push(`Leaf wetness ${leafWetness.toFixed(1)}h > ${t.leaf_wetness_hrs}h`);
        }
        if (sporeIndex > 35) {
            score += sporeIndex * 0.42;
            factors.push(`Spore index ${sporeIndex.toFixed(0)}`);
        }

        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'botrytis',
            name: 'Gray Mold (Botrytis)',
            nameZh: '灰霉病',
            score: finalScore,
            trend: sporeIndex > 50 ? 'rising' : sporeIndex > 30 ? 'stable' : 'falling',
            status: riskStatus(finalScore),
            factors,
        };
    },

    aphids: (sensors, pests, stage) => {
        const t = thresholds.aphids;
        if (!t.applicable_stages.includes(stage)) return lowBaselineRisk('aphids', 'Aphids', '蚜虫');

        const aphids = num(pests.aphids_per_leaf);
        const trap = num(pests.sticky_trap_whitefly ?? pests.sticky_trap_daily);

        let score = 0;
        const factors = [];

        if (aphids > t.per_leaf) {
            score += (aphids - t.per_leaf) * 10;
            factors.push(`Aphids ${aphids.toFixed(1)}/leaf > ${t.per_leaf}/leaf`);
        }
        if (trap > t.sticky_trap_daily) {
            score += 12;
            factors.push(`Trap count ${trap.toFixed(0)} > ${t.sticky_trap_daily}`);
        }

        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'aphids',
            name: 'Aphids',
            nameZh: '蚜虫',
            score: finalScore,
            trend: aphids > t.per_leaf ? 'rising' : 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },

    anthracnose: (sensors, pests, stage) => {
        const t = thresholds.anthracnose;
        if (!t.applicable_stages.includes(stage)) return lowBaselineRisk('anthracnose', 'Anthracnose', '炭疽病');

        const temp = num(sensors.temp_C);
        const humidity = num(sensors.humidity_pct);

        let score = 0;
        const factors = [];

        if (temp > t.temp_min && humidity > t.humidity_pct) {
            score += 35;
            factors.push(`Warm + humid: ${temp.toFixed(1)}C, ${humidity.toFixed(1)}%`);
        }
        if (num(pests.botrytis_spore_index) > 40) {
            score += 8;
            factors.push('Moisture pressure supports fungal spread');
        }

        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'anthracnose',
            name: 'Anthracnose',
            nameZh: '炭疽病',
            score: finalScore,
            trend: finalScore > 40 ? 'rising' : 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },

    spider_mites: (sensors, pests, stage) => {
        const t = thresholds.spider_mites;
        if (!t.applicable_stages.includes(stage)) return lowBaselineRisk('spider_mites', 'Spider Mites', '红蜘蛛');

        const mites = num(pests.mite_density);
        const temp = num(sensors.temp_C);
        const humidity = num(sensors.humidity_pct);

        let score = 0;
        const factors = [];

        if (mites > t.mite_density) {
            score += (mites - t.mite_density) * 10;
            factors.push(`Mite density ${mites.toFixed(1)} > ${t.mite_density}`);
        }
        if (temp > t.temp_min && humidity < t.humidity_max) {
            score += 20;
            factors.push('Hot + dry conditions');
        }

        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'spider_mites',
            name: 'Spider Mites',
            nameZh: '红蜘蛛',
            score: finalScore,
            trend: mites > t.mite_density ? 'rising' : 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },

    root_rot: (sensors, pests, stage) => {
        const t = thresholds.root_rot;
        if (!t.applicable_stages.includes(stage)) return lowBaselineRisk('root_rot', 'Root Rot', '根腐病');

        const soilMoist = num(sensors.soil_moist_pct);

        let score = 0;
        const factors = [];

        if (soilMoist > t.soil_moist_pct) {
            score += (soilMoist - t.soil_moist_pct) * 3;
            factors.push(`Soil moisture ${soilMoist.toFixed(1)}% > ${t.soil_moist_pct}%`);
        }

        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'root_rot',
            name: 'Root Rot',
            nameZh: '根腐病',
            score: finalScore,
            trend: 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },

    compound_pest: (sensors, pests, stage) => {
        const aphids = num(pests.aphids_per_leaf);
        const spores = num(pests.botrytis_spore_index);
        let score = 5;
        const factors = [];
        if (aphids > 5 && spores > 25) {
            score = 78;
            factors.push(`Cascade threat: Aphids (${aphids.toFixed(0)}/leaf) + Fungal spores (${spores.toFixed(0)})`);
            factors.push(`Pest damage providing entry points for secondary infection`);
        }
        return {
            threatId: 'compound_pest',
            name: 'Aphids -> Botrytis Cascade',
            nameZh: '多虫害级联风险',
            score,
            trend: score > 50 ? 'rising' : 'stable',
            status: riskStatus(score),
            factors,
        };
    },

    frost_damage: (sensors, pests, stage) => {
        const temp = num(sensors.temp_C, 20); // Default safe temp
        let score = 5;
        const factors = [];
        if (temp < 8) {
            score = 40 + (8 - temp) * 15;
            factors.push(`Temperature ${temp.toFixed(1)}C approaches/breaches frost threshold`);
        }
        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'frost_damage',
            name: 'Frost Damage Risk',
            nameZh: '霜冻风险',
            score: finalScore,
            trend: temp < 8 ? 'rising' : 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },

    ventilation_failure: (sensors, pests, stage) => {
        const airFlow = num(sensors.air_flow_ms, 1.0);
        const humidity = num(sensors.humidity_pct);
        const powerDraw = sensors.power_draw_w !== undefined ? num(sensors.power_draw_w) : null;

        let score = 5;
        const factors = [];
        if ((airFlow < 0.2 || powerDraw === 0) && humidity > 85) {
            score = 82 + (humidity - 85);
            factors.push(`Ventilation failure detected (Airflow: ${airFlow.toFixed(1)}m/s, Power: ${powerDraw ?? 'N/A'}W)`);
            factors.push(`Critical humidity spike: ${humidity.toFixed(1)}%`);
        }
        const finalScore = clamp(Math.round(score), 0, 100);
        return {
            threatId: 'ventilation_failure',
            name: 'Hardware Failure -> Disease Risk',
            nameZh: '温室通风故障风险',
            score: finalScore,
            trend: score > 50 ? 'rising' : 'stable',
            status: riskStatus(finalScore),
            factors,
        };
    },
};

export const assessRisks = (snapshot) => {
    const { sensors, pests, stage } = snapshot;
    const results = Object.values(riskRules).map(fn => fn(sensors, pests, stage));
    return results.sort((a, b) => b.score - a.score);
};

export const checkConstraints = (action, sensors, daysToHarvest) => {
    const violations = [];
    const warnings = [];

    const actionType = action.action || action.method;

    let windRuleKey = null;
    if (actionType === 'spot_spray' || actionType === 'emergency_spray') windRuleKey = 'drone_spray';
    if (actionType === 'broadcast_spray') windRuleKey = 'broadcast_spray';
    if (actionType === 'biocontrol') windRuleKey = 'biocontrol_release';

    if (action.activeIngredient && action.activeIngredient.key) {
        const phi = phiConstraints[action.activeIngredient.key];
        if (phi && daysToHarvest < phi.days) {
            violations.push({
                type: 'PHI',
                message: `${phi.name}: requires ${phi.days}d PHI, only ${daysToHarvest}d to harvest`,
                severity: 'critical',
            });
        }
    }

    if (windRuleKey && windConstraints[windRuleKey]) {
        const wc = windConstraints[windRuleKey];
        if (num(sensors.wind_speed_ms) > wc.maxWindMs) {
            violations.push({
                type: 'WIND',
                message: `${wc.description}: current ${num(sensors.wind_speed_ms).toFixed(1)} m/s`,
                severity: 'warning',
            });
        }
    }

    if (action.activeIngredient) {
        const ingredientName = action.activeIngredient.name?.toLowerCase() || '';
        const banned = bannedPesticides.find(b => ingredientName.includes(b.name.toLowerCase()));
        if (banned) {
            violations.push({ type: 'BANNED', message: `${banned.name}: ${banned.reason}`, severity: 'critical' });
        }
    }

    if (
        num(sensors.rainfall_mm) > thresholds.environment.rainfall_spray_limit
        && ['spot_spray', 'broadcast_spray', 'emergency_spray'].includes(actionType)
    ) {
        warnings.push({
            type: 'RAIN',
            message: `Rainfall ${num(sensors.rainfall_mm).toFixed(1)}mm - spray effectiveness reduced`,
            severity: 'warning',
        });
    }

    return { violations, warnings, canProceed: violations.filter(v => v.severity === 'critical').length === 0 };
};

const prescriptionTemplates = {
    botrytis: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'mancozeb', name: 'Mancozeb', moaGroup: 'M03' }, dosageRatio: 0.7 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Trichoderma harzianum', moaGroup: 'BCA' }, dosageRatio: 1.0 },
        ventilation: { action: 'ventilation', activeIngredient: null, dosageRatio: 0 },
    },
    aphids: {
        primary: { action: 'broadcast_spray', activeIngredient: { key: 'imidacloprid', name: 'Imidacloprid', moaGroup: '4A' }, dosageRatio: 0.8 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Ladybug release', moaGroup: 'BCA' }, dosageRatio: 1.0 },
    },
    anthracnose: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'chlorothalonil', name: 'Chlorothalonil', moaGroup: 'M05' }, dosageRatio: 0.7 },
        fallback: { action: 'manual_removal', activeIngredient: null, dosageRatio: 0 },
    },
    spider_mites: {
        primary: { action: 'spot_spray', activeIngredient: { key: 'abamectin', name: 'Abamectin', moaGroup: '6' }, dosageRatio: 0.6 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Phytoseiulus persimilis', moaGroup: 'BCA' }, dosageRatio: 1.0 },
    },
    root_rot: {
        primary: { action: 'irrigation', activeIngredient: null, dosageRatio: 0 },
    },
    frost_damage: {
        primary: { action: 'frost_protection', activeIngredient: null, dosageRatio: 0 },
    },
    ventilation_failure: {
        primary: { action: 'emergency_spray', activeIngredient: { key: 'carbendazim', name: 'Carbendazim', moaGroup: '1' }, dosageRatio: 0.8 },
        fallback: { action: 'manual_override', activeIngredient: null, dosageRatio: 0 },
        ventilation: { action: 'dehumidification', activeIngredient: null, dosageRatio: 0 },
    },
    compound_pest: {
        primary: { action: 'compound_sequential', activeIngredient: { key: 'imidacloprid', name: 'Imidacloprid', moaGroup: '4A' }, dosageRatio: 0.8 },
        fallback: { action: 'biocontrol', activeIngredient: { key: null, name: 'Ladybug release', moaGroup: 'BCA' }, dosageRatio: 1.0 },
    },
};

export const generatePrescription = (fieldId, snapshot, riskResults, daysToHarvest = 30) => {
    const topRisk = riskResults.find(r => r.status === 'critical' || r.status === 'elevated') || riskResults[0];
    if (!topRisk) return null;

    const template = prescriptionTemplates[topRisk.threatId];
    if (!template) return null;

    const isPreventiveMode = topRisk.score < 30;
    let chosen = (isPreventiveMode && template.fallback) ? template.fallback : template.primary;

    let constraintResult = checkConstraints({ ...chosen, method: chosen.action }, snapshot.sensors, daysToHarvest);

    let usedFallback = isPreventiveMode && !!template.fallback;
    if (!constraintResult.canProceed && template.fallback) {
        chosen = template.fallback;
        constraintResult = checkConstraints({ ...chosen, method: chosen.action }, snapshot.sensors, daysToHarvest);
        usedFallback = true;
    }

    const supportAction = template.ventilation ? 'ventilation_adjust' : null;

    const rxId = `RX-${uuid().slice(0, 4).toUpperCase()}`;
    const methodInfo = executionMethods[chosen.action] || {};
    const baseCost = (chosen.dosageRatio || 0) * 3000 * (methodInfo.costMultiplier || 1);

    return {
        id: rxId,
        fieldId,
        timestamp: snapshot.timestamp,
        target: fieldId === 'BS-B3' ? 'Field B-3 (Blueberry)' : 'Greenhouse A-2 (Rose)',
        threatId: topRisk.threatId,
        threatName: topRisk.name,
        threatNameZh: topRisk.nameZh || topRisk.name,
        riskScore: topRisk.score,
        action: chosen.action,
        actionLabel: methodInfo.label || chosen.action,
        actionLabelZh: methodInfo.labelZh || methodInfo.label || chosen.action,
        activeIngredient: chosen.activeIngredient,
        dosageRatio: chosen.dosageRatio,
        constraints: {
            wind_max_ms: windConstraints.drone_spray?.maxWindMs || null,
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
            riskReduction: Math.max(5, Math.round(topRisk.score * (isPreventiveMode ? 0.35 : 0.55))),
            gradeProtection: topRisk.score >= 70 ? 'A' : null,
        },
        confidence: usedFallback ? 0.65 : (isPreventiveMode ? 0.74 : 0.82),
        decisionMode: isPreventiveMode ? 'preventive' : 'reactive',
        responsibilityBoundary: 'system',
        estimatedCost: Math.round(baseCost),
        status: 'pending',
    };
};

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
    const totalRiskScore = Math.max(1, riskResults.reduce((s, x) => s + (x.score || 0), 0));

    return {
        total: revenueAtRisk,
        currentGrade: field.gradeClass,
        currentPrice,
        downgradePrice,
        downgradeProbability: +(downgradeProbability * 100).toFixed(0),
        volume,
        breakdown: riskResults.filter(r => r.score >= 30).map(r => ({
            threat: r.name,
            contribution: Math.round(revenueAtRisk * ((r.score || 0) / totalRiskScore)),
        })),
    };
};

