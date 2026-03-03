// Sentinel AgriAI — Rule-Based Decision Engine
// Implements threshold rules from the research report for Yunnan blueberry & flower

import { currentSensors, pestMonitoring, previousActions } from './mockData';

/**
 * Risk assessment rules — each returns a risk object
 */
const rules = {
    // Gray Mold (Botrytis) — triggers when humidity high + consecutive overcast
    grayMold: (sensors, pests, field) => {
        const humidity = sensors.humidity_pct;
        const isFlowering = true; // simplified: assume flowering stage from mock
        const humidityThreshold = field.crop === 'blueberry' ? 65 : 90;
        const score = Math.min(100, Math.round(
            (humidity > humidityThreshold ? 40 : 0) +
            (humidity > 85 ? 25 : humidity > 75 ? 15 : 0) +
            (pests.botrytis_infection_pct > 2 ? 20 : pests.botrytis_infection_pct > 0 ? 10 : 0) +
            (isFlowering ? 10 : 0) +
            (sensors.light_Lux < 10000 ? 10 : 0)
        ));

        let status = 'low';
        if (score >= 70) status = 'critical';
        else if (score >= 50) status = 'elevated';
        else if (score >= 30) status = 'monitoring';

        return {
            threat: 'Gray Mold (Botrytis cinerea)',
            score,
            status,
            factors: [
                { name: 'Relative Humidity', value: `${humidity}%`, threshold: `>${humidityThreshold}%`, breached: humidity > humidityThreshold },
                { name: 'Light Intensity', value: `${sensors.light_Lux} Lux`, threshold: '<10000 Lux', breached: sensors.light_Lux < 10000 },
                { name: 'Infection Rate', value: `${pests.botrytis_infection_pct || 0}%`, threshold: '>2%', breached: (pests.botrytis_infection_pct || 0) > 2 },
                { name: 'Growth Stage', value: 'Flowering', threshold: 'Flowering/Fruiting', breached: isFlowering },
            ],
        };
    },

    // Aphid threshold
    aphids: (sensors, pests) => {
        const aphidsPerLeaf = pests.aphids_per_leaf || 0;
        const stickyTrap = pests.sticky_trap_daily || 0;
        const score = Math.min(100, Math.round(
            (aphidsPerLeaf > 5 ? 50 : aphidsPerLeaf > 3 ? 30 : aphidsPerLeaf > 1 ? 10 : 0) +
            (stickyTrap > 20 ? 30 : stickyTrap > 10 ? 15 : 0) +
            (sensors.temp_C > 25 ? 10 : 0)
        ));

        let status = 'low';
        if (score >= 70) status = 'critical';
        else if (score >= 50) status = 'elevated';
        else if (score >= 30) status = 'monitoring';

        return {
            threat: 'Aphids',
            score,
            status,
            factors: [
                { name: 'Aphids/Leaf', value: `${aphidsPerLeaf}`, threshold: '>5', breached: aphidsPerLeaf > 5 },
                { name: 'Sticky Trap Count', value: `${stickyTrap}/day`, threshold: '>20/day', breached: stickyTrap > 20 },
                { name: 'Temperature', value: `${sensors.temp_C}°C`, threshold: '>25°C', breached: sensors.temp_C > 25 },
            ],
        };
    },

    // Anthracnose (blueberry)
    anthracnose: (sensors, pests) => {
        const lesions = pests.anthracnose_lesion_pct || 0;
        const score = Math.min(100, Math.round(
            (lesions > 0 ? 40 : 0) +
            (sensors.humidity_pct > 80 ? 25 : 0) +
            (sensors.temp_C > 25 ? 20 : sensors.temp_C > 20 ? 10 : 0) +
            (sensors.rainfall_mm > 5 ? 15 : sensors.rainfall_mm > 2 ? 8 : 0)
        ));

        let status = 'low';
        if (score >= 70) status = 'critical';
        else if (score >= 50) status = 'elevated';
        else if (score >= 30) status = 'monitoring';

        return {
            threat: 'Anthracnose (Colletotrichum)',
            score,
            status,
            factors: [
                { name: 'Fruit Lesion Rate', value: `${lesions}%`, threshold: '>0%', breached: lesions > 0 },
                { name: 'Humidity', value: `${sensors.humidity_pct}%`, threshold: '>80%', breached: sensors.humidity_pct > 80 },
                { name: 'Temperature', value: `${sensors.temp_C}°C`, threshold: '>25°C', breached: sensors.temp_C > 25 },
                { name: 'Rainfall', value: `${sensors.rainfall_mm} mm`, threshold: '>5mm', breached: sensors.rainfall_mm > 5 },
            ],
        };
    },

    // Spider Mites (flower)
    spiderMites: (sensors, pests) => {
        const density = pests.spider_mite_density || 0;
        const score = Math.min(100, Math.round(
            (density > 10 ? 50 : density > 5 ? 30 : density > 2 ? 10 : 0) +
            (sensors.temp_C > 28 ? 25 : sensors.temp_C > 24 ? 15 : 0) +
            (sensors.humidity_pct < 60 ? 20 : 0)
        ));

        let status = 'low';
        if (score >= 70) status = 'critical';
        else if (score >= 50) status = 'elevated';
        else if (score >= 30) status = 'monitoring';

        return {
            threat: 'Spider Mites',
            score,
            status,
            factors: [
                { name: 'Mite Density', value: `${density}`, threshold: '>10', breached: density > 10 },
                { name: 'Temperature', value: `${sensors.temp_C}°C`, threshold: '>28°C', breached: sensors.temp_C > 28 },
                { name: 'Humidity', value: `${sensors.humidity_pct}%`, threshold: '<60%', breached: sensors.humidity_pct < 60 },
            ],
        };
    },
};

