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
    leaf_wetness_h: 2.62,
  },
  'YN-A2': {
    temp_C: 22.3,
    humidity_pct: 92,
    soil_moist_pct: 45,
    light_Lux: 8500,
    wind_speed_ms: 0.5,
    rainfall_mm: 0,
    soil_ph: 6.2,
    leaf_wetness_h: 3.4,
  },
};

// Generate 24h time-series data with timestamps
function generateTimeSeries(baseValue, variance, count = 24) {
  const data = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * 3600000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: time.toISOString(),
      value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
    });
  }
  return data;
}

// Generate 12h AI forecast (dashed line data)
function generateForecast(lastValue, trend, hours = 12) {
  const data = [];
  const now = new Date();
  for (let i = 1; i <= hours; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const trendDelta = trend === 'rising' ? 0.3 * i : trend === 'falling' ? -0.2 * i : (Math.random() - 0.5) * 0.5;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: time.toISOString(),
      value: Math.round((lastValue + trendDelta + (Math.random() - 0.3) * 1.5) * 10) / 10,
      confidence: Math.round(92 - i * 2 + Math.random() * 5),
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
    leafWetness: generateTimeSeries(2.5, 2),
    wind: generateTimeSeries(1.8, 2),
    co2: generateTimeSeries(420, 80),
    uvIndex: generateTimeSeries(4.5, 3),
    irrigationFlow: generateTimeSeries(2.8, 1.5),
    sporeCount: generateTimeSeries(35, 25),
  },
  'YN-A2': {
    temperature: generateTimeSeries(22.3, 5),
    humidity: generateTimeSeries(90, 10),
    soilMoisture: generateTimeSeries(45, 10),
    light: generateTimeSeries(8500, 6000),
    leafWetness: generateTimeSeries(3.2, 2.5),
    wind: generateTimeSeries(0.5, 1),
    co2: generateTimeSeries(450, 60),
    uvIndex: generateTimeSeries(5.2, 3),
    irrigationFlow: generateTimeSeries(3.2, 1.2),
    sporeCount: generateTimeSeries(50, 30),
  },
};

// AI-predicted sensor forecasts (12h)
export const sensorForecasts = {
  'BS-B3': {
    temperature: generateForecast(18.5, 'stable'),
    humidity: generateForecast(88, 'rising'),
    soilMoisture: generateForecast(32, 'falling'),
    leafWetness: generateForecast(2.62, 'rising'),
    wind: generateForecast(1.8, 'stable'),
    co2: generateForecast(420, 'rising'),
    uvIndex: generateForecast(4.5, 'falling'),
    irrigationFlow: generateForecast(2.8, 'stable'),
    sporeCount: generateForecast(35, 'rising'),
  },
  'YN-A2': {
    temperature: generateForecast(22.3, 'rising'),
    humidity: generateForecast(92, 'rising'),
    soilMoisture: generateForecast(45, 'stable'),
    leafWetness: generateForecast(3.4, 'rising'),
    wind: generateForecast(0.5, 'stable'),
    co2: generateForecast(450, 'stable'),
    uvIndex: generateForecast(5.2, 'falling'),
    irrigationFlow: generateForecast(3.2, 'stable'),
    sporeCount: generateForecast(50, 'rising'),
  },
};

// Sensor thresholds for alert generation
export const sensorThresholds = {
  temperature: { min: 5, max: 28, unit: '°C', warningDelta: 3 },
  humidity: { min: 40, max: 85, unit: '%', warningDelta: 5 },
  soilMoisture: { min: 20, max: 45, unit: '%', warningDelta: 5 },
  leafWetness: { min: 0, max: 3, unit: 'h', warningDelta: 0.5 },
  wind: { min: 0, max: 3, unit: 'm/s', warningDelta: 0.5 },
  light: { min: 2000, max: 50000, unit: 'Lux', warningDelta: 5000 },
  co2: { min: 300, max: 600, unit: 'ppm', warningDelta: 50 },
  uvIndex: { min: 0, max: 8, unit: 'UV', warningDelta: 1 },
  irrigationFlow: { min: 0, max: 5, unit: 'L/min', warningDelta: 0.5 },
  sporeCount: { min: 0, max: 50, unit: 'spores/m³', warningDelta: 10 },
};

