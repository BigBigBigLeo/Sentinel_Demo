# Sentinel Demo Runbook

## 6.1 implementation and rehearsal

Start from the [6.1 release index](v6.1/README.md) and follow the build sequence in Section 6 of the plan. Check the starter inputs from the repository root:

```powershell
node --test scripts/sentinel-6.1-data.test.mjs
```

Run `npm run demo` to build and start the current app. Dashboard shows the server-side check for the seeded BS-B3 telemetry. The server checks once per minute and stores its cursor in the sibling `.operations` file next to the case state. Market Intelligence displays the dated offer and holiday snapshot. Open Scenarios to compare the 6.1 order branches without changing the current run. In the early-QA branch no plan leads; in the late-QA branch Plan B leads at planning and full release faces a 50 kg gap.

A threshold crossing in the seeded Operations feed can open a review without starting a scenario. Open Risk for the linked observation, then follow its order workflow. Scenario runs can temporarily take focus while Operations keeps its own record and clock.

From Scenarios, select a branch and choose **Start order scenario**. The original Prescription page opens with the plan comparison. Authorize the eligible plan, then follow the links to Execution and Audit. Execution provides Pause, Resume and Step to next receipt while work is in progress. Export the evidence from Audit, then archive the run and reopen it from History. Farm Business shows the order terms and recorded quantities. A late QA receipt blocks release and records a new revision. The seeded Operations heartbeat continues independently. Use Ask Sentinel on an order page to query that run when the server has a configured Gemini key. The original six scenarios still use their existing runner.

## Legacy V3.5 order demo

The same `npm run demo` command serves both versions. Open http://127.0.0.1:4175/workspace for the legacy order demo. For frontend development, run `npm run demo:serve` and `npm run dev` in separate terminals. The service advances the simulation clock while it runs, including when every browser tab is closed. In the system temporary directory under `sentinel-demo-v351`, the legacy demo uses `state.json` and the 6.1 workflow uses `state.json.operations`. Pass `--store=PATH` to `npm run demo:serve --` to give a separate service instance its own pair of files. Use a distinct `--port` if another instance is running.

## Presentation

1. The root URL opens the operations Dashboard. For the legacy order workspace, open `http://127.0.0.1:4175/workspace` directly. The 05:40 event appears about 11 seconds after a fresh run. Follow the source and specialist findings in System activity. **Exit Demo** returns to the Dashboard.
2. Open Farm Context and follow the South block alert, crop lots, harvest allocation and 750 kg order.
3. Open Decision Room. The baseline recommends Plan B. Inspect a blocked strategy and expand a specialist finding. Approve Plan B as the demo farm manager.
4. Open Execution. The service completes the simulated tasks in sequence. Open Evidence to see 780 kg QA-cleared, 760 kg accepted, 750 kg reserved and the execution fingerprint.
5. To rehearse the exception, reset in Settings and choose the 700 kg QA receipt before approving. Evidence will record a 50 kg shortfall and zero reserved. Reset again to run the one-day or 15-picker what-if from Decision Room.

History retains the last 20 reset runs. Open a run to review its recorded evidence and export JSON. Archived records are read-only. The demo is a single local simulation with a simulated manager identity.

Use **Ask Sentinel** for a conversation grounded in the current field or selected order run. The terminal that starts Sentinel must supply `GEMINI_API_KEY`. Market Intelligence shows cached regional weather and agriculture news when their providers respond. The price card uses the order case's reference values.

## Data dictionary

Generate a standalone JSON copy with `node scripts/sentinel-demo.mjs --fixture > sentinel-fixture.json`. The runtime uses the same generator. Business fixture values are fixed, and the seed only varies supporting temperature readings.

| Data | Source and units |
| --- | --- |
| Farm, order and alert | Shenzhen V3.5 presentation inputs. 20 mu, 750 kg Grade A, three days, 25 pickers and 05:40 local time |
| Lot quantities, crew rate and QA | Synthetic assumptions. Kilograms, 12 kg per picker-day, simulated baseline and shortfall receipts |
| Telemetry | Seed 35. Hourly reference profile in °C and relative humidity percent |
| Rule checks and contribution | Computed from allocated lots, usable days and labor capacity. Simulated safety window. Contribution is capped eligible order volume × RMB 45/kg minus modeled strategy cost |
| Events and receipts | UTC epoch milliseconds, displayed in Asia/Shanghai. Service heartbeat uses wall-clock time |

The first release uses synthetic sources, role findings, and receipts. The rules and figures support the presentation and require agronomy review before real operational use. The service binds to localhost. A production deployment would require an independently hosted worker, durable storage and authenticated roles.
