# Sentinel Demo 6.0.0 · Unified workspace plan

**Implementation baseline:** the original Sentinel Engine v4.2 workspace, Build 2026.03, shown in the reference screenshots. Reuse its dark shell, seven-stage navigation, telemetry and risk charts, live stream, Agent panels and scenario controls.

This plan supersedes the separate order-workspace and mode-switching design in the [6.0.0 implementation plan](https://chatgpt.com/library?file_id=libfile_5f18da3238d4819193ea89e1de035e50&account_id=personal). Use that plan for the market data, forecasting, photography and presentation requirements that remain applicable. The new website release is 6.0.0. The Shenzhen presentation remains V3.5.

## 1. One workspace and one mode switch

Keep `Layout.jsx`, the original sidebar, topbar, stage bar, shared chart conventions and default Dashboard. Add **Operations / Demo** to the same topbar, using the existing Scenarios page to select presets. The 750 kg blueberry order becomes a selectable scenario alongside the original scenarios. The switch changes the data session, clock and workflow context in place. Navigation and component layout remain the same. Retain a short scenario title and current step in the existing topbar. Show a single shared **Ask Sentinel** panel across routes.

| Mode | Behavior |
| --- | --- |
| Operations | Default on a fresh visit. Restore the selected field and operational session. Run the original automated monitoring workflow with the configured source adapters. Render source timestamps and availability for the field. |
| Demo | Start or resume a chosen scenario from Scenarios. Use the same pages, rules, Agent panels and activity rail. An accelerated clock, pause, step, reset and what-if controls are available for the selected scenario. |
| Return to Operations | Restore the previous field, pending approvals, running work and workspace position. Pause the scenario when leaving it. Keep its history and receipts under its own run ID. |

Preserve the canonical routes `/`, `/sensors`, `/risk`, `/prescription`, `/execution`, `/audit`, `/history`, `/scenarios`, `/intelligence` and `/admin`. Migrate old `/workspace/cases/…` links to the appropriate original page and explicitly resolve the matching scenario or archived run. A link to an archive opens a read-only view. A legacy link never resets or starts work implicitly. Remove the parallel workspace shell after link and regression tests pass.

## 2. Integrate the scenario into the original pages

| Original page | Shared behavior with the selected Demo scenario |
| --- | --- |
| Dashboard | Keep the original KPIs, chart grid, Agent cards and Live System Stream. Add the affected order and latest relevant market or weather signal beside existing operating alerts. Select the alert to follow its evidence. |
| Sensor Telemetry | Keep the original grouped charts, sensor health and shared time range. Apply the selected field and scenario clock. Show temperature, humidity, soil moisture, leaf wetness and pest observations from the active feed. Preserve gaps and freshness instead of substituting a sensor reading from another session. |
| Risk Assessment | Keep the original evidence board, gauges and trends. Link the pest threshold, weather outlook and lot to crop risk and the affected order. Separate measured signals, forecast risk and order exposure. |
| Prescription | Keep the original reasoning timeline, evidence and constraint checks. Add the three order strategies and comparison inside this page. Show the candidate, alternatives, blocking rules, Agent findings and approval state. |
| Execution | Use the existing work-order and execution view for the approved plan, task dependencies, QA, accepted harvest, inventory and dispatch receipts. |
| Audit Report | Extend the existing fingerprint and evidence views with the order, snapshot and approval versions, QA and inventory reconciliation, and any exceptions. |
| History | Show operations and scenario runs with their context. Restore the original snapshot when reviewing a run. |
| Market Intelligence | Keep this inside the same sidebar and shell. Use the active field and crop filters for regional weather, news, crop-health notices and comparable price history. Map relevant signals to the current field or order. |

Reuse the existing deep navy colors, status colors, chart components and card layouts. Keep one scrolling content region with the same width and gutters on every page. The activity rail and conversation transcript get their own scroll when expanded. Keep the composer visible at short window heights. At narrow widths the assistant opens as a drawer with a fixed launcher. Check short desktop windows, standard desktops, projection and mobile.

## 3. Shared data, state and execution

The current repository has a browser autonomous loop in `src/engine/store.js` and a separate order-run service in `scripts/sentinel-demo.mjs`. The original Scenarios switch resets several state collections. Reuse its controls and visual pattern. Migrate the runtime so switching modes preserves operational work and never uses the other mode's data.

Use the existing Node process as the sole scheduler and write owner for migrated sessions. Keep Zustand as the shared view state and command client. Extract or adapt the original sensor, crop risk, prescription, execution and audit functions for reuse. Build an explicit session contract for mode, run, field, clock, active snapshot, tasks, approvals and receipts. Expose one normalized state snapshot and a cursor-based event feed. Switch the original pages to that feed once the autonomous flow passes parity tests. Disable the previous browser timer and scripted writers for migrated sessions during cutover. Every command is scoped to the current session and checks the relevant snapshot or approval version. Preserve state through refresh and server restart.

| Source | How it enters the workspace |
| --- | --- |
| Sensors and field observations | Normalize channel ID, plot, unit, observed time, received time and source status. Use a configured actual feed when available. Use a pinned record or generated series where needed for the selected case. Keep records consistent with the scenario season, soil, irrigation and risk thresholds. |
| Weather, news and prices | Use validated provider records or dated historical snapshots. Keep regional forecasts separate from plot measurements. Filter by region, crop, date and relevance before attaching to an order. Preserve price basis and source reference. |
| Orders, labor, lots, QA and execution | Use one versioned fixture for the order scenario. An Operations session uses its own field and run records. The same IDs and computed quantities must reach risk, decisions, execution and audit. |

The 05:40 pest observation must appear as an actual input event in the selected scenario's telemetry and activity stream. Its evidence links resolve to the affected lot, order, and strategy gate. A modeled weather signal may qualify the analysis. A regional reference-price move is advisory and leaves the contract price unchanged. Keep observed, forecast, estimated and case values recognizable in context without adding a global synthetic-data banner. Keep source lineage and timestamps available in record details and audit.

## 4. Agent workflow and fixed AI conversation

Reuse the original Agent roster, task cards, timestamps and live stream. Attach a durable record to each stage transition: trigger, input IDs, Agent role, applied rule or assessment, result, next owner and timestamp. The trace follows **ingestion → risk assessment → compliance → strategy → approval or escalation → execution → audit**. Use one shared trace in the stage panels and activity feed. A missing result remains pending, and a blocked task records the failed prerequisite. Distinguish assigned roles from completed work.

Use the six perspectives to summarize the existing 14 roles where relevant. Gemini can produce a cross-source briefing and concise evidence-backed rationale using the current snapshot. Deterministic rules continue to calculate quantities, enforce gates and govern approval. Show the reasons and evidence used for the decision in the existing reasoning panel. Label a model answer as advisory and show its source or snapshot references.

Mount one shared **Ask Sentinel** instance in the original shell. The panel stays in a fixed position on every operational page, including Scenarios, Market Intelligence and Admin. On desktop it opens as a docked conversation panel and can be collapsed. It follows the current page and receives the selected field, mode, run, snapshot, relevant records and pending action. Preserve conversation across navigation within the same session. Restore the corresponding thread on mode switch and open a read-only context for an archived run. Verify that archived questions use their stored evidence. A missing key or API timeout leaves the page and the existing workflow usable.

## 5. Upgrade the original Agent cards and decision trace

The current `AIAgentPanel.jsx` expands a task into two text fields, Input and Outcome. `SystemActivityRail.jsx` reads the original cycle logs. The order case separately defines six perspectives in `src/demo/scenario.js`. Replace these separate presentation contracts with one versioned task and event contract. Keep the original card layout, role icons, task expansion, time stamps and stream colors. The six perspectives are views of the same 14 stable roster IDs from `src/engine/store.js`. Map aliases in the order case to those IDs during migration.

### Original roster and 6.0 responsibilities

| Existing Agent | Inputs and result displayed on the original card |
| --- | --- |
| Data Retriever | Source, fetch time, event time, crop, region, grade and unit. Deduplicate, check freshness and emit an accepted record, warning or exclusion with reason. |
| Remote Sensor Pilot | Sensor, trap or imagery reference, location and capture time. Resolve the signal to the relevant plot and lot. Flag coverage and uncertainty. |
| Field Agronomist | Crop stage, trap count, lot observations and historical context. Record crop-risk finding, affected lots and agronomy recommendation. |
| Greenhouse Agronomist | Humidity, temperature, leaf wetness and protected-crop exposure. Explain how the microclimate changes risk or the available harvest window. |
| Crop Chemist | Relevant treatment and configured safety interval. Record which strategy requires a compatibility or interval check and hand it to Compliance. |
| Compliance Officer | Versioned compliance, grade and release rules. Record pass, block or missing evidence for each applicable gate. |
| Safety Officer | Weather alerts, exposure and crew constraints. Flag unsafe or unverified field windows and cite the relevant threshold or notice. |
| Sales Planner | Contract price, order grade and deadline, comparable market observations and firm quotes. Report delivery exposure and candidate commercial options. |
| Finance Analyst | Validated contract or quote basis, quantities and costs. Explain gross contractual value, exposure and modeled contribution separately. |
| Ops Manager | Reconcile findings and compare eligible strategies. Own escalation, approval handoff and the next operational decision. |
| Control Engineer | Device and service health, plan prerequisites and dispatch status. Record task readiness, hold reason or acknowledgement. |
| Drone Operator | Aerial scouting or assigned work scope and location. Record the applicable observation, task status and linked receipt when present. |
| Field Operator | Crew capacity, QA results, accepted harvest and inventory handoff. Reconcile quantities by lot and order. |
| Learning Engineer | Compare forecast with actual outcome and record discrepancies for review. Keep the historical rule and model version attached to the record. |

### What expanding a task shows

1. **Assignment and state.** Stage, field, order or run ID, role, assignee, started/finished time, and Waiting, Running, Complete, Blocked, or Awaiting approval. A task becomes complete when its corresponding result exists.
2. **Trigger and inputs.** Clickable source IDs with observed or published time, units, relevant values and the active snapshot. Indicate missing, stale or inapplicable records.
3. **Applied checks.** Rule ID/version, threshold or formula, inputs, and pass/fail result. Show the decision rationale and cited evidence. Record model interpretation separately from computed checks.
4. **Result and handoff.** Finding, proposed action, alternatives or block reason, the next owner, and a direct link to the next stage or approval. Include approval ID, work-order ID, receipt ID and fingerprint where they exist.

Use a record with `eventId`, `parentEventIds`, `runId`, `snapshotId`, `stage`, `agentId`, `status`, `inputRefs`, `ruleChecks`, `outputRefs`, `nextOwner`, and timestamps. The original Activity Rail renders these same records in compact form and opens the matching task or source. Preserve audit records across re-evaluation. Distinguish superseded plans from current recommendations. Archive an authorized snapshot together with its original inputs and receipts.

### How the workflow changes

Ingest → validate and link through Farm Ontology → evaluate relevant specialists → apply compliance, capacity and quality gates → compare feasible strategies → approval or escalation → dispatch and verify → audit and review the result. In Operations, a material field or commercial event uses this workflow without requiring the blueberry order. In the selected blueberry scenario, the same flow applies to A/B/C. Keep the original navigation stages and use the existing prescription panel to show alternatives and trade-offs. Produce advisory Gemini findings from a single compact snapshot of validated evidence, with caching by snapshot and prompt version. On timeout, show the recorded facts and rules immediately. Only the existing rule and approval layer can authorize a task.

## 6. Rebuild Market Intelligence inside the original design

Reuse the Dashboard's dark cards and KPI grid, telemetry's synchronized time-range controls, risk page's severity vocabulary and chart styling, and the original right-hand System Stream. Keep the existing content width and responsive behavior. Show a compact Market Pulse on Dashboard and the full view at `/intelligence`. Retire the current three-card layout after the replacement is verified.

| Section | Visible content | Agent and decision connection |
| --- | --- | --- |
| **Market Pulse** | Key price movements, forecast weather, recent crop alerts, highest-priority opportunity or exposure, and last refresh per source. Each headline opens its supporting record. | Data Retriever validates the records. Ops Manager assigns material items for review. |
| **Prices & Channels** | Comparable blueberry series by region, grade, size and price basis. Show farmgate, wholesale, firm quote and contract separately. Use synchronized 7D, 30D, 90D, 1Y and available seasonal comparisons, with an expandable price table and forecast interval where supported. | Sales Planner checks order relevance. Finance Analyst recalculates economics only with an eligible quote, contract change or cost input. |
| **Supply & Demand** | Harvest calendar, regional supply, grade availability, buyer demand, holiday timing and sales channels. Show the affected crop, period and coverage. | Sales Planner and Field Agronomist flag a supply gap or demand shift. Ops Manager routes a relevant exposure for review. |
| **Weather & Crop Health** | Regional outlook, rain/heat windows, weather anomalies, pest and disease notices, and field links. Place official and reported events on the shared time axis. | Remote Sensor Pilot and Data Retriever match coverage. Agronomists and Safety Officer assess effects on a specific plot or harvest window. |
| **Costs, Logistics & Trade** | Packaging, cold chain, transport, labor and farm-input cost observations, competition and trade reports. Show currency, unit, effective date and provenance. | Finance Analyst tests cost sensitivity. Ops Manager considers actual schedule or resource changes after eligibility checks. |
| **News, Holidays & Policy** | Filterable headlines and official notices with publisher, published date, event date, topic, affected geography, related signals and source link. Add short English AI summaries with evidence IDs. | Data Retriever clusters duplicates. Relevant Agents add findings. Compliance Officer reviews applicable policy changes before any rule update. |

Make the page browseable at depth through tabs, filters and expandable rows. Use the same active field, crop and case as the workspace, with optional regional comparison. Prepare a reviewable published snapshot for each tab where comparable records are available. Use versioned case series for scenario-only history and clear empty states for unverified coverage. A public observation, forecast and case assumption each keep their own time, basis and lineage. Extend the existing weather and news adapters and source registry in the same Node service. Check relevant crops and geographies, cache results, ingest source changes at their publication cadence, and keep rehearsal usable from pinned records. Open-Meteo and GDELT remain initial adapter candidates. Official crop health and weather notices, calendar dates, and comparable price extracts are sourced before populating their respective sections. Keep the simpler forecast when event-aware backtesting shows no improvement.

### Intake and decision policy

| Record | What happens after intake |
| --- | --- |
| Background news, holiday, unrelated price or incompatible grade/basis | Show in the relevant tab. No case mutation. |
| Comparable regional price drop or verified regional event | Open a watch item with a named Agent, evidence, coverage and time. Link to the affected case only when relevant. A regional price move does not change contract economics. |
| Relevant rain or pest notice | Review linked plots and the applicable window or risk. A validated local input can trigger re-evaluation; an unverified headline stays advisory. |
| Valid firm quote, contractual change, revised capacity, or QA receipt | Recompute the affected gates and strategy inputs. Require renewed approval for a material change to authorized inputs. Hold affected tasks where required. |

Show the same signal ID and Agent finding on Market Intelligence, Dashboard, the Activity Rail and the relevant decision. In Audit, link the signal and the pinned snapshot to the calculation or explicitly record that the signal was advisory. Group routine updates in the stream so decisions and exceptions remain easy to find.

## 7. Implementation and release checks

1. **Capture the original baseline.** Verify the legacy dark pages, charts, scroll behavior, scenario controls and autonomous actions against the reference. Record existing routes and store owners. Identify outdated assets and scripted events before replacing them.
2. **Unify navigation and mode state.** Implement the selector in the original topbar, register the order case in Scenarios, and route old links to existing pages. Establish one data and command contract. Verify Operations → Demo → Operations preserves the active field and approvals.
3. **Migrate the vertical slice.** Feed the original telemetry, risk, prescription, execution and audit views from the selected session. Run the order case through QA and inventory. Replace the two-field task details and generic activity lines with the same structured trace. Connect the fixed assistant to this session.
4. **Expand market coverage.** Build the six sections with shared original UI components. Validate source metadata and cross-page links with one advisory event and one decision-grade change before expanding coverage. Reuse the existing Gemini integration for source-grounded findings.
5. **Cut over and rehearse.** Verify that old timers and the separate workspace are outside the active route. Run all original routes at desktop and mobile widths and at reduced height. Build and run an end-to-end rehearsal with the configured Gemini key.

| Acceptance scenario | Required result |
| --- | --- |
| Operations loads first | The original Dashboard is the home page. Auto Loop starts the expected workflow. Demo remains available from the same topbar and Scenarios page. |
| Switch to the blueberry order | Navigation, color, charts and scroll layout stay consistent. The selected scenario drives the telemetry readings, risk rules, Agent records and affected order. |
| Baseline | The 750 kg order uses the same data in every page. 780 kg passes QA, 760 kg is accepted and 750 kg is reserved. Evidence reports the final 10 kg unreserved balance. |
| Exceptions | One-day delivery yields 300 kg capacity and a 450 kg modeled shortfall. A 700 kg QA receipt blocks reservation and records a 50 kg gap. Both conditions appear in the trace and audit. |
| External source changes | Relevant weather and news can open a review. A reference-price update leaves contractual economics and approvals intact. Failed feeds display their status and retain last confirmed evidence where available. |
| Agent trace | From a weather or pest signal, open the assigned task, source, rule, outcome and handoff. Follow the same event to the strategy, versioned approval, execution receipt and audit fingerprint. A blocked task shows the missing prerequisite and next owner. |
| Market depth and style | Every market section uses the original shell, chart styling and page width. Verify filtering, comparable price bases, synchronized timeline and event overlays, and consistent source references across Dashboard, Market, Prescription and Audit. |
| Fixed conversation | Open the assistant on each route, switch pages and ask about the current field or case. Verify the selected session, cited evidence, archive context, short-height scroll and mobile drawer. |
| Session protection | Switching, reloading and reopening archives does not copy approvals or receipts across sessions, duplicate execution, reset the previous run or start a second writer for the same session. |

Keep implementation in the existing repository. The acceptance artifact is one integrated workbench with a selectable operating scenario, source records and a repeatable walkthrough.
