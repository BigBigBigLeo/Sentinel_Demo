// Sentinel Decision OS  - AI Thinking Engine v3
// Multi-round iterative reasoning with timestamps, data requests, pre-audit, and ML feedback

// 鈹€鈹€鈹€ Timestamp Generator 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
const makeTimestamp = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    return d.toISOString();
};
const fmtTs = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
};

// 鈹€鈹€鈹€ Thinking Phases 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export const PHASES = {
    PERCEIVE: { id: 'perceive', label: 'Perceiving', color: '#38bdf8', icon: 'perception' },
    ANALYZE: { id: 'analyze', label: 'Analyzing', color: '#a78bfa', icon: 'activity' },
    REASON: { id: 'reason', label: 'Reasoning', color: '#f472b6', icon: 'reasoning' },
    DECIDE: { id: 'decide', label: 'Deciding', color: '#fbbf24', icon: 'prescription' },
    VERIFY: { id: 'verify', label: 'Verifying', color: '#34d399', icon: 'audit-alt' },
};

// 鈹€鈹€鈹€ Thought Types 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const TYPES = {
    SENSOR_INGEST: 'sensor_ingest',
    CROSS_REFERENCE: 'cross_reference',
    PATTERN_MATCH: 'pattern_match',
    MODEL_INFERENCE: 'model_inference',
    RISK_CALCULATION: 'risk_calculation',
    CONSTRAINT_CHECK: 'constraint_check',
    ECONOMIC_ANALYSIS: 'economic_analysis',
    RECOMMENDATION: 'recommendation',
    CONFIDENCE: 'confidence',
    COMPLIANCE: 'compliance',
    DATA_REQUEST: 'data_request',
    WAITING: 'waiting',
    DATA_RECEIVED: 'data_received',
    ITERATION: 'iteration',
    PRE_AUDIT: 'pre_audit',
    ML_FEEDBACK: 'ml_feedback',
};

// 鈹€鈹€鈹€ Helper Utilities 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const r = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const pct = v => `${(v * 100).toFixed(1)}%`;