// Zone interval definitions (for chart bands: green=normal, amber=risky, red=critical)
export const zoneIntervals = {
  temperature: { normal: [10, 25], risky: [5, 10], riskyHigh: [25, 28], critical: [0, 5], criticalHigh: [28, 40] },
  humidity: { normal: [50, 80], risky: [80, 85], riskyLow: [40, 50], critical: [85, 100], criticalLow: [0, 40] },
  soilMoisture: { normal: [25, 40], risky: [40, 45], riskyLow: [20, 25], critical: [45, 60], criticalLow: [0, 20] },
  leafWetness: { normal: [0, 2], risky: [2, 3], critical: [3, 12] },
  wind: { normal: [0, 2], risky: [2, 3], critical: [3, 15] },
  light: { normal: [5000, 40000], risky: [2000, 5000], riskyHigh: [40000, 50000], critical: [0, 2000], criticalHigh: [50000, 80000] },
  co2: { normal: [350, 500], risky: [500, 600], critical: [600, 1000] },
  uvIndex: { normal: [0, 5], risky: [5, 8], critical: [8, 15] },
  irrigationFlow: { normal: [1, 4], risky: [4, 5], riskyLow: [0, 1], critical: [5, 10] },
  sporeCount: { normal: [0, 20], risky: [20, 50], critical: [50, 150] },
};

// Proactive trend alerts (AI-generated)
export const trendAlerts = {
  'BS-B3': [
    {
      id: 'TA-001',
      timestamp: '2026-03-03T22:05:12+08:00',
      severity: 'warning',
      sensor: 'Humidity',
      icon: 'activity',
      title: 'Humidity approaching critical threshold',
      detail: 'Rising 3.2% over last 6h — predicted to breach 85% threshold in ~2h. Historical correlation: 87% chance of Botrytis spore activation above 85% RH during flowering.',
      prediction: 'Breach at 85% by 00:15 tonight',
      recommended: 'Preemptive ventilation increase to 70% fan speed',
      status: 'active',
      trendData: [82, 83, 84, 85, 86, 87, 88],
    },
    {
      id: 'TA-002',
      timestamp: '2026-03-03T21:30:00+08:00',
      severity: 'info',
      sensor: 'Leaf Wetness',
      icon: 'perception',
      title: 'Leaf wetness duration extending',
      detail: 'Consecutive wet hours: 2.62h and rising. Critical threshold: 3h. Correlated with night temperature drop below dew point.',
      prediction: 'Will exceed 3h threshold by 23:30',
      recommended: 'Monitor — auto-alert at 3h | Consider heated air blower deployment',
      status: 'monitoring',
      trendData: [1.8, 2.0, 2.2, 2.4, 2.5, 2.62],
    },
    {
      id: 'TA-003',
      timestamp: '2026-03-03T20:15:00+08:00',
      severity: 'low',
      sensor: 'Temperature',
      icon: 'activity',
      title: 'Night temperature drop detected',
      detail: 'Cooling rate: -1.2°C/h since sunset. Current: 18.5°C. Forecast min: 14.2°C at 05:00.',
      prediction: 'No frost risk (min 14.2°C > 5°C threshold)',
      recommended: 'No action required — within safe range for flowering stage',
      status: 'resolved',
      trendData: [22, 21, 20, 19, 18.5],
    },
  ],
  'YN-A2': [
    {
      id: 'TA-101',
      timestamp: '2026-03-03T22:08:00+08:00',
      severity: 'critical',
      sensor: 'Humidity',
      icon: 'alert-triangle',
      title: 'Greenhouse humidity above critical level',
      detail: 'Humidity at 92% — 7% above 85% threshold for 3+ hours. Spider mite reproduction accelerates above 90% RH. Powdery mildew risk HIGH.',
      prediction: 'Sustained above 85% until ventilation correction',
      recommended: 'IMMEDIATE: Exhaust fan 100% + dehumidifier activation',
      status: 'active',
    },
    {
      id: 'TA-102',
      timestamp: '2026-03-03T21:00:00+08:00',
      severity: 'warning',
      sensor: 'Temperature',
      icon: 'activity',
      title: 'Greenhouse heat accumulation',
      detail: 'Internal temp 22.3°C vs. optimal 18-20°C for bud development. Prolonged heat stress may cause bud abortion.',
      prediction: 'Will stabilize overnight as ambient drops',
      recommended: 'Shade cloth deployment at sunrise + ventilation adjustment',
      status: 'monitoring',
    },
  ],
};

