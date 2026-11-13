# 农场本体论与数字血缘规范 (Farm Ontology & Digital Lineage Specification)

## 1. 核心实体定义 (Entity Definitions)
在 Sentinel 中，现实物理世界通过 5 类核心实体构成数字孪生体（Ontology）：

1. **传感器/感知端点 (Sensor/Endpoint)：**
   - 标识：`#TRAP-S02`（南区2号智能捕虫板）、`#T-03`（温度传感器）、`#H-03`（湿度传感器）、`#LW-01`（叶面湿度仪）。
2. **地理地块 (Field/Plot)：**
   - 标识：`South Block B3`（蓝莓南区B3温室棚群，种植面积 5 亩，植株 3,200 株）。
3. **农产品批次 (Crop Lot)：**
   - 标识：
     - `#LOT-01`：420 kg，Grade A，感官质检合格，未受灰霉病波及。
     - `#LOT-02`：360 kg，Grade A，感官质检合格，未受灰霉病波及。
     - `#LOT-03`：120 kg，Grade B/待定，处于 TRAP-S02 邻近区域，检出初期病斑，已物理隔离。
4. **作业资源 (Labor & Asset Resource)：**
   - 标识：
     - `#CREW-25`：采摘一班（25名熟练工人，日采摘产能 12 kg/人/天 = 300 kg/天，3天累计理论产能 900 kg）。
     - `#COLD-ROOM-02`：1号气调保鲜库（设定温度 0~2°C，预留 800 kg 库容）。
     - `#DRONE-01`：精准对靶喷雾无人机（配载哈茨木霉菌剂）。
5. **商业订单 (Customer Contract & Order)：**
   - 标识：`#BB-ORDER-750-001`（盒马鲜生直供合同，交付量 750 kg，等级 Grade A，单价 ¥65/kg，交付期限 D+3）。

## 2. 闭环因果证据链 (The Closed Causal Chain)
当外部或现场发生扰动时，数据在实体之间形成双向溯源链条：

```
[传感器异常] TRAP-S02 虫情暴增至 14.8只 + H-03 湿度 88.2%
       ↓ (物理归因)
[地块受损] South Block B3 (灰霉病风险评分 68/100)
       ↓ (物料分割)
[批次隔离] LOT-03 (120kg 染病隔离) vs LOT-01/02 (780kg 合格待放行)
       ↓ (产能匹配)
[资源调度] CREW-25 (25名工人连续3天作业，确保 750kg 采收出库)
       ↓ (商业闭环)
[订单履约] BB-ORDER-750-001 (750kg 交付合格，总收入 ¥48,750 锁定)
```

## 3. 关联抽屉 (Related Records Drawer) 的响应行为
- 用户在任何页面点击任何带有 `#` 的实体标签，系统均立即呼出关联记录抽屉，展示：
  - 该实体的上游触发源头（Upstream Provenance）。
  - 该实体的下游波及对象（Downstream Impact）。
  - 该实体当前参与计算的决策版本（Revision ID）。
  - 一键跳转至对应详查页面（如跳转至 `/sensors`, `/business`, `/prescription`）。
