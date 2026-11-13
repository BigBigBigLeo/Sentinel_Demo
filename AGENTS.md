# Sentinel Demo repository instructions

- Start with [README.md](README.md), then read [PRD.md](PRD.md) for product requirements and [DESIGN.md](DESIGN.md) for architecture. Use the [6.1 documentation index](docs/v6.1/README.md) to find the full specification and scenario data.
- Keep changes focused and preserve existing workspace routes and original scenario behavior when changing the 6.1 workflow. Reuse existing components, rules and fixtures where possible.
- Keep Operations, scenario and archived records scoped to their run. Validate authorization against the current revision and eligible plan on the server. Preserve existing receipts when late evidence changes the decision.
- Preserve source, date and units when introducing data. Keep public offers, forecasts, case assumptions and contractual prices distinct. Keep credentials in server environment variables.
- For runtime, scenario or evidence changes, run `node --test scripts/sentinel-6.1-data.test.mjs`. For frontend changes, also run `npm.cmd run build` on Windows. Use the [runbook](docs/Sentinel_Demo_Runbook.md) for browser checks when available. Record which checks passed and which remain pending.
- Update the owning document when a change alters product behavior, architecture, launch instructions or scenario expectations. Keep the root README as an index and quick start.
