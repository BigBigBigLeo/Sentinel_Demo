# 观衡智序 (Sentinel 7.0) Demo 生成、本地启动与公网部署指南
# (How to Generate, Run & Deploy the Sentinel 7.0 Demo)

> **版本：** 7.0.0 · 演示与交付标准操作手册 (SOP)  
> **适用对象：** 演示者、售前解决方案专家、软件工程师与投资人  
> **线上参考：** [https://sentinel-three-ashy.vercel.app/](https://sentinel-three-ashy.vercel.app/)

---

## 一、 环境依赖准备 (Prerequisites)

在开始运行或构建 Demo 之前，请确认您的计算机已安装以下基础环境：
*   **Node.js：** `v18.0.0` 或更高版本（推荐 Node 20 LTS）；
*   **包管理工具：** `npm` (推荐) 或 `pnpm`；
*   **操作系统：** Windows 10/11、macOS 或 Linux；
*   **设计与研发基准：** 全面遵循 **Google Stitch (stitch.google.com)** 极简工业设计准则，并协同工程内置的专业 Skills（如 `frontend-design`, `web-artifacts-builder`, `theme-factory`）进行高保真、模块化与极致高效的敏捷开发。

---

## 二、 本地快速启动运行 (Local Quick Start)

### 2.1 极简双命令启动 (推荐)
在项目根目录下打开终端（Windows 推荐 PowerShell），执行：

```powershell
# 1. 安装项目依赖
npm.cmd install

# 2. 一键启动 7.0 统一全功能演示服务 (含 Node 后端 + 前端静态托管)
npm.cmd run demo
```
启动成功后，浏览器访问：  
👉 **`http://localhost:4175`**

### 2.2 纯前端极速热重载开发模式 (Vite Dev Server)
如果您在微调界面布局、Stitch 样式或组件文案：
```powershell
npm.cmd run dev
```
启动成功后，浏览器访问：  
👉 **`http://localhost:5173`** (支持微秒级热更新 HMR)

---

## 三、 配置自有 Gemini API Key 与演示口令 (可选)

系统设计了**“开箱即用 + 离线兜底”**机制，即使不配置任何 API Key，系统也能 100% 正常运行并展示高保真决策推演。如果您希望连接真实的 Gemini AI：

### 3.1 本地配置方式
在项目根目录新建一个 `.env.local` 文件（已被 `.gitignore` 保护，绝对不会误提交）：
```env
# Google Gemini 官方 API Key (支持 Gemini 2.0 Flash / 1.5 Flash)
GEMINI_API_KEY=AIzaSyYourPersonalGeminiApiKeyHere...

# VIP 演示者口令 (在右侧 AI 对话抽屉输入此口令，可解锁无限制无限次提问)
PRESENTER_PASSPHRASE=sentinel2026
```

---

## 四、 如何生成生产环境打包文件 (Production Build)

在终端执行：
```powershell
npm.cmd run build
```
*   构建工具将自动编译 JSX、打包 Tailwind/Stitch 工业样式表、生成最小化资源；
*   产物输出至根目录的 **`dist/`** 文件夹；
*   构建耗时通常在 8~18 秒之间，产物包含 `index.html` 以及 `dist/assets/` 下的优化静态文件。

---

## 五、 如何部署到 Vercel 公网 (Vercel Deployment)

本项目已完美适配 Vercel 自动化 CI/CD 流程：

### 5.1 代码推送到 GitHub 仓库
```powershell
git add .
git commit -m "feat(v7.0): Sentinel 7.0 Autonomous Operating Core release"
git push origin main
```

### 5.2 在 Vercel 控制台绑定与配置
1. 登录 [Vercel 官网 (vercel.com)](https://vercel.com)；
2. 关联导入您的 GitHub 仓库 `Sentinel_Demo`；
3. Framework Preset 选择 **Vite**，Build Command 保持默认 `npm run build`，Output Directory 保持默认 `dist`；
4. **配置环境变量（关键安全步）：**
   * 进入 **Project Settings** ➔ **Environment Variables**；
   * 添加 `GEMINI_API_KEY` = 您的实际秘钥；
   * 添加 `PRESENTER_PASSPHRASE` = 您的 VIP 演示口令（如 `sentinel2026`）；
5. 点击 **Deploy**，大约 45 秒内即可完成全球 CDN 部署！
   * 公网线上访问地址形如：`https://your-project-name.vercel.app/`

---

## 六、 自动化测试与自检命令 (Verification Gates)

在交付或演示前，建议运行以下两道自动化检验命令，确保数据与逻辑零差错：

```powershell
# 1. 运行核心业务数据逻辑与一致性回归测试 (5/5 应全部绿灯通过)
node --test scripts/sentinel-6.1-data.test.mjs

# 2. 运行前端构建语法与资源引用检查 (应 0 错误 Exit Code 0)
npm.cmd run build
```

---

## 七、 现场 3 分钟高管演练与汇报标准 SOP (Presentation SOP)

按照以下 6 步节奏向高管或客户展示，效果最为震撼：

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 现场演练 6 步标准操作规程 (3-Minute Presentation SOP)                                   │
│                                                                                        │
│ 步骤 1: 亮相首页 (Dashboard)                                                           │
│  • 展示 900 亩高科技蓝莓超级工厂区位与资产全貌 (云南澄江抚仙湖畔，¥6,500万资产)       │
│  • 切换顶栏 [EN] / [中文]，展示无缝双语与专业中国农业语言风格                         │
│                                                                                        │
│ 步骤 2: 展示常态自主闭环 (Track 1)                                                     │
│  • 指向右侧实时动态流 (Activity Rail)，解释午后微湿对流排风、基质水分微灌等黄色微扰动 │
│  • 强调：“小事 AI 自行闭环执行，不惊扰老板和决策层”                                   │
│                                                                                        │
│ 步骤 3: 触发重大危机场景 (Track 2)                                                     │
│  • 在顶栏或导航点击加载“重大场景 1: 05:40 虫害预警与 750kg 履约冲突”                 │
│  • 全局瞬间爆出重点红色高危警报，点击跳转至 `/prescription` 处方中心                    │
│                                                                                        │
│ 步骤 4: 震撼呈现 Hero 专家决策大屏                                                     │
│  • 首屏 30 秒看懂全局：5大黄金KPI仪表盘 + 6位专家共识徽章 + 三套候选方案横向对比       │
│  • 点击“农艺专家”或“合规官”徽章，滑出抽屉查看微距图像真实分析与 GB 2763 法规条款      │
│                                                                                        │
│ 步骤 5: 展现高阶博弈与第二优选 (拒绝非黑即白)                                          │
│  • 点击【方案 A】：下方合规门禁立刻亮红（14天 PHI 超标），主按钮闭锁，展现合规熔断；   │
│  • 选中【方案 B】(当前首选，净利 ¥35k 最高) 与【方案 C】(强力第二优选，零用药纯生态)； │
│  • 点击 [Simulate Boundary Conditions] 模拟“无人机突发故障”，观众亲眼目睹方案 C 瞬间  │
│    翻转为 [✔ CURRENT LEAD]，直观体现 AI 综合权衡的商业智慧！                           │
│                                                                                        │
│ 步骤 6: 联锁授权与闭环派发                                                             │
│  • 三道门禁全绿，点击 [⚡ AUTHORIZE DISPATCH (INTERLOCKED)]，微秒级开锁生成加密存证单号 │
│  • 平滑跳转至 `/execution`，展现农机、采摘工班与冷库工单全自动下发与执行追踪！        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 八、 高效研发利器：利用 Google Stitch 与 Antigravity Skills 进行极致敏捷迭代

为了在最短时间内高质量生成、微调或扩充 Demo 的界面与场景逻辑，项目全面支持并推荐采用 **Google Stitch** 与 **Antigravity Skills** 协同工作流：

### 8.1 借助 Google Stitch (stitch.google.com) 快速生成高保真工业原型
1. **设计生成理念：**
   * Google Stitch 支持从自然语言需求直接输出高度规整、色彩克制、符合现代工业人机工程学的 UI 组件。
   * **Sentinel 7.0 色彩体系规范：**
     - 底色：深曜石黑背景 (`#090d16` / `#0f172a`)
     - 首选状态：高科技祖母绿 (`#00e5a3` / `#10b981`)
     - 重点高亮：科技天蓝 (`#38bdf8`)
     - 警示备选：琥珀暖金 (`#f59e0b` / `#fbbf24`)
     - 风险阻断：绯红熔断 (`#ef4444`)
2. **多终端响应式自适应 Prompt 模板 (Stitch 适用)：**
   > *"Generate a mission-critical agricultural operating decision matrix for a 900-mu smart blueberry facility. Include 5 gold KPIs at the top, a horizontal row of 6 domain specialists with status pills, a 3-column strategy comparison (Plan A Blocked, Plan B Lead, Plan C Runner-up), and 3 interlocked compliance gates. Must be responsive: 3-column layout on PC (>1280px), swipeable container on iPad (768px-1024px), and segmented plan tabs on iPhone (<768px). Use dark industrial theme with high-contrast status colors."*

### 8.2 协同 Antigravity Skills 模块化高效开发
在开发环境中，可组合调用内置专业 Skills：
*   **`frontend-design`**：负责将 Stitch 生成的原型转化为生产级 React 组件，摆脱千篇一律的通用 AI 塑料感，打造沉浸式数字农业指挥舱质感；
*   **`web-artifacts-builder`**：负责复杂交互组件（如策略动态翻转、密码学签名生成、实时滑动开关）的独立沙盒构建与快速验证；
*   **`theme-factory`**：统一调优多端暗色/明色对比度，确保在强光户外（农田现场平板）与昏暗监控室均具备出色的可读性；
*   **`workflow-skill-creator` / `skill-creator`**：将多步骤调试与自动化检测封装为定制化 Skill，实现开发流水线的一键复用。

### 8.3 10x 极速闭环开发工作流
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  业务/农艺需求  │ ────> │  Google Stitch  │ ────> │ Antigravity     │ ────> │ 自动化测试与    │
│  (900亩蓝莓厂)  │       │  快速视觉原型   │       │ Skills 组装落地 │       │ 100%闭环上线    │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```
遵循此规范，新场景、新农作物（如牛油果、草莓、温室番茄）或新决策矩阵的开发与落地可缩短至数小时内完成！
