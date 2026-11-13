# Sentinel Demo 6.1.0

This is the starting point for the 6.1 release. The existing application and Node service are the implementation base.

Start at the [root README](../../README.md) for the PRD, design and repository instructions.

| File | Purpose |
| --- | --- |
| [主控方案 (Master Plan)](SENTINEL_6.1_MASTER_PLAN_CN.md) | 纯蓝莓端到端闭环、决策矩阵整合、全站数据流与 Gemini AI Harness 主控升级方案。 |
| [项目总览与交接](PROJECT_BRIEF_CN.md) | Background, user requirements, business logic, repository structure and actual delivery status. |
| [6.1 workspace and ontology plan](Sentinel_Demo_6.1.0_Workspace_and_Ontology_Plan_EN.md) | Design, build steps, acceptance criteria and original UI preservation. Start with Section 6. |
| [Scenario manifest](scenarios.json) | The six original scenarios and the blueberry order exercise, with source pointers, branch overrides and expected outcomes. |
| [Runbook](../Sentinel_Demo_Runbook.md) | Commands for the current application and the planned 6.1 walkthrough and checks. |
| [Starter knowledge catalog](../../data/sentinel-knowledge.json) | Server-side knowledge candidates and their provenance. Entries marked draft need review before retrieval. |
| [Source snapshot](../../data/sentinel-source-snapshot.json) | Dated public price offer and the official 2026 calendar. |
| [Blueberry fixture](../../src/data/sentinel-6.1-fixture.js) | Seeded telemetry, case economics, lots and receipt assumptions for the 6.1 runtime to consume. |
| [Data check](../../scripts/sentinel-6.1-data.test.mjs) | Run `node --test scripts/sentinel-6.1-data.test.mjs` from the repository root. |

The shared service now persists a seeded Operations heartbeat and the 6.1 blueberry exercise. Start from Scenarios in the original workspace and follow the order through Prescription, Execution, Audit and History. The six original scenarios still use their existing runner. Full release acceptance remains tracked in Section 6.