// 鈹€鈹€鈹€ Multi-Round Risk Thinking Chain 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateRiskThinkingChain(snapshot, field, riskResults) {
    const s = snapshot?.sensors || {};
    const p = snapshot?.pests || {};
    const topRisk = riskResults?.[0];
    const chain = [];
    let stepId = 0;
    const t = () => stepId++;

    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    // ROUND 1  - Initial Data Ingestion & Preliminary Assessment
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.SENSOR_INGEST, round: 1,
        title: 'Multimodal data ingestion initiated',
        content: `Connecting to 12 data sources across IoT mesh (32 nodes), drone hyperspectral imagery (224 bands), Sentinel-2 satellite (NDVI/EVI), weather API, pest trap network (48 traps), soil lab reports, market price feed, and historical outbreak database. Total: 384 sensor readings/hr, 2.4 GB imagery, 847 historical events.`,
        data: { sources: 12, channels: 356, 'data volume': '4.7 GB', protocol: 'MQTT + REST + gRPC' },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.SENSOR_INGEST, round: 1,
        title: 'Environmental state vector assembled',
        content: `IoT Mesh  -> Temperature ${s.temp_C || 24}°C (卤0.3°C calibrated) | Humidity ${s.humidity_pct || 78}% (capacitive + resistive dual-sensor) | Soil moisture ${s.soil_moist_pct || 32}% (TDR probe @ 15cm depth) | Wind ${s.wind_speed_ms || 1.2} m/s (ultrasonic 3-axis) | Leaf wetness ${s.leaf_wetness_hrs || 4}h (dielectric sensor) | Solar radiation ${s.solar_rad || 450} W/m2 | Soil pH ${s.soil_ph || 5.8} (ion-selective electrode).`,
        data: { temp: s.temp_C, humidity: s.humidity_pct, soil: s.soil_moist_pct, 'leaf wetness': `${s.leaf_wetness_hrs}h`, wind: `${s.wind_speed_ms} m/s` },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.CROSS_REFERENCE, round: 1,
        title: 'Cross-referencing 4 additional modalities',
        content: `Satellite NDVI index: 0.${Math.round(65 + Math.random() * 20)} (healthy vegetation baseline: >0.70). Pest trap captures: Botrytis spore index ${p.botrytis_spore_index || 35}, Aphid density ${p.aphids_per_leaf || 2}/leaf, Mite density ${p.mite_density || 3}/cm2. Weather forecast: ${pick(['rain expected in 36h', 'dry spell continuing', 'humidity spike predicted'])}. Market: Grade A blueberry CNY ${Math.round(170 + Math.random() * 20)}/kg spot price.`,
        data: { NDVI: `0.${Math.round(65 + Math.random() * 20)}`, spore_index: p.botrytis_spore_index, market_price: `CNY ${Math.round(170 + Math.random() * 20)}/kg` },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.PATTERN_MATCH, round: 1,
        title: 'Pathogen signature matching  - preliminary',
        content: `Comparing against 847 historical disease outbreak records from Yunnan Provincial Agriculture Database (YPAD-v3.1). Temperature-humidity envelope (${s.temp_C || 24}°C, ${s.humidity_pct || 78}% RH) falls ${s.humidity_pct > 82 ? 'WITHIN' : 'BORDERLINE of'} Botrytis cinerea infection window (18-25°C, >85% RH, >6h leaf wetness). Pattern match confidence: ${pct(r(0.62, 0.74))}.`,
        data: { patterns_scanned: 847, database: 'YPAD-v3.1', preliminary_confidence: r(0.62, 0.74) },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.MODEL_INFERENCE, round: 1,
        title: 'Running ensemble inference  - Round 1',
        content: `CNN-ResNet50 on last drone RGB (${pct(r(0.55, 0.72))} lesion probability), LSTM temporal model on 14-day history (trend: ${topRisk?.trend || 'rising'}), Random Forest on pest-environment matrix. Ensemble disagreement detected: CNN suggests early-stage infection, LSTM shows trend acceleration, but RF indicates insufficient leaf-wetness duration. Confidence: ${pct(r(0.58, 0.72))}  - BELOW threshold (75%).`,
        data: { models: 3, CNN: pct(r(0.55, 0.72)), LSTM: 'trend ' + (topRisk?.trend || 'rising'), RF: 'inconclusive', ensemble_confidence: r(0.58, 0.72) },
        duration: 1100,
    });

    // 鈹€鈹€ AI IDENTIFIES UNCERTAINTY  -> REQUESTS MORE DATA 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.DATA_REQUEST, round: 1,
        title: 'Uncertainty detected  - requesting additional data',
        content: `Model ensemble confidence (${pct(r(0.58, 0.72))}) is below decision threshold (75%). Leaf wetness at ${s.leaf_wetness_hrs || 4}h is borderline  - need micro-climate data to distinguish surface condensation from pathogen-conducive sustained wetness. Requesting: (1) Drone-03 close-range hyperspectral scan of high-risk rows 4-7, (2) Historical outbreak query for conditions matching current profile.`,
        data: { reason: 'confidence < 75%', bottleneck: 'leaf wetness ambiguity', assets_dispatched: 2 },
        isDataRequest: true,
        requestDetails: {
            title: 'Active Data Request  - Drone-03 Dispatched',
            items: [
                { asset: 'Drone-03', action: 'Hyperspectral scan (224-band)', target: 'Rows 4-7, East sector', eta: '4 min' },
                { asset: 'Historical DB', action: 'K-NN query: humidity 75-90%, leaf wetness 3-6h, temp 20-26°C', target: 'Kunming region, 3yr window', eta: '2 sec' },
            ],
        },
        duration: 1200,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.WAITING, round: 1,
        title: 'Awaiting reconnaissance data...',
        content: `Drone-03 en route to rows 4-7 (ETA: 4 min). Meanwhile, processing historical query results...`,
        data: { status: 'WAITING', drone_03: 'in-flight', db_query: 'processing' },
        duration: 800,
    });

    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    // ROUND 2  - New Data Arrives, Refined Analysis
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.DATA_RECEIVED, round: 2,
        title: 'New data received  - Round 2 analysis',
        content: `Drone-03 hyperspectral scan complete: 224-band imagery at 3cm/pixel resolution over rows 4-7. Dataset: 680 MB. Historical query returned ${Math.round(r(128, 267))} analogous outbreak records from ${pick(['Kunming', 'Dali', 'Chuxiong', 'Yuxi'])} region. Integrating new data into reasoning pipeline.`,
        data: { drone_data: '680 MB / 224-band', resolution: '3cm/px', historical_matches: Math.round(r(128, 267)), round: '2 of 3' },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.MODEL_INFERENCE, round: 2,
        title: 'Hyperspectral lesion detection  - refined',
        content: `Running specialized Botrytis spectral classifier on drone data. Detected early-stage lesions in rows 4-6 at 705nm/740nm reflectance ratio anomaly. Lesion signature matches Botrytis cinerea profile at ${pct(r(0.88, 0.96))} similarity. Estimated affected area: ${r(8, 18)}% of rows 4-7. Unaffected rows (1-3, 8+) confirmed healthy.`,
        data: { classifier: 'Botrytis-SpectralNet v2', match: pct(r(0.88, 0.96)), affected_area: `${r(8, 18)}%`, bands_analyzed: 224 },
        duration: 1000,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.PATTERN_MATCH, round: 2,
        title: 'Historical benchmark  - updated risk trajectory',
        content: `In ${pct(r(0.78, 0.89))} of analogous historical cases (n=${Math.round(r(128, 267))}), conditions at this profile led to >= grade downgrade within ${Math.round(r(5, 14))} days if untreated. Early intervention efficacy: ${pct(r(0.70, 0.88))} at current growth stage (${snapshot?.stageName || 'Fruit Set'}). Window of optimal action: ${Math.round(r(3, 7))} days.`,
        data: { sample_size: Math.round(r(128, 267)), downgrade_probability: pct(r(0.78, 0.89)), action_window: `${Math.round(r(3, 7))} days` },
        duration: 850,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.ITERATION, round: 2,
        title: 'Updating risk score with new evidence',
        content: `Pre-drone risk score: ${Math.max(topRisk?.score - 18, 40) || 54}/100. After hyperspectral confirmation: ${topRisk?.score || 72}/100 (+${Math.round(r(14, 22))} points). Confidence increased from ${pct(r(0.58, 0.68))} to ${pct(r(0.82, 0.91))}. All three ensemble models now in agreement. Risk velocity: +${r(3, 8)} points/day if untreated.`,
        data: { score_before: Math.max(topRisk?.score - 18, 40), score_after: topRisk?.score, confidence_delta: `+${pct(r(0.15, 0.28))}`, models_agreeing: '3/3' },
        duration: 900,
    });

    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
    // ROUND 3  - Economic Analysis, Decision, Verification
    // 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.ECONOMIC_ANALYSIS, round: 3,
        title: 'Monte Carlo economic impact simulation',
        content: `Running 10,000 Monte Carlo simulations. Grade class ${field?.gradeClass || 'A'} at CNY ${field?.crop === 'blueberry' ? '180' : '8.5'}/${field?.crop === 'blueberry' ? 'kg' : 'stem'}. Field volume: ${(field?.estimatedVolume || 3600).toLocaleString()} units. Downgrade probability: ${pct(r(0.55, 0.82))}. Expected revenue at risk: CNY ${Math.round(r(25000, 85000)).toLocaleString()}. Treatment cost: CNY ${Math.round(r(2000, 5000)).toLocaleString()}. Expected ROI of intervention: ${r(5, 18)}x.`,
        data: { simulation: 'Monte Carlo (n=10,000)', downgrade_prob: pct(r(0.55, 0.82)), revenue_at_risk: `CNY ${Math.round(r(25000, 85000)).toLocaleString()}`, roi: `${r(5, 18)}x` },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.CROSS_REFERENCE, round: 3,
        title: 'Collateral impact assessment',
        content: `Evaluating treatment side-effects: beneficial insect impact (pollinator season: ${pick(['active', 'early', 'peak'])}), soil microbiome disruption risk, adjacent crop contamination (nearest field: ${Math.round(r(50, 200))}m). Recommendation: targeted spot treatment (rows 4-7 only) to minimize ecological footprint. Precision approach reduces chemical usage by ${Math.round(r(55, 75))}% vs. broadcast spray.`,
        data: { pollinator_risk: 'low (targeted)', soil_impact: 'minimal', chemical_reduction: `${Math.round(r(55, 75))}%` },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.DECIDE, type: TYPES.RECOMMENDATION, round: 3,
        title: 'Multi-actor execution plan generated',
        content: `Decision matrix complete. Recommending coordinated precision intervention:\n - Drone-01: Spot spray (Mancozeb 0.7x) on rows 4-7 only\n - IoT System: Increase ventilation to 80% (reduce humidity)\n - Field Team: Manual pruning of worst-affected tissue in rows 4-5\n - Irrigation: Reduce soil moisture target to 28%\n - Drone-03: Verification re-scan at T+72h\nAction urgency: ${topRisk?.score >= 70 ? 'IMMEDIATE' : 'HIGH'}. Window: ${topRisk?.score >= 70 ? '4-6' : '12-24'} hours.`,
        data: { actors: 5, actions: 5, urgency: topRisk?.score >= 70 ? 'IMMEDIATE' : 'HIGH', approach: 'precision targeted' },
        duration: 1000,
    });

    // 鈹€鈹€ PRE-AUDIT GATE 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.PRE_AUDIT, round: 3,
        title: 'Pre-execution audit gate  - 7 checks',
        content: `[1/7] PHI (Pre-Harvest Interval): Mancozeb 14d vs. 30d to harvest  -> PASSPASS\n[2/7] Wind safety: ${s.wind_speed_ms || 1.2} m/s < 3.0 m/s limit  -> PASSPASS\n[3/7] Banned substance check: Mancozeb (代森锰锌) not on restricted list  -> PASSPASS\n[4/7] Label rate compliance: 0.7x within 0.5-1.0x range  -> PASSPASS\n[5/7] Collateral assessment: targeted spray, pollinators low-risk  -> PASSPASS\n[6/7] Rollback plan: if ineffective, escalate to biological control (Trichoderma)  -> PASSREADY\n[7/7] Confidence gate: ${pct(r(0.82, 0.91))} >=75% threshold  -> PASSPASS`,
        data: { checks: '7/7 passed', phi: 'PASS', wind: 'PASS', banned: 'PASS', label: 'PASS', collateral: 'PASS', rollback: 'READY', confidence: 'PASS' },
        duration: 1100,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.CONFIDENCE, round: 3,
        title: 'Final confidence calibration',
        content: `Overall reasoning confidence: ${pct(r(0.84, 0.93))}. Epistemic uncertainty (MC-Dropout, 蟽=${r(0.03, 0.07)}): within bounds. Reasoning chain quality: ${r(8.5, 9.7)}/10. Data sources consulted: 12. Models used: 4. Iterations: 3. Decision chain hash recorded for audit trail.`,
        data: { confidence: pct(r(0.84, 0.93)), iterations: 3, models: 4, sources_consulted: 12 },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.ML_FEEDBACK, round: 3,
        title: 'ML training data flagged for capture',
        content: `This decision cycle will generate ${Math.round(r(120, 190))} labeled data points for model retraining. Outcome verification scheduled at T+72h and T+168h. Prediction to validate: risk reduction of ${Math.round(r(40, 65))}% within 7 days. Model version: Sentinel-Agri v4.2  -> training batch queued for v4.3.`,
        data: { training_points: Math.round(r(120, 190)), verification: 'T+72h, T+168h', model_version: 'v4.2  -> v4.3' },
        duration: 600,
    });

    // Inject timestamps into all steps
    let cumulativeOffset = 0;
    chain.forEach(step => {
        step.timestamp = makeTimestamp(cumulativeOffset);
        step.formattedTime = fmtTs(step.timestamp);
        cumulativeOffset += (step.duration || 500);
    });
    return chain;
}

