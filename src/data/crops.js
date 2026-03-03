// Sentinel Decision OS — Crop Definitions
// Yunnan blueberry and fresh-cut flower (rose) production profiles

export const crops = {
    blueberry: {
        id: 'blueberry',
        name: 'Yunnan Blueberry',
        nameZh: '云南蓝莓',
        variety: "O'Neal",
        growthStages: [
            { id: 'dormancy', name: 'Dormancy', nameZh: '休眠期', months: 'Jan–Mar', daysRange: [0, 15] },
            { id: 'bud_break', name: 'Bud Break', nameZh: '芽萌发期', months: 'Mar–Apr', daysRange: [16, 28] },
            { id: 'flowering', name: 'Flowering', nameZh: '开花期', months: 'Apr–May', daysRange: [29, 42] },
            { id: 'fruit_set', name: 'Fruit Set', nameZh: '结果膨大期', months: 'Jun–Jul', daysRange: [43, 52] },
            { id: 'harvest', name: 'Harvest', nameZh: '采收期', months: 'Aug–Sep', daysRange: [53, 60] },
        ],
        optimalConditions: {
            tempMin: 15, tempMax: 28,
            phMin: 4.5, phMax: 5.5,
            humidityMax: 85,
            soilMoistMin: 25, soilMoistMax: 45,
        },
        gradeClasses: {
            A: { label: 'Export Grade', pricePerKg: 180, minAppearance: 0.9, minFirmness: 0.85, minBrix: 12 },
            B: { label: 'Domestic', pricePerKg: 95, minAppearance: 0.7, minFirmness: 0.6, minBrix: 10 },
            C: { label: 'Processing', pricePerKg: 40, minAppearance: 0, minFirmness: 0, minBrix: 0 },
        },
    },
    flower: {
        id: 'flower',
        name: 'Fresh-Cut Rose',
        nameZh: '云南鲜切玫瑰',
        variety: 'Red Naomi',
        growthStages: [
            { id: 'planting', name: 'Planting', nameZh: '定植期', months: 'Oct–Nov', daysRange: [0, 10] },
            { id: 'vegetative', name: 'Vegetative Growth', nameZh: '营养生长期', months: 'Nov–Jan', daysRange: [11, 25] },
            { id: 'bud_formation', name: 'Bud Formation', nameZh: '花芽分化期', months: 'Jan–Feb', daysRange: [26, 38] },
            { id: 'bloom', name: 'Bloom & Harvest', nameZh: '开花采收期', months: 'Mar–May', daysRange: [39, 55] },
            { id: 'rest', name: 'Rest Period', nameZh: '休整期', months: 'Jun–Aug', daysRange: [56, 60] },
        ],
        optimalConditions: {
            tempMin: 18, tempMax: 30,
            phMin: 5.8, phMax: 6.5,
            humidityMax: 80,
            soilMoistMin: 30, soilMoistMax: 50,
        },
        gradeClasses: {
            A: { label: 'Export Grade', pricePerStem: 8.5, minStemLength: 60, minHeadDiam: 5 },
            B: { label: 'Domestic', pricePerStem: 4.2, minStemLength: 45, minHeadDiam: 4 },
            C: { label: 'Bulk', pricePerStem: 1.5, minStemLength: 0, minHeadDiam: 0 },
        },
    },
};

export const getStageForDay = (cropId, day) => {
    const crop = crops[cropId];
    if (!crop) return null;
    return crop.growthStages.find(s => day >= s.daysRange[0] && day <= s.daysRange[1]) || crop.growthStages[crop.growthStages.length - 1];
};
