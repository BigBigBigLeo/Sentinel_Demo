// Sentinel AgriAI — Mock Data Layer
// Realistic data for Yunnan blueberry and fresh-cut flower scenarios

export const fields = [
  {
    id: 'BS-B3',
    name: 'BS-区B3号园',
    nameEn: 'Blueberry Zone B3',
    crop: 'blueberry',
    area: '2.5 hectares',
    growthStage: 'Flowering',
    growthStageZh: '花序期',
    location: { lat: 24.88, lng: 102.83 },
    plantDate: '2025-10-15',
  },
  {
    id: 'YN-A2',
    name: 'YN-温棚A2',
    nameEn: 'Rose Greenhouse A2',
    crop: 'flower',
    area: '1.2 hectares',
    growthStage: 'Bud Development',
    growthStageZh: '花蕾期',
    location: { lat: 24.92, lng: 102.78 },
    plantDate: '2025-09-20',
  },
];

export const currentSensors = {
  'BS-B3': {
    temp_C: 18.5,
    humidity_pct: 88,
    soil_moist_pct: 32,
    light_Lux: 15000,
    wind_speed_ms: 1.8,
    rainfall_mm: 2.4,
    soil_ph: 4.8,
  },
  'YN-A2': {
    temp_C: 22.3,
    humidity_pct: 92,
    soil_moist_pct: 45,
    light_Lux: 8500,
    wind_speed_ms: 0.5,
    rainfall_mm: 0,
    soil_ph: 6.2,
  },
};

// Generate 24h time-series data
function generateTimeSeries(baseValue, variance, count = 24) {
  const data = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
    });
  }
  return data;
}

export const sensorTimeSeries = {
  'BS-B3': {
    temperature: generateTimeSeries(18.5, 6),
    humidity: generateTimeSeries(85, 15),
    soilMoisture: generateTimeSeries(32, 8),
    light: generateTimeSeries(15000, 12000),
  },
  'YN-A2': {
    temperature: generateTimeSeries(22.3, 5),
    humidity: generateTimeSeries(90, 10),
    soilMoisture: generateTimeSeries(45, 10),
    light: generateTimeSeries(8500, 6000),
  },
};

export const pestMonitoring = {
  'BS-B3': {
    aphids_per_leaf: 4,
    fruitfly_trap_count: 2,
    botrytis_infection_pct: 3,
    anthracnose_lesion_pct: 0,
    sticky_trap_daily: 12,
  },
  'YN-A2': {
    aphids_per_leaf: 2,
    spider_mite_density: 6,
    thrips_trap_count: 8,
    botrytis_infection_pct: 5,
    whitefly_count: 15,
  },
};

export const previousActions = {
  'BS-B3': {
    last_spray: '10 days ago',
    last_spray_chemical: 'Mancozeb (WP)',
    last_irrigation: '2 days ago',
    last_fertilizer: '14 days ago',
    last_pruning: '30 days ago',
    phi_remaining_days: 5,
  },
  'YN-A2': {
    last_spray: '7 days ago',
    last_spray_chemical: 'Carbendazim',
    last_irrigation: '1 day ago',
    last_fertilizer: '10 days ago',
    last_pruning: '21 days ago',
    phi_remaining_days: 3,
  },
};

export const growthStages = {
  blueberry: [
    { name: 'Dormancy', nameZh: '休眠期', months: 'Jan–Mar', status: 'completed' },
    { name: 'Bud Break', nameZh: '芽萌发期', months: 'Mar–Apr', status: 'completed' },
    { name: 'Flowering', nameZh: '花序期', months: 'Apr–May', status: 'active' },
    { name: 'Fruit Set', nameZh: '结果膨大期', months: 'Jun–Jul', status: 'upcoming' },
    { name: 'Harvest', nameZh: '采收期', months: 'Aug–Sep', status: 'upcoming' },
  ],
  flower: [
    { name: 'Seedling', nameZh: '育苗期', months: 'Sep–Oct', status: 'completed' },
    { name: 'Vegetative', nameZh: '营养生长期', months: 'Nov–Dec', status: 'completed' },
    { name: 'Bud Development', nameZh: '花蕾期', months: 'Jan–Mar', status: 'active' },
    { name: 'Bloom & Harvest', nameZh: '开花采收期', months: 'Mar–May', status: 'upcoming' },
    { name: 'Rest', nameZh: '休整期', months: 'Jun–Aug', status: 'upcoming' },
  ],
};

