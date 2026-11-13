# Sentinel Demo 6.1 设计与架构

## 页面与交互

保留原版深色工作台。Dashboard 展示运行状态和关注事项，Risk 展示观察与风险证据，Prescription 比较方案并承接授权，Execution 跟踪工单和回执，Audit 核验并导出，History 回看归档。Sensor Telemetry、Market Intelligence 和 Farm Business 提供详细信息。Scenarios 用于启动可重复演练。Ask Sentinel 从当前页面和订单记录获取上下文。

## 运行与数据

| 模块 | 当前入口和职责 |
| --- | --- |
| 前端 | [App](src/App.jsx)、[Layout](src/components/Layout.jsx)、[订单与 AI 面板](src/demo/Operations.jsx)负责路由、工作台和跨页订单流程。 |
| 服务 | [Node 入口](scripts/sentinel-demo.mjs)提供静态页面、运营、场景、订单、情报与对话接口。 |
| 运行层 | [运行模块](scripts/sentinel-runtime.mjs)推进服务端监测与蓝莓订单、持久化状态、校验命令并保存证据。 |
| 规则 | [蓝莓方案比较](src/demo/scenario.js)计算约束、产能、可交付量和贡献。[原版六场景](src/engine/scenarioEngine.js)仍使用原有运行器。 |
| 数据 | [案例数据](src/data/sentinel-6.1-fixture.js)支持回放。[公开来源快照](data/sentinel-source-snapshot.json)提供带日期的市场和日历记录。[知识目录](data/sentinel-knowledge.json)标记来源与审核状态。 |

主链路为 **观测 → 风险复核 → 方案与授权 → 工单和回执 → 审计**。Farm Ontology 将地块、批次、订单、资源和证据关联。运营、场景及归档以运行 ID 区分。授权关联当前版本和选中方案。晚到质检可以产生新版本，历史授权仍可追查。价格、产能与预留量使用共享计算口径。AI 为分析提供解释与证据入口，状态变更沿服务端命令处理。

具体页面布局见[主方案](docs/v6.1/Sentinel_Demo_6.1.0_Workspace_and_Ontology_Plan_EN.md) §2–4、§8–9，运行与数据见 §7，Gemini 和知识库见 §10–11。以[交接总览](docs/v6.1/PROJECT_BRIEF_CN.md)查看实现和待验收项。