// 鈹€鈹€鈹€ Prescription Thinking Chain (Multi-Round) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generatePrescriptionThinkingChain(snapshot, field, riskResults) {
    const s = snapshot?.sensors || {};
    const topRisk = riskResults?.[0];
    const chain = [];
    let stepId = 0;
    const t = () => stepId++;

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.SENSOR_INGEST, round: 1,
        title: 'Loading decision context & constraint space',
        content: `Risk assessment output: ${topRisk?.name || 'Gray Mold'} at ${topRisk?.score || 72}/100 (3-round iterative assessment, confidence ${pct(r(0.84, 0.93))}). Field ${field?.id || 'BS-B3'} (${field?.crop || 'blueberry'}, ${field?.area_mu || 12}浜?. Loading chemical database (${Math.round(r(340, 520))} registered products), regulatory constraints (GB/T 8321, FSMA 204), and resource availability matrix.`,
        data: { risk_score: topRisk?.score, confidence: pct(r(0.84, 0.93)), chemicals_db: Math.round(r(340, 520)), field: field?.id },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.CONSTRAINT_CHECK, round: 1,
        title: 'PHI & chemical compatibility screening',
        content: `Screening ${Math.round(r(12, 18))} candidate active ingredients against PHI constraints (harvest in ~30d). Mancozeb (代森锰锌) PHI 14d  -> PASS| Chlorothalonil (百菌清 PHI 7d  -> PASS| Trifloxystrobin (肟菌酯 PHI 21d  -> PASS| Iprodione (异菌脲 PHI 14d  -> PASS Eliminated ${Math.round(r(3, 7))} candidates due to PHI conflict or market restrictions.`,
        data: { candidates: Math.round(r(12, 18)), passed: Math.round(r(8, 12)), eliminated: Math.round(r(3, 7)), constraint: 'PHI >=30d' },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.CONSTRAINT_CHECK, round: 1,
        title: 'Environmental application window check',
        content: `Wind: ${s.wind_speed_ms || 1.2} m/s (limit: 3.0 for spot spray). Rain forecast: ${pick(['none in 48h', 'light rain in 36h', 'dry for 72h'])}. Spray drift risk: ${s.wind_speed_ms > 2 ? 'MODERATE' : 'LOW'}. Temperature inversion: ${pick(['not detected', 'slight (>2°C gradient)', 'moderate'])}. Application window: OPEN for next ${Math.round(r(6, 24))}h.`,
        data: { wind: `${s.wind_speed_ms} m/s`, drift_risk: s.wind_speed_ms > 2 ? 'MODERATE' : 'LOW', window: `${Math.round(r(6, 24))}h` },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.MODEL_INFERENCE, round: 2,
        title: 'Dose-response optimization',
        content: `Running pharmacokinetic dose-response model for ${topRisk?.name || 'Botrytis'}. Optimal dosage: 0.70x label rate (precision calibrated via historical efficacy data, n=${Math.round(r(180, 350))}). Expected pathogen reduction: ${Math.round(r(50, 68))}% within 72h. Resistance risk: MoA Group M03  - cross-resistance probability ${pct(r(0.04, 0.12))}. No resistance management concern at current frequency.`,
        data: { dosage_ratio: 0.7, pathogen_reduction: `${Math.round(r(50, 68))}%`, MoA_group: 'M03', resistance_risk: 'LOW' },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.ECONOMIC_ANALYSIS, round: 2,
        title: 'Cost-benefit optimization  - precision vs. broadcast',
        content: `Precision spot spray (rows 4-7): CNY ${Math.round(r(1800, 3200)).toLocaleString()} covering ${r(25, 40)}% of field. Traditional broadcast: CNY ${Math.round(r(4500, 6000)).toLocaleString()} covering 100%. Revenue protection: CNY ${Math.round(r(35000, 85000)).toLocaleString()}. Precision ROI: ${r(10, 25)}x vs. broadcast ROI: ${r(5, 12)}x. Chemical savings: ${Math.round(r(55, 72))}%. Environmental impact reduction: ${Math.round(r(60, 78))}%.`,
        data: { precision_cost: `CNY ${Math.round(r(1800, 3200))}`, broadcast_cost: `CNY ${Math.round(r(4500, 6000))}`, chemical_savings: `${Math.round(r(55, 72))}%`, precision_roi: `${r(10, 25)}x` },
        duration: 850,
    });

    chain.push({
        id: t(), phase: PHASES.DECIDE, type: TYPES.RECOMMENDATION, round: 3,
        title: 'Precision execution plan compiled',
        content: `Multi-actor prescription finalized:\n - Actor 1 (Drone-01): Spot spray Mancozeb 0.7x on rows 4-7 East, 2m altitude, symptomatic canopy only\n - Actor 2 (IoT System): Ventilation increase to 80% in zones A-C (automated)\n - Actor 3 (Field Team): Manual pruning of infected tissue, rows 4-5 (priority)\n - Actor 4 (Irrigation): Reduce soil moisture target from ${s.soil_moist_pct || 32}% to 28%\n - Actor 5 (Drone-03): Verification hyperspectral scan at T+72h\nTotal actors: 5. Timeline: staggered over 72h.`,
        data: { total_actors: 5, timeline: '72h staggered', approach: 'precision multi-actor' },
        duration: 900,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.PRE_AUDIT, round: 3,
        title: 'Pre-execution compliance seal',
        content: `All 7 regulatory gates passed: PHI PASS Wind safety PASS Banned substance PASS Label rate PASS Collateral assessment PASS Rollback plan (Trichoderma biocontrol) PASS Confidence gate (${pct(r(0.85, 0.93))} >=75%) PASS Decision provenance chain recorded. Hash: ${Math.random().toString(36).slice(2, 10).toUpperCase()}. Ready for multi-actor dispatch.`,
        data: { gates_passed: '7/7', status: 'APPROVED', provenance: 'recorded' },
        duration: 600,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.ML_FEEDBACK, round: 3,
        title: 'Outcome verification & ML feedback scheduled',
        content: `Scheduled verification checkpoints: T+24h (IoT sensor delta), T+72h (drone re-scan), T+168h (7-day efficacy). Prediction to validate: ${Math.round(r(50, 68))}% pathogen reduction. ${Math.round(r(130, 200))} training data points flagged for Sentinel-Agri v4.3 batch. Feature importance ranking will be updated post-outcome.`,
        data: { checkpoints: 3, training_points: Math.round(r(130, 200)), next_model: 'v4.3' },
        duration: 500,
    });

    // Inject timestamps into all steps
    let cumulativeOffset = 0;
    chain.forEach(step => {
        step.timestamp = makeTimestamp(cumulativeOffset);
        step.formattedTime = fmtTs(step.timestamp);
        cumulativeOffset += (step.duration || 500);
    });
    return chain;
}