// AI Watchdog status
export const aiWatchdog = {
  status: 'active',
  lastScan: '2026-03-03T22:10:45+08:00',
  nextScan: '2026-03-03T22:11:45+08:00',
  scanIntervalSec: 60,
  totalScansToday: 1428,
  anomaliesDetected: 3,
  proactiveAlerts: 5,
  alertsThisWeek: 12,
  uptime: '99.97%',
  modelVersion: 'Sentinel-Agri v4.2',
  scanHistory: [
    { time: '22:10:45', result: 'ANOMALY — Humidity trend breach predicted', severity: 'warning' },
    { time: '22:09:45', result: 'OK — All sensors within thresholds', severity: 'ok' },
    { time: '22:08:45', result: 'ANOMALY — Greenhouse A2 humidity critical', severity: 'critical' },
    { time: '22:07:45', result: 'OK — All sensors within thresholds', severity: 'ok' },
    { time: '22:06:45', result: 'OK — All sensors within thresholds', severity: 'ok' },
    { time: '22:05:45', result: 'ANOMALY — Leaf wetness duration approaching limit', severity: 'info' },
    { time: '22:04:45', result: 'OK — All sensors within thresholds', severity: 'ok' },
    { time: '22:03:45', result: 'OK — All sensors within thresholds', severity: 'ok' },
  ],
};

// Season Financial KPIs
export const seasonFinancials = {
  'BS-B3': {
    seasonStart: '2025-10-15',
    seasonEnd: '2026-09-30',
    totalSpent: 18750,
    laborCost: 8200,
    chemicalCost: 5300,
    droneCost: 3400,
    iotCost: 1850,
    traditionalEstimate: 42000,
    predictedSavings: 23250,
    revenueProtected: 156000,
    preventedLosses: 62400,
    gradeDowngradesPrevented: 2,
    interventions: 8,
    netBenefit: 137250,
    seasonROI: 7.3,
    currency: '¥',
  },
  'YN-A2': {
    seasonStart: '2025-09-20',
    seasonEnd: '2026-08-31',
    totalSpent: 12400,
    laborCost: 5600,
    chemicalCost: 3200,
    droneCost: 2100,
    iotCost: 1500,
    traditionalEstimate: 28000,
    predictedSavings: 15600,
    revenueProtected: 210000,
    preventedLosses: 84000,
    gradeDowngradesPrevented: 3,
    interventions: 6,
    netBenefit: 197600,
    seasonROI: 15.9,
    currency: '¥',
  },
};

// Threshold breach log entries
export const thresholdBreaches = [
  { time: '2026-03-03T22:05:12+08:00', sensor: 'Humidity', value: '88.2%', threshold: '>85%', zone: 'B3-East', action: 'Ventilation increased to 80%', status: 'resolved' },
  { time: '2026-03-03T19:30:00+08:00', sensor: 'Leaf Wetness', value: '3.1h', threshold: '>3h', zone: 'B3-Row5', action: 'Alert dispatched to field team', status: 'monitoring' },
  { time: '2026-03-03T15:45:00+08:00', sensor: 'Temperature', value: '29.1°C', threshold: '>28°C', zone: 'B3-South', action: 'Shade cloth deployed', status: 'resolved' },
  { time: '2026-03-02T21:00:00+08:00', sensor: 'Humidity', value: '91.5%', threshold: '>85%', zone: 'B3-East', action: 'Drone-02 dispatched for spray', status: 'resolved' },
  { time: '2026-03-02T08:15:00+08:00', sensor: 'Soil Moisture', value: '18.4%', threshold: '<20%', zone: 'B3-West', action: 'Irrigation auto-triggered', status: 'resolved' },
  { time: '2026-03-01T23:45:00+08:00', sensor: 'Wind Speed', value: '3.8 m/s', threshold: '>3 m/s', zone: 'All', action: 'Spray operations suspended', status: 'resolved' },
];

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

