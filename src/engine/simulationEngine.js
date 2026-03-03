// Sentinel Decision OS — Simulation Engine
// Generates 60-day realistic agricultural lifecycle data

import { getStageForDay } from '../data/crops.js';

// Gaussian noise
const gauss = (mean, sigma) => {
    const u = 1 - Math.random();
    const v = Math.random();
    return mean + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Diurnal pattern: peaks at peakHour, trough at peakHour+12
const diurnal = (hour, base, amplitude, peakHour = 14) => {
    const phase = ((hour - peakHour) / 24) * 2 * Math.PI;
    return base + amplitude * Math.cos(phase);
};

// Generate 24h sensor readings for a given day
const generateDaySensors = (day, cropId, overrides = {}) => {
    const hours = [];
    // Base values evolve over 60 days (gradual warming)
    const baseTempTrend = 14 + (day / 60) * 8; // 14C -> 22C
    const baseHumidity = 72;

    for (let h = 0; h < 24; h++) {
        const temp = clamp(gauss(diurnal(h, baseTempTrend, 5, 14), 0.8), 2, 38);
        const humidity = clamp(gauss(diurnal(h, baseHumidity, -12, 6), 3), 40, 99);
        const soilMoist = clamp(gauss(32, 3), 15, 60);
        const light = h >= 6 && h <= 19 ? clamp(gauss(diurnal(h, 15000, 10000, 12), 2000), 0, 35000) : 0;
        const wind = clamp(gauss(2.0, 0.8), 0, 8);
        const ph = clamp(gauss(cropId === 'blueberry' ? 4.8 : 6.1, 0.1), 3.5, 7.5);
        const leafWetness = humidity > 85 ? clamp(gauss(humidity > 90 ? 8 : 4, 1.5), 0, 14) : clamp(gauss(1, 0.5), 0, 3);

        const reading = {
            hour: h,
            temp_C: +temp.toFixed(1),
            humidity_pct: +humidity.toFixed(1),
            soil_moist_pct: +soilMoist.toFixed(1),
            light_Lux: Math.round(light),
            wind_speed_ms: +wind.toFixed(1),
            soil_ph: +ph.toFixed(2),
            leaf_wetness_hrs: +leafWetness.toFixed(1),
            rainfall_mm: 0,
        };

        // Apply day-level overrides
        if (overrides.humidityBoost) {
            reading.humidity_pct = clamp(reading.humidity_pct + overrides.humidityBoost, 40, 99);
            reading.leaf_wetness_hrs = clamp(reading.leaf_wetness_hrs + overrides.humidityBoost * 0.08, 0, 14);
        }
        if (overrides.tempBoost) reading.temp_C = clamp(reading.temp_C + overrides.tempBoost, 2, 40);
        if (overrides.rainfall) reading.rainfall_mm = +(overrides.rainfall * (0.5 + Math.random())).toFixed(1);
        if (overrides.windBoost) reading.wind_speed_ms = clamp(reading.wind_speed_ms + overrides.windBoost, 0, 10);
        if (overrides.soilMoistBoost) reading.soil_moist_pct = clamp(reading.soil_moist_pct + overrides.soilMoistBoost, 15, 70);

        hours.push(reading);
    }
    return hours;
};

// Generate pest metrics for a given day
const generateDayPests = (day, cropId, overrides = {}) => {
    const baseAphid = 1.5 + (day / 60) * 2;
    const baseFruitfly = 1;
    const baseSporeIndex = 20 + (day / 60) * 15;
    const baseMite = cropId === 'flower' ? 2 : 0.5;

    return {
        aphids_per_leaf: +clamp(gauss(overrides.aphidBoost ? baseAphid + overrides.aphidBoost : baseAphid, 0.8), 0, 25).toFixed(1),
        fruitfly_trap_count: Math.max(0, Math.round(gauss(overrides.fruitflyBoost ? baseFruitfly + overrides.fruitflyBoost : baseFruitfly, 1))),
        botrytis_spore_index: Math.round(clamp(gauss(overrides.sporeBoost ? baseSporeIndex + overrides.sporeBoost : baseSporeIndex, 5), 0, 100)),
        sticky_trap_whitefly: Math.max(0, Math.round(gauss(overrides.whiteflyBoost ? 8 + overrides.whiteflyBoost : 8, 3))),
        mite_density: +clamp(gauss(overrides.miteBoost ? baseMite + overrides.miteBoost : baseMite, 0.5), 0, 15).toFixed(1),
    };
};

// Weather event overlays for the 60-day lifecycle
const weatherEvents = {
    // Cold snap Day 8-10
    8: { tempBoost: -6 },
    9: { tempBoost: -7 },
    10: { tempBoost: -5 },
    // Rain + overcast Day 15-18 (Botrytis trigger)
    15: { humidityBoost: 12, rainfall: 5.2 },
    16: { humidityBoost: 15, rainfall: 8.1 },
    17: { humidityBoost: 18, rainfall: 3.5 },
    18: { humidityBoost: 14, rainfall: 1.2 },
    // Gusty Day 22-24
    22: { windBoost: 2.5 },
    23: { windBoost: 3.0 },
    24: { windBoost: 2.0 },
    // Monsoon Day 35-40 (second Botrytis event)
    35: { humidityBoost: 15, rainfall: 6.5 },
    36: { humidityBoost: 20, rainfall: 12.0 },
    37: { humidityBoost: 22, rainfall: 8.0 },
    38: { humidityBoost: 18, rainfall: 4.0 },
    39: { humidityBoost: 12, rainfall: 1.5 },
    40: { humidityBoost: 8, rainfall: 0 },
};

// Pest event overlays
const pestEvents = {
    12: { aphidBoost: 2 },
    13: { aphidBoost: 3 },
    14: { aphidBoost: 4 },
    15: { sporeBoost: 20 },
    16: { sporeBoost: 35 },
    17: { sporeBoost: 50 },
    18: { sporeBoost: 55 },
    19: { sporeBoost: 40 }, // after intervention
    20: { sporeBoost: 25 },
    22: { sporeBoost: 10 },
    28: { aphidBoost: 1 },
    35: { sporeBoost: 30 },
    36: { sporeBoost: 45 },
    37: { sporeBoost: 55 },
    38: { sporeBoost: 60 },
    39: { sporeBoost: 50 },
    46: { sporeBoost: 40 },
    47: { sporeBoost: 50 },
    48: { sporeBoost: 55 },
};

// Generate full 60-day dataset for a field
export const generate60DayData = (fieldId, cropId) => {
    const days = [];
    for (let d = 1; d <= 60; d++) {
        const weatherOverride = weatherEvents[d] || {};
        const pestOverride = pestEvents[d] || {};
        const stage = getStageForDay(cropId, d);

        const sensorReadings = generateDaySensors(d, cropId, weatherOverride);
        const dailyAvg = {
            temp_C: +(sensorReadings.reduce((s, r) => s + r.temp_C, 0) / 24).toFixed(1),
            humidity_pct: +(sensorReadings.reduce((s, r) => s + r.humidity_pct, 0) / 24).toFixed(1),
            soil_moist_pct: +(sensorReadings.reduce((s, r) => s + r.soil_moist_pct, 0) / 24).toFixed(1),
            light_Lux: Math.round(sensorReadings.reduce((s, r) => s + r.light_Lux, 0) / 24),
            wind_speed_ms: +(sensorReadings.reduce((s, r) => s + r.wind_speed_ms, 0) / 24).toFixed(1),
            soil_ph: +(sensorReadings.reduce((s, r) => s + r.soil_ph, 0) / 24).toFixed(2),
            leaf_wetness_hrs: +(sensorReadings.filter(r => r.leaf_wetness_hrs > 2).length * 1.0).toFixed(1),
            rainfall_mm: +(sensorReadings.reduce((s, r) => s + r.rainfall_mm, 0)).toFixed(1),
        };

        const pests = generateDayPests(d, cropId, pestOverride);

        days.push({
            day: d,
            date: new Date(2026, 2, d).toISOString().split('T')[0], // March 1 = Day 1
            stage: stage ? stage.id : 'unknown',
            stageName: stage ? stage.name : 'Unknown',
            hourly: sensorReadings,
            daily: dailyAvg,
            pests,
        });
    }
    return days;
};

// Get a snapshot for a specific day (latest hourly reading as "current")
export const getSnapshot = (dayData, hour = null) => {
    const h = hour !== null ? hour : Math.min(new Date().getHours(), 23);
    const hourly = dayData.hourly[h] || dayData.hourly[dayData.hourly.length - 1];
    return {
        timestamp: `${dayData.date}T${String(h).padStart(2, '0')}:00:00`,
        sensors: hourly,
        pests: dayData.pests,
        stage: dayData.stage,
        stageName: dayData.stageName,
        day: dayData.day,
    };
};