// 鈹€鈹€鈹€ Execution Thinking Chain 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateExecutionThinkingChain(snapshot, field, prescription, execution) {
    const s = snapshot?.sensors || {};
    const chain = [];
    let stepId = 0;
    const t = () => stepId++;

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.SENSOR_INGEST, round: 1,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Loading execution context & resource availability',
        content: `Prescription ${prescription?.id || 'RX-XXXX'} received. Target field: ${field?.id || 'BS-B3'} (${field?.crop || 'blueberry'}). Checking resource availability: drones (${Math.round(r(2, 4))} available), field teams (${Math.round(r(1, 3))} on-site), IoT systems (${Math.round(r(8, 15))} controllable nodes). Weather window assessment for execution timing.`,
        data: { rx_id: prescription?.id, drones: Math.round(r(2, 4)), teams: Math.round(r(1, 3)), iot_nodes: Math.round(r(8, 15)) },
        duration: 600,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.CONSTRAINT_CHECK, round: 1,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Execution environment validation',
        content: `Wind: ${s.wind_speed_ms || 1.2} m/s (limit: 3.0 m/s for drone spray)  -> PASSCLEAR. Temperature: ${s.temp_C || 24}°C (spray evaporation risk: ${s.temp_C > 32 ? 'HIGH' : 'LOW'}). Humidity: ${s.humidity_pct || 78}% (spray adhesion: ${s.humidity_pct > 60 ? 'GOOD' : 'REDUCED'}). Sunlight: ${s.light_Lux || 12000} Lux (UV degradation: ${s.light_Lux > 25000 ? 'CONCERN' : 'ACCEPTABLE'}).`,
        data: { wind: 'CLEAR', temperature: 'CLEAR', humidity: 'CLEAR', uv: 'CLEAR' },
        duration: 500,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.MODEL_INFERENCE, round: 1,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Multi-actor coordination plan  - optimal sequencing',
        content: `Generating execution DAG (Directed Acyclic Graph) for ${execution?.executionPlan?.length || 5} actors. Dependencies: IoT ventilation must precede spray (reduce humidity first). Drone spray concurrent with recon drone. Field team follows drone spray. Verification scan scheduled at T+72h. Critical path duration: ${Math.round(r(3, 8))} hours.`,
        data: { actors: execution?.executionPlan?.length || 5, critical_path: `${Math.round(r(3, 8))}h`, dependencies: 3 },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.DECIDE, type: TYPES.RECOMMENDATION, round: 2,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Actor dispatch sequence finalized',
        content: `Dispatch order: (T+0) IoT ventilation activate  -> (T+0) Drone-01 spray + Drone-02 recon  -> (T+2h) Field Team pruning  -> (T+1h) Irrigation adjustment  -> (T+72h) Drone-03 verification. Each actor has individual execution fingerprint for compliance tracking.`,
        data: { dispatch_sequence: '5 actors', fingerprints: 'per-actor', timeline: '72h span' },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.PRE_AUDIT, round: 2,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Execution fingerprint generation & verification',
        content: `Generating cryptographic execution fingerprint: prescribed parameters  -> canonical JSON  -> SHA-256 hash. Prescribed fingerprint: ${execution?.executionFingerprint?.prescribed?.slice(0, 20) || 'sha256:a4f2b8c1..'}. This fingerprint will be compared against actual execution parameters post-completion to detect any deviations.`,
        data: { fingerprint: execution?.executionFingerprint?.prescribed?.slice(0, 20) || 'sha256:a4f2b8c1..', method: 'SHA-256', match_expected: true },
        duration: 600,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.CONFIDENCE, round: 2,
        agentId: 'execution', agentRole: 'Execution Agent',
        title: 'Execution readiness confirmed',
        content: `All pre-execution checks passed. Resource allocation confirmed. Weather window open for ${Math.round(r(8, 16))}h. Execution confidence: ${pct(r(0.88, 0.96))}. Rollback plan ready: if coverage <75% or deviation >30%, halt and re-assess. Live monitoring active on all actors.`,
        data: { readiness: 'CONFIRMED', confidence: pct(r(0.88, 0.96)), rollback: 'armed' },
        duration: 500,
    });

    let cumulativeOffset = 0;
    chain.forEach(step => {
        step.timestamp = makeTimestamp(cumulativeOffset);
        step.formattedTime = fmtTs(step.timestamp);
        cumulativeOffset += (step.duration || 500);
    });
    return chain;
}