// Multimodal imagery metadata (paths to generated images)
export const multimodalImagery = [
  {
    id: 'IMG-001',
    source: 'Drone-01 RGB',
    sourceZh: '无人机RGB',
    type: 'drone_rgb',
    timestamp: '2026-03-03T16:30:00+08:00',
    zone: 'Rows 4-7, East',
    resolution: '2cm/px',
    annotation: 'Gray mold lesions detected: 15 clusters identified. Severity: moderate-high. Sporulation visible on 8 fruit clusters.',
    filename: 'drone_rgb_field.png',
  },
  {
    id: 'IMG-002',
    source: 'Thermal IR Camera',
    sourceZh: '热成像',
    type: 'thermal_ir',
    timestamp: '2026-03-03T17:00:00+08:00',
    zone: 'Full field B3',
    resolution: '5cm/px',
    annotation: 'Temperature variation: 14.2-22.8°C. Cool spots correlate with shaded/humid zones where fungal risk is highest.',
    filename: 'thermal_ir_map.png',
  },
  {
    id: 'IMG-003',
    source: 'Sentinel-2 Satellite',
    sourceZh: '卫星NDVI',
    type: 'satellite_ndvi',
    timestamp: '2026-03-03T10:45:00+08:00',
    zone: 'Full farm overview',
    resolution: '10m/px',
    annotation: 'NDVI range: 0.42-0.78. Stressed vegetation (NDVI<0.5) concentrated in eastern rows. Correlates with drone findings.',
    filename: 'satellite_ndvi.png',
  },
  {
    id: 'IMG-004',
    source: 'Pest Trap Camera',
    sourceZh: '虫害监测',
    type: 'pest_trap',
    timestamp: '2026-03-03T06:00:00+08:00',
    zone: 'Trap Station #7',
    resolution: 'Macro 1:1',
    annotation: 'Species identified: Aphis gossypii (棉蚜) x12, Frankliniella occidentalis (西花蓟马) x3. Below treatment threshold.',
    filename: 'pest_trap_macro.png',
  },
  {
    id: 'IMG-005',
    source: 'Drone-03 Hyperspectral',
    sourceZh: '高光谱',
    type: 'hyperspectral',
    timestamp: '2026-03-03T15:20:00+08:00',
    zone: 'Rows 4-7',
    resolution: '3cm/px, 224 bands',
    annotation: 'False-color composite (bands 680/720/850nm). Early disease signatures detected in 23 canopy segments before visible symptoms.',
    filename: 'hyperspectral_false_color.png',
  },
  {
    id: 'IMG-006',
    source: 'IoT Leaf Sensor',
    sourceZh: '叶面传感器',
    type: 'leaf_wetness',
    timestamp: '2026-03-03T19:45:00+08:00',
    zone: 'Row 5, Node 12',
    resolution: 'Close-up',
    annotation: 'Surface moisture film detected. Duration: 2.62h and counting. Dew point convergence expected at 23:00.',
    filename: 'leaf_wetness_closeup.png',
  },
];

