export const CASE_ID = 'BB-ORDER-750-001';
export const ORDER_KG = 750;
export const ORDER_PRICE = 65;
export const ZONE = 'Asia/Shanghai';
export const START = Date.parse('2026-06-18T05:30:00+08:00');
export const MINUTE = 60_000;
export const BASELINE = { days: 3, workers: 25, quality: 780, freshness: 'Current', lotOrder: CASE_ID };
export const LOTS = [
  { id: 'LOT-01', plot: 'North block', ready: 420, gradeA: 420, harvestFirst: 400 },
  { id: 'LOT-02', plot: 'South block', ready: 360, gradeA: 360, harvestFirst: 320 },
  { id: 'LOT-03', plot: 'South block', ready: 120, gradeA: 0, harvestFirst: 0 },
];
export const PERSPECTIVES = [
  { name: 'Agronomy', roles: ['Field Agronomist', 'Greenhouse Agronomist', 'Crop Protection Specialist'], finding: 'Contain the affected lot while preserving the healthy harvest window.', source: 'TRAP-S02', impact: 'Supports selective containment' },
  { name: 'Quality & Compliance', roles: ['Compliance Officer', 'Safety Officer'], finding: 'The simulated protection interval exceeds the baseline delivery window. Release only QA-cleared lots.', source: 'RULE-01', impact: 'Safety-window gate' },
  { name: 'Sales & Orders', roles: ['Sales Planner'], finding: 'The order requires 750 kg of Grade A fruit. Downgraded fruit does not count toward fulfillment.', source: 'ERP-750', impact: 'Grade A volume gate' },
  { name: 'Operations & Workforce', roles: ['Operations Manager', 'Field Operator', 'Control Engineer', 'Drone Operator'], finding: 'Allocate the eligible lots across two crews and confirm capacity before dispatch.', source: 'CREW-25', impact: 'Labor capacity gate' },
  { name: 'Finance & Margin', roles: ['Finance Analyst'], finding: 'Compare modeled contribution at the same order price and eligible volumes.', source: 'FIN-01', impact: 'Ranks feasible plans' },
  { name: 'Data & Risk Assurance', roles: ['Data Collector', 'Remote Sensing Operator', 'Learning Engineer'], finding: 'Check source timestamps and the scope of the affected lot before releasing a plan.', source: 'TRAP-S02', impact: 'Data freshness gate' },
];
export const TASKS = [
  ['Contain affected lot', 'Field operations'],
  ['Verify Grade A quality', 'Quality team'],
  ['Allocate harvest', 'Operations manager'],
  ['Dispatch and confirm harvest', 'Crew A / Crew B'],
  ['Reserve order inventory', 'Inventory service'],
  ['Confirm ERP acknowledgement', 'Simulated ERP'],
  ['Verify execution fingerprint', 'Data assurance'],
];

export function generateFixture(seed = 35) {
  let random = seed >>> 0;
  const telemetry = Array.from({ length: 24 }, (_, hour) => {
    random = (Math.imul(1664525, random) + 1013904223) >>> 0;
    const warmth = (1 + Math.cos((hour - 14) * Math.PI / 12)) / 2;
    return {
      hour,
      temperature: Math.round((15 + warmth * 10 + random / 2 ** 32) * 10) / 10,
      humidity: Math.round(89 - warmth * 25),
    };
  });
  return {
    version: 'blueberry-v3.5.1', ruleVersion: 'demo-rules-1', seed, timezone: ZONE,
    farm: { id: 'YN-BB-01', name: 'Yunnan Blueberry Farm', areaMu: 20 },
    order: { id: CASE_ID, quantityKg: ORDER_KG, source: 'ERP-750' },
    lots: LOTS, telemetry,
    sources: [
      { minute: 5, id: 'WEATHER-S02', type: 'Source', title: 'Weather and trap readings synced', detail: 'Routine source check · South block' },
      { minute: 10, id: 'TRAP-S02', type: 'Alert', title: 'Pest activity crossed the watch threshold', detail: 'South block · LOT-03 · synthetic trap count 9 / threshold 6' },
      { minute: 30, id: 'SCOUT-N01', type: 'Source', title: 'North block check received', detail: 'No material change to Grade A availability' },
      { minute: 55, id: 'CREW-CHECK', type: 'Source', title: 'Crew roster refreshed', detail: 'Both harvest crews reported available' },
    ],
  };
}

export function compareStrategies(inputs, { price = ORDER_PRICE, kgPerPickerDay = 12, confirmedKg = Infinity } = {}) {
  const capacity = inputs.days * inputs.workers * kgPerPickerDay;
  const allocated = LOTS.filter(lot => lot.id !== 'LOT-02' || inputs.lotOrder === CASE_ID);
  return [
    { id: 'A', title: 'Full Crop Protection', subtitle: 'Treat the full affected block', cost: 6900, earliestHarvestDay: 5 },
    { id: 'B', title: 'Selective Release + Containment', subtitle: 'Isolate LOT-03 and release healthy lots', cost: 5400, earliestHarvestDay: 1 },
    { id: 'C', title: 'Harvest-First Containment', subtitle: 'Harvest early with a higher downgrade risk', cost: 4900, earliestHarvestDay: 1 },
  ].map(plan => {
    const eligible = Math.min(confirmedKg, allocated.reduce((sum, lot) => sum + (plan.id === 'C' ? lot.harvestFirst : lot.gradeA), 0));
    const usableDays = Math.max(0, inputs.days - plan.earliestHarvestDay + 1);
    const usableCapacity = usableDays * inputs.workers * kgPerPickerDay;
    const deliverable = Math.min(usableCapacity, eligible);
    const gates = [
      { name: 'Source freshness', passed: inputs.freshness === 'Current' },
      { name: 'Simulated harvest safety window', passed: usableDays > 0 },
      { name: 'Harvest crew capacity', passed: capacity >= ORDER_KG },
      { name: 'Capacity within the usable harvest window', passed: usableCapacity >= ORDER_KG },
      { name: 'Grade A availability', passed: eligible >= ORDER_KG },
    ];
    return {
      ...plan, eligible, capacity, usableCapacity, deliverable, gates,
      contribution: Math.min(deliverable, ORDER_KG) * price - plan.cost,
      feasible: gates.every(gate => gate.passed),
    };
  });
}