/**
 * Run full risk assessment for a field
 */
export function assessRisks(fieldId, fieldData) {
    const sensors = currentSensors[fieldId];
    const pests = pestMonitoring[fieldId];

    if (!sensors || !pests) return [];

    const results = [];

    results.push(rules.grayMold(sensors, pests, fieldData));
    results.push(rules.aphids(sensors, pests));

    if (fieldData.crop === 'blueberry') {
        results.push(rules.anthracnose(sensors, pests));
    }
    if (fieldData.crop === 'flower') {
        results.push(rules.spiderMites(sensors, pests));
    }

    return results.sort((a, b) => b.score - a.score);
}

/**
 * Generate structured prescription based on highest risk
 */
export function generatePrescription(fieldId, fieldData) {
    const sensors = currentSensors[fieldId];
    const actions = previousActions[fieldId];
    const risks = assessRisks(fieldId, fieldData);

    if (!risks.length) return null;

    const topRisk = risks[0];
    const prescriptionId = `RX-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    // PHI check
    const phiDays = actions?.phi_remaining_days || 14;
    const withinPHI = phiDays <= 7;

    let action, activeIngredient, doseRatio, verificationTarget;

    if (topRisk.threat.includes('Gray Mold')) {
        if (withinPHI) {
            action = 'Environmental control + biocontrol';
            activeIngredient = 'Ventilation protocol + Bacillus subtilis (biological)';
            doseRatio = 1.0;
            verificationTarget = 'Humidity below 65% within 24h; infection rate stable';
        } else {
            action = 'Localized fungicide spray';
            activeIngredient = 'Fungicide (MoA Group 9 — Anilinopyrimidine)';
            doseRatio = 0.7;
            verificationTarget = 'Canopy infection reduced ≥30% in 72h';
        }
    } else if (topRisk.threat.includes('Aphid')) {
        action = 'Full spray + biocontrol release';
        activeIngredient = 'Imidacloprid 2000x dilution + Ladybug release';
        doseRatio = 1.0;
        verificationTarget = 'Aphids per leaf < 2 within 48h';
    } else if (topRisk.threat.includes('Anthracnose')) {
        action = 'Targeted spray + sanitation';
        activeIngredient = 'Mancozeb (WP) + manual removal of infected fruit';
        doseRatio = 0.8;
        verificationTarget = 'No new lesions within 5 days';
    } else if (topRisk.threat.includes('Spider')) {
        action = 'Acaricide rotation spray';
        activeIngredient = 'Abamectin (rotate with Spiromesifen)';
        doseRatio = 0.9;
        verificationTarget = 'Mite density < 3 within 72h';
    } else {
        action = 'Monitoring — no intervention required';
        activeIngredient = 'N/A';
        doseRatio = 0;
        verificationTarget = 'Continue monitoring';
    }

    return {
        prescription_id: prescriptionId,
        target: `${fieldData.name} — Zone ${topRisk.score > 60 ? '4 (hotspot)' : '全域'}`,
        targetEn: `${fieldData.nameEn} — Zone ${topRisk.score > 60 ? '4 (hotspot)' : 'Full-field'}`,
        threat: topRisk.threat,
        riskScore: topRisk.score,
        action,
        active_ingredient: activeIngredient,
        dose_ratio: doseRatio,
        constraints: {
            wind_speed: '< 3 m/s',
            current_wind: `${sensors.wind_speed_ms} m/s`,
            wind_ok: sensors.wind_speed_ms < 3,
            pre_harvest_interval_days: phiDays,
            phi_compliant: !withinPHI || action.includes('biocontrol') || action.includes('Environmental'),
            soil_moisture: `< 40%`,
            soil_ok: sensors.soil_moist_pct < 40,
        },
        verification: {
            photo_after_72h: true,
            target_reduction: verificationTarget,
            recheck_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        },
        generated_at: new Date().toISOString(),
        growth_stage: fieldData.growthStage,
        factors: topRisk.factors,
    };
}

/**
 * Calculate dosage comparison (precision vs traditional)
 */
export function calculateDosageComparison(prescription) {
    return {
        traditional: {
            volume_L: 450,
            coverage: '100% field',
            chemical_kg: 2.4,
            time_min: 90,
        },
        sentinel: {
            volume_L: Math.round(450 * prescription.dose_ratio * 0.6),
            coverage: `${Math.round(prescription.dose_ratio * 60)}% targeted`,
            chemical_kg: Math.round(2.4 * prescription.dose_ratio * 0.6 * 10) / 10,
            time_min: Math.round(90 * 0.5),
        },
        savings_pct: Math.round((1 - prescription.dose_ratio * 0.6) * 100),
    };
}