// ─── Multi-Unit Sensor Fleet (Req #4) ─────────────────────────────────────
export const sensorFleet = {
  'BS-B3': [
    { id: 'T-01', type: 'temperature', zone: 'B3-East', value: 18.5, unit: '°C', status: 'online', battery: 87, signalDb: -42, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'T-02', type: 'temperature', zone: 'B3-West', value: 17.9, unit: '°C', status: 'online', battery: 92, signalDb: -38, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'T-03', type: 'temperature', zone: 'B3-South', value: 19.2, unit: '°C', status: 'online', battery: 78, signalDb: -51, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'H-01', type: 'humidity', zone: 'B3-East', value: 88.2, unit: '%', status: 'warning', battery: 65, signalDb: -44, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'H-02', type: 'humidity', zone: 'B3-West', value: 84.1, unit: '%', status: 'online', battery: 81, signalDb: -39, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'H-03', type: 'humidity', zone: 'B3-South', value: 86.5, unit: '%', status: 'online', battery: 73, signalDb: -47, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'SM-01', type: 'soilMoisture', zone: 'B3-East', value: 32.1, unit: '%', status: 'online', battery: 94, signalDb: -35, lastCalibration: '2026-01-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'SM-02', type: 'soilMoisture', zone: 'B3-West', value: 29.8, unit: '%', status: 'online', battery: 88, signalDb: -41, lastCalibration: '2026-01-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'SM-03', type: 'soilMoisture', zone: 'B3-South', value: 34.5, unit: '%', status: 'online', battery: 91, signalDb: -37, lastCalibration: '2026-01-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'LW-01', type: 'leafWetness', zone: 'B3-East', value: 2.62, unit: 'h', status: 'warning', battery: 70, signalDb: -49, lastCalibration: '2026-02-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'LW-02', type: 'leafWetness', zone: 'B3-West', value: 2.1, unit: 'h', status: 'online', battery: 82, signalDb: -43, lastCalibration: '2026-02-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'WS-01', type: 'wind', zone: 'B3-Central', value: 1.8, unit: 'm/s', status: 'online', battery: 96, signalDb: -32, lastCalibration: '2026-02-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'WS-02', type: 'wind', zone: 'B3-North', value: 2.1, unit: 'm/s', status: 'online', battery: 89, signalDb: -40, lastCalibration: '2026-02-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'LX-01', type: 'light', zone: 'B3-East', value: 15000, unit: 'Lux', status: 'online', battery: 99, signalDb: -28, lastCalibration: '2026-02-25', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'LX-02', type: 'light', zone: 'B3-West', value: 14200, unit: 'Lux', status: 'online', battery: 95, signalDb: -33, lastCalibration: '2026-02-25', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'PH-01', type: 'soilPh', zone: 'B3-East', value: 4.8, unit: 'pH', status: 'online', battery: 85, signalDb: -45, lastCalibration: '2026-01-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'PH-02', type: 'soilPh', zone: 'B3-South', value: 5.1, unit: 'pH', status: 'online', battery: 79, signalDb: -48, lastCalibration: '2026-01-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'RF-01', type: 'rainfall', zone: 'B3-Central', value: 0, unit: 'mm', status: 'online', battery: 97, signalDb: -30, lastCalibration: '2026-02-05', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'PT-01', type: 'pestTrap', zone: 'B3-East', value: 12, unit: 'count/day', status: 'online', battery: 68, signalDb: -52, lastCalibration: '2026-03-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'PT-02', type: 'pestTrap', zone: 'B3-West', value: 8, unit: 'count/day', status: 'online', battery: 74, signalDb: -46, lastCalibration: '2026-03-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'PT-03', type: 'pestTrap', zone: 'B3-South', value: 15, unit: 'count/day', status: 'warning', battery: 61, signalDb: -55, lastCalibration: '2026-03-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'CAM-01', type: 'camera', zone: 'B3-East', value: 'streaming', unit: '', status: 'online', battery: null, signalDb: -36, lastCalibration: '2026-02-28', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'CAM-02', type: 'camera', zone: 'B3-West', value: 'streaming', unit: '', status: 'online', battery: null, signalDb: -41, lastCalibration: '2026-02-28', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'CO2-01', type: 'co2', zone: 'B3-East', value: 415, unit: 'ppm', status: 'online', battery: 88, signalDb: -38, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'CO2-02', type: 'co2', zone: 'B3-West', value: 428, unit: 'ppm', status: 'online', battery: 82, signalDb: -43, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'CO2-03', type: 'co2', zone: 'B3-South', value: 410, unit: 'ppm', status: 'online', battery: 76, signalDb: -47, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'UV-01', type: 'uvIndex', zone: 'B3-East', value: 4.2, unit: 'UV', status: 'online', battery: 95, signalDb: -30, lastCalibration: '2026-02-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'UV-02', type: 'uvIndex', zone: 'B3-West', value: 4.8, unit: 'UV', status: 'online', battery: 91, signalDb: -34, lastCalibration: '2026-02-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'IRR-01', type: 'irrigationFlow', zone: 'B3-East', value: 2.8, unit: 'L/min', status: 'online', battery: 93, signalDb: -32, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'IRR-02', type: 'irrigationFlow', zone: 'B3-West', value: 3.1, unit: 'L/min', status: 'online', battery: 87, signalDb: -39, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'SP-01', type: 'sporeCount', zone: 'B3-East', value: 32, unit: 'spores/m³', status: 'warning', battery: 71, signalDb: -50, lastCalibration: '2026-03-01', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'SP-02', type: 'sporeCount', zone: 'B3-West', value: 38, unit: 'spores/m³', status: 'warning', battery: 64, signalDb: -53, lastCalibration: '2026-03-01', lastReading: '2026-03-04T00:55:00+08:00' },
  ],
  'YN-A2': [
    { id: 'GT-01', type: 'temperature', zone: 'A2-Main', value: 22.3, unit: '°C', status: 'online', battery: 90, signalDb: -36, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'GT-02', type: 'temperature', zone: 'A2-North', value: 21.8, unit: '°C', status: 'online', battery: 86, signalDb: -40, lastCalibration: '2026-02-15', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'GH-01', type: 'humidity', zone: 'A2-Main', value: 92.0, unit: '%', status: 'warning', battery: 72, signalDb: -44, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'GH-02', type: 'humidity', zone: 'A2-North', value: 89.5, unit: '%', status: 'warning', battery: 68, signalDb: -48, lastCalibration: '2026-02-10', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'GSM-01', type: 'soilMoisture', zone: 'A2-Main', value: 45.0, unit: '%', status: 'online', battery: 93, signalDb: -34, lastCalibration: '2026-01-20', lastReading: '2026-03-04T00:55:00+08:00' },
    { id: 'GLW-01', type: 'leafWetness', zone: 'A2-Main', value: 3.4, unit: 'h', status: 'warning', battery: 66, signalDb: -50, lastCalibration: '2026-02-20', lastReading: '2026-03-04T00:55:00+08:00' },
  ],
};

