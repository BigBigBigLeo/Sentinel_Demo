# Sentinel 7.0 观衡智序 · 全域交付文档与规范索引 (Documentation Index)

欢迎查阅 Sentinel 7.0 (Autonomous Operating Core · 观衡智序) 完整规划、RFP建议书、部署指南与农业知识库全集。

---

## 一、 核心规划与商务技术文档 (Core Specifications & RFP)

| 规范文档 (Document) | 语言/类型 | 核心内容与业务定位 (Purpose & Scope) |
|---|---|---|
| [7.0 主控方案 (Master Plan CN)](SENTINEL_7.0_MASTER_PLAN_CN.md) | 中文方案 | 核心主规划：演讲闭环叙事、900亩农业工厂基准、双轨运行逻辑、三大重大场景深度设计、Google Stitch 极简工业风格、确定性物理引擎与真实 Gemini AI 边界划分。 |
| [7.0 Master Plan (EN)](SENTINEL_7.0_MASTER_PLAN_EN.md) | English | Executive master plan in idiomatic professional English for international audiences and stakeholders. |
| [技术方案建议书 (Enterprise RFP)](SENTINEL_7.0_ENTERPRISE_RFP_SOLUTION_PROPOSAL_CN.md) | 商务/采购 | 面向现代农业产业园与企业采购的标准技术方案建议书：痛点破局、五层架构、功能清单、年创效 ¥400万~¥590万精算、投资回收期 <1.5年。 |
| [Demo 生成、本地运行与部署指南](HOW_TO_GENERATE_AND_DEPLOY_DEMO_CN.md) | 运维手册 | 极简双命令本地启动 (`npm run demo`)、Vercel 自动化部署、环境变量安全注入、现场 3 分钟高管汇报演练 SOP。 |
| [双语国际化与行业术语规范](BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md) | 双语对照 | 顶栏无缝一键切换机制（`[EN]` / `[中文]`）、符合中国高科技农业工厂与企业高管习惯的中文专业术语、保留通用英文专业缩写（PHI, Grade A, D+3, SLA, KA, FTE, EC/pH）。 |
| [专家共识决策矩阵与动态信息流规范](DECISION_MATRIX_AND_INFORMATION_FLOW_SPEC_CN.md) | 中文规范 | 对齐上传截图的像素级 Hero 决策大屏规范：5大黄金KPI、6位专家具名穿透抽屉、A/B/C 三列横向对比（含强力第二优选与胜出条件）、3道联锁硬门禁、极端工况推演与一键加密联锁授权。 |
| [900亩蓝莓超级工厂与经营者心智模型](FARM_BLUEPRINT_AND_OPERATOR_PERSONA_CN.md) | 中文基准 | 云南澄江抚仙湖北岸 900 亩设施园区资产、100亩连栋大棚、50吨级气调冷库群、¥6,500万投资、¥1,150万年OPEX、¥5,200~6,800万年产值账本与经营者清晨五问。 |
| [自主运行分级与 24/7 日常微场景规范](AUTONOMY_LEVELS_SPEC_CN.md) | 中文规范 | L1~L5 自主权划分与 4 大真实科学的日常黄色微场景（午后微湿通风、基质微亏微灌、阵风无人机延期、诱虫板低密度巡查标记），未开启场景时 24/7 自动闭环执行，不打扰管理层。 |
| [公网 Demo 网站防滥用与口令模式规范](DEMO_ANTI_ABUSE_PLAN_CN.md) | 安全风控 | 针对公网 Demo 网站的精细化风控：普通访客单会话5次额度限制、5秒提问冷却、150字输入截断与严格农场范围锁死；演示者 VIP 口令解锁无限制提问模式。 |
| [自有 Gemini Key 接入与防盗刷安全规范](GEMINI_KEY_SECURITY_AND_PROXY_SPEC_CN.md) | 安全代理 | 五重立体安全架构：服务端反向代理（零前端明文）、IP级频控（3秒冷却/6次分）、每日300次硬熔断、免费额度与预算保护、离线确定性智能推演兜底。 |
| [三大重大场景双语数据定义 (scenarios.json)](scenarios.json) | JSON (双语) | 机器可读的双语场景库：05:40 虫害与 PHI 冲突、连续 36.5°C 极端热浪日灼危机、气调冷库故障 50kg 质检缺口重分配。 |
| [自闭环 Demo 架构与轻量化运行机制](SELF_CONTAINED_DEMO_ARCHITECTURE_CN.md) | 架构准则 | 核心原则阐述：纯前端自成闭环、零外部 API 依赖、时钟/感知/决策/执行全链路自运转、零白屏报错、零 API 账单风险。 |

---

## 二、 支撑数据与专业知识库专题 (Knowledge Bases & Corpora)

| 知识库专题 | 路径 | 核心内容与业务价值 |
|---|---|---|
| **蓝莓全周期农学与病虫害模型全书** | [blueberry-full-agronomy-pests-growth-models.md](../../data/knowledge/blueberry-full-agronomy-pests-growth-models.md) | 优瑞卡/绿宝石生物学特性、全基质水肥动力学、VPD 饱和水汽压差、灰霉病侵染动力学 (BIM 模型)、西花蓟马有效积温模型、GB 2763 农药安全采收期 (PHI) 数据库、采后气调冷库呼吸跃变与果粉保护机理。 |
| **多智能体专家博弈与双语问答语料库** | [dialogue-scenarios-and-expert-corpora.md](../../data/knowledge/dialogue-scenarios-and-expert-corpora.md) | 高管晨会 7 角色现场激辩实录、精选双语高频决策问答（B与C权衡、A合规拦截、C胜出翻转）、越狱违规拦截范例。 |
| **蓝莓基础农学知识库** | [blueberry-agronomy.md](../../data/knowledge/blueberry-agronomy.md) | 品种（优瑞卡/绿宝石）、温湿度基准、灰霉病侵染动力学、高温日灼与果粉保护机理。 |
| **农残法规与 PHI 规则库** | [compliance-phi-rules.md](../../data/knowledge/compliance-phi-rules.md) | 国家标准 GB 2763 食品农残限量、绿色食品农药清单、代森锰锌 14天 PHI vs 哈茨木霉菌 0天 PHI。 |
| **市场定价与商业违约逻辑** | [market-pricing-logic.md](../../data/knowledge/market-pricing-logic.md) | 盒马直供协议（¥65/kg）、一级批发（¥54/kg）、私域现货（¥100~120/kg）、违约罚金与边际贡献精算公式。 |
| **农业企业运行本体规范** | [farm-ontology-spec.md](../../data/knowledge/farm-ontology-spec.md) | 传感器、地块、批次、工班、冷库与订单的全域实体血缘与因果图谱。 |

---

## 三、 质量验证基准 (Verification & Quality Gates)

*   **数据一致性测试：** `node --test scripts/sentinel-6.1-data.test.mjs`（5/5 测试持续绿灯）
*   **工程构建检验：** `npm run build`（0 错误构建通过）
*   **线上参考原型：** [https://sentinel-three-ashy.vercel.app/](https://sentinel-three-ashy.vercel.app/)