# Sentinel Demo 6.1.0 · Workspace and Farm Ontology

## 1. Release and source baseline

**Target application release:** Sentinel Demo 6.1.0. The presentation uses its own V3.6 version. Use 6.1.0 in the app footer, runbook, and new run metadata. Preserve the original version on archived runs.

This revision governs the workspace, runtime, data and decision contracts, AI behavior and release acceptance. Retain the [unified workspace plan](https://chatgpt.com/library?file_id=libfile_d0f3b628b4d88191b1c577986347d030&account_id=personal) for the detailed 14-role roster, market coverage, session behavior, and migration tests. Use the [V3.6 Market-Aware Extension](https://chatgpt.com/library?file_id=libfile_a4a24606ef708191a60de818be58cee2&account_id=personal) for the product narrative and market intelligence logic. The accessible Shenzhen final deck outline is V3.5. A standalone V3.6 presentation and its speaker notes were not located. Confirm exact slide copy and slide-to-screen mapping when the deck is available.

The product promise is **Your Farm’s 24/7 AI Operating Manager**. Sentinel coordinates crop production, customer commitments, people, equipment and costs, then records the business outcome. Use **LOOK → THINK → ACT → PROVE** to group the existing operational pages. Explain the underlying five steps in **How It Works**, using one field event instead of a second navigation system.

**Implementation status.** This is the design and release specification. The original workspace now hosts the 6.1 blueberry order workflow and a persisted, seeded Operations stream. Legacy routes and six original scenario runners remain available. See the [project brief](PROJECT_BRIEF_CN.md) for delivered, unverified and outstanding work.

**Build priority.** Preserve the original operating workspace, connect one field from evidence through audit, then expand the shared flow to external intelligence, Ask Sentinel and the scenario catalog. Section 6 owns delivery order and release gates. Sections 8 and 9 define preserved UI and page behavior. Sections 10 and 11 define AI behavior and evidence authority.

### 24/7 Operations is the main demonstration

Opening Sentinel lands in an already running Operations session. The service monitors configured feeds and due work on its own schedule. Operators can see what was checked, what changed, which assessments are in progress, what needs approval, and what was verified. Opening the Dashboard, selecting a case or asking the assistant is independent of starting or advancing the scheduler. An event enters the decision workflow when its relevance and severity warrant review. Quiet periods show the last successful check, the next expected check and source freshness.

In 6.1, extend the existing Node service to own recurring Operations checks and persist checkpoints. The current server timer advances the separate enterprise case. It continues when the browser closes while the service is running. After a service restart, it resumes from its persisted state, checks overdue feeds and deduplicates events and task receipts. Show actual service health separately from the timestamp of each source. A feed outage leaves the last confirmed observation visible with its age. A provider or Gemini outage leaves rule evaluation, approval gates and recorded work available. Approvals are scoped to affected work. Monitoring and unrelated work continue while an item awaits review.

**Scenarios are optional replays and controlled exercises.** A scenario supplies pinned inputs and an isolated clock to the same workflow and pages. It can accelerate a known chain, inject an exception, or let the audience compare alternatives. Starting, pausing, stepping, resetting or closing a scenario only affects that scenario session. Operations continues to ingest and assess its own events in the background. On exit, restore the operator’s field and view and show the latest Operations state, including changes that arrived during the scenario.

### Decisions from the three shared references

| Reference | Apply in 6.1 | Placement and scope |
| --- | --- | --- |
| [Sentinel’s essence and operating logic](https://chatgpt.com/s/t_6af71abf0284819189b0c6c3aa540000) | Lead with enterprise coordination and verifiable outcomes. Connect the five steps to Farm Ontology, the Decision Engine, and Governed Execution & Evidence. | Product presents one operating promise and one example. How It Works explains the architecture and the path from blueberries to premium crops and multi-site operations as a roadmap. |
| [Market intelligence and multi-Agent proposal](https://chatgpt.com/s/t_6af708d09130819186dfc46ef9e0513d) | Keep the six-section Market Intelligence view and the distinction between information, analytical signals and eligible decision inputs. Surface urgent risks and opportunities through the existing queue. | The Dashboard shows a compact Market Pulse. Put source coverage, comparison charts and exploratory filters in Market Intelligence. Reuse the 14 roles for collection, analysis and review. |
| [Market-Aware Demo integration](https://chatgpt.com/s/t_6af71a44bb488191b55900c6464a51fe) | Keep the 750 kg baseline, six perspectives, A/B/C comparison, approval and evidence flow. Carry the same market snapshot and eligibility status across the five timed screens. | Keep the 650 kg pressure case as a separate selectable Q&A scenario. Add sources incrementally after the core scenario is replayable. Put automated channel optimization and live ERP or quote ingestion on the roadmap. |

| Product step | What the user can verify |
| --- | --- |
| **Observe · LOOK** | Identify the field or market change and check its source, timestamp and scope. |
| **Connect · LOOK / THINK** | Open the affected plot, batch, crew, customer order and relevant rules in Related records. |
| **Weigh & Decide · THINK** | Compare grade, delivery, labor, compliance and contribution. Inspect specialist disagreements and see which rule excludes a strategy. |
| **Orchestrate · ACT** | Approve a versioned plan and follow the assigned work, dependencies and receipts through existing systems. |
| **Verify & Learn · PROVE** | Compare plan with receipts and record deviations and lessons for review. Update rules or models through the existing review process. |

## 2. Navigation and shared layout

Keep the original dark v4.2 shell, icons, chart language, and canonical routes. Group the sidebar by how operators work. Keep the original seven-stage strip for the active workflow. Highlight the actual workflow state and the selected page separately. Market Intelligence, Scenarios and Admin remain accessible from the same shell.

| Group | Pages |
| --- | --- |
| LOOK | Dashboard, Field Monitoring (Sensor Telemetry), Market Intelligence, Farm Business |
| THINK | Risk Assessment, Prescription |
| ACT | Execution |
| PROVE | Audit Report, History |
| Tools | Scenarios, Admin |

Use one context bar for mode, field, crop, optional case, relevant clock and last update. **Operations** opens by default, including when there is no selected order or scenario. **Scenarios** opens an optional replay or exercise in the same routes and components. Keep the Operations health indicator available during a scenario. The original dashboard remains the application home. Keep Product and How It Works as secondary routes.

### In-place scenario activation

Follow the original mode-switch interaction. Starting a scenario from Scenarios or the context selector keeps the currently open page and the original workspace mounted. Update its selected field, run, time range and data in place. Navigation continues through the same canonical URLs and components, with the active scenario retained across pages. Keep the sidebar, topbar, stage strip, panel order, chart types and Ask Sentinel position stable. Scenario controls use the existing topbar or Scenarios page. Replace the current separate Order Demo shell and map its deep links to canonical workspace pages with an explicit case or archived-run reference.

Every view reads the selected session through the same data contract. Dashboard updates its KPIs, alerts and tasks. Field Monitoring updates readings, chart series and captured evidence. Market Intelligence updates the applicable source records. Farm Business updates order commitments, costs and resource reservations. Risk and Prescription update evidence, scores, alternatives and approvals. Execution, Audit and History show the matching tasks, receipts and records. Use the same components and empty states when a scenario has no applicable records for a page. If a selected field, record or time range is unavailable in the new session, select a valid value for that session while keeping the current page. Ask Sentinel follows the active session and uses its own conversation thread. Exiting restores the prior Operations context on the current page and displays its latest state.

All workspace pages share a single content grid, maximum width, gutters and vertical scroll region. At desktop widths the right-side slot switches between **Activity**, **Evidence** and **Ask Sentinel**. The assistant keeps a fixed launcher and retains the active conversation on navigation. On smaller screens the same panels open as drawers, with independent transcript scrolling and a visible composer. Use original chart components and status colors. Use real Yunnan photographs in editorial positions when cleared for the intended use.

## 3. Page layout and hierarchy

Dashboard is the common overview. Field Monitoring, Market Intelligence and Farm Business own the detailed views. Use summaries and linked records to connect the three. Keep a consistent Farm, Field, Crop and Time context where applicable. A regional forecast, an on-farm weather station and an order deadline carry their own location and clock. Context filters must preserve those distinctions.

| Page | Layout from top to bottom | Original content to retain and action |
| --- | --- | --- |
| **Dashboard** | Operating status and last/next check → attention queue → **Field, Market & Weather, Business** summary cards → original monitoring and analytical panels → Agent tasks and live stream | Keep the AI Watchdog, proactive alerts, sensor sparklines and multimodal feed, financial KPIs and revenue-at-risk insight, biological threats, 30-day risk profile and scan history. Give each summary a link to the relevant tab and record. Use the attention queue for exceptions requiring a decision. |
| **Field Monitoring / Sensor Telemetry** | Field and time controls → devices online, data gaps and exceptions → **Telemetry**, **Images & Video**, **Pest Traps & Scouting** tabs | Keep `/sensors`, the original grouped charts, device detail, thresholds, camera preview and synchronized time ranges. Link a specific sample or image to its plot, device or trap, and any observation or alert. |
| **Market Intelligence** | Crop, region and time controls → relevance-ranked changes → **Overview**, **Prices & Demand**, **Weather & Crop Health**, **Supply & Logistics**, **News & Calendar** tabs | Extend `/intelligence` in the original dark shell. Show comparable price history and forecast, farm-relevant weather, supply regions and harvest windows, freight and trade context, and filterable disease, climate, policy and holiday events. Open the related Agent assessment and evidence when a signal is reviewed. |
| **Farm Business** | Farm and time controls → commitments at risk, eligible supply, labor and cold-room capacity, modeled cost and contribution → **Orders & Lots**, **Resources**, **Costs & Contribution** tabs | Add a single read-oriented `/business` page for existing operational records. Drill down to an order, lot, shift, cold-room slot or cost item. Open an existing decision in Prescription or task in Execution. |
| **Risk Assessment** | Priority risks and exposure → multimodal evidence board and original gauges → affected plots, lots and orders → score comparison, trend and thresholds | Keep original gauges, risk comparison chart, trend and evidence board. Show which external or farm evidence triggered the assessment and how it affects operations. |
| **Prescription** | Current decision queue or selected case → order, lot, capacity and quality context → six specialist perspectives → strategy comparison → constraints, selected plan and authorization | Keep the original analysis stages and expandable factors, constraint checks and structured prescription view. Add dynamic selection, what-if and authorization. Preserve the selected plan and its underlying policy and evidence. |
| **Execution** | Approved scope and status → multi-actor Gantt and task cards → planned vs actual → receipts, exceptions and next checks | Keep the Gantt, actor detail, execution timeline, asset monitor, environment and deviation panels. Show case-relevant quantities and task dependencies using the approved scope. |
| **Audit Report** | Outcome vs approved target → deviations and owner → linked evidence, policy, approval and receipts → export | Keep the original evidence chain and responsibility details. Trace who approved or performed each scoped action and what verification supports the outcome. |
| **History** | Run and outcome filters → KPI summary and replay cards → trends and decision log → archived record | Keep the risk journey, accuracy, chemical-use, revenue-protected and response-time charts, decision quality and compliance details where the archive supports them. |
| **Scenarios** | Original scenario cards → selected case and starting conditions → run controls and archive links | Start, pause, step, reset or exit in the same workspace. The main menu and page structure stay mounted. |
| **Admin** | Source health and freshness → configured policies, thresholds and rule versions → operating controls | Verify feed availability, coverage, configured sources and which changes require review. |
| **Product / How It Works** | 24/7 operating manager → monitoring and workflow → one example with business consequences → interactive Ontology example | Open Operations or the linked case. Keep these pages in secondary navigation. |

### Information shown in the three detailed views

**Field Monitoring.** Keep the device grid and charts, including temperature, humidity, soil moisture, leaf wetness and pest counts. Add filters by field, plot, device type and status. Images & Video shows available camera feeds, dated captures or clips, drone and satellite records, and scouting photographs. Render each capture as a single source record with time and location. A sequence of still images can be stepped through as captures. A connected stream can show a live indicator based on its own health. Pest Traps & Scouting shows trap ID, plot, inspection time, catch per trap or period, count trend, threshold, annotation, and linked image or review. When a visual is illustrative, use it in an editorial position. Operational evidence requires a corresponding observation record.

**Market Intelligence.** The current implementation has a short Kunming regional outlook, article links and one case price comparison. Build out the tabs with tables, time-series charts and filters in the original UI. Each price series carries crop, grade, region, currency, unit, date and price basis. Show forecast bands where the underlying method supports them. Put holidays, regional climate events, pest reports and logistics disruptions on the timeline with their source and date. An Agent records whether each material signal is background, needs review or is eligible for the decision. The article and source browser stays available for full detail. A marked event represents an observation or an assessed influence; a decision effect must link to its applicable evidence and rule. The farm's measured weather stays in Field Monitoring.

**Farm Business.** Orders & Lots shows required grade, volume, due date, contract price, allocated/QA-cleared/accepted/reserved volume, shortfall and links to the lot and decision. Resources shows crew shifts, equipment, packing and cold-room slots, current reservations and available capacity by time window. Costs & Contribution shows contract revenue if fulfilled, scoped operating costs, modeled contribution and verified settlement when documented. Use the same order, allocation and capacity records as Prescription, Execution and Audit. Keep the operating review within a single page and the existing authorized action paths.

### Cross-page interaction and preservation

- The three Dashboard cards show a small set of actionable summaries and the top change. Opening a summary keeps the selected field or crop, applicable time range and record link. The original detailed charts, task cards and panels stay available below the first screen or in their existing detail views.
- One example walkthrough starts from a rise in catch count. Open the trap image and series in Field Monitoring, inspect the Agronomist finding and related lot in Risk, then open the affected order and capacity in Farm Business. Compare and authorize a strategy in Prescription and verify its actual receipts in Execution and Audit. The same event is visible in the activity stream. A regional pest report can attach additional context through Market Intelligence.
- Keep common widths, panel spacing, vertical scrolling and responsive chart layouts. Preserve the fixed Ask Sentinel launcher and use the same Activity and Related records panels. On small screens stack the summary cards and move wide comparison tables into their own scroll container. Keep the rest of the page vertically scrollable.
- Acceptance checks cover the full walkthrough, deep links and return paths, and the preservation of each original component listed above. Check normal Operations and one pinned scenario using the same page structures. During each run verify the dashboard quantity, detailed record, candidate calculation and receipt agree at the same cutoff. Confirm that a stale source, absent stream or missing quote shows the actual availability and preserves the last timestamped record where one exists.


### Strategy selection in Prescription

Use the supplied decision matrix as the primary layout reference for the selected decision on the existing `/prescription` route. Keep the original dark workspace, seven-stage navigation, live stream and fixed Ask Sentinel launcher. Dashboard or Risk opens the matching decision in Prescription. The same components show an Operations decision or an optional scenario. When no decision is selected, show the current decision queue and its empty state. Show only the candidate plans the engine actually produced. A/B/C are the blueberry case choices.

| Region | What the screen shows |
| --- | --- |
| **Operating context** | Pest risk, eligible Grade A estimate, customer order and deadline, crew/cold-room capacity, and treatment or pre-harvest interval (PHI). Use values from the active snapshot and open their sources in Related records. |
| **Specialist assessments** | The six existing perspectives, with review status and the responsible Agent. Open the relevant findings, evidence, disagreements and unresolved checks. Derive active-role counts from current assignments. |
| **Strategy matrix** | One column per plan. Compare action, forecast deliverable volume, cost and modeled contribution, risk and obligations, execution requirements, conditions for success and status. Highlight the current recommendation when eligible. Show exact rule failures and distinguish Conditional, Blocked and Ready for approval. Hide contribution where a hard block makes the result misleading. Keep the table scrollable within its own region on narrow screens. |
| **Approval and actions** | Show quality, compliance and capacity as separate gates with their actual states. Keep forecasts and planned capacity distinct from verified QA and reserved capacity. **Run what-if** creates a comparison snapshot. **Authorize dispatch** enables only for the eligible selected plan and current snapshot when required checks pass and the operator has permission. **Export decision record** links to the recorded snapshot and Audit. |

Recommendations and operator selections do not dispatch work. Approval records the actor, plan, rule version and evidence snapshot. Execution reads that approved record and displays dependencies and receipts. Audit uses the same IDs to reconstruct the decision and outcome. A material input change invalidates stale authorization and exposes the next action. The screenshot supplies layout and emphasis. Its sample numbers, scores, version labels and security claims are excluded from runtime copy. An export describes the records it contains and uses integrity wording only where the implementation verifies it.

#### Interactive behavior and results

Use the original workflow service and ordered event feed. New eligible evidence creates a decision revision. Show what changed, when it arrived, which findings or gates it affected, and whether the operator must review again. Refresh the matrix, related records and Agent activity from the same revision. Informational updates can appear in the activity stream without changing the selected decision. Display **Recommended**, **Selected** and **Approved** as distinct states. Operators can inspect any candidate and select any eligible candidate, including one other than the recommended plan. Require a reason when choosing an eligible alternative to the recommendation.

| Control | Observable result |
| --- | --- |
| **Open evidence** | Open the shared Related records panel at the selected KPI, Agent finding or failed rule. Show the linked source, input, timestamp and version. |
| **Select plan** | Highlight the operator’s choice, show its obligations, gates and next action, and retain the system recommendation as a separate indicator. A blocked option stays inspectable and shows what prevents authorization. |
| **Run what-if** | Recalculate the plans with the changed inputs and show differences against the current decision. Keep the comparison isolated. Applying valid changes to the current decision requires a separate action and creates a new revision. |
| **Authorize dispatch** | Recheck permissions, required gates and the current plan revision on the server. On success, display an approval ID and the resulting queued work order with a link to Execution. A stale request returns the updated decision and asks the operator to review it. Disable repeat submission while pending and deduplicate retries. |
| **Export decision record** | Download the selected revision as structured JSON with source IDs, checked rules, candidate results and any linked approval, work order and receipts. |

Prioritize the comparison, blocking reasons and next action. Collapse detailed Agent notes, source history and financial assumptions into the existing panels. Use the reference matrix where there is enough width and stacked plan cards at narrow widths, preserving the same selection and actions. Show pending, successful and failed action states in place. If a feed or model is unavailable, keep the latest timestamped evidence and the rule-based decision available.

## 4. Make Farm Ontology visible and operational

Provide a shared **Related records** panel. Open it from a sensor point, market signal, order, task or receipt. Start with the relevant branch. Allow users to expand neighbors, inspect the underlying record, and open the corresponding operational page. Provide a compact path and an accessible table view. Use the same relationship query for UI navigation and for selecting evidence used in calculation.

| Example relation | What the system and user can do with it |
| --- | --- |
| Pest observation → South block → LOT-03 | Resolve the affected plot and lot from the actual source event. Identify the relevant crop protection or release rule. |
| Lot → harvest assignment → crew → order | Compute qualified volume and available capacity for the active order. A batch reassignment changes the relationship view and affected decisions. |
| Regional weather, pest notice or market record → relevance assessment → plot or order | Check scope, date and evidence before showing the link. Advisory signals can create a review item. Only eligible inputs enter decision rules. |
| Decision snapshot → rule checks and Agent findings → approved strategy → work order → receipt → audit | Trace every approval and result back to the exact data, rule versions and scope that were evaluated. |

Carry stable entity and relationship IDs, timestamps, source references and snapshot versions. Mark a relationship as observed, inferred or manually assigned where that distinction matters. Show an inferred relationship as an assessment until verified. Each Agent card displays trigger, role, inputs, checks, outcome and handoff from the existing unified plan. The assistant opens with the current record or route context and can reference the same evidence.

Extend Related records with price observation, buyer quote, contract, channel and cost records. Match crop, grade, geography, date, currency, unit and price basis before comparison. Record the relevance finding and whether the signal is for display, review or decision. A missing or expired quote stays outside the decision calculation. Pin the source, eligibility result and calculation version used at approval. Execution and Audit read that snapshot even after the market feed updates.

## 5. Market intelligence in the Operations walkthrough

| Screen | Show by default | Available on demand |
| --- | --- | --- |
| Dashboard | Field alert, affected order and one relevant Market Pulse item | Full market view, source health and other signals |
| Farm Business | Commitments, eligible supply, resource availability and scoped economics | Linked order, lot, shift, cost and decision records |
| Risk / Related records | A recent operating alert linked to its affected records | Comparable market records and the Agent’s applicability assessment |
| Prescription | The active recommendation or escalation, alternatives and hard gates | Contract basis, cost assumptions and Sales / Finance findings |
| Execution | Approved scope and task status | The pinned market and order snapshots used for approval |
| Audit | Quantity reconciliation and verified outcome | Calculated exposure, costs, available settlement evidence and source lineage |

For the optional blueberry scenario, pin a case contract price of RMB 65/kg. At 750 kg, gross contractual value if fulfilled is RMB 48,750. A case regional reference of RMB 54/kg against RMB 60/kg yields a 10% decline and an advisory Market Watch item. Keep the baseline plan, contract price and approval state intact. Show actual settlement or realized margin only when supporting records exist. Use one separately verified, material change such as an eligible buyer quote or a new QA receipt to demonstrate re-evaluation. The separate 650 kg case yields a 100 kg projected shortfall and RMB 6,500 potential gross contractual exposure before mitigation. Keep its run, inputs and receipts isolated from the baseline.

Prepare the Operations walkthrough using the current queue and a recent completed run from that same Operations session. Use the completed run to show approval and verification within the time limit. Use a pinned scenario when the audience requests a repeatable example. Accept provider updates in Operations through the existing cached source service. Start with verified regional weather and source-linked notices or news. Add trade and international reports as context where comparable. Activate China blueberry price feeds, firm quotes and ERP records as decision inputs only after validating data access, units, grade, region and price basis. Show provenance in source details and distinguish observed values, case values and forecasts wherever the distinction affects interpretation.

### 5.1 Market and agricultural source rollout

| Series or event | First release source and treatment |
| --- | --- |
| Weather | Reuse Open-Meteo. Read forecasts by approved location; pin an archived forecast for replay. Regional forecasts and farm-station measurements are separate records. |
| News, crop conditions and pest notices | Reuse GDELT to discover news and curate relevant Yunnan Agriculture and Rural Affairs notices. Store title, source URL, publication time, crop and covered region. A regional notice can prompt scouting; local counts and imagery substantiate a plot assessment. |
| Holidays, promotions and harvest windows | Pin the official State Council holiday and make-up working-day calendar. Add promotions, collection schedules and crop windows when verified or as case assumptions. Plot events on a common time axis. An event influences an estimate only through measured history or an explicit scenario assumption. |
| Latest domestic prices | Start with dated public reports or authorized supplier/buyer quotes. The national market information platform provides general context. The ministry price-reporting portal requires login. A Yunnan department listing for Chengjiang blueberries is a published local offer, with no confirmed transaction or continuous regional series. Verify stable coverage and permitted access before promising live Yunnan blueberry prices. |
| Historical and multi-fruit prices | Use real comparable points where available. Track product/variety, grade or size, region, channel, package/net weight, currency, unit, time and price type. Keep farmgate, wholesale, retail, buyer offer and contract series distinct. Start with blueberry plus two example comparison fruits such as strawberry and raspberry. Use USDA AMS as a separate US market reference if relevant. Use seeded case series for missing coverage. |
| Demand and supply | Use actual orders, buyer inquiries, shipment volume and market arrivals where available. In sparse markets present observed proxies or a modeled demand index with inputs and coverage. Shipment volume measures movement. Case fixtures can vary demand, arrivals and available lots together. |
| Price and demand outlook | Start with a weekly or seasonal baseline when the history supports it. Add event markers and conditional overlays for harvest, holidays, weather, crop health and logistics. Show a range when supported, the cutoff and assumptions, and avoid estimates for insufficient real history unless the user is in a modeled comparison. Gemini explains the result using cited evidence. |

Keep one data contract for provider updates, dated snapshots and case data. Store original timestamps and data type. Show source, cadence and scope in record details; a gap in a real series stays a gap. Use no new connector per page. Extend the existing intelligence module and share the same market records across Dashboard, Market Intelligence, Farm Business, Prescription and Ask Sentinel. Set the chart default to one comparable price series with time-range controls and event markers. Display the local reference series separately from international context and the order contract. A valid quote can enter an applicable comparison after its terms, timing and eligibility are checked; a regional indicator or modeled demand series can trigger review.

For repeatable scenarios, use one seeded family of series and pin dated real events. Use harvest timing and a shared weather or logistics event to drive related changes, with separate assumptions by grade and channel. Leave the existing RMB 60 to 54 reference move in the case context. Preserve RMB 65/kg as the 6.1 order contract basis.

Sources: [Open-Meteo archived forecasts](https://open-meteo.com/en/docs/historical-forecast-api), [GDELT DOC API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-supports-jsonfeed/), [Yunnan agricultural reports](https://nync.yn.gov.cn/html/shujufabu/nongyechanyebaogao/), [Chengjiang blueberry listing](https://nync.yn.gov.cn/html/2025/nongchanpinxuqiu_1230/1423468.html), [China market information](https://ncpscxx.moa.gov.cn/), [price reporting portal](https://jgsb.agri.cn/), [2026 official holiday calendar](https://big5.www.gov.cn/gate/big5/www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm), [USDA AMS specialty crops](https://mymarketnews.ams.usda.gov/general-resources/Specialty-Crops).

### 5.2 Shared data for proactive analysis and Ask Sentinel

Publish each accepted record once with its source, time, crop and region or plot, data type, and stable ID. Existing Agents and analytic functions read the same records as Ask Sentinel. Keep each finding linked to its input IDs, cutoff, applicability and downstream decision or review. Show the finding in Market Intelligence or the relevant farm page, with **Ask Sentinel** opening the same evidence and finding.

| Signal | What happens automatically | What the operator can ask |
| --- | --- | --- |
| Comparable price move, demand change or an approaching holiday | Sales and Finance review material changes. The forecast can use comparable history and supported calendar inputs. A validated buyer quote may enter a separate plan comparison. | What changed by fruit, grade or channel? How much of the change is supported by the data? Does it affect an existing order or a new quote? |
| Weather, crop bulletin, local trap count or scouting record | Data and Agronomy check freshness and applicability. An external notice can open a scouting review; related field evidence can change the risk assessment. | Which plot or lot is affected, which observations support the assessment, and what still needs to be checked? |
| QA receipt, order change or crew/cold-room availability | Operations and Sales recompute fulfillment and route any affected decision or authorization for review. | Why did the shortfall or plan ranking change? Which receipt or capacity assumption changed? |

Run checks in the existing scheduler on source updates or due review times. Deduplicate findings by signal and decision revision. Recalculate only the affected records. Use Gemini for on-demand explanation and selected material briefings; preserve the latest valid finding and the underlying rule outputs when it is unavailable. Chat reads the existing analysis by default and can combine it with other permitted records. It can propose a what-if in the existing review flow. Operations, scenarios and archives keep their own data cutoff and evidence. Add no second ingestion or chat-specific dataset.

Acceptance: deliver one qualifying price event and one late QA event without opening chat. Verify that the price event creates an advisory with the signed contract intact, and that the QA receipt changes the applicable fulfillment or release check. Open each finding in Ask Sentinel and confirm the response cites the same inputs and revision shown in the corresponding page. Repeat in the pinned scenario and confirm its findings stay within that run.

## 6. Implementation, release gates and rehearsal

### 6.1 Build sequence and scope

Keep one release plan for the original dark workspace and the enterprise case integration. Each increment should produce a runnable checkout. Sections 8 and 9 provide the component baseline and layout specification.

| Order | Deliverable | Exit condition |
| --- | --- | --- |
| 1. Baseline and shared runtime | Inventory original routes, controls, selectors and fixtures. Record reference screenshots. Reuse the Node service and choose a durable local store. Add the run partition, operating clock, event journal, stable IDs, and reconnect cursor. | One field updates while the browser is closed; a restart resumes safely. The original frontend remains navigable. |
| 2. End-to-end operating case | Carry one observation through the existing pages, Agents, ontology links, strategy checks, authorization, task receipts and audit. Add the Farm Business read view and canonical legacy links. | An operator can follow one record across the entire chain. Both the quiet monitoring path and an eligible dispatch path pass. |
| 3. External information and Gemini | Wire the initial weather and source-linked news feeds, comparable market records, the reviewed knowledge catalog, page-aware Ask Sentinel and event briefing. | On-page answers cite correct records. A forecast or headline remains advisory until an applicable rule admits it. Workflows pass with the model unavailable. |
| 4. Scenario migration and release | Connect the optional enterprise order and all six original scenario cards to the shared runtime. Finish layout and preservation regression checks, documentation and rehearsal. | Each original scenario completes its expected workflow or escalation with the original views. Scenario reset/exit preserves Operations. All blocking checks below pass. |

The first release covers the full workspace and original scenario catalog. Build depth first using one Operating field and the blueberry path. Additional live connectors, continuous video analysis, broader ERP or buyer-quote integrations, and embedding retrieval can follow once the release flow is verified. Demo dispatch produces scoped work orders and recorded receipts in the configured demo environment. Production equipment integrations require their own validated configuration and authorization.

### 6.2 Release acceptance matrix

Record the command or click path, run and revision IDs, expected result and observed result. Keep fast fixture checks for calculations, server integration checks for commands and persistence, and browser checks for layout and interactions. Mark a failed gate with its owner and affected scope before release.

| Gate | Required evidence |
| --- | --- |
| Autonomous Operations | Fresh start opens Dashboard without a scenario. Show a scheduled check with the browser closed, an unattended review created from an eligible source event, and a quiet cycle with no intervention. Restart the service and verify cursor recovery and no duplicate action. Leave an approval pending while unrelated monitoring continues. |
| Data and case reconciliation | Validate every Section 7.6 fixture, including baseline, one day, QA known before planning versus received later, reallocation, stale sources and the market advisory. Match displayed values, units and timestamps with source records and the audit export. Trace the originating observation using its event ID and the workflow using its correlation ID. |
| Decision and dispatch | Use a separate fixture with two eligible candidates, select the alternative and verify its work order and audit. Verify an isolated what-if, missing evidence, failed gates, rejected or stale approval, concurrent or repeated requests, and a change after work begins. A blocked action produces no work order. |
| Scenario isolation and archive | Replay each original scenario twice against pinned inputs and confirm equivalent outcomes. Start, pause, step, reset and exit in place while Operations receives an update. Verify old links, the preserved Operations approval queue, and archive reconstruction after an external feed changes. |
| Source and Gemini degradation | Verify forecast coverage, market comparability and timestamped fallback data. Test one cross-source question with working citations, a different page or revision, prompt injection in source text, and provider timeout/quota. Rule-based decisions and navigation remain available throughout. |
| Original workspace and responsiveness | Check every Section 8 item and Section 9 route on a normal desktop, narrow width and short viewport. Exercise buttons, charts, drawers, scroll, evidence links and return paths. Preserve all original information with supporting records, and show meaningful unavailable states where records are missing. |
| Demo and handoff | From a clean start, follow the runbook, check service and source health, run the 90-second Operations path, then run the optional baseline and one blocked case. Record which feeds were reachable, fixture/source versions and the known gaps. Confirm public wording against reviewed presentation materials. |

### 6.3 Walkthrough

Use Dashboard and current operating health (15 s), then follow a recent operating event into Risk and Related records (15 s). Open Prescription and explain the current decision and gates (30 s). Show authorized work in Execution (15 s) and linked verification in Audit (15 s). Use a recent completed record from the same Operations session where waiting for receipts would exceed the walkthrough. Use the pinned blueberry and pressure scenarios as optional follow-ups.


### 6.4 Minimal file map

Start from [the 6.1 release index](README.md). The [scenario manifest](scenarios.json) records fixture branches. The starter fixture and source snapshot are separate input files, and `node --test scripts/sentinel-6.1-data.test.mjs` verifies their basic consistency. The scenario runtime, live refresh and AI retrieval still need integration.

Reuse the existing project structure. Add one shared server runtime module when implementing the first end-to-end workflow.

| Purpose | File | Treatment |
| --- | --- | --- |
| Build steps and acceptance | `docs/v6.1/Sentinel_Demo_6.1.0_Workspace_and_Ontology_Plan_EN.md` | Maintained in docs/v6.1. Section 6 is the single build checklist and release gate list. |
| Launch, demo steps and troubleshooting | `docs/Sentinel_Demo_Runbook.md` | Existing. Add start, reset and replay commands, the 90-second walkthrough and recovery steps. |
| Knowledge base | `data/sentinel-knowledge.json` | Starter catalog created with source, version and scope. Review draft entries before server-side retrieval. |
| Seeded farm data | `src/data/sentinel-6.1-fixture.js` and the existing generators | Starter blueberry fixture is available. Integrate the remaining farm telemetry and observations on one seed and time base. |
| Scenario definitions | `docs/v6.1/scenarios.json`, `src/engine/scenarioEngine.js`, `src/demo/scenario.js` | The manifest names original scenarios and declares starter blueberry overrides and expected results. Reuse the existing scripts for timed changes and connect both case types to the shared runtime. |
| External data | `data/sentinel-source-snapshot.json`, `scripts/sentinel-intelligence.mjs` | Starter snapshot contains the official calendar and dated published offer. Extend existing weather/news refresh and persist last-known-good records with original timestamps. |
| AI harness | `scripts/sentinel-intelligence.mjs`, `scripts/sentinel-analysis.mjs` | Existing. Keep provider access in the first file and unify identity, evidence assembly and response validation in the second. Resolve authorized record IDs from the shared runtime. |
| Shared state and server | `scripts/sentinel-demo.mjs`, `scripts/sentinel-runtime.mjs` | Existing entry point plus one new module for scheduling, session separation, record lookup, persistence and command handling. Keep the existing calculators in `src/engine/decisionEngine.js`. |
| Focused automated verification | `scripts/sentinel-6.1-data.test.mjs` | Starter checks verify fixture and source consistency. Extend verification after runtime integration for duplicate commands, restart/replay and session isolation. Keep click-through checks in the runbook and Section 6.2. |
| Interface | Existing layout, routes, components and page files under `src/` | Extend in place. Add one Farm Business page when its order and resource read view is ready. |

Runtime-generated caches, Operations state and scenario runs belong in the existing local data location and remain outside source control. A recorded source snapshot may be committed with its provenance when needed for a repeatable replay. Keep source credentials in the server environment.

## 7. Original runtime audit and the 6.1 data contract

### 7.1 What the original application does today

The original dark workspace is the navigation and component baseline. The current checkout also contains a separate enterprise case runtime. The following observations come from the current source, with the blueberry comparison independently exercised in Node. Treat the target rules below as implementation and acceptance requirements.

| Original surface or subsystem | Current path and behavior | Required 6.1 change |
| --- | --- | --- |
| Operations clock and scenario control | `src/engine/store.js` advances a browser timer, merges scenario sensor overrides into the current snapshot, recalculates risk and advances the Agent loop. `src/pages/ScenarioControl.jsx` also runs scenario autoplay. Loading and exiting a scenario alter shared store fields. `scripts/sentinel-demo.mjs` separately advances the enterprise case. | Give the existing Node service ownership of scheduling and operational writes. Keep a separate clock, event partition and approval queue for each run. The browser subscribes and changes the active view context. Advancing a scenario twice or switching tabs cannot advance Operations or duplicate actions. |
| Telemetry, Dashboard and History | Dashboard reads the store's current values and imports fixture trends and forecasts from `mockData`. Sensor Telemetry imports fixture series. History imports `historicalDecisions`. | Query one field/run history. Derive the last value, chart endpoint, warnings, summaries and history links from the same series and cutoff. |
| Agent panel and stream | The original store has 14 roles and rotates eligible assignments randomly. The stage card primarily exposes input/outcome text. The stream combines logs, actions and assignments. The enterprise case has six separately authored perspectives. | Keep the original cards and stream. Attach each visible result to a completed handler or recorded human/device action. Build the six decision lenses by grouping named findings from the same Agent run. |
| Risk, Prescription and constraints | `src/engine/decisionEngine.js` has risk and constraint functions. `src/pages/Prescription.jsx` contains hard-coded candidate/report data and a displayed PHI check with a fixed 14-day comparison. Prescription and execution estimates also use independent random values. | Keep the useful calculators and visual components. Return candidate metrics and gate outcomes once, with input references, and use them in the comparison, the approval action, the work order and the audit. |
| Approval and execution | In `src/engine/store.js`, approval removes the queue entry and may immediately execute, complete and audit the prescription. The execution entry checks whether an approval is pending. In the enterprise case, acceptance and reservation include fixed quantity writes in `scripts/sentinel-demo.mjs`. | Require a persisted authorization for the exact current scope and revision at the service boundary. Advance each task from its own receipt, derive quantities from lots, and keep approval, start, completion and verification as distinct events. |
| External signals and synthesis | `scripts/sentinel-intelligence.mjs` has cached, request-driven weather and news retrieval. The configured forecast coordinates are a regional location. `scripts/sentinel-analysis.mjs` generates a briefing against supplied evidence. | Move source refresh into the operating cycle. Record provider issue time and location coverage. Resolve candidate evidence through the same record links before briefing or chat. |

The Node comparison check on `src/demo/scenario.js` reproduced these current results: baseline B is feasible with 780 kg eligible, 900 kg nominal capacity, and RMB 28,350 modeled contribution at RMB 45/kg. A one-day window gives B 300 kg capacity and all plans are blocked. A stale source blocks all plans. Reassigning LOT-02 lowers B's eligible quantity to 420 kg. Changing the quality parameter to 700 kg leaves the comparison at 780 kg because the comparator does not consume the parameter. The existing execution script handles 700 kg only as a later receipt. Record the timing of that evidence explicitly in 6.1.

### 7.2 Event processing, snapshots and page projections

Keep the existing frontend routes and server. Implement one source intake path, one rule/candidate engine and one event journal with a durable local store. A current snapshot is a projection of that journal. Reuse the original scenario definitions and chart components as adapters to the shared schema. Start with local persistence and one scheduler; the demo does not require a distributed queue or a graph database.

1. Intake records are normalized to stable source and entity IDs, typed units and timestamps. Deduplicate by provider record ID and version. Preserve both event time and received time; store UTC and display the workspace timezone.
2. The ontology resolves affected records before a rule runs. Each event carries a session or run ID, event ID, type, event time, receipt time, source version, related entity IDs and parent or correlation IDs. Sensor, plot, lot, order, contract, shift, cold-room slot, policy, finding, decision, authorization, work order and receipt remain separately identifiable. Scope by field/plot, crop/grade, applicable time and relationship validity.
3. A scheduled or incoming event evaluates only affected records. Nonmaterial updates advance activity and data freshness. A material update to a gate, approved scope or capacity opens a new revision; invalidate affected unstarted work and route any in-progress effect for review. Preserve earlier snapshots and their history.
4. Pin the evaluated evidence IDs, source freshness, policy version, plan assumptions, Agent findings and candidate results in each decision revision. For each decision-relevant input keep its applicability and the source record that supplied it. A what-if branches from an explicit revision. Application creates a new revision with its own lineage.
5. Record authorization, work order and task receipts using the approved revision and plan ID. Journal mutations and idempotency checks share the same write boundary. Reloads and retries resume open work and deduplicate state transitions.
6. Dashboard shows current state and exceptions, Field Monitoring the underlying observations, Farm Business the orders, allocations, resources and economics, Risk the evidence and threshold transitions, Prescription the candidate evaluation and approval, Execution the approved tasks and receipts, Audit the reconciliation, History the archived revisions and Market the comparable source events. The Agent cards, activity rail and Ask Sentinel all read those same references. Subscribe from the last event cursor after reconnect.

### 7.3 Agents, task cards and handoffs

Keep the original seven workflow stages and 14 role IDs. The table defines which evidence each role reads and what the role must produce. Assign by task, scope and capability. Show the responsible Lead, Reviewer or Executor only after the task has been assigned. A task can legitimately wait for evidence or approval.

| Original role | Evidence and output shown on its task card | Handoff |
| --- | --- | --- |
| Data Retriever | Source record, coverage, units and age. Produce normalized records or a missing/stale source finding. | Data quality and domain roles |
| Remote Sensor Pilot | Device health, calibration and plot coverage. Produce a measurement-quality finding or request a rescan. | Agronomist or Control |
| Field Agronomist | Plot observations, crop stage and weather. Produce risk and affected-lot findings and scoped options. | Crop Chemist, Compliance and Ops Manager |
| Greenhouse Agronomist | Humidity, leaf wetness, ventilation and crop stage. Produce environmental diagnosis and recovery criteria. | Control, Safety and Ops Manager |
| Crop Chemist | Candidate treatment, usage history and rule reference. Produce a treatment-window check and an eligible alternative where applicable. | Compliance and Safety |
| Compliance Officer | Applicable policy version, grade/release evidence and required authorization. Produce a pass, fail, pending or not-applicable result and its reason. | Ops Manager and Audit |
| Safety Officer | Equipment/worker constraints, field conditions and stop thresholds. Produce dispatch gates and pause/recheck criteria. | Ops Manager and execution roles |
| Sales Planner | Contract, eligible lots, delivery date, grade and relevant market signals. Produce fulfillment gap, allocation or qualified substitution options. | Finance and Ops Manager |
| Finance Analyst | Contract or comparable quote, cost basis and delivered quantity assumption. Produce estimated contribution and exposure, with settlement tracked separately. | Ops Manager and Audit |
| Ops Manager | Domain findings, gate status, approvals, crew and cold-room availability. Produce a ranked recommendation, escalation or scoped handoff. | Operator, Control and Field Operator |
| Control Engineer | Approved scope, equipment state and task prerequisites. Produce dispatch validation, acknowledgment or deviation. | Execution roles and Safety |
| Drone Operator | Task scope and route/equipment readiness. Produce actual or case coverage receipts linked to the work order. | Control and verification |
| Field Operator | Lot assignments, shift and completed work. Produce quantity or work receipts and any deviations. | Compliance, Sales and Audit |
| Learning Engineer | Matched pre/post evidence, expected result and observation window. Produce outcome verification, confidence and follow-up. | Ops Manager and History |

The six comparison lenses use the same findings: Sensor/Data, Agronomy, Compliance/Safety, Operations, Sales/Quality and Finance. Every task detail shows trigger, owner, inputs and source links, rule or calculation, outcome, timestamp and next owner. Show material disagreements and their resolution, such as higher modeled contribution with insufficient Grade A volume. Gemini can summarize cross-source evidence, answer follow-ups and explain changes using the active snapshot and citations. Capacity, gate outcomes and authorization are produced by the shared rule path. A model response can suggest a what-if for the user to run. When the model is unavailable the recorded evidence, rule outcomes and actions remain usable.

### 7.4 Decisions, compliance and prescription lifecycle

* Evaluate each candidate with the same cutoff and units. Compute eligible quantity from assigned lots at the required grade, and usable capacity from eligible harvest slots and crew/cold-room reservations. Apply lot-specific harvest windows using the applicable policy and last relevant operation. Calculate the harvest window independently of the order delivery deadline. Use the tightest constraint for projected deliverable quantity and list all blocking rules.
* Gates return Pass, Fail, Pending or Not applicable, with the input evidence, threshold, policy version, timestamp and owner. A required missing or expired input stays Pending and blocks its corresponding action. Use approved, validated policy references for live decisions. Case-only crop protection parameters stay in the pinned scenario context.
* Rank eligible plans by the applicable policy and comparable modeled contribution. The matrix shows the recommended plan, the operator selection, alternatives, blocks, assumptions and trade-offs. Every selectable candidate resolves to its own prescription scope, owners, time windows, prerequisites, monitoring/stop criteria and expected receipts. An operator can select an eligible alternative with a recorded reason. If no plan is eligible, create an escalation with owner and reason.
* Allow a separately scoped inspection or QA work order where its own gates permit it. Dispatch of harvest or treatment, and release/reservation of inventory, each check their own prerequisites. The authorization records plan, revision, authorizer and scope. A denied or stale approval cannot authorize a dispatch. Repeated dispatch commands return the existing work order for the same authorization.
* Record actual or case measurements at each execution step. Verification reconciles accepted, held, isolated, reserved and acknowledged quantities within the applicable scope. Export the pinned evidence and linked receipts as a traceable record. A content hash can support integrity checking; record missing acknowledgment or settlement as pending.

For each plan, distinguish a forecast eligible volume, a confirmed QA quantity, and the accepted and reserved quantities. A forecast may support planning or authorization for explicitly scoped inspection or QA when its own gates pass. Full-order release requires the applicable recorded evidence. A new QA receipt is an event, and any resulting change to projected fulfillment, eligibility or scope is reflected in a linked revision. A hard gate is evaluated against the action being requested.

### 7.5 Source inventory and reproducible data

| Data family | Operations input and handling | Scenario input and invariant |
| --- | --- | --- |
| Sensor, imagery and scouting | Read connected telemetry and scouting records when available. Preserve device ID, calibration, coordinates or plot, sample time, units and quality. Use a coherent local baseline for unconnected channels, retaining provenance in record details. | Use a seeded field-level series with daily cycles and correlated temperature, humidity, leaf wetness and device interruptions. Inject dated changes into the series so alerts and charts move together. Use only linked imagery or scouting records as observation evidence. |
| Weather and news | Reuse the existing forecast and headline connectors. Store issue time, validity, provider, coverage, URL and last successful refresh. Check relevance before an Agent links an event to a plot, route or order. | Pin each source excerpt and applicable timestamp at scenario start. Use the matching local time and geography. Preserve an archived weather issue or source event when the feed changes. |
| Market and calendar | Track comparable price series, buyer quotes, harvest/holiday calendar, regional climate and pest news, supply and logistics notices. Compare matched crop, grade, geography, currency, unit, date and price basis. A headline or holiday contributes a dated explanatory feature or review signal. Decision impact requires validated applicability and a policy. | Reuse the same matching and eligibility rules for regional reference, pinned contract and quote cases. Store separately the observed history, forecast interval and explanatory event markers. Zoom from short to seasonal windows through shared time aggregation and keep underlying event IDs. |
| Order, lots, workforce, equipment and cost | Prefer linked records or validated snapshots. Otherwise use internally reconciled records with distinct IDs and realistic reservations and costs. Report last-updated time and missing inputs. | Build lot allocations, shifts, receipts and costs from the run definition and scoped work orders. Use deterministic fixtures and keep the seed, source versions and inputs for replay. |
| Outcome, pricing and forecast | Compute forecasts from the historical cutoff, record method, horizon and available uncertainty; label observations, forecasts and estimates in context. Use actual settlement only when documented. | A dated receipt changes only its own run from its event time forward. All pages consume the same revision and quantity; a result cannot appear before the task that produced it. |

Source details are available on demand. Use the original interface and its charts with consistent timestamps and units. Show stale or missing input at the affected decision or chart. Cached external data retains its original source timestamp. Never use the current publication timestamp for a replayed event. Pin source versions, scenario clock, seed, assumptions and rule version for repeatability. Validate connector reachability and relevance during release rehearsal before calling it live.

### 7.6 Scenario migrations and case reconciliation

Migrate the original six `src/engine/scenarioEngine.js` scenarios as event overlays using the original views and shared contracts. Use the existing seven workflow stages throughout.

| Original scenario | First changed evidence | Cross-page acceptance |
| --- | --- | --- |
| A. Blueberry PHI Window Risk | Plot risk, treatment history and harvest deadline | Compare eligible protection and release routes using the same lot-specific rule result. |
| B. Fresh Cut Flower Gray Mold | Humidity, leaf wetness and scouting | Risk changes with the evidence. A staged work order and follow-up observation verify the result. |
| C. Execution Deviation | Scoped device or operator receipt differs from target | Execution pauses or escalates affected tasks. Verify the discrepancy and revised scope in Audit. |
| D. Multi-Pest Cascade | Time-ordered pest observations on linked plots | Separate affected plots and risks. Compare scope, constraints and trade-offs before selecting a combined plan. |
| E. Frost Emergency Response | Localized forecast and approaching threshold window | Show affected crop and available time, then compare feasible protection actions and verify follow-up readings. |
| F. Greenhouse Ventilation Failure | Equipment fault, humidity trend and recovery signal | Route diagnosis to Control and Greenhouse Agronomy, then link repair and recovery evidence. |
| Enterprise blueberry order extension | 750 kg contract, Grade A forecast, pest-affected lot, shifts and buyer/market context | Offer it as an optional scenario in the same workspace. Retain each older case under its original version and migrate the 6.1 walkthrough to the versioned input set below. |

Use RMB 65/kg only for the 6.1 case revision. Archived runs keep their original price, policy and records, including the current alternate implementation's RMB 45/kg. Keep this conversion in one versioned case definition. The planned case reconciles as follows.

| Input or event | Expected 6.1 result |
| --- | --- |
| 750 kg at RMB 65/kg, projected 780 kg eligible and 900 kg nominal capacity in the 3-day case | Gross contractual value if fulfilled is RMB 48,750. A and C show the specific rules that make them ineligible under baseline assumptions. B leads if the current gates support it. Nominal capacity is separate from capacity in the authorized harvest window. |
| One day, 25 pickers and 12 kg/picker/day | 300 kg capacity and 450 kg shortfall for a route eligible to harvest that day. All plans remain blocked for order fulfillment. |
| 780 kg QA-cleared, 760 kg accepted, 750 kg reserved | 20 kg held at packing and 10 kg accepted but unreserved. Track the separate 120 kg isolated lot outside cleared volume. Reserve up to the lower of required quantity and accepted, QA-cleared, allocated and unreserved volume. Each receipt identifies the contributing lot. |
| 700 kg QA receipt | With pre-existing evidence, the comparison shows at least a 50 kg gap. With a later receipt, preserve the earlier projected decision and block full reservation on receipt, creating a revised state and escalation. |
| 650 kg confirmed usable; separate run | 100 kg gap and RMB 6,500 potential gross exposure before mitigation. |
| LOT-02 reassignment or source expiry | Recompute the affected plans, constraints and relationships. Invalidate an affected unstarted authorization if the change breaks its prerequisites. |
| Regional price moves from RMB 60 to RMB 54/kg | Record a 10% advisory decline. Keep the pinned contract and authorization basis. A validated eligible quote may open a separate re-evaluation. |

## 8. Original workspace preservation and regression checklist

Use the original dark workspace screenshots as the component and interaction baseline. Sections 3 and 7 specify where each component sits and where it gets its records. Verify the following items in both default Operations and a pinned scenario before release.

| Original screen or panel | Preserve in 6.1 | Data and interaction acceptance |
| --- | --- | --- |
| Dashboard and Autonomous Agent Mesh | Season spend, predicted savings, revenue protected, ROI, Watchdog and Structural Revenue Leakage insight, autonomy counters, ecosystem connectivity, seven task cells, 14 Agent cards and Live System Stream | Count checks, escalations, executions and audits from their own events. Opening a task reveals owner, evidence, rule, result and handoff. Connectivity badges reflect the corresponding configured source. A quiet monitoring cycle can end with Continue Monitoring and no intervention. |
| Sensor Telemetry | Unified Telemetry Window, 6h through 2y presets, grouped sensor cards, device counts and data rate, sparklines, status colors, battery, signal and calibration | Change the time range and verify all applicable charts follow it. Display available history and gaps. Derive counts from devices and status definitions; threshold warnings and connection state can coexist. Open the source reading, associated plot, trap or capture. |
| Risk Assessment | Highest Threat, Revenue at Risk, Decision Window, Multimodal Evidence Board, individual gauges, horizontal comparison, risk trend, Generate Risk Report and Open Prescription Builder | Use a common snapshot for cards and charts. Show source time and scope. Keep crop harvest timing and customer deadlines distinct. Unknown grade or probability renders as unavailable. Generate a report tied to that snapshot and open the matching decision. |
| Prescription analysis and alternatives | Five colored phases, completed analysis rounds and factors, historical cross-reference, alternatives including monitoring and fallback, cost-benefit table, Decision Flow timeline, Generate Prescription and JSON View | Populate the analysis stages with recorded events and evidence-linked findings. Counts and timing follow the run. Compare selected, eligible and rejected plans with their rationale. Where applicable, retain precision versus broadcast comparison using comparable scope, cost, input use and impact assumptions. Both the summary and detailed cost table use the same candidate result. |
| Active Rx and recent decisions | Prescription card with scope, status, conditions, violations, verification targets, cost and owner. Keep Modify, dispatch, Recent Prescriptions with detail and the decision log. | Modify creates a new revision; JSON View shows the selected revision; dispatch enforces its gates. A fallback is checked against its own rules. Show one authoritative status for each revision with related execution and audit links. |
| Execution | Multi-actor Gantt and actor cards, step timeline, execution-scoped Agent feed, environmental readings, fleet readiness, fingerprint panel, precision-versus-traditional chemical-use chart, planned-vs-actual comparison, recent execution details | Each task follows its assigned actor, time, dependency and receipt. Show current conditions and conditions at execution separately when applicable. Keep fleet readiness in Execution and link the same asset records from Farm Business. Track work completion and outcome verification separately. Verify the fingerprint against the recorded scope and integrity method, and assess conformity against actual receipts. |
| Audit and Outcome Learning | Audit KPIs and Generate Audit Report, gate-by-gate compliance, decision provenance trail, predicted vs observed outcome, verification checkpoints, learning feedback, model version history and feature attribution | Show pre-dispatch checks separately from checks supported by execution receipts. The generated report uses the selected case and rule versions. Only show model accuracy, feature importance or retraining status when a supporting evaluation, attribution or job record exists; rules can display their contributing factors. Mark missing outcome evidence as awaiting verification. |
| Analytics & History | All/Success/Issues, seasonal KPIs, six replay cards, risk journey, accuracy trend, chemical-use comparison, protected revenue, response-time chart, decision quality matrix, compliance summary and detailed decision log including no-action outcomes | Derive aggregates from the selected archive and disclose the denominator or basis where needed. Preserve failed/deviated outcomes and source versions. Drill down to the corresponding decision, prescription, execution and audit. Replay uses the archived time and inputs. |

Cross-check mismatches visible in the reference screens as regression cases: a required constraint failure keeps dispatch locked even when a fallback is shown; a low-risk score alone cannot authorize an intervention; the headline and breakdown must reconcile for the same plan and version; an overall execution status cannot imply completed verification when follow-up is still scheduled. Use one scrolling content region with accessible detail panes. Validate each retained control with a click and an observable result, alongside desktop and short-window screenshot checks.

## 9. Site-wide interaction and page design

Sections 2 and 3 define navigation and content. This section specifies the first screen, detail behavior, and route transitions to implement. Section 8 is the preservation checklist. Retain the dark canvas, dark-blue panels, chart and status colors, device-card style and compact typography. Improve text contrast and spacing where the originals are difficult to read.

### 9.1 Navigation and shared workspace

- **Sidebar.** Put Dashboard, Field Monitoring, Market Intelligence and Farm Business first. Follow with Risk Assessment, Prescription, Execution, Audit Report and History. Put Scenarios and Admin at the bottom. Use the original icons and labels where possible. Keep the seven-step strip on the original workflow screens. The sidebar indicates the page currently open; the strip indicates progress for the selected workflow and provides its original shortcuts.
- **Context bar.** Show Operations or the active Scenario, farm and field, crop, and the relevant clock. Show a case chip only when a decision or record is selected. Detail and history screens display the selected record's cutoff separately from the current operating clock. A filter applies to the data it can scope. Regional market records and farm measurements retain their original coverage.
- **Main content.** Use one shared width, alignment and vertical scroll container across workspace routes. Start with title, actionable status and page-specific controls. Put one primary work area above the fold on a normal desktop. Keep secondary detail below it or in accessible expandable panels with section anchors. Render wide tables and the Gantt in their own horizontal scroll regions.
- **Shared right panel.** Open Activity by default on desktop. A click on a chart point, Agent finding, order, rule or receipt opens Related records at the clicked item. Keep Ask Sentinel in the same fixed position on each page with a persistent transcript for the active session, a visible composer and citations that reopen evidence. The rail becomes a drawer on narrower screens; closing it restores focus to the triggering control. Keep the main content scrollable at short heights.
- **Navigation state.** Keep the canonical path on scenario activation, pause, step, exit and reset. Preserve relevant filters and scroll position on return. When opening a linked record on another page, carry its run or archive reference, record ID and applicable field. Display the resulting record scope visibly. If a record is unavailable, explain why and offer a return to the scoped list. Restoring Operations shows its latest state without advancing or resetting either session.

### 9.2 First screen, retained detail and interaction by page

| Route | First screen and primary action | Retained or expanded detail |
| --- | --- | --- |
| `/` Dashboard | 24/7 health, last/next check, current workload, attention queue and Field / Market & Weather / Business cards. Open an exception, check its related evidence, or browse any of the three detailed views. | Keep season spend, modeled savings, protected revenue, ROI and the Structural Revenue Leakage insight; preserve proactive alerts, sensor sparklines, risk profile and Watchdog history. Keep the seven Agent task cells, the 14 role cards and live stream on this page. Expand a task to see its evidence, rule, result and handoff. |
| `/sensors` Field Monitoring | Keep Sensor Telemetry as the default tab. Place the unified 6h–2y time presets and device summary above the original sensor grid. Select a device or sample to inspect it. | Device groups, thresholds, battery, signal, calibration and trend charts stay intact. Images & Video and Pest Traps & Scouting add capture timelines, counts, observations and media records linked to the same plots. Show gaps and last valid readings. |
| `/intelligence` Market Intelligence | Overview shows the most relevant farm-facing changes, current source coverage and short outlook. Select crop, region and time or open an Agent assessment. | Preserve and expand regional weather, news and price context into the five views in Section 3. Display comparable prices, supply, freight, trade and dated holiday, climate and pest events. Annotate relevance, freshness and eligibility. Provide a timeline with zoom and event drill-down. |
| `/business` Farm Business | Start with open commitments, Grade A availability, near-term resource gaps and cost exposure. Open the selected order and its lot allocation. | Orders & Lots, Resources and Costs & Contribution share the records already needed by Prescription and Execution. Include a link to fleet readiness, active reservations and the relevant decision or work order. |
| `/risk` Risk Assessment | Highest threat, revenue exposure and decision window, followed by the multimodal evidence board and risk gauges. Generate Risk Report or open the matching decision. | Keep score comparison, trend, thresholds, recent activity and source-linked observations. Expand an affected plot or lot to see related orders and capacity; display the assessment cutoff. |
| `/prescription` Prescription Builder | With a case selected, show the operating context, current recommendation or blocking reason, six specialist perspectives and strategy comparison. Open the selected candidate and see whether authorization is available. Without a selection, show the decision queue and recent prescriptions. | Keep the original five-color analysis timeline and rounds, factors, historical comparison, rejected/conditional alternatives, cost-benefit, decision flow, active prescription, verification plan, recent records and JSON View. Keep Generate and Modify. Use one authorization control for dispatch. An invalid or stale authorization leaves an actionable explanation. |
| `/execution` Execution | Show authorized scope and work/verification status, then the multi-actor Gantt. Open a task, its dependencies and actual receipt. | Keep actor cards, step timeline, scoped Agent feed, live environment, asset readiness, planned-vs-actual comparison, chemical-use comparison where applicable, fingerprint and recent runs. Retain equipment and treatment modules for the cases that use them. Order cases also show lot quantities, packing, reservation and fulfillment receipts. |
| `/audit` Audit Report | Show the approved target, verified outcome or outstanding checkpoint, exceptions, and Generate Audit Report. | Keep compliance checks, evidence sources, provenance trail, responsibilities, fingerprint details, planned vs observed results, learning feedback and model version/attribution when supported. Link each check to the rule, approval or receipt that supports it. |
| `/history` Analytics & History | Date, field and outcome filters, seasonal KPIs and intervention/replay cards. Open an archived run or compare outcomes. | Keep original risk journey, accuracy, chemical usage, revenue protected, response time, decision quality matrix, compliance summary and detailed decision log including no-action outcomes. A replay opens with the archived inputs and supports the original stages. |
| `/scenarios` Scenarios | Keep the original six scenario cards, add the optional blueberry order extension, and show starting conditions, field, and the signals that will change. Start or resume a run. | Keep pause, step, reset and exit in the workspace and show archived runs. The user stays on the current page when using the persistent scenario controls. |
| `/admin` Admin | Source health and rule versions, with clear operational settings and review states. | Keep existing governance and configuration views. Link source failures to their coverage and last successful update. Record configured thresholds and changes using the active policy version. |
| `/product`, `/how-it-works` | Present Sentinel's 24/7 operating role and open Operations. Explain the process with one linked example. | Keep secondary placement. Show how the Farm Ontology connects observation, lot, order, decision and verification. Provide an optional case link using the workspace. |

### 9.3 One workspace and one route per action

| Existing entry point | Canonical destination |
| --- | --- |
| `/workspace` | Dashboard in the unified shell |
| `/workspace/cases/:caseId/context` | Dashboard focused on the case with a link to Farm Business for the order and resource records |
| `/workspace/cases/:caseId/decision` | Prescription with the case and revision selected when available |
| `/workspace/cases/:caseId/execution` | Execution with the corresponding case or work order selected |
| `/workspace/cases/:caseId/evidence` | Audit with the selected case and evidence record when available |
| `/workspace/history`, `/workspace/settings` | History and Admin respectively |

Retain the record or archived-run identity in redirects. Keep bookmarked routes usable while retiring the duplicate shell. Use a single candidate selection and approval flow in Prescription. Use Farm Business for order and capacity inspection, Execution for authorized work, and Audit for the recorded verification. The same details can be opened from the activity rail without creating another workflow.

### 9.4 Design acceptance

Apply the scenario, preservation and responsiveness gates in Section 6.2 and use Section 8 as the per-component checklist.

## 10. Gemini and Ask Sentinel

### 10.1 One assistant with page-aware entry points

Keep one floating Ask Sentinel launcher on every workspace page. It opens the shared right-side panel on desktop and a drawer on small screens. Keep Activity available and preserve the conversation when changing pages within the same session. On Product and How It Works, an optional Ask about Sentinel action can open the same component in public product-help scope without farm records.

Each page can add a local entry such as Explain this alert, Analyze this chart or Compare these plans. It opens the same panel and attaches the selected record. Show the scope next to the composer: **This page**, **Selected record**, or **Current workspace**. Default to the page when opened from the launcher and the selected record when opened from a local action. Show field, time range, case and decision revision where applicable. Users can remove a record or widen scope deliberately. Each question pins its own context, and navigating during an in-flight response cannot change its evidence. Separate threads by Operations, active scenario run and archived run. Keep the visible last-used context and preserve citations when a record is revised.

The current application already mounts a floating Assistant and has a real Gemini server endpoint. Its ordinary farm context is a browser-provided summary, and the separate order path assembles case context on the server. The interface currently renders a plain answer. Reuse the component and endpoint. Resolve the current route, record IDs and requested scope against the server's authoritative read model. Build responses with answer, cited record IDs, cutoff, and missing or stale evidence where relevant. Link citations to the exact record. Keep historical analysis anchored to the archive; fetching a current source for comparison requires an explicit request and separate timestamps.

### 10.2 Page analysis and workflow placement

| Page or workflow | Real Gemini capability | Inputs and cadence |
| --- | --- | --- |
| Dashboard and Watchdog | Summarize what changed, how field, market and order signals relate, and which item to inspect next. | On-demand questions. Generate one cached briefing for a material event or case revision. Routine heartbeats and thresholds run locally. |
| Field Monitoring | Explain an anomaly across readings, device health, inspection notes and a selected image; suggest what to confirm in the field. | Use bounded series summaries and linked captures. Optional selected still or short clip after the core flow is stable. |
| Market Intelligence | Summarize linked stories and compare price movements, forecast windows, regional alerts and farm exposure. Explain source disagreements and relevance. | Use known provider records and comparable price series. Batch material events. Forecast values and uncertainty come from the forecasting method or source. |
| Farm Business | Explain a delivery or capacity gap, relevant lots and the cost implications of confirmed alternatives. | On demand, using pinned order, QA, crew, reservation and cost records. Use the shared calculator for quantities and economics. |
| Risk Assessment and Agent review | Draft a cross-source briefing and evidence-linked questions for the assigned roles. Explain trigger, risk changes and uncertainty. | One structured synthesis per material decision snapshot, shared across the relevant cards. Each role keeps its own task record, rules and result. |
| Prescription | Compare eligible and blocked plans, explain trade-offs and identify useful what-if inputs. | Use candidate metrics and gate results calculated by the existing engine. Show evidence IDs. Send any what-if to the existing explicit review action. |
| Execution and Audit | Explain a delay or deviation, identify missing receipts, and draft a summary of the verified record. | Read the authorized scope and actual task receipts. Distinguish expected from recorded outcomes and include outstanding verification. |
| History, Scenarios and Admin | Compare two archived runs, explain the selected scenario setup, or interpret source status and policy changes. | Read the selected scope and its versions. Restrict settings and service data to the user's existing permissions. |

Gemini participates after data ingestion and deterministic checks, and again when a user asks for an explanation. The runtime owns risk scores, numerical forecasts, rule outcomes, recommendation ranking, authorizations, dispatch and audit records. Model suggestions are advisory and can surface conflicting or missing evidence. Recorded outcomes remain available when Gemini is unavailable.

### 10.3 Integration, reliability and acceptance

- Start with page-aware chat and the existing cross-source briefing. Reuse the Node service and configurable model. Keep the API credential in the server environment. Use a bounded evidence payload and existing local retrieval for the first implementation. Evaluate read-only Gemini function calling later if a question needs iterative lookup.
- Request structured output for briefings and citations. Validate fields, record IDs, scope and numeric claims against the actual inputs; valid JSON alone does not establish evidentiary support. Treat headlines, captured text and uploads as untrusted data. Apply authorization and field-level filtering before sending context. Use only permitted records and media.
- Queue or coalesce background briefs by case, revision and model settings, with a timeout and a bounded retry. Keep chat interactive, cache the latest valid briefing with its version, and cap context and media. Expose the briefing cutoff, stale status and retry in the assistant. A Gemini timeout or quota limit leaves direct evidence, rule summaries and all authorized workflow actions available. Rehearsal mode may display a pinned prior briefing as a recorded result.
- Verify that one question can connect field measurements, a relevant market/weather signal and the affected order with working citations. Verify that the same prompt on another route or revision uses its own evidence, that Scenario and Operations threads remain separate, and that an old briefing cannot present itself as current. Confirm a blocked option cannot be authorized through chat and the demo flow completes with the model unavailable.

References: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling).

## 11. Sentinel AI runtime harness and knowledge base

### 11.1 Identity and scope

The existing chat prompt already identifies the assistant as Sentinel, and the separate briefing prompt serves the blueberry case. Move both behind one server-owned Sentinel identity, versioned with the application. Use it for Ask Sentinel, Agent briefings and public product help. Maintain short, task-specific instructions for those entry points. Keep retrieved documents, live records and messages outside the trusted instruction layer.

Suggested identity: **You are Sentinel AI, the agricultural operations assistant inside Sentinel. Help the operator understand crop conditions, market signals, orders, resources, costs, decisions and verified outcomes. Answer in the user's language. Use the selected farm, time, case and revision. Cite the records that support operational claims and explain material uncertainty or conflicting evidence. Refer approved actions to the workspace's authorization flow.**

The visible assistant name and the response metadata identify Sentinel AI. Gemini remains the configured model provider. The assistant can explain the product using approved materials and the workflows actually available. Roadmap claims retain their planned status. An archived run uses the version and evidence recorded for that run.

### 11.2 Knowledge sources and authority

| Knowledge type | Initial sources | How Sentinel uses it |
| --- | --- | --- |
| Product and operating methods | Approved portions of the current Shenzhen deck, speaker notes, whitepaper, runbook, Farm Ontology and Agent glossary | Explain what Sentinel does, how the workflow operates, and how to read the workspace. Verify document version and approval before indexing. |
| Agronomy and compliance | Reviewed crop reference notes and scouting SOPs, versioned policies, applicable approved labels and verified official references | Explain general crop risks and observations. For an operational check, use the applicable versioned rule result and supporting evidence. Surface missing applicability or conflicting versions. |
| Market and external signals | Source-linked weather, prices, trade, holidays, news and notices, plus source definitions | Retrieve dated, comparable records and their applicability findings. Keep regional observations, forecasts and contract terms distinct. |
| Farm, orders and resources | Structured device and scouting records, fields, lots, orders, QA, shift calendars, assets, packing and cold-room slots | Query the selected workspace or scenario at the requested cutoff. Follow Farm Ontology links to resolve affected entities and records. |
| Economics and outcomes | Contract terms, input and operating costs, allocations, receipts, verified settlement and calculation definitions | Use the existing calculator for projected delivery, costs, contribution and gross exposure. Ground reported outcomes in receipts or settlement. Explain assumptions and units. |
| Historical lessons | Archived decision revisions, approvals, task receipts, verified outcomes and reviewed feedback | Compare compatible cases and cite the original revision. History can inform review; any change to a rule or model follows its existing approval process. |

Start with a small reviewed catalog. Reuse the repository's evidence index and versioned project material as candidates, including the whitepaper, runbook and product documentation. Publish an explicit allowlist of passages for assistant retrieval. Give each passage an ID, title, section, version, owner, approval status, effective dates, relevant crop/region and access scope. Publish updated versions without overwriting evidence cited in archived decisions. Keep general background distinguishable from local data and binding rules. Select the current approved material at publication time; earlier versions remain addressable for history.

### 11.3 Harness and tools

Keep the existing Node service and Gemini adapter. A practical first version uses approved Markdown passages with tags and text search, a lightweight index and the existing structured read model. The service validates user and page scope, retrieves relevant passages and records, follows linked entities, runs approved calculations, then sends a bounded evidence bundle to Gemini. Validate the reply's references against that bundle before rendering. Track source freshness, permissions, run and revision, and bound the number of records, calls and tokens per question. Add embeddings only if question evaluation shows a retrieval gap.

Use narrowly scoped operations with typed inputs and outputs. The server can call these directly in the first release.

| Operation | Example result |
| --- | --- |
| Search approved knowledge | A crop scouting SOP excerpt or product definition with source, section and version. |
| Read an operational record | A selected lot, order, trap inspection, asset or policy check in the permitted session. |
| Traverse related records | Trap → plot → lot → order → decision, with IDs and effective dates. |
| Summarize a series | Values, range, timestamps, gaps and threshold crossings for sensor, weather or market records. |
| Calculate a comparison | Existing fulfillment, capacity, cost or contribution calculator output for a pinned plan or explicit what-if. |
| Read an audit or archived run | Approval scope, rule outcomes, receipts and verification checkpoints for the selected revision. |

Return the answer, cited evidence IDs, cutoff, assumptions, and any missing or conflicting inputs. If an operational answer cannot be substantiated, explain what is available and what record is needed. The conversation supplies context for follow-up questions; it does not change farm facts. The existing engine and UI own decision updates, approvals, dispatch and policy edits. A suggested scenario or what-if can prefill the existing review action. Scope checks apply before data leaves the server and again when resolving citations. Treat instructions embedded in documents, news or media as untrusted input. Keep the credential and restricted supplier, customer and settlement details out of model context unless the particular field is necessary and authorized.

Example: an operator asks whether a 750 kg order can still ship after a pest alert. Retrieve the alert and linked lots, the current allocation, QA, capacity window, contract and applicable release checks. Run the current decision calculation. If the applicable QA result is 700 kg, state the 50 kg minimum gap and the corresponding blocked release, link the source records, and show what could resolve the gap. A regional price movement can be explained separately using its own market record and eligibility finding.

### 11.4 Build sequence and evaluation

1. Extract the shared identity and task instructions from the existing chat and briefing handlers. Reuse Gemini and return evidence-linked structured answers.
2. Publish the approved initial knowledge catalog and connect the Farm Ontology read model for field, market, order, lot, resources and finance. Reuse existing calculations and prefetch one bounded evidence bundle for each question.
3. Wire page and selected-record entry points into the shared assistant. Enable the existing event briefing for material revisions, keeping routine workflow independent of model availability.
4. Add representative questions for agronomy, markets, farm operations, orders, resource limits, finance, compliance and archived outcomes. Test bilingual identity, correct source versions and citations, unknown data, conflicting evidence, live versus scenario isolation, attempted document instructions, blocked actions and Gemini failure. Evaluate grounded answers and calculations with fixed fixtures, then smoke-test against the configured Gemini service.

Release the first version with the reviewed knowledge catalog and read-only operations above. Extend document coverage and retrieval when evaluations show where the assistant cannot yet answer reliably.

