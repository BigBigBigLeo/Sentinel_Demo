// Sentinel Decision OS — Configurable Thresholds
// All trigger thresholds for decision engine rules

const thresholds = {
    // Gray Mold (Botrytis)
    botrytis: {
        humidity_pct: 85,
        leaf_wetness_hrs: 6,
        overcast_days: 2,
        spore_index_critical: 70,
        applicable_stages: ['flowering', 'fruit_set', 'bloom', 'bud_formation'],
    },

    // Aphid threshold
    aphids: {
        per_leaf: 5,
        sticky_trap_daily: 30,
        applicable_stages: ['bud_break', 'flowering', 'vegetative', 'bud_formation', 'bloom'],
    },

    // Anthracnose
    anthracnose: {
        fruit_lesion_pct: 5,
        temp_min: 25,
        humidity_pct: 80,
        applicable_stages: ['fruit_set', 'harvest'],
    },

    // Spider Mites
    spider_mites: {
        mite_density: 5,
        temp_min: 28,
        humidity_max: 60,
        applicable_stages: ['vegetative', 'bloom', 'flowering'],
    },

    // Downy Mildew
    downy_mildew: {
        temp_max: 20,
        humidity_pct: 90,
        consecutive_wet_days: 2,
        applicable_stages: ['bud_formation', 'bloom'],
    },

    // Root Rot
    root_rot: {
        soil_moist_pct: 55,
        waterlog_days: 3,
        applicable_stages: ['bud_break', 'vegetative', 'flowering'],
    },

    // Environmental alerts
    environment: {
        temp_high: 35,
        temp_low: 2,
        wind_spray_limit: 3.0,
        rainfall_spray_limit: 5.0,
    },
};

export default thresholds;