// ─── Historical Decision Log ──────────────────────────────────────────────
export const historicalDecisions = [
  {
    id: 'DEC-2026-001', timestamp: '2026-02-12T09:15:00+08:00', field: 'BS-B3',
    threat: 'Gray Mold (Botrytis)', riskScore: 72, action: 'Spot Spray — Mancozeb 70% WP',
    prescriptionId: 'RX-20260212-001', executionId: 'EX-20260212-001', auditId: 'AUD-20260212-001',
    outcome: 'success', costYuan: 2800, savingsYuan: 18500, note: 'Contained within 48h. Zero spread to adjacent rows.',
    approvedBy: 'Human Operator', approvalType: 'critical',
  },
  {
    id: 'DEC-2026-002', timestamp: '2026-02-18T14:30:00+08:00', field: 'BS-B3',
    threat: 'Aphids', riskScore: 45, action: 'Biocontrol — Ladybug Release',
    prescriptionId: 'RX-20260218-001', executionId: 'EX-20260218-001', auditId: 'AUD-20260218-001',
    outcome: 'success', costYuan: 1200, savingsYuan: 8400, note: 'Auto-approved (low risk). Population reduced 85% in 5 days.',
    approvedBy: 'System (Auto)', approvalType: 'auto',
  },
  {
    id: 'DEC-2026-003', timestamp: '2026-02-22T07:00:00+08:00', field: 'BS-B3',
    threat: 'Environmental — Frost Warning', riskScore: 58, action: 'Activate Frost Protection System',
    prescriptionId: 'RX-20260222-001', executionId: 'EX-20260222-001', auditId: 'AUD-20260222-001',
    outcome: 'success', costYuan: 800, savingsYuan: 45000, note: 'Temperature dropped to 3.2°C. Protection activated. Zero frost damage.',
    approvedBy: 'System (Auto)', approvalType: 'auto',
  },
  {
    id: 'DEC-2026-004', timestamp: '2026-02-25T11:20:00+08:00', field: 'YN-A2',
    threat: 'Whitefly Surge', riskScore: 68, action: 'Yellow Sticky Traps + Targeted Spray',
    prescriptionId: 'RX-20260225-001', executionId: 'EX-20260225-001', auditId: 'AUD-20260225-001',
    outcome: 'partial', costYuan: 3200, savingsYuan: 12000, note: 'Traps effective, spray required 2nd application. 70% reduction.',
    approvedBy: 'Human Operator', approvalType: 'critical',
  },
  {
    id: 'DEC-2026-005', timestamp: '2026-02-28T16:45:00+08:00', field: 'BS-B3',
    threat: 'Spider Mites', riskScore: 52, action: 'Predatory Mite Release',
    prescriptionId: 'RX-20260228-001', executionId: 'EX-20260228-001', auditId: 'AUD-20260228-001',
    outcome: 'success', costYuan: 1500, savingsYuan: 9800, note: 'Auto-approved. Biological control established in 72h.',
    approvedBy: 'System (Auto)', approvalType: 'auto',
  },
  {
    id: 'DEC-2026-006', timestamp: '2026-03-01T08:30:00+08:00', field: 'BS-B3',
    threat: 'Anthracnose Early Signs', riskScore: 41, action: 'Preventive Pruning + Ventilation Increase',
    prescriptionId: 'RX-20260301-001', executionId: 'EX-20260301-001', auditId: 'AUD-20260301-001',
    outcome: 'success', costYuan: 600, savingsYuan: 7200, note: 'Non-chemical intervention. Symptoms resolved in 4 days.',
    approvedBy: 'System (Auto)', approvalType: 'auto',
  },
  {
    id: 'DEC-2026-007', timestamp: '2026-03-02T13:00:00+08:00', field: 'BS-B3',
    threat: 'Humidity Spike + Botrytis Risk', riskScore: 78, action: 'Emergency Ventilation + Spot Spray',
    prescriptionId: 'RX-20260302-001', executionId: 'EX-20260302-001', auditId: 'AUD-20260302-001',
    outcome: 'success', costYuan: 3500, savingsYuan: 22000, note: 'Critical: human approved in 8min. Multi-actor execution: Drone-01 + IoT ventilation. Contained.',
    approvedBy: 'Human Operator', approvalType: 'critical',
  },
  {
    id: 'DEC-2026-008', timestamp: '2026-03-03T06:00:00+08:00', field: 'BS-B3',
    threat: 'Routine Monitoring — All Clear', riskScore: 18, action: 'Continue Monitoring',
    prescriptionId: null, executionId: null, auditId: null,
    outcome: 'no_action', costYuan: 0, savingsYuan: 0, note: 'All sensors within thresholds. No intervention required.',
    approvedBy: 'System (Auto)', approvalType: 'auto',
  },
];

