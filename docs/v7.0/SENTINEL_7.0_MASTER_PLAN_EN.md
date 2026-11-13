# Sentinel 7.0 Master Plan: Autonomous Operating Core for Modern Agribusiness

> **System Name:** 观衡智序 · Sentinel 7.0 (Autonomous Operating Core)  
> **Mission:** Synthesize specialized disciplinary judgments into unified operational strategies, coordinating Agronomy, Compliance, Operations, Sales, and Finance. *A single production decision ripples across fruit quality, contract delivery, and bottom-line margin.*  
> **Design Philosophy:** Combines the decision intelligence of Palantir Foundry / AIP with Google Stitch (stitch.google.com) visual simplicity. Preserves all V3.5/V4.2 assets while achieving a dual-track loop: **24/7 routine autonomous operations (minor yellow micro-events resolved autonomously by AI)** and **3 major crisis scenarios with interlocked human-in-the-loop governance (critical red alarms)**.  
> **Baseline Reality:** **900-mu High-Tech Blueberry Plant Factory (~60 ha modern facility)** located in Chengjiang, Yunnan (Fuxian Lake north bank, 1,750m elevation). Core testbed: South-B3 multi-span greenhouse (20 mu, 3,200 plants, baseline contract: 750 kg Grade A @ ¥65/kg = ¥48,750).  
> **Online Prototype:** [https://sentinel-three-ashy.vercel.app/](https://sentinel-three-ashy.vercel.app/)

---

## 1. Executive Narrative: The Operational Decision Loop

The narrative centers on the core dilemma facing modern commercial agricultural enterprises:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🔴 INDUSTRY DILEMMA: Tools are digitized, but decisions are fragmented │
│    "Delivery in 3 days: 750 kg Grade A Blueberries from 20-mu block,  │
│     25 pickers assigned today."                                        │
│    "At 05:40 AM - Connected trap flags possible pest spread."          │
│    • Agronomy: Treat immediately or delay? ➔ Crop downgrade risk       │
│    • Quality: Which lots can be released? ➔ Delivery delay risk        │
│    • Compliance: Is chemical spray permitted? ➔ 14-day PHI legal breach│
│    • Operations: Can crew and cold rooms execute? ➔ Overtime cost      │
│    • Sales: How to safeguard contract profit? ➔ Margin erosion         │
│    👉 A single field decision ripples across Quality, Delivery & Profit!│
├────────────────────────────────────────────────────────────────────────┤
│ 🟢 SENTINEL 7.0 SOLUTION: Synthesizing Judgments into Unified Strategy │
│    Powered by an Enterprise Agribusiness Ontology across 4 phases:     │
│    1. Perception: Continuous ingestion of crops, orders, sensors, & env│
│    2. Decision: 6-specialist consensus comparing 3 candidate plans     │
│    3. Execution: Automated dispatch of work orders (crew, drones, HVAC)│
│    4. Verification: 3 interlocked gates & immutable cryptographic audit│
├────────────────────────────────────────────────────────────────────────┤
│ 💎 THREE PILLARS:                                                      │
│    01 | Holistic Operational Awareness (Farm Ontology)                 │
│    02 | Multi-Agent Collaborative Decision (6 Specialist Perspectives) │
│    03 | Interlocked Execution & Closed-Loop Verification               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 900-Mu Mega-Facility Blueprint (Yunnan Chengjiang)

*   **Location & Microclimate:** Chengjiang, Yuxi, Yunnan (Fuxian Lake basin, 24.67°N, 102.91°E, 1,750m altitude). Low-latitude high-elevation dry-warm lake microclimate; >2,250 annual sunshine hours; 12~15°C diurnal temperature variation. National prime zone for early-season jumbo blueberries.
*   **Facility Zoning (900 mu / ~60 ha):**
    *   **Smart Multi-Span Complex (100 mu):** 5 interconnected glass/poly complexes (20 mu each). Core crisis testbed: South Sector B, Block B3 (20 mu, 3,200 Eureka plants in substrate containers, `#TRAP-S02`, `CREW-25`).
    *   **High-Tunnel Protected Area (500 mu):** Main commercial production zone for premium supermarket contracts.
    *   **Precision Open-Field Base (300 mu):** Staggered harvest and processing stock.
    *   **Post-Harvest & Cold Chain Center (30 mu):** 15,000 m² facility with 50-tonne controlled-atmosphere cold room complex (4 rooms @ 12~15 tonnes, 0~2°C) and 4-channel optical sorting lines.
*   **Workforce & Equipment:** 35 permanent technical staff; peak harvest workforce of 150~300 pickers organized into 25-worker crews (`CREW-25`). 80 smart vision insect traps, 200+ IoT sensors, 4 DJI T40/T50 agricultural drones.
*   **Economics:** ¥65M CAPEX; annual OPEX ~¥11.5M; annual yield 800~1,000 tonnes; annual revenue ¥52M~¥68M; net margin ¥22M~¥35M.
*   **Channels:** 60% Key Account (KA) Supermarket SLA (Hema, Sam's Club @ ¥65/kg); 25% Tier-1 Wholesale (¥54/kg); 15% Private E-Commerce (¥100~¥120/kg).

---

## 3. Executive Decision Model: The Morning Five Questions

1. **Fulfillment Risk:** Can we deliver the 750kg D+3 Hema order on time without SLA penalty?
2. **Quality Degradation:** Will pests or heat downgrade fruit from Grade A (¥65/kg) to juice processing (¥15/kg)?
3. **Regulatory Compliance:** Does the treatment violate the Pre-Harvest Interval (PHI)?
4. **Labor & Cold Chain Capacity:** Can Crew-25 finish harvesting today? Does Cold Room #1 have space?
5. **Bottom-Line Margin:** What is the final net profit after accounting for inputs, labor, electricity, and penalties?

---

## 4. Nuanced Strategy Trade-Offs (Not Black-and-White)

The three candidate plans on `/prescription` represent realistic agricultural trade-offs with distinct boundary advantages:

| Dimension | **Plan A: Full Crop Protection** | **Plan B: Selective Release + Biocontrol (Current Lead)** | **Plan C: Harvest-First & Zero-Spray (Strong Runner-Up)** |
|---|---|---|---|
| **Action** | Full chemical spray (Mancozeb/Fludioxonil). Negotiate 10-day delay or substitute lot. | Release cleared LOT-01/02 (780kg). Isolate LOT-03 (120kg) and apply 0-day PHI Trichoderma biocontrol. | **Zero chemical/biological spray**. 25 pickers harvest immediately. Strict post-harvest optical sorting. |
| **Economics** | Sales: ¥41k~¥46k \| Cost: ¥13k~¥18k<br>**NET: ¥23k~¥33k** | Sales: ¥42k~¥48.75k \| Cost: ¥6.7k~¥11.8k<br>**NET HIGHEST: ¥30k~¥35k** | Sales: ¥38k~¥42k \| Cost: ¥8k~¥11k<br>**NET: ¥25k~¥28k (Strong Runner-Up)** |
| **Scores** | Crop **5/5** \| Compliance **3/5** \| Customer **2/5**<br>Ease **4/5** (Standard uniform spray) | Crop **4/5** \| Compliance **5/5** \| Customer **5/5**<br>**Ease 2/5 (Highest operational complexity)** | Crop **3/5** \| **Compliance 5/5 (100% Eco-Pure)**<br>Customer **4/5** \| **Ease 5/5 (Simplest execution)** |
| **Wins When** | Infestation is widespread and buyer approves 10-day delay in writing. | Precise lot isolation, drone micro-targeting, and cold room partition are operational. | **Drones fail, gusts prevent flight, or buyer mandates 100% zero-spray organic eco-certification.** |
| **Status** | `[• CONDITIONAL / BLOCKED]` | `[✔ CURRENT LEAD / OPTIMAL]` | `[• STRONG RUNNER-UP]` |

> 💡 **Core Value:** Plan B leads on margin (+¥6,500), but Plan C provides maximum execution simplicity and 100% zero-residue certification. Under boundary testing (e.g., drone failure), Plan C instantly becomes the CURRENT LEAD.

---

## 5. Dual-Track Operational Logic

```
                    ┌──────────────────────────────────────────────┐
                    │      Sentinel 7.0 Unified Operating Core     │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│ 🟢 TRACK 1: Routine Autonomous  │                 │ 🔴 TRACK 2: Major Scenarios     │
│    Operations (24/7 Normal)     │                 │    (Human-in-the-Loop L4)       │
├─────────────────────────────────┤                 ├─────────────────────────────────┤
│ • Trigger: Default normal state │                 │ • Trigger: Scenario enabled     │
│ • Severity: Green / Yellow info │                 │ • Severity: Global Critical Red │
│ • Autonomy: L2/L3 closed-loop   │                 │ • Autonomy: L4 mandatory human  │
│ • Actions: Micro-ventilation,   │                 │ • Actions: 6-specialist debate, │
│   pulse fertigation, wind delay │                 │   A/B/C trade-off matrix,       │
│   executed without bother   │                 │   interlocked dispatch receipt  │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

### 5.1 Track 1: 4 Routine Closed-Loop Micro-Events
1. **Afternoon Micro-Ventilation:** Internal humidity reaches 82.5% (>80% threshold). AI activates axial fans #3 & #4 at 60% power for 20 mins; humidity recovers to 71.0%.
2. **Substrate Pulse Fertigation:** Substrate moisture drops to 27.2%. Pulse line #2 delivers targeted nutrient solution for 12 mins; moisture recovers to 33.2%.
3. **Gust Avoidance Inspection Delay:** Local gusts reach 4.6 m/s. AI defers drone multispectral flight by 30 mins until wind calms.
4. **Early Thrip Trap Scouting:** Sticky trap records 3 thrips (below 10/trap action threshold). Dispatches scout inspection task for tomorrow; chemical spray prohibited.

---

## 6. Three Major Crisis Scenarios

1. **Scenario 1: Connected Trap Warning vs D+3 750kg Order & PHI Conflict (Baseline Core)**
   *   Trigger: 05:40 AM, #TRAP-S02 reports pest spread (Risk 68/100).
   *   Plan B leads (Net ¥30k~¥35k); Plan C strong runner-up (Net ¥25k~¥28k, zero spray); Plan A crop asset fallback (Net ¥23k~¥33k).
2. **Scenario 2: Extreme 36.5°C Heatwave vs Dawn Staggered Harvest (Climate Emergency)**
   *   Trigger: 48h extreme heat 36.5°C & UV Index 11+ threatening 1,200kg Grade A order.
   *   Plan B leads: 75% aluminum shade curtain + night cooling + 05:00-10:00 dawn harvest (Net ¥60k~¥65k).
   *   Plan C strong runner-up: Dawn-only harvest with 20 co-op temp workers (48 total) without night misting (avoids night fungal mold risk, Net ¥55k~¥58k).
   *   Plan A: Continuous daytime overhead misting (bloom loss 25%~30%, Net ¥38k~¥42k).
3. **Scenario 3: Cold Room #1 Fault & Post-Harvest QA 50kg Deficit (Supply Chain Reconciliation)**
   *   Trigger: Cold room rose to 7.8°C; QA approves 700kg, 50kg deficit against 750kg order.
   *   Plan B leads: Release 700kg + draw 50kg buffer stock from Room #2 + soft fruit to frozen puree (Net ¥32,500).
   *   Plan C strong runner-up: Release 700kg + swap 50kg Grade A from neighboring partner co-op (preserves internal safety stock for tomorrow's contract, Net ¥29.5k~¥31k).
   *   Plan A: Split shipment (ship 700kg immediately, dispatch 50kg tomorrow via cold-chain air express, Net ¥25k~¥28k).

---

## 7. Bilingual Terminology & UI Standards

*   **Seamless Instant Switching:** Toggling between `[EN]` and `[中文]` in the top bar instantly updates all UI text, KPI units, badges, and scenario definitions without page reload.
*   **Natural Localization Standards:** Chinese texts strictly adhere to commercial agricultural industry conventions (e.g., 针对性隔离放行, 抢收优先+零喷洒, 强力第二优选, 联锁门禁) while retaining universal professional acronyms (PHI, Grade A, D+3, SLA, KA, FTE, EC/pH).
*   Details documented in [BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md](BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md).

---

## 8. Deterministic Simulation vs. Genuine Gemini AI Boundaries

*   **Deterministic Simulation Engine:** Mathematical calculations, physical sensor telemetry, GB 2763 compliance rules, PHI calendar calculations, interlocked dispatch locks, and SHA-256 receipts.
*   **Genuine Gemini AI Layer:** Page-aware Ask Sentinel AI drawer with contextual badges, cross-disciplinary conflict arbitration, causal attribution explanations, and interactive boundary simulations.

---

## 9. Verification & Delivery Roadmap

1. **Master Specifications & Terminology (Complete):**
   *   [SENTINEL_7.0_MASTER_PLAN_CN.md](SENTINEL_7.0_MASTER_PLAN_CN.md)
   *   [SENTINEL_7.0_MASTER_PLAN_EN.md](SENTINEL_7.0_MASTER_PLAN_EN.md)
   *   [BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md](BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md)
   *   [DECISION_MATRIX_AND_INFORMATION_FLOW_SPEC_CN.md](DECISION_MATRIX_AND_INFORMATION_FLOW_SPEC_CN.md)
   *   [FARM_BLUEPRINT_AND_OPERATOR_PERSONA_CN.md](FARM_BLUEPRINT_AND_OPERATOR_PERSONA_CN.md)
   *   [AUTONOMY_LEVELS_SPEC_CN.md](AUTONOMY_LEVELS_SPEC_CN.md)
   *   [scenarios.json](scenarios.json)
2. **Next Steps (Upon User Approval to Code):**
   *   Develop `src/components/DecisionMatrix.jsx` (Hero Decision Matrix with bilingual support).
   *   Mount `DecisionMatrix.jsx` at the top of `src/pages/Prescription.jsx`.
   *   Enhance 24/7 routine autonomous loop events in `src/engine/store.js`.
   *   Verify with `node --test scripts/sentinel-6.1-data.test.mjs` and `npm run build`.