export const riskScores = {
  'BS-B3': [
    { name: 'Gray Mold (Botrytis)', score: 82, trend: 'rising', status: 'critical' },
    { name: 'Aphids', score: 35, trend: 'stable', status: 'monitoring' },
    { name: 'Anthracnose', score: 48, trend: 'rising', status: 'elevated' },
    { name: 'Root Rot', score: 18, trend: 'falling', status: 'low' },
    { name: 'Fruit Fly', score: 22, trend: 'stable', status: 'low' },
  ],
  'YN-A2': [
    { name: 'Gray Mold (Botrytis)', score: 76, trend: 'rising', status: 'warning' },
    { name: 'Powdery Mildew', score: 42, trend: 'rising', status: 'elevated' },
    { name: 'Spider Mites', score: 55, trend: 'rising', status: 'elevated' },
    { name: 'Thrips', score: 38, trend: 'stable', status: 'monitoring' },
    { name: 'Downy Mildew', score: 25, trend: 'falling', status: 'low' },
  ],
};

export const decisionHistory = [
  {
    id: 'RX-0923',
    date: '2026-03-01',
    field: 'BS-区B3号园',
    threat: 'Gray Mold (Botrytis)',
    action: 'Ventilation + Fungicide spray',
    status: 'completed',
    outcome: 'Infection reduced 45% in 72h',
    riskBefore: 82,
    riskAfter: 34,
  },
  {
    id: 'RX-0918',
    date: '2026-02-25',
    field: 'YN-温棚A2',
    threat: 'Spider Mites',
    action: 'Acaricide rotation spray',
    status: 'completed',
    outcome: 'Density below threshold after 48h',
    riskBefore: 68,
    riskAfter: 22,
  },
  {
    id: 'RX-0912',
    date: '2026-02-20',
    field: 'BS-区B3号园',
    threat: 'Aphids',
    action: 'Imidacloprid 2000x + Ladybug release',
    status: 'completed',
    outcome: 'Per-leaf count dropped from 8 to 2',
    riskBefore: 65,
    riskAfter: 15,
  },
  {
    id: 'RX-0905',
    date: '2026-02-14',
    field: 'BS-区B3号园',
    threat: 'Anthracnose',
    action: 'Mancozeb spray + clean infected fruit',
    status: 'completed',
    outcome: 'Lesion spread contained',
    riskBefore: 56,
    riskAfter: 28,
  },
  {
    id: 'RX-0897',
    date: '2026-02-08',
    field: 'YN-温棚A2',
    threat: 'Gray Mold (Botrytis)',
    action: 'Dehumidification + preventive fungicide',
    status: 'completed',
    outcome: 'Spore count normalized within 96h',
    riskBefore: 71,
    riskAfter: 30,
  },
];

export const auditRecords = [
  {
    id: 'AUD-0923',
    prescriptionId: 'RX-0923',
    timestamp: '2026-03-01T10:32:00',
    field: 'BS-区B3号园',
    decisionBasis: 'Humidity 88% + 3 consecutive overcast days during flowering stage → Gray Mold risk score 82/100 (threshold: 70)',
    actionTaken: 'Localized fungicide spray (MoA Group 9), dose ratio 0.7x standard',
    executionMatch: true,
    executionFingerprint: {
      timestamp: '2026-03-01T11:15:00',
      coverage_pct: 94,
      duration_min: 45,
      wind_during: 1.8,
    },
    result: 'Canopy infection reduced from 3% to 1.2% within 72 hours',
    compliance: {
      phi_compliant: true,
      phi_days_remaining: 5,
      gap_compliant: true,
      fsma204: true,
      pesticide_within_label: true,
    },
    riskBefore: 82,
    riskAfter: 34,
    responsibilityNote: 'Decision generated by Sentinel, executed by field team. Execution fingerprint matched — responsibility on system.',
  },
];

export const thresholdBreaches = [
  { time: '08:15', sensor: 'Humidity', value: '88%', threshold: '85%', zone: 'B3', status: 'active' },
  { time: '07:30', sensor: 'Humidity', value: '87%', threshold: '85%', zone: 'B3', status: 'active' },
  { time: '06:45', sensor: 'Humidity', value: '86%', threshold: '85%', zone: 'B3', status: 'active' },
  { time: 'Yesterday 22:00', sensor: 'Soil Moisture', value: '38%', threshold: '35%', zone: 'B3', status: 'resolved' },
  { time: 'Yesterday 16:30', sensor: 'Temperature', value: '28.5°C', threshold: '28°C', zone: 'A2', status: 'resolved' },
];

export const riskTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    grayMold: Math.round(40 + Math.random() * 45 + (i > 20 ? 15 : 0)),
    aphids: Math.round(15 + Math.random() * 30),
    anthracnose: Math.round(20 + Math.random() * 35 + (i > 15 ? 10 : 0)),
  };
});