// ─── Completed Execution Records ──────────────────────────────────────────
export const executionRecords = [
  {
    id: 'EX-20260212-001', rxId: 'RX-20260212-001', timestamp: '2026-02-12T10:00:00+08:00',
    field: 'BS-B3', status: 'completed', duration: '2h 15min',
    actors: [
      { type: 'drone', id: 'Drone-01', task: 'Spot spray Rows 3-6 (Mancozeb 70% WP)', zone: 'B3-East', startTime: '10:00', endTime: '11:15', status: 'completed', coverage: '98%' },
      { type: 'iot', id: 'IoT-System', task: 'Increase ventilation to 75%', zone: 'B3-All', startTime: '10:00', endTime: '12:15', status: 'completed', coverage: '100%' },
      { type: 'human', id: 'Field-Team-A', task: 'Remove infected canes (manual)', zone: 'B3-East', startTime: '10:30', endTime: '12:00', status: 'completed', coverage: '100%' },
    ],
    feedback: 'Botrytis contained. Post-execution monitoring shows 95% spore reduction in 24h.',
  },
  {
    id: 'EX-20260218-001', rxId: 'RX-20260218-001', timestamp: '2026-02-18T15:00:00+08:00',
    field: 'BS-B3', status: 'completed', duration: '45min',
    actors: [
      { type: 'human', id: 'Field-Team-B', task: 'Release 5000 ladybugs (Coccinellidae)', zone: 'B3-West', startTime: '15:00', endTime: '15:45', status: 'completed', coverage: '100%' },
    ],
    feedback: 'Aphid population reduced 85% within 5 days. Biocontrol established.',
  },
  {
    id: 'EX-20260302-001', rxId: 'RX-20260302-001', timestamp: '2026-03-02T13:30:00+08:00',
    field: 'BS-B3', status: 'completed', duration: '3h 00min',
    actors: [
      { type: 'drone', id: 'Drone-01', task: 'Emergency spray Rows 1-4', zone: 'B3-East', startTime: '13:30', endTime: '14:45', status: 'completed', coverage: '97%' },
      { type: 'drone', id: 'Drone-02', task: 'Emergency spray Rows 5-8', zone: 'B3-West', startTime: '13:30', endTime: '14:50', status: 'completed', coverage: '96%' },
      { type: 'iot', id: 'IoT-System', task: 'Emergency ventilation 90%', zone: 'B3-All', startTime: '13:30', endTime: '16:30', status: 'completed', coverage: '100%' },
      { type: 'human', id: 'Field-Team-A', task: 'Manual inspection + pruning', zone: 'B3-South', startTime: '14:00', endTime: '16:00', status: 'completed', coverage: '100%' },
      { type: 'facility', id: 'Shade-System', task: 'Deploy shade cloth', zone: 'B3-All', startTime: '14:00', endTime: '14:30', status: 'completed', coverage: '100%' },
    ],
    feedback: 'Multi-actor coordinated response. Humidity reduced from 92% to 74% within 2h. Spore count dropped 88%.',
  },
];

