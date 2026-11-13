# Sentinel 7.0 · 观衡智序 (Autonomous Operating Core)

> **把专业判断汇成经营方案，统筹农艺、合规、运营、销售与财务。**  
> *一个生产决定，牵动品质、交付与利润。*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](file:///scripts/sentinel-6.1-data.test.mjs)
[![Demo Version](https://img.shields.io/badge/version-7.0.0-blue)](file:///docs/v7.0/README.md)
[![Scale](https://img.shields.io/badge/scale-900--mu%20Plant%20Factory-emerald)](file:///docs/v7.0/FARM_BLUEPRINT_AND_OPERATOR_PERSONA_CN.md)
[![Design](https://img.shields.io/badge/design-Stitch%20%2B%20Palantir-cyan)](file:///docs/v7.0/DECISION_MATRIX_AND_INFORMATION_FLOW_SPEC_CN.md)

Sentinel (观衡智序 7.0) 是一套面向现代高价值设施农业超级工厂的自主经营决策操作系统。它基于**农业企业运行本体 (Enterprise Farm Ontology)**，将传感器、环境预测、商超订单、劳动力工班、气调冷库与农药合规规则全面图谱化，实现从**感知 (Perception) ➔ 决策 (Decision) ➔ 执行 (Execution) ➔ 验证 (Verification)** 的端到端工业级闭环。

---

## ⚡ 快速启动 (Quick Start)

### 本地快速运行 (Windows / macOS / Linux)

```powershell
# 1. 安装项目依赖
npm.cmd install

# 2. 一键启动 7.0 全功能系统 (含前端 Vite + Node 协同服务)
npm.cmd run demo
```

启动后在浏览器中打开：👉 **`http://localhost:4175`**  
*(纯前端热重载开发模式可运行 `npm.cmd run dev` 打开 `http://localhost:5173`)*

---

## 🌐 线上体验与公网参考 (Live Demo)

*   **Vercel 线上参考站点：** [https://sentinel-three-ashy.vercel.app/](https://sentinel-three-ashy.vercel.app/)
*   **中英文无缝切换：** 点击顶栏 `[EN]` / `[中文]` 按钮，即可在符合中国现代农业高管习惯的中文模式与纯正国际化英文模式间毫秒级切换。
*   **演示者 VIP 口令：** 在右侧 AI 助手抽屉输入口令（`sentinel2026`）即可解锁演示者模式，无限制提问。普通公网访客受到单会话 5 次提问与 5 秒冷却风控保护，防止 API 被滥用。

---

## 📚 7.0 核心文档与交付物矩阵 (7.0 Deliverables Matrix)

本版本已完备编制并归档了全套方案、RFP、生成运行指南、双语规范、安全防盗刷及农业机理知识库：

### 1. 战略规划与工程实施方案
| 核心文档 | 语言 | 内容概述 |
|---|---|---|
| [7.0 全域主控方案 (Master Plan CN)](docs/v7.0/SENTINEL_7.0_MASTER_PLAN_CN.md) | 中文 | 闭环四部曲、900亩园区设定、双轨自主运行逻辑、三大重大场景深度设计、Google Stitch 极简工业风格。 |
| [7.0 Master Plan (EN)](docs/v7.0/SENTINEL_7.0_MASTER_PLAN_EN.md) | English | Executive master plan in idiomatic professional English for international stakeholders. |
| [专家决策矩阵与信息流规范](docs/v7.0/DECISION_MATRIX_AND_INFORMATION_FLOW_SPEC_CN.md) | 中文 | 像素级 Hero 决策大屏：5大黄金KPI、6专家穿透抽屉、A/B/C 三列横向对比（含第二优选）、3道联锁门禁。 |
| [900亩超级工厂与经营者心智模型](docs/v7.0/FARM_BLUEPRINT_AND_OPERATOR_PERSONA_CN.md) | 中文 | 云南澄江 900 亩设施资产、100亩连栋大棚、50吨气调库、¥1,150万年OPEX、¥5,200~6,800万年产值账本与高管清晨五问。 |
| [双轨自主分级与日常微场景规范](docs/v7.0/AUTONOMY_LEVELS_SPEC_CN.md) | 中文 | L1~L5 自主权划分与 4 大黄色日常微场景（微湿通风、微灌、防风顺延、低密度巡查），平时 24/7 自动闭环执行。 |

### 2. 商务交付、演示与安全风控
| 交付文档 | 类型 | 内容概述 |
|---|---|---|
| [自闭环 Demo 架构与轻量化运行机制](docs/v7.0/SELF_CONTAINED_DEMO_ARCHITECTURE_CN.md) | 架构准则 | **核心定位规范**：100% 浏览器内自我形成闭环的高保真沙盘，零外部付费 API 依赖，零报错风险，零盗刷账单。 |
| [技术方案建议书 (Enterprise RFP)](docs/v7.0/SENTINEL_7.0_ENTERPRISE_RFP_SOLUTION_PROPOSAL_CN.md) | 采购/RFP | 面向园区与企业采购的高标准 RFP 技术方案：系统架构、规格清单、年创效 ¥400万~¥590万、ROI 回收期 <1.5年。 |
| [Demo 生成与部署指南 (Runbook)](docs/v7.0/HOW_TO_GENERATE_AND_DEPLOY_DEMO_CN.md) | 运维手册 | 本地依赖安装、构建打包、一键部署 Vercel、环境秘钥配置、现场 3 分钟高管演练 SOP。 |
| [公网防盗刷与防滥用方案](docs/v7.0/DEMO_ANTI_ABUSE_PLAN_CN.md) | 安全风控 | 普通访客单会话5次限额、5秒冷却、150字截断与严格农场范围锁死；演示者口令模式与每日 150 次硬熔断。 |
| [自有 Gemini Key 接入规范](docs/v7.0/GEMINI_KEY_SECURITY_AND_PROXY_SPEC_CN.md) | 安全代理 | Vercel Serverless 反向代理（零前端明文泄露）、Google 免费层 0 费用保护与离线确定性智能推演兜底。 |
| [双语国际化与行业术语规范](docs/v7.0/BILINGUAL_TERMINOLOGY_AND_LOCALE_SPEC.md) | 双语规范 | 符合中国农业工厂习惯的本土化语言（保留通用英文 PHI, Grade A, D+3, SLA, KA, FTE）。 |

### 3. 蓝莓农业机理与语料知识库
| 知识库专题 | 路径 | 核心内容 |
|---|---|---|
| **蓝莓全周期农学与病虫害模型全书** | [查看知识库](data/knowledge/blueberry-full-agronomy-pests-growth-models.md) | 优瑞卡/绿宝石生物学特性、全基质水肥配比、VPD 饱和水汽压差、灰霉病侵染动力学、蓟马有效积温模型、GB 2763 农药 PHI 数据库、采后气调冷链保鲜机理。 |
| **多智能体博弈辩论与问答语料库** | [查看知识库](data/knowledge/dialogue-scenarios-and-expert-corpora.md) | 高管晨会 7 角色现场激辩实录、精选双语高频决策问答（B与C权衡、A合规拦截、C胜出翻转）、越狱违规拦截范例。 |
| **三大重大场景双语数据集** | [查看数据集](docs/v7.0/scenarios.json) | 机器可读的双语场景库：05:40 虫害与 PHI 冲突、连续 36.5°C 极端热浪日灼危机、气调冷库故障 50kg 质检缺口重分配。 |

---

## 🧪 自动化测试与质量检验 (Verification)

工程内置严密的业务数据逻辑与构建自检脚本，确保随时处于 100% 可交付状态：

```powershell
# 运行业务数据一致性与分支回归测试 (5/5 绿灯)
node --test scripts/sentinel-6.1-data.test.mjs

# 运行前端生产环境构建与资源打包自检
npm.cmd run build
```

---

## 🏛️ 系统演进版本对照 (Version History)

*   **Sentinel 7.0 (Current):** 观衡智序 · 900 亩蓝莓超级工厂 · 双轨 24/7 自主运营与重大危机人机联锁最高决策 · Hero 专家决策大屏 · 双语国际化 · 防盗刷 Serverless 代理。
*   **Sentinel 6.1:** 统一蓝莓工作流，集成本地 Operations 动态时钟与基础事件流。
*   **Legacy V3.5:** 原始决策演练框架（`/workspace`）。

---

© 2026 Sentinel AgriAI Operating Core. All rights reserved. Confidential.