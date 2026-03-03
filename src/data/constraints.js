// Sentinel Decision OS — Regulatory Constraints
// PHI intervals, banned pesticides, wind limits per Chinese regulations

export const phiConstraints = {
    mancozeb: { name: 'Mancozeb (代森锰锌)', days: 15, moaGroup: 'M03' },
    chlorothalonil: { name: 'Chlorothalonil (百菌清)', days: 14, moaGroup: 'M05' },
    carbendazim: { name: 'Carbendazim (多菌灵)', days: 7, moaGroup: '1' },
    procymidone: { name: 'Procymidone (腐霉利)', days: 7, moaGroup: '2' },
    prochloraz: { name: 'Prochloraz (咪鲜胺)', days: 10, moaGroup: '3' },
    imidacloprid: { name: 'Imidacloprid (吡虫啉)', days: 7, moaGroup: '4A' },
    abamectin: { name: 'Abamectin (阿维菌素)', days: 7, moaGroup: '6' },
    cypermethrin: { name: 'Cypermethrin (高效氯氰菊酯)', days: 5, moaGroup: '3A' },
};

export const bannedPesticides = [
    { name: 'Methamidophos (甲胺磷)', reason: 'Banned in China since 2008' },
    { name: 'Monocrotophos (久效磷)', reason: 'Banned for all crops' },
    { name: 'Parathion (对硫磷)', reason: 'Banned for all crops' },
    { name: 'Phosphamidon (磷胺)', reason: 'Banned for all crops' },
    { name: 'Fipronil (氟虫腈)', reason: 'Banned for food crops' },
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
};
