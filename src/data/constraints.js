// Sentinel Decision OS - Regulatory and execution constraints

export const phiConstraints = {
    mancozeb: { name: 'Mancozeb', days: 15, moaGroup: 'M03' },
    chlorothalonil: { name: 'Chlorothalonil', days: 14, moaGroup: 'M05' },
    carbendazim: { name: 'Carbendazim', days: 7, moaGroup: '1' },
    procymidone: { name: 'Procymidone', days: 7, moaGroup: '2' },
    prochloraz: { name: 'Prochloraz', days: 10, moaGroup: '3' },
    imidacloprid: { name: 'Imidacloprid', days: 7, moaGroup: '4A' },
    abamectin: { name: 'Abamectin', days: 7, moaGroup: '6' },
    cypermethrin: { name: 'Cypermethrin', days: 5, moaGroup: '3A' },
};

export const bannedPesticides = [
    { name: 'Methamidophos', reason: 'Banned in China for food crops' },
    { name: 'Monocrotophos', reason: 'Banned for all crops' },
    { name: 'Parathion', reason: 'Banned for all crops' },
    { name: 'Phosphamidon', reason: 'Banned for all crops' },
    { name: 'Fipronil', reason: 'Banned for many edible crops' },
];

export const windConstraints = {
    drone_spray: { maxWindMs: 3.0, description: 'Drone spraying prohibited above 3 m/s' },
    broadcast_spray: { maxWindMs: 4.5, description: 'Broadcast spraying risky above 4.5 m/s' },
    biocontrol_release: { maxWindMs: 5.0, description: 'Biocontrol release limited above 5 m/s' },
};

export const executionMethods = {
    spot_spray: { label: 'Spot Spray', labelZh: '局部点喷', method: 'drone', costMultiplier: 1.0 },
    broadcast_spray: { label: 'Broadcast Spray', labelZh: '全株喷雾', method: 'drone', costMultiplier: 1.5 },
    biocontrol: { label: 'Biocontrol Release', labelZh: '生物防治释放', method: 'manual', costMultiplier: 2.0 },
    ventilation: { label: 'Ventilation Adjustment', labelZh: '通风调控', method: 'iot', costMultiplier: 0.2 },
    irrigation: { label: 'Irrigation Control', labelZh: '灌溉控制', method: 'iot', costMultiplier: 0.3 },
    manual_removal: { label: 'Manual Removal', labelZh: '人工摘除', method: 'manual', costMultiplier: 3.0 },
    frost_protection: { label: 'Frost Protection', labelZh: '霜冻防护', method: 'facility', costMultiplier: 0.6 },
    emergency_spray: { label: 'Emergency Spray', labelZh: '紧急喷洒', method: 'drone', costMultiplier: 1.8 },
    manual_override: { label: 'Manual Override', labelZh: '人工操作切换', method: 'manual', costMultiplier: 1.2 },
    dehumidification: { label: 'Dehumidification', labelZh: '除湿处理', method: 'facility', costMultiplier: 0.4 },
    compound_sequential: { label: 'Sequential Treatment', labelZh: '阶段性复合处理', method: 'multi', costMultiplier: 1.6 },
};
