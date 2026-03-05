// Sentinel Decision OS - Configurable thresholds

const thresholds = {
    botrytis: {
        humidity_pct: 90,
        leaf_wetness_hrs: 8,
        overcast_days: 2,
        spore_index_critical: 70,
        applicable_stages: ['flowering', 'fruit_set', 'bloom', 'bud_formation'],
    },

    aphids: {
        per_leaf: 5,
        sticky_trap_daily: 20,
        applicable_stages: ['bud_break', 'flowering', 'vegetative', 'bud_formation', 'bloom'],
    },

    anthracnose: {
        fruit_lesion_pct: 5,
        temp_min: 24,
        humidity_pct: 85,
        applicable_stages: ['fruit_set', 'harvest', 'bloom'],
    },

    spider_mites: {
        mite_density: 5,
        temp_min: 28,
        humidity_max: 70,
        applicable_stages: ['vegetative', 'bloom', 'flowering'],
    },

    downy_mildew: {
        temp_max: 20,
        humidity_pct: 90,
        consecutive_wet_days: 2,
        applicable_stages: ['bud_formation', 'bloom'],
    },

    root_rot: {
        soil_moist_pct: 50,
        waterlog_days: 2,
        applicable_stages: ['bud_break', 'vegetative', 'flowering'],
    },

    frost: {
        temp_critical: 2,
        temp_warning: 5,
        duration_hrs_critical: 4,
        applicable_stages: ['bud_break', 'flowering', 'fruit_set', 'bud_formation', 'bloom'],
    },

    ventilation_failure: {
        humidity_spike_rate: 2.0,
        max_humidity_pct: 95,
        heartbeat_timeout_sec: 300,
        applicable_stages: ['vegetative', 'bud_formation', 'bloom', 'flowering'],
    },

    environment: {
        temp_high: 35,
        temp_low: 2,
        wind_spray_limit: 3.0,
        rainfall_spray_limit: 5.0,
    },
};

export default thresholds;