// ─── Historical Performance KPIs ──────────────────────────────────────────
export const performanceKPIs = {
  totalInterventions: 7,
  successRate: 85.7,
  avgCostPerIntervention: 1943,
  totalSpent: 13600,
  totalSavings: 122900,
  seasonROI: 9.04,
  gradeMaintenanceRate: 100,
  zeroResidueCompliance: 100,
  avgResponseTimeMin: 12,
  autoApprovedPct: 57.1,
  humanApprovedPct: 42.9,
  chemicalReduction: 68,
  droneFlightHours: 14.5,
  dataPointsProcessed: 847000,
  pesticideUsedLiters: 18.6,
  areaTreatedHa: 4.2,
  waterSavedLiters: 12500,
  carbonFootprintKg: 28.5,
  biocontrolDeployments: 3,
  droneFlightsTotal: 12,
  aiPredictionAccuracy: 91.3,
  falsePositiveRate: 4.2,
  avgDecisionConfidence: 87.8,
  bestROIIntervention: { name: 'Frost Protection', roi: 56.3 },
  worstROIIntervention: { name: 'Whitefly Spray #2', roi: 3.75 },
  conventionalCostEstimate: 42000,
  monthlyBreakdown: [
    { month: 'Jan', cost: 800, savings: 7200, interventions: 1 },
    { month: 'Feb', cost: 9300, savings: 93900, interventions: 4 },
    { month: 'Mar', cost: 3500, savings: 21800, interventions: 2 },
  ],
};

// ─── Per-Unit Sensor Mini Time Series (for individual sensor charts) ──────
const generateMiniSeries = (base, variance, points = 24) => {
  const data = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v += (Math.random() - 0.48) * variance * 0.15;
    v = Math.max(0, v);
    data.push({ hour: `${String(i).padStart(2, '0')}:00`, value: +v.toFixed(2) });
  }
  return data;
};

export const perUnitTimeSeries = {};
Object.entries({
  'BS-B3': [
    ['T-01', 18.5, 3], ['T-02', 17.9, 3], ['T-03', 19.2, 3],
    ['H-01', 88.2, 8], ['H-02', 84.1, 6], ['H-03', 86.5, 7],
    ['SM-01', 32.1, 4], ['SM-02', 29.8, 4], ['SM-03', 34.5, 4],
    ['LW-01', 2.62, 1], ['LW-02', 2.1, 0.8],
    ['WS-01', 1.8, 1], ['WS-02', 2.1, 1],
    ['LX-01', 15000, 5000], ['LX-02', 14200, 5000],
    ['PH-01', 4.8, 0.3], ['PH-02', 5.1, 0.3],
    ['RF-01', 0, 0.5],
    ['PT-01', 12, 5], ['PT-02', 8, 4], ['PT-03', 15, 6],
    ['CAM-01', 0, 0], ['CAM-02', 0, 0],
    ['CO2-01', 415, 40], ['CO2-02', 428, 35], ['CO2-03', 410, 45],
    ['UV-01', 4.2, 2], ['UV-02', 4.8, 2],
    ['IRR-01', 2.8, 1], ['IRR-02', 3.1, 1],
    ['SP-01', 32, 12], ['SP-02', 38, 15],
  ],
}).forEach(([field, sensors]) => {
  perUnitTimeSeries[field] = {};
  sensors.forEach(([id, base, variance]) => {
    perUnitTimeSeries[field][id] = generateMiniSeries(base, variance);
  });
});
