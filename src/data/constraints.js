// Sentinel Decision OS - Regulatory and execution constraints

export const phiConstraints = {
    mancozeb: { name: 'Mancozeb', nameZh: '代森锰锌', days: 15, moaGroup: 'M03' },
    chlorothalonil: { name: 'Chlorothalonil', nameZh: '百菌清', days: 14, moaGroup: 'M05' },
    carbendazim: { name: 'Carbendazim', nameZh: '多菌灵', days: 7, moaGroup: '1' },
    procymidone: { name: 'Procymidone', nameZh: '腐霉利', days: 7, moaGroup: '2' },
    prochloraz: { name: 'Prochloraz', nameZh: '咪鲜胺', days: 10, moaGroup: '3' },
    imidacloprid: { name: 'Imidacloprid', nameZh: '吡虫啉', days: 7, moaGroup: '4A' },
    abamectin: { name: 'Abamectin', nameZh: '阿维菌素', days: 7, moaGroup: '6' },
    cypermethrin: { name: 'Cypermethrin', nameZh: '氯氰菊酯', days: 5, moaGroup: '3A' },
};

export const bannedPesticides = [
    { name: 'Methamidophos', nameZh: '甲胺磷', reason: 'Banned in China for food crops', reasonZh: '中国禁用于食用作物' },
    { name: 'Monocrotophos', nameZh: '久效磷', reason: 'Banned for all crops', reasonZh: '中国全面禁用（所有作物）' },
    { name: 'Parathion', nameZh: '对硫磷', reason: 'Banned for all crops', reasonZh: '中国全面禁用（所有作物）' },
    { name: 'Phosphamidon', nameZh: '磷胺', reason: 'Banned for all crops', reasonZh: '中国全面禁用（所有作物）' },
    { name: 'Fipronil', nameZh: '氟虫腈', reason: 'Banned for many edible crops', reasonZh: '在多类食用作物上禁用' },
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