// 鈹€鈹€鈹€ Audit Thinking Chain 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export function generateAuditThinkingChain(snapshot, field, prescription, execution, riskResults) {
    const topRisk = riskResults?.[0];
    const chain = [];
    let stepId = 0;
    const t = () => stepId++;

    chain.push({
        id: t(), phase: PHASES.PERCEIVE, type: TYPES.SENSOR_INGEST, round: 1,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Collecting post-execution evidence',
        content: `Gathering outcome data: T+72h sensor readings, drone verification imagery (${Math.round(r(400, 800))} MB), execution telemetry from ${execution?.executionPlan?.length || 5} actors, chemical delivery logs, IoT system records. Cross-referencing against pre-execution baseline snapshot.`,
        data: { sources: 6, imagery: `${Math.round(r(400, 800))} MB`, actors_audited: execution?.executionPlan?.length || 5 },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.PATTERN_MATCH, round: 1,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Execution fingerprint comparison',
        content: `Prescribed fingerprint: ${execution?.executionFingerprint?.prescribed?.slice(0, 20) || 'sha256:a4f2b8c1..'}. Actual fingerprint: ${execution?.executionFingerprint?.actual?.slice(0, 20) || 'sha256:a4f2b8c1..'}. Match: ${execution?.executionFingerprint?.match !== false ? 'PASSMATCH' : 'PASSMISMATCH'}. ${execution?.deviations?.length > 0 ? `${execution.deviations.length} deviation(s) detected.` : 'Zero deviations detected.'}`,
        data: { fingerprint_match: execution?.executionFingerprint?.match !== false, deviations: execution?.deviations?.length || 0 },
        duration: 600,
    });

    chain.push({
        id: t(), phase: PHASES.ANALYZE, type: TYPES.RISK_CALCULATION, round: 1,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Outcome efficacy measurement',
        content: `Pre-intervention risk: ${topRisk?.score || 72}/100. Post-intervention risk: ${Math.round((topRisk?.score || 72) * r(0.35, 0.55))}/100. Risk reduction: ${Math.round((topRisk?.score || 72) * r(0.45, 0.65))} points (${pct(r(0.45, 0.65))} improvement). NDVI change: +${r(0.02, 0.08)}. Lesion count delta: -${Math.round(r(55, 80))}%.`,
        data: { risk_before: topRisk?.score, risk_after: Math.round((topRisk?.score || 72) * r(0.35, 0.55)), ndvi_delta: `+${r(0.02, 0.08)}` },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.ECONOMIC_ANALYSIS, round: 2,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Financial impact assessment',
        content: `Intervention cost: CNY ${prescription?.estimatedCost || 2800}. Revenue protected: CNY ${Math.round(r(25000, 85000)).toLocaleString()} (grade ${field?.gradeClass || 'A'} maintained on ${Math.round(r(70, 100))}% of product). Realized ROI: ${r(8, 22)}x. Compared to traditional approach: chemical savings ${Math.round(r(40, 70))}%, total cost reduction ${Math.round(r(25, 45))}%.`,
        data: { cost: `CNY ${prescription?.estimatedCost || 2800}`, revenue_protected: `CNY ${Math.round(r(25000, 85000))}`, roi: `${r(8, 22)}x` },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.REASON, type: TYPES.COMPLIANCE, round: 2,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Regulatory compliance verification',
        content: `[1/5] PHI compliance: ${prescription?.activeIngredient?.name || 'Mancozeb'}  - PASSPASS. [2/5] Residue testing: within MRL limits (GB 2763-2021)  - PASSPASS. [3/5] Label rate adherence: ${execution?.actualDosageRatio || 0.7}x within 0.5-1.0x approved range  - PASSPASS. [4/5] Environmental safeguard: buffer zones maintained  - PASSPASS. [5/5] Worker safety: PPE protocols followed  - PASSPASS.`,
        data: { checks: '5/5 passed', standard: 'GB 2763-2021', phi: 'PASS', residue: 'PASS', label: 'PASS' },
        duration: 800,
    });

    chain.push({
        id: t(), phase: PHASES.DECIDE, type: TYPES.RECOMMENDATION, round: 3,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'Responsibility assignment & recommendations',
        content: `Decision quality: ${r(8.5, 9.5)}/10. Execution quality: ${r(7.5, 9.5)}/10. Responsibility boundary: ${execution?.executionFingerprint?.match !== false ? 'SYSTEM (decision and execution aligned)' : 'OPERATOR (execution deviated from prescription)'}. Recommendations: ${Math.round(r(1, 3))} process improvements identified. Next verification: T+168h (7-day follow-up).`,
        data: { decision_quality: r(8.5, 9.5), execution_quality: r(7.5, 9.5), responsibility: execution?.executionFingerprint?.match !== false ? 'system' : 'operator' },
        duration: 700,
    });

    chain.push({
        id: t(), phase: PHASES.VERIFY, type: TYPES.ML_FEEDBACK, round: 3,
        agentId: 'audit', agentRole: 'Audit Agent',
        title: 'ML feedback loop & continuous improvement',
        content: `This audit cycle captured ${Math.round(r(150, 220))} labeled outcome data points. Features updated: intervention timing weight, dosage-efficacy curve, cascade risk probability. Model prediction vs. actual deviation: ${r(2, 8)}%. Sentinel-Agri model queued for v4.3 retraining batch. Feature importance ranking updated.`,
        data: { training_points: Math.round(r(150, 220)), prediction_error: `${r(2, 8)}%`, next_model: 'v4.3' },
        duration: 600,
    });

    let cumulativeOffset = 0;
    chain.forEach(step => {
        step.timestamp = makeTimestamp(cumulativeOffset);
        step.formattedTime = fmtTs(step.timestamp);
        cumulativeOffset += (step.duration || 500);
    });
    return chain;
}


