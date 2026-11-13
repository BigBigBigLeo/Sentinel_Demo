# Sentinel · English-First Website Rebuild Plan

**Product and presentation baseline:** `2026shenzhen/ShenZhen Final/V3.5.md`, *Shenzhen International Final — V3.5* (nine slides). The V3.5 Product & Demo Rebuild Brief supplies implementation details. Shenzhen Final V2.6 supplies background, and the Netherlands materials supply visual references. Use the V3.5 final for product language, team and progress references, and the order scenario. The revised website is an English-only release.

| Reference | What the website takes from it |
| --- | --- |
| **Shenzhen International Final V3.5**, slides 1–4 and 9 | The 24/7 operating-manager positioning, five business consequences, six perspectives and 14 roles, three strategies, approval lock, and Farm Ontology. |
| **Sentinel_V21.pptx** and **Sentinel_V31.pptx**, Shanghai Visit, slides and speaker notes 2–4 | Explain the decision from the farm manager's point of view. Compare business consequences, get approval, coordinate work, and verify the result. |
| **Sentinel_Netherlands_v5.5.pptx**, slides and speaker notes 1, 3–4 | Make “keeping watch” visible. Show one shared farm state, how specialists weigh competing strategies, and why a leading plan still has to clear execution gates. Use Shenzhen V3.5 for the current names and role grouping. |
| **Sentinel white paper V1.3.1**, sections 3.3, 3.5–3.6, 4.6 and 6.4 | A proactive, continuous decision loop, third-party execution interfaces, verification against the approved plan, and evidence that improves future decisions. |
| [**Sentinel Demo V1.0 · Shenzhen Final demo proposal**](https://chatgpt.com/s/t_6af6f7d3d6088191a17b04fbffc453f7) | Five competition views, the 90-second route, visible specialist disagreement, real what-if recalculation, and a verified replay. Apply these to the same operating workflow used across the site. |

## 1. Product direction

Lead with **“Your Farm’s 24/7 AI Operating Manager”** and **“Decision & Execution OS for High-Value Agriculture.”** Use **“From Field Intelligence to Enterprise Decisions”** to introduce what changes for farm owners and agricultural groups. The homepage should connect crops, orders, people, and profit through one event.

Apply this direction across the homepage, workspace, technical pages, case entry points, and system messages. The blueberry walkthrough demonstrates how the product works. The wider site explains who uses Sentinel, which decisions it supports, how it fits with existing production systems, and what operators can verify after execution.

Use **LOOK → THINK → ACT → PROVE** as the visible product workflow. Use **Observe → Weigh → Decide → Orchestrate** where the brand philosophy is explained. Position Sentinel as the enterprise decision layer above existing farm systems and physical operations. Show how an observation affects grade, delivery, labor, compliance, and margin. Use the V3.5 vision **“One AI Operating Layer. Across Farms, Crops and Intelligent Machines.”** The first release demonstrates one synthetic blueberry operation. Explain the path from blueberries to premium crops and multi-site enterprises in terms of a reusable operating model and crop-specific expertise.

Use English throughout the first release, including charts, accessibility labels, alerts, errors, empty states, exports, and the runbook. Keep the existing locale structure where useful for a future translation pass.

Describe the product as an operating team that keeps watch, brings specialists together, compares options, coordinates authorized work, and checks what happened. The homepage should demonstrate each step in a short product preview. Deeper pages should expose the live state, evidence, and controls relevant to that step. Use **24/7** for the product operating model and **Simulation** for the first release's environment.

## 2. Site map and page priorities

| Page | Visitor’s question | Main content or action |
| --- | --- | --- |
| **Home** | What does Sentinel do for my farm business? | Lead with the V3.5 positioning. Use **One Alert. Five Business Consequences.** to introduce grade, delivery, labor, compliance, and margin. Give visitors two clear paths: **Open workspace** and **See how it works**. Use one product preview and a short operating workflow. |
| **Workspace** | What needs my attention today? | Show **Farm Watch**, recent changes, orders at risk, evaluations in progress, decisions awaiting approval, and active work. Each queue item links to its triggering event, the decision, and its next required action. |
| **Farm Context** | Why is this order at risk? | Trace the alert through plot, batch, order, workers, and operating rules. Each key record shows its source, timestamp, and quality status. Provide telemetry and risk detail here. |
| **Decision Room** | What are the options, and can we act? | Show what triggered the evaluation, six specialist perspectives, three strategies, and the combined recommendation or escalation. Compare grade, delivery, labor, compliance, and margin. Show approval separately and support what-if changes. |
| **Execution** | Who is doing what, and where could work stop? | Show the authorized workflow, task dependencies, acknowledgments, and any blocked next step. Provide pause, resume, failure injection, and reset where relevant. |
| **Evidence** | What happened, and can I verify it? | Connect the input snapshot, approved plan, tasks, receipts, and deviations. Show estimated business impact with its assumptions, case history, and JSON/CSV export. |
| **How It Works** | How does Sentinel fit into our current operation? | Show how farm systems and equipment feed the decision layer. Explain decision support, approval, workflow orchestration, and audit with one concrete example. Present L1 Farm Assistant, L2 Enterprise Decision OS, and L3 Governed Execution & Audit with clear availability labels. |
| **Company** | Who is building Sentinel, and where is it today? | Use a compact section linked from the footer. Present the four complementary founding capabilities and the Shenzhen build / Yunnan validation / Netherlands research and market connections roadmap. Label the current prototype and future milestones. Keep fundraising and target ARR in investor materials. |

Use a short public navigation for **Product**, **How It Works**, and **Open workspace**. Inside the workspace, use **Overview**, **Farm Context**, **Decisions**, **Execution**, and **Evidence**. Surface scenarios and administration in the workspace tools. Preserve legacy deep links such as `/sensors`, `/risk`, `/prescription`, `/execution`, `/audit`, and `/history` through compatible routes or explicit redirects after checking their existing behavior.

## 3. Farm Ontology and decision evidence

- **Shared operating model.** Use stable IDs, typed entities and relationships, and versioned scenario snapshots across the overview, Farm Context, decisions, execution, and evidence. Model farms, plots, crop batches, observations, alerts, orders, harvest plans, workforce, equipment, quality and compliance rules, tasks, and receipts. Example relationships include `Observation recorded on Plot`, `Crop Batch harvested from Plot`, `Crop Batch allocated to Order`, and `Quality Rule governs Batch Release`. Record source, timestamp, validity, unit, and confidence where applicable.
- **Semantic interoperability.** Seed three source types: scouting or sensor observations, an ERP order record, and a crew roster or quality receipt. Show how source fields and identifiers map to shared entities. Preserve the original references and normalized units. Flag missing, stale, or conflicting inputs. Implement the first graph with typed records and relationship queries in the simulation service. A graph database is outside this release.
- **Farm Context.** Make “Why is this order at risk?” open a focused, clickable path from the 05:40 pest alert through the affected plot and batch to the 750 kg Grade A order. Show the available crews, applicable rules, and source records alongside the path. Derive this view from the same relationships the decision service queries.
- **Decision Room and Execution.** Derive affected order volume, eligible batches, crew capacity, and applicable rule checks from the selected snapshot. Combine crop models and deterministic business rules with specialist assessments. AI can propose or explain options. Hard constraints and quantitative calculations govern eligibility. Carry the approved plan version and the affected entity IDs into tasks and receipts.
- **Evidence.** Show an expandable **Execution Fingerprint** linking the input snapshot, rule and model versions, approved plan, approver, task events, simulated receipts, and deviations. Distinguish task completion, execution verification, and business outcome validation. Show the assumptions behind modeled contribution or revenue at risk.
- **How It Works.** Make the three layers explorable in one example: Sentinel's Enterprise Decision Layer, Production & Farm Management, and Physical Operations. Explain how source records map into the Farm Ontology and how approved work flows back through adapters. Label adapter availability as Simulated, Planned, or Connected when applicable.
- **Technical differentiation.** Show four sources of reusable capability from the final: crop knowledge, semantic maps, system interfaces, and outcome evidence. Use one blueberry-specific quality or harvest rule alongside the shared order, resource, and task model to explain what changes for the next crop.

### 3.1 Continuous farm watch and specialist decisions

| Surface | How the operating model appears |
| --- | --- |
| **Home** | Show an alert arriving, specialist assessments opening, options compared, and authorized work verified in one compact preview. Use **See how it works** to open the same case. |
| **Workspace and Farm Context** | Show the watch status, last check, next scheduled check, and latest meaningful changes. Show what triggered the review, which farm records changed, which orders are affected, and which specialists have findings. |
| **Decision Room** | Keep the six perspectives visible alongside the options. An expandable role record shows its finding, evidence, affected strategy, and whether it raised a hard gate or a trade-off. Summarize the disagreement that changed the recommendation. |
| **Execution** | Show manager approval and policy checks, who or what owns each task, the next dependency, and who receives an escalation. Simulated adapters represent staff, farm software, and equipment interfaces. |
| **Evidence and How It Works** | Explain and trace the chain from automatic trigger to specialist judgments, approved action, actual receipt, and operational outcome. Preserve ignored, expired, or overridden cases for review. |

Use the same watch status, alert references, and decision status across workspace routes. Maintain a single shared case and event history. Use one product example across public pages and contextual links into the workspace. Avoid duplicating the full role roster or decision matrix on pages that need only a summary.

**Specialist perspectives.** Group the 14 roles into Agronomy, Quality & Compliance, Sales & Orders, Operations & Workforce, Finance & Margin, and Data & Risk Assurance. Each assessment records the snapshot, evidence references, finding, impact, and applicable gate. Agronomy can favor faster containment while Compliance raises a harvest-window conflict, Sales protects the order, Operations checks capacity, Finance models contribution, and Data checks freshness. Calculate one enterprise recommendation from the shared record. Apply hard constraints before ranking. Explain the winning trade-offs and what would change the result. Escalate if every strategy is blocked. Use deterministic rules and fixture-backed specialist assessments for the first release. Label simulated assessments and support later model or tool integration through the same assessment contract.

**Proactive runtime.** Run a background scheduler and event evaluator in the simulation service while it is running. Ingest a scheduled or incoming synthetic observation, refresh the Farm Ontology, and automatically create a risk review when a threshold or material business change occurs. Re-evaluate affected orders when grade availability, deadline, staffing, or data freshness changes. Deduplicate repeated events. Write watch checkpoints, assessment outputs, decisions, approvals, tasks, and receipts to one persisted event trail. Route recommendations into the approval queue and record timeouts or declined actions. Keep approved simulated jobs running across page navigation and browser closure, and resume from a durable checkpoint after a service restart. Use an accelerated seeded clock for the 05:40 event. The launch control starts the simulation clock. Evaluation and plan comparison start automatically when the event arrives.

**Automation policy.** Monitoring, risk detection, impact analysis, plan generation, recommendations, and escalation are automatic. Execution requires the applicable policy and a valid approval in this case. After approval, the service dispatches and verifies allowed simulated tasks automatically. A failed prerequisite, stale approval, or receipt mismatch pauses dependent actions and records the reason and next responsible role. Product pages describe authorized production integrations as product scope, with first-release data and execution visibly labeled as simulated.

### 3.2 Live information flow and agent activity

Carry forward the previous version's continuously updating **System Activity Rail**. Keep it visible in the desktop workspace shell and accessible through one shared drawer on small screens. Use a compact, labeled simulation preview of the same flow on the homepage. The overview shows the latest changes, the Decision Room filters to assessments for the selected case, and Execution and Evidence use the same event IDs for receipts and verification. Switching pages preserves the stream and the selected case.

Show this sequence as it happens: **Source update → Farm Ontology change → Specialist assessment → Strategy comparison → Recommendation or escalation → Approved work → Verified receipt**. Each event displays its source or role, timestamp, related case or record, and outcome. Show relevant specialist roles moving through **Watching**, **Assessing**, **Findings ready**, or **Waiting for evidence**. A completed finding opens its evidence, affected plan, and impact on the recommendation. Display roles relevant to the active case, with the full roster available on demand.

Show the service heartbeat and last successful check during quiet periods. Keep Farm Watch active while a decision awaits approval. Continue evaluating material updates and invalidate a stale recommendation or approval when its inputs change. Use a steady simulated clock with several distinct events before, during, and after the featured alert. Populate the rail from persisted service events. Use restrained transitions to highlight new entries and allow users to pause scrolling while reading. Keep simulation time and live service status visibly distinct.

## 4. Visual direction and Stitch

Use a deep navy brand frame, crisp typography, light decision surfaces, and a restrained teal accent for active controls. Reserve amber for warnings. Pair color with words and icons for blocked and verified states. Use the V3.5 agricultural photography direction and draw useful patterns from the existing `BusinessPlan/stitch_sentinel_demo1.zip` export, which includes dashboard, prescription, execution, and audit screens. Give the homepage a strong product visual, and make the workspace easy to scan from a laptop or projector.

Make **one Stitch pass** for the homepage, workspace overview, and Decision Room using synthetic scenario data, the logo, and a few existing screenshots. The homepage should show the shift from ongoing watch to action. The overview should make the latest change, affected order, and pending decisions easy to find. The Decision Room should show the specialist disagreement, three strategies, the decisive constraint, and approval status. Reuse the same status, relationship, and evidence components in Farm Context, Execution, and Evidence. Allow one refinement after checking visual hierarchy, legibility, warnings, and approval states. Capture the result in a short `DESIGN.md` covering type, spacing, color, navigation, tables, status labels, and responsive behavior. If Stitch is unavailable, build the same three reference screens directly in React.

Review the three reference screens at 1440 px and 390 px before applying the design across the site. Verify the primary walkthrough at 1920×1080 for projection. Use shared UI components for navigation, headings, data tables, alerts, timelines, and evidence panels.

## 5. One working workflow

Reuse React, Vite, React Router, Zustand, Recharts, and applicable existing components. Audit the uncommitted workspace changes before creating an isolated development baseline. Reuse the working agronomy and audit logic where it fits the new order scenario.

- **Inputs and decisions.** Use the synthetic Yunnan blueberry case `BB-ORDER-750-001`. A 05:40 pest alert threatens a 750 kg Grade A order due in three days. With 25 pickers at 12 kg per person per day, baseline harvest capacity is 900 kg. Compute harvest capacity and quality-eligible volume separately. Compare Full Crop Protection, Selective Release + Containment, and Harvest-First Containment. Evaluate hard constraints before ranking eligible plans. Calculate the baseline recommendation from the scenario. Group the 14 specialist roles into six expandable decision perspectives.
- **Approval and execution.** Use a lightweight Node simulation service for rules, approvals, task events, and persistence. Bind approvals to the scenario and plan versions. Validate permissions, data freshness, and constraints at execution start. Run the approved task chain through simulated isolation, quality review, harvest allocation, crew dispatch, inventory reservation, external-system sync, and verification. Use repeatable receipts, idempotent dispatch, and bounded retries. Provide a clear pause and escalation path.
- **Evidence.** Keep one event trail for decisions, approvals, tasks, and audit. Expose the difference between planned quantities and simulated receipts. Make historical replay deterministic and downloadable. Label modeled economic estimates, synthetic data, and simulated execution wherever shown. Public product pages describe capability and availability. The workspace clearly identifies its simulation environment.
- **Regression cases.** A one-day deadline gives 300 kg of harvest capacity, and 15 pickers over three days give 540 kg. Both trigger re-evaluation and escalation in the baseline fixture. Stale data blocks dependent execution. A 700 kg quality receipt records a 50 kg shortfall and stops inventory reservation. The approved baseline flow reaches simulated order readiness.

### Walkthrough and expected state changes

| Step | What the audience sees | What the system does |
| --- | --- | --- |
| **LOOK** | Farm Watch detects a 05:40 pest alert on a 20 mu Yunnan blueberry operation, with 25 pickers and a 750 kg Grade A order due in three days. | Ingest the scheduled observation and automatically open an evaluation. Resolve the impacted plot, batch, harvest allocation, and order through the Farm Ontology. Show source and freshness on click. |
| **THINK** | Six perspectives, three strategies, and Plan B marked **Current Lead** in the baseline. | Evaluate Plan A for a simulated harvest safety-window conflict, Plan C for a simulated Grade A volume shortfall, and Plan B for eligible volume, crew capacity, and modeled cost. Rank eligible plans. Display the evidence supporting each decision. Keep all 14 specialist role assessments expandable. |
| **ACT** | **Execution Locked Until Approved**. An authorized manager approves the current plan and the timeline advances automatically. | Bind approval to plan and snapshot versions. Run isolation, QA, allocation, dispatch, reservation, simulated sync, and verification through task dependencies. Check the receipt before releasing dependent tasks. |
| **PROVE** | Simulated order readiness and an **Execution Fingerprint**, with planned quantities, receipts, and deviations available on click. | Record actual simulated quantities and compare them with the approved plan. Preserve the original snapshots and event history for deterministic replay. |

Run a second path from the same fixture. Changing the deadline to one day withdraws the recommendation and invalidates any prior approval. Reset to baseline and inject a 700 kg QA receipt to show the 50 kg shortfall, blocked downstream actions, and escalation. The 900 kg baseline is labor capacity. Order eligibility depends separately on the qualified batch volume. Treat all costs and outcomes as modeled. Keep the earlier 90 kg / RMB 2,850 example out of the default walkthrough until its plan comparison and inputs are reconciled with the fixture.

### Initial simulation contract

These proposed fixture values make each result reproducible. The final supplies the order, site, headcount, deadline, alert, and recommended strategy. The implementation brief supplies the simulated labor rate and failure receipt.

| Strategy | Proposed baseline fixture | Expected decision |
| --- | --- | --- |
| A · Full Crop Protection | The configured harvest safety window extends beyond the three-day deadline. | Blocked by the safety-window rule. |
| B · Selective Release + Containment | Eligible lots total 780 kg before execution. Crew capacity is 900 kg. The baseline QA receipt confirms 780 kg. | Eligible and recommended. After approval and harvest confirmation, reserve exactly 750 kg for this order. |
| C · Harvest-First Containment | Forecast eligible Grade A volume is 720 kg after modeled downgrades. | Blocked by a 30 kg grade-eligible volume shortfall. |

For each strategy, resolve eligible batches and the available crew through the selected snapshot. Cap feasible order volume by eligible Grade A stock and available harvest capacity. Apply data-quality, compliance, and delivery gates before scoring. At execution, calculate the available volume again from QA and completed harvest receipts. With a 700 kg QA receipt, record a 50 kg shortage and leave inventory reservation and order readiness blocked.

Use the shared proposal's five-view, 90-second route in the Decision Room portion of the pitch. Allow 15 seconds for the Enterprise Dashboard, 15 for the Business Impact Map, 30 for the Decision Room, 15 for Approval & Execution, and 15 for Outcome & Audit. Link the same views with a guided route and keep them directly accessible in the workspace. Include the deadline, staffing, and QA exceptions in the interactive walkthrough and Q&A. Provide a labeled replay from the same verified fixture for presentation fallback.

Start with one farm, two plots, three crop batches, two crew groups, two synthetic observations, and the primary 750 kg order. Add a second order to the relationship-change test fixture. Keep cross-site sourcing and broader economic comparisons as follow-up scope after the core workflow is verified. Show modeled costs and margin impact with assumptions and units. Avoid requiring a live model call for the presentation, and preserve existing specialist integration points for later work.

## 6. Delivery order and token budget

| Pass | Output | Exit check |
| --- | --- | --- |
| **1. Scope and design** | Baseline build and route audit, V3.5 copy, shared fixture contract with expected results, three reference screens, concise `DESIGN.md` | The same order, rules, and evidence appear across the reference screens. Baseline and exception outcomes are agreed at fixture level. |
| **2. Site and workflow** | Shared public and workspace shells, working route mapping, one complete approval-to-evidence workflow, and the technical product page | The homepage and every primary navigation item lead to useful content or a working action. Both baseline and blocked outcomes run. |
| **3. Release check** | English copy pass, state and layout checks, export and replay tests, runbook and release notes | The whole site follows the same positioning and visual rules. The 90-second walkthrough runs reliably. |

Keep the rebuild brief, this plan, and `DESIGN.md` as the sources for implementation. For each pass, load the relevant sections, files, and acceptance checks. Carry forward a short list of decisions and outstanding issues. Reuse the same fixture and state model across pages. Limit design generation to three reference screens and use shared components to propagate changes. Run targeted checks during development, followed by one full build and browser regression pass before release.

## 7. Release acceptance

- A new visitor can explain what Sentinel does and open the workspace from the homepage. The product story remains consistent across decision, execution, evidence, and technical pages.
- Advance the simulation clock with no browser open. One 05:40 observation must produce one evaluation and one queue item with a trigger, source records, specialist assessments, and strategy results. Reopen the browser and verify the updated state. Restart the service during an approved simulated run and verify recovery without duplicate dispatch or reservation.
- Leave the workspace open without clicking. Observe source updates, linked context changes, specialist findings, and a recommendation appearing in sequence. Navigate between the overview, Decision Room, and Execution and confirm that each view traces back to the same events. While approval is pending, ingest a staffing or deadline change and verify that monitoring continues, only the affected case is re-evaluated, and the previous approval is cleared if present. During a quiet period the heartbeat advances while the feed waits for the next recorded event.
- Open the decision directly from the workspace and trace at least two competing specialist findings to the relevant strategies and evidence. Verify that a hard gate blocks an otherwise attractive option and that the UI distinguishes recommendation, approval, and execution. Verify that no feasible plan produces an escalation.
- In a test fixture, reassign an affected batch to a different order. The affected order shown in the overview, the Farm Context path, and the decision scope must follow the updated relationship. Mark a required observation stale and verify that dependent execution is blocked. Verify that the 700 kg simulated receipt stops reservation and that its 50 kg shortfall is traceable through the Execution Fingerprint.
- English is consistent across all reachable first-release pages and visible states. Navigation works on mobile, by keyboard, and through direct URLs.
- The normal path and the blocked path are reproducible. Changed inputs invalidate stale approvals. Refresh, replay, and reset work as documented. Simulated device actions stay inside the simulation service.
- Build and targeted tests pass. Browser checks cover the primary routes, approval controls, fault behavior, exports, and desktop and mobile layouts.
- Deliver the runnable site, `DESIGN.md`, updated startup instructions, and a short English runbook with the 90-second route and a fallback replay.

## 8. Repository handoff

Keep React, Vite, Router, and the existing workspace structure. The current source already has telemetry, risk, prescription, execution, audit, history, a prescription approval queue, a parameter-comparison fingerprint, and a browser-based autonomous loop. Reuse those components and applicable rules. Put scheduling, order-level assessment, execution state, and replay behind the shared simulation service so page visits read existing state. Replace scripted approval bypasses, static success logs, and randomized audit values in the V3.5 path with state transitions and fixture-backed receipts. Preserve existing workspace changes and deep links while integrating the new path.

## 9. Implementation specification

Sections 9.1–9.5 define the route, data, runtime, migration, and release contracts for implementation. Use the preceding sections for product narrative, design direction, and presentation timing.

### 9.1 Route and page structure

| Canonical route | Page structure, in reading order | Main action or link |
| --- | --- | --- |
| `/` | Operating-manager headline → compact simulated activity preview → five business consequences → LOOK / THINK / ACT / PROVE → pilot and company summary | Open workspace or see how it works |
| `/how-it-works` | Product layers → sample source-to-Ontology mappings → six perspectives and 14 specialist roles → strategy and approval gates → adapter and evidence example | Explore the same order in the workspace |
| `/workspace` | Farm Watch status → current operating change → orders and decisions needing attention → active work → shared activity rail | Open the affected case |
| `/workspace/cases/:caseId/context` | Order and alert summary → clickable event, plot, batch, harvest, and order path → evidence drawer → telemetry and data-quality details | Review the decision |
| `/workspace/cases/:caseId/decision` | Trigger and target → strategy comparison → recommendation and specialist disagreements → source evidence and what-if controls → approval panel | Approve the current eligible plan or inspect the escalation |
| `/workspace/cases/:caseId/execution` | Approval and run state → dependent work orders → task owner, planned quantities, receipts and blockers → escalation details | Inspect the active task or review evidence |
| `/workspace/cases/:caseId/evidence` | Simulated order result → planned versus actual → fingerprint and event timeline → assumptions, replay and export | Replay or export the selected run |
| `/workspace/history` | Prior runs → scenario, snapshot, and outcome filters → run links | Open a specific historical run |
| `/workspace/settings` | Clock and replay controls → scenario presets → fault injection → reset confirmation | Start or reset a simulation run |

Public pages share one header, brand system, and footer. Workspace pages share navigation, a simulation label, clock and service status, case and run selectors, and the activity rail. Keep the case ID in case URLs and resolve a pinned historical run through a run query parameter. Legacy bookmarks resolve through the same components: `/sensors` and `/risk` to Context panels, `/prescription` to Decision, `/execution` to Execution, `/audit` to Evidence, `/history` to History, and `/scenarios` and `/admin` to their corresponding Settings panels. Case-less links resolve to the current case. Preserve access to meaningful existing panels from these destinations.

Specify desktop and mobile page layouts, reusable status language, component variants, and loading, empty, stale, offline, pending approval, blocked, running, completed, and replay states before implementation. Use the three Stitch reference screens to settle visual hierarchy and interaction patterns. Apply the same typography, spacing, colors, tables, badges, charts, and evidence drawer to every route. The workspace remains navigable during an outage and shows the last confirmed state and timestamp.

### 9.2 Synthetic data generation and credibility

Deliver a checked-in scenario manifest, deterministic generator, generated baseline and exception fixtures, and a short data dictionary. The dictionary records source category, units, timezone, seed, generation rule, and expected outputs. Record the V3.5 scenario inputs separately from synthetic assumptions and calculated fields. Label the farm, telemetry, specialist assessments, finance, integrations, and receipts as simulated. Leave monetary values unavailable when their assumptions are absent.

Use one 20 mu Yunnan demo farm, two 10 mu plots, a three-day delivery window, and two crew groups of 13 and 12. Store timestamps as UTC with the farm display zone `Asia/Shanghai`. Use stable IDs and explicit entity relationships. The source timeline includes an earlier routine check, the 05:40 pest observation, and later check-ins so the activity rail shows both quiet and eventful periods. Attribute the alert to a synthetic scouting or trap record. Simulated weather and telemetry supply context with coherent day/night patterns, units, and timestamps. Configure alert thresholds and harvest-window rules as scenario assumptions. Keep the values scoped to the prototype and have the agronomy team review them before external presentation.

| Record | Baseline fixture | Purpose |
| --- | --- | --- |
| `LOT-01` | Plot A, 420 kg harvest-ready, 420 kg Grade A eligible under B | QA verifies the first releasable lot |
| `LOT-02` | Plot B, 360 kg harvest-ready, 360 kg Grade A eligible under B | QA verifies the second releasable lot |
| `LOT-03` | Plot B, 120 kg harvest-ready, 0 kg eligible under B after the 05:40 alert | Retain and isolate the affected lot |
| `ORD-750` | 750 kg Grade A, due in three days | Drives feasibility and caps reservation |
| `CREW-01 / CREW-02` | 13 and 12 pickers, each at 12 kg per picker per day | Three-day capacities of 468 and 432 kg |
| B baseline receipts | QA: 420 + 360 = 780 kg. Harvest acceptance: 400 + 360 = 760 kg. Log 20 kg from LOT-01 held back at packing. | Reserve 750 kg and record the 10 kg unreserved accepted balance |
| C forecast | 400 + 320 = 720 kg Grade A after simulated downgrades, with LOT-03 excluded | Show a 30 kg forecast shortfall |
| B QA exception | QA: 390 + 310 = 700 kg Grade A | Record a 50 kg shortfall and block reservation and readiness |

The 900 kg harvest-ready inventory and the 900 kg labor capacity are separate values. Feasible volume is bounded by eligible lots, crew capacity, and usable harvest windows. A configured simulated safety-window conflict blocks A. B remains conditional on QA and approved harvest. C falls short on grade. Test deadline one day, staffing 15, stale or missing input, batch reassignment to a second order, duplicate source events, and service restart. Generate each exception as a small change to the same baseline.

Use a baseline acceptance ledger with 760 kg accepted, 20 kg held at packing and 120 kg isolated. Those dispositions account for the 900 kg harvest-ready baseline. The 760 kg accepted divides into 750 kg reserved and 10 kg available. Verify the values in the fixture test, Decision Room, Execution, and Evidence. For the 700 kg QA path, the 80 kg difference from the baseline QA forecast stays unqualified pending review and reserved inventory stays at zero.

Use fixed fixture values for facts that determine outcomes. Seed only optional variation in supporting telemetry. Verify mass conservation, grade eligibility, chronological receipts, no duplicate inventory reservations, and repeatability by scenario version and seed. Use an explicit rule for any modeled margin. Revenue, incremental cost, and contribution must remain separately traceable. Keep the prior RMB 2,850 figure out of the default demo pending reconciliation.

### 9.3 Data flow, service boundaries, and workflow

**Source → context → decision → execution → evidence.** The simulation clock or incoming fixture event supplies raw observations and updates. Validate schema, source identity, units, timestamp and freshness. Normalize into Farm Ontology entities, find affected cases through relationship queries, and create a versioned case snapshot. Compute only affected assessments. Resolve specialist findings into six views and three comparable strategies. The decision engine checks hard gates first, ranks feasible strategies using versioned assumptions, and records the reason, alternatives, and evidence. The manager approves the exact recommended or selected feasible strategy version. The worker advances approved tasks, records receipts, then calculates outcome and publishes evidence. New input can start another evaluation while an unrelated run continues.

| Record or interface | Contract |
| --- | --- |
| Source event | Event ID, source type and source record ID, observed and received times, entity references, payload, units and provenance |
| Case snapshot | Case and snapshot IDs, farm/plot/lot/order/resource relationships, source event IDs, scenario and rule versions |
| Specialist assessment and strategy | Role, perspective, finding, linked evidence, candidate strategy, gate or trade-off. Strategy carries expected eligible kg, deadline, labor, cost and contribution assumptions, gate results, and recommendation rationale |
| Approval and work order | Actor, approval time, exact snapshot and strategy IDs, approved scope. Task carries dependencies, owner, planned quantity, idempotency key, status, and linked receipts |
| Receipt and fingerprint | Task and event IDs, observed quantity and time, source adapter, deviations, input/approval references and outcome. Derive the fingerprint from the canonical persisted records |
| Workspace read model | One initial case snapshot plus ordered changes since the last event sequence. Reconnect from that sequence. Use the same read model for the activity rail, case pages and replay |

Use a lightweight Node simulation service with a durable local store for the demo. Serve the built React app with the service, or connect Vite to it during development. A hosted demo that advertises ongoing monitoring needs a running worker and durable storage. Start the accelerated baseline clock by default for the presentation environment. Keep pause, reset, and fault injection in settings. Persist scheduler progress and task transitions so the worker can continue after browser closure and recover after restart. Prefer one small polling endpoint with an event cursor for the first release. Use explicit service commands for what-if, approve, reset, and fault injection. Give mutations expected-version checks and event or task idempotency keys. Store real timestamps for service health and simulated timestamps for scenario actions.

**Case progression.** Watching → Evaluating → Recommendation pending approval or Escalated → Approved → Running → Verified or Blocked. A new material input supersedes the old decision and any unused approval. If work is running, hold unstarted dependent tasks while their authorization is rechecked. Keep earlier receipts and events. Duplicate or stale approvals leave state unchanged. Concurrent or retried commands cannot reserve the same inventory twice.

**Task progression.** Batch isolation and QA review → harvest allocation → dispatch to the two crew groups → accepted harvest receipts → reserve up to 750 kg → simulated ERP acknowledgement → evidence verification. If QA reports 700 kg, record the 50 kg shortage and block dependent reservation and order readiness. Keep planned, QA-eligible, harvested, reserved, and ready quantities separate in the UI. Use English labels throughout and retain the simulated environment marker in exports and replay.

### 9.4 Reuse and cutover

| Existing code | Planned treatment |
| --- | --- |
| `App.jsx`, `Layout.jsx`, shared cards, status badges and charts | Keep the framework and useful components. Create the canonical route tree, unify the public and workspace shells, and update English labels and page layout once. |
| Dashboard, telemetry, risk, prescription, execution, audit and history pages | Reuse charts, tables and detail panels as views of the shared case model. Migrate page by page behind the new routes. |
| `SystemActivityRail.jsx`, `AIAgentPanel.jsx`, `ApprovalModal.jsx`, `ExecutionFingerprint.jsx` | Preserve useful interaction patterns. Connect them to persisted events, structured findings, versioned approval and recorded receipts. |
| `src/data/decisionEngine.js`, `src/engine/decisionEngine.js`, crop and constraints data | Trace current imports and reuse applicable agronomy functions through one strategy evaluation path. Consolidate overlapping logic after identifying callers and baseline behavior. |
| `store.js`, `simulationEngine.js`, `scenarioEngine.js`, `AutomationController.jsx` | Retain relevant UI state and tested logic. Replace active scenario timers, random data and scripted decisions in the V3.5 path with the service clock, deterministic fixtures and state transitions. |
| `executionEngine.js`, `auditEngine.js`, existing demo and recording scripts | Reuse suitable task and audit presentation. Drive the new scenario with approved tasks and persisted receipts. Point active presentation entry points at the new routes after end-to-end verification. |

Record baseline routes, callers, dirty files, and build status first. Preserve user edits. Build one vertical slice behind the new workspace routes, then switch legacy bookmarks and the home entry point together. In the final build, every user-facing route resolves to the same runtime, scenario version, English copy, data source, and design system. Verify that legacy timers, scenario writers, scripted approval bypasses, and random audit values are unreachable from production entry points before retiring their unused callers.

### 9.5 Implementation order, budget, and completion

| Gate | Deliverable and exit check |
| --- | --- |
| 1 · Design and contract | Freeze routes, page structures, shared states, event and approval contracts, a compact data dictionary, and expected outcomes. Review the three design references at desktop and mobile sizes. |
| 2 · Data and vertical slice | Generate fixtures and run the service from scheduled alert through A/B/C, approved tasks, inventory, and fingerprint. Run at least the short-deadline and QA-shortfall paths before expanding the UI. |
| 3 · Site integration and cutover | Wire every canonical view and legacy bookmark to the common runtime. Verify a continuous information stream, English copy, and consistent states across desktop and mobile. |
| 4 · Release rehearsal | Run the full 90-second route, exception walkthrough, same-fixture replay, refresh and recovery, keyboard navigation, and clean build. Verify the runnable app, fixture generator and data dictionary, design reference, startup instructions, and presenter runbook. |

Use this plan as the primary implementation brief and open source material only when a decision needs it. Keep one fixture generator, one service, one set of shared UI components, and one scripted rehearsal. Load the active gate and targeted source files in each coding pass. Use narrow tests as work progresses, then run the integrated checks once after cutover. Update the plan or decision log when a contract changes so later passes inherit a single current specification.

