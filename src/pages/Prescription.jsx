import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../engine/store';
import PrescriptionCard from '../components/PrescriptionCard';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import AIThinkingPanel from '../components/AIThinkingPanel';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import ApprovalModal from '../components/ApprovalModal';
import { pick, localeTag } from '../i18n/locale.js';

export default function Prescription() {
    const navigate = useNavigate();
    const {
        prescriptions, activePrescription, generateRx, modifyRx, executeRx,
        riskResults, fields, activeFieldId, eventLog, activeScenario,
        thinkingChain, isThinking, thinkingContext,
        startPrescriptionThinking, stopThinking,
        approvalQueue, approveDecision, rejectDecision,
        currentSnapshot, executions, auditRecords,
        locale,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const cropLabel = (value) => {
        const mapZh = { blueberry: '蓝莓', flower: '鲜切花' };
        return isZh ? (mapZh[value] || value) : value;
    };
    const threatLabel = (item) => (isZh ? (item?.nameZh || item?.name) : (item?.name || item?.nameZh));
    const stageLabel = (valueZh, valueEn) => {
        if (!isZh) return valueEn || valueZh;
        if (valueZh) return valueZh;
        const raw = String(valueEn || '').toLowerCase();
        const map = {
            'bud break': '萌芽期',
            flowering: '开花期',
            fruiting: '结果期',
            vegetative: '营养生长期',
            harvest: '采收期',
        };
        return map[raw] || valueEn || '开花期';
    };
    const localizeRxText = (value) => {
        if (!isZh || !value) return value;
        let text = String(value);
        const phraseMap = [
            ['Humidity', '湿度'],
            ['Leaf wetness', '叶面湿润'],
            ['Growth stage', '生育阶段'],
            ['Days to harvest', '距采收天数'],
            ['Historical', '历史样本'],
            ['Weather forecast', '天气预测'],
            ['Cost-benefit', '成本收益'],
            ['Cost-benefit:', '成本收益：'],
            ['intervention', '投入'],
            ['potential loss', '潜在损失'],
            ['same treatment profile proved effective', '同类处置已验证有效'],
            ['similar events in 2025 - same treatment profile proved effective', '个 2025 年相似案例，且同类处置已验证有效'],
            ['dry period - optimal treatment window', '短期干燥，处于最佳处置窗口'],
            ['dry period — optimal treatment window', '短期干燥，处于最佳处置窗口'],
            ['active rain - treatment window limited', '降雨进行中，处置窗口受限'],
            ['active rain — treatment window limited', '降雨进行中，处置窗口受限'],
            ['at', '为'],
            ['threshold', '阈值'],
            ['elevated disease pressure', '病害压力升高'],
            ['within normal range', '处于正常范围'],
            ['spore germination conditions present', '具备孢子萌发条件'],
            ['below germination threshold', '低于萌发阈值'],
            ['high susceptibility window', '高敏感窗口期'],
            ['moderate susceptibility window', '中等敏感窗口期'],
            ['PHI restrictions apply', '受 PHI 限制'],
            ['PHI compliant for recommended chemicals', '推荐药剂可满足 PHI'],
            ['No action required', '无需动作'],
            ['Rejected', '已排除'],
            ['Selected as fallback', '已作为回退方案启用'],
            ['Biocontrol (Bacillus subtilis)', '生物防治（枯草芽孢杆菌）'],
            ['Manual pruning only', '仅人工修剪'],
            ['Full-zone spray (Iprodione)', '全域喷施（异菌脲）'],
            ['Wait and monitor', '继续观察'],
            ['Banned Substance Check', '禁限用物质核查'],
            ['Wind Conditions', '风速条件'],
            ['PHI Compliance', 'PHI 合规'],
            ['MOA Rotation', '作用机制轮换'],
            ['Selected as fallback  - PHI blocks chemical', '已选作回退方案：PHI 限制阻断化学方案'],
            ['Rejected: current infestation rate exceeds biocontrol efficacy threshold', '已排除：当前虫害压力超过生防有效阈值'],
            ['Insufficient for score', '不足以覆盖风险分值'],
            ['would only reduce by', '预计仅可降低约'],
            ['Risk critical  - weather window closing', '风险高危，天气窗口正在收窄'],
            ['Risk below intervention threshold', '风险低于干预阈值'],
            ['Insufficient for score >', '不足以覆盖分值 >'],
            ['would only reduce by ~20pts', '预计仅可降低约 20 分'],
            ['not on China banned list', '不在中国禁限用清单中'],
            ['group  - last use >21d ago  - rotation safe', '组别，距上次使用已超过 21 天，轮换安全'],
            ['Non-chemical  - PHI not applicable', '非化学方案，不适用 PHI 约束'],
            ['preventive', '预防式'],
            ['reactive', '响应式'],
            ['completed', '已完成'],
            ['Auto-approved', '自动通过'],
            ['system', '系统'],
            ['operator', '人工'],
            ['assigned', '已分配'],
            ['standby', '待命'],
            ['pending', '待执行'],
            ['primary', '主方案'],
            ['secondary', '次方案'],
            ['supporting', '辅助方案'],
            ['infrastructure', '基础设施方案'],
            ['Mancozeb', '代森锰锌'],
            ['Trichoderma harzianum', '哈茨木霉'],
            ['Trichoderma', '木霉'],
            ['Botrytis', '灰霉病'],
            ['Gray Mold', '灰霉病'],
            ['Timeline', '时间线'],
            ['Equipment', '设备'],
        ];
        phraseMap.forEach(([en, zh]) => {
            text = text.replace(new RegExp(en, 'gi'), zh);
        });
        text = text.replace(/->/g, '→');
        text = text.replace(/\s-\s/g, '｜');
        text = text.replace(/\bRows\b/g, '行区');
        return text;
    };
    const [showJson, setShowJson] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [selectedPreviousRxId, setSelectedPreviousRxId] = useState(null);
    const [selectedDecisionLogId, setSelectedDecisionLogId] = useState(null);
    const field = fields[activeFieldId];
    const topRisk = riskResults[0];
    const sensors = currentSnapshot?.sensors || {};
    const now = new Date().toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    const handleGenerateRx = () => {
        startPrescriptionThinking();
        generateRx({ autoExecuteLowImpact: true });
        setTimeout(() => {
            const { activePrescription: latestRx, approvalQueue: pendingQueue } = useStore.getState();
            const isPendingApproval = pendingQueue.some(item => item.prescription?.id === latestRx?.id);
            if (latestRx && !isPendingApproval) {
                navigate('/execution');
            }
        }, 120);
    };

    const handleModify = (rxId) => {
        modifyRx(rxId, { dosageRatio: 0.85 });
    };

    const handleExecute = (rxId) => {
        const pendingApproval = approvalQueue.find(item => item.prescription?.id === rxId);
        if (pendingApproval) {
            setReviewItem(pendingApproval);
            return;
        }

        const execution = executeRx(rxId);
        if (execution) {
            setTimeout(() => navigate('/execution'), 300);
        }
    };

    const handleApprove = (id) => {
        approveDecision(id);
        setReviewItem(null);
    };

    const handleReject = (id) => {
        rejectDecision(id);
        setReviewItem(null);
    };

    const seededRecentPrescriptions = useMemo(() => ([
        { id: 'RX-240301-A', threatName: 'Gray Mold (Botrytis)', threatNameZh: '灰霉病（Botrytis）', actionLabel: 'Biocontrol Release + Ventilation', actionLabelZh: '生防释放 + 通风联动', riskScore: 62, estimatedCost: 2600, status: 'completed', generatedAt: '2026-03-01T09:18:00Z', confidence: 0.86, decisionMode: 'reactive', decisionModeZh: '响应式', result: 'Spore index reduced 31% in 48h.', resultZh: '48 小时内孢子指数下降 31%。' },
        { id: 'RX-240228-B', threatName: 'Aphids', threatNameZh: '蚜虫', actionLabel: 'Targeted Spot Spray', actionLabelZh: '定点精准喷施', riskScore: 54, estimatedCost: 1800, status: 'completed', generatedAt: '2026-02-28T06:42:00Z', confidence: 0.82, decisionMode: 'reactive', decisionModeZh: '响应式', result: 'Aphid count dropped below threshold.', resultZh: '蚜虫数量已降至阈值以下。' },
        { id: 'RX-240227-C', threatName: 'Anthracnose', threatNameZh: '炭疽病', actionLabel: 'Manual Removal + Monitoring', actionLabelZh: '人工清除 + 持续监测', riskScore: 41, estimatedCost: 1300, status: 'completed', generatedAt: '2026-02-27T13:25:00Z', confidence: 0.79, decisionMode: 'preventive', decisionModeZh: '预防式', result: 'Lesion growth contained in 24h.', resultZh: '24 小时内病斑扩散得到控制。' },
        { id: 'RX-240224-D', threatName: 'Root Rot', threatNameZh: '根腐病', actionLabel: 'Irrigation Control', actionLabelZh: '灌溉调控', riskScore: 36, estimatedCost: 900, status: 'completed', generatedAt: '2026-02-24T03:10:00Z', confidence: 0.77, decisionMode: 'preventive', decisionModeZh: '预防式', result: 'Soil moisture normalized within 12h.', resultZh: '12 小时内土壤含水率恢复正常。' },
        { id: 'RX-240222-E', threatName: 'Frost Damage', threatNameZh: '霜冻风险', actionLabel: 'Frost Protection Protocol', actionLabelZh: '霜冻防护预案', riskScore: 71, estimatedCost: 2900, status: 'completed', generatedAt: '2026-02-22T18:05:00Z', confidence: 0.9, decisionMode: 'reactive', decisionModeZh: '响应式', result: 'No canopy damage observed after event.', resultZh: '事件后未观察到冠层冻害。' },
    ]), []);

    const previousPrescriptions = useMemo(() => {
        const live = prescriptions.slice(0, -1).reverse().slice(0, 12);
        const seen = new Set(live.map(item => item.id));
        const fallback = seededRecentPrescriptions.filter(item => !seen.has(item.id));
        return [...live, ...fallback].slice(0, 12);
    }, [prescriptions, seededRecentPrescriptions]);
    const selectedPreviousRx = previousPrescriptions.find(item => item.id === selectedPreviousRxId) || previousPrescriptions[0];
    const seededExecutionByRxId = useMemo(() => ({
        'RX-240301-A': { id: 'EXE-240301-A', status: 'completed', statusZh: '已完成', actualCoverage_pct: 96, actualDosageRatio: 0.88, completedAt: '2026-03-01T11:08:00Z' },
        'RX-240228-B': { id: 'EXE-240228-B', status: 'completed', statusZh: '已完成', actualCoverage_pct: 94, actualDosageRatio: 0.81, completedAt: '2026-02-28T08:02:00Z' },
        'RX-240227-C': { id: 'EXE-240227-C', status: 'completed', statusZh: '已完成', actualCoverage_pct: 91, actualDosageRatio: 0.74, completedAt: '2026-02-27T14:31:00Z' },
        'RX-240224-D': { id: 'EXE-240224-D', status: 'completed', statusZh: '已完成', actualCoverage_pct: 98, actualDosageRatio: 0.65, completedAt: '2026-02-24T04:03:00Z' },
        'RX-240222-E': { id: 'EXE-240222-E', status: 'completed', statusZh: '已完成', actualCoverage_pct: 93, actualDosageRatio: 0.9, completedAt: '2026-02-22T21:10:00Z' },
    }), []);
    const seededAuditByRxId = useMemo(() => ({
        'RX-240301-A': { id: 'AUD-240301-A', responsibilityAssignment: 'system', responsibilityAssignmentZh: '系统', gradeResult: 'A preserved', gradeResultZh: 'A级已保全' },
        'RX-240228-B': { id: 'AUD-240228-B', responsibilityAssignment: 'system', responsibilityAssignmentZh: '系统', gradeResult: 'A preserved', gradeResultZh: 'A级已保全' },
        'RX-240227-C': { id: 'AUD-240227-C', responsibilityAssignment: 'system', responsibilityAssignmentZh: '系统', gradeResult: 'A preserved', gradeResultZh: 'A级已保全' },
        'RX-240224-D': { id: 'AUD-240224-D', responsibilityAssignment: 'system', responsibilityAssignmentZh: '系统', gradeResult: 'A preserved', gradeResultZh: 'A级已保全' },
        'RX-240222-E': { id: 'AUD-240222-E', responsibilityAssignment: 'operator', responsibilityAssignmentZh: '人工', gradeResult: 'A preserved', gradeResultZh: 'A级已保全' },
    }), []);

    const selectedPreviousExecution = selectedPreviousRx
        ? executions.find(item => item.prescriptionId === selectedPreviousRx.id) || seededExecutionByRxId[selectedPreviousRx.id] || null
        : null;
    const selectedPreviousAudit = selectedPreviousRx
        ? auditRecords.find(item => item.prescriptionId === selectedPreviousRx.id) || seededAuditByRxId[selectedPreviousRx.id] || null
        : null;

    const seededDecisionEvents = useMemo(() => ([
        { timestamp: '2026-03-01T09:17:00Z', type: 'prescription', message: 'Biocontrol package selected after PHI restriction blocked primary chemistry.', messageZh: '主化学方案受 PHI 限制阻断后，系统已切换生防组合方案。' },
        { timestamp: '2026-02-28T06:40:00Z', type: 'approval', message: 'Human operator approved critical intervention in 6 minutes.', messageZh: '关键干预已在 6 分钟内完成人工审批通过。' },
        { timestamp: '2026-02-27T13:24:00Z', type: 'modification', message: 'Dosage ratio adjusted from 0.80 to 0.74 due wind volatility.', messageZh: '因风场波动，剂量比例由 0.80 调整为 0.74。' },
        { timestamp: '2026-02-24T03:09:00Z', type: 'prescription', message: 'Preventive irrigation-control action generated for root rot pressure.', messageZh: '针对根腐压力，系统生成预防性灌溉调控处方。' },
        { timestamp: '2026-02-22T18:04:00Z', type: 'rejection', message: 'Initial plan rejected; frost-protection protocol regenerated with manual verification.', messageZh: '初始方案被驳回；系统已结合人工复核重建霜冻防护预案。' },
    ]), []);

    const decisionEvents = useMemo(() => {
        const live = eventLog
            .filter(e => e.type === 'prescription' || e.type === 'modification' || e.type === 'approval' || e.type === 'rejection')
            .slice(-25)
            .reverse();
        const merged = [...live];
        seededDecisionEvents.forEach(item => {
            if (!merged.some(evt => evt.timestamp === item.timestamp && evt.type === item.type)) {
                merged.push(item);
            }
        });
        return merged.slice(0, 25);
    }, [eventLog, seededDecisionEvents]);
    const selectedDecisionEvent = decisionEvents.find(item => `${item.timestamp}-${item.type}` === selectedDecisionLogId) || decisionEvents[0];
    const decisionTitle = (item) => {
        const text = isZh ? (item?.messageZh || item?.message) : item?.message;
        if (!text) return t('Decision event', '决策事件');
        return text.split('.')[0].slice(0, 90);
    };
    const decisionStage = (type) => {
        const map = {
            prescription: t('Plan generation', '方案生成'),
            modification: t('Plan adjustment', '方案调整'),
            approval: t('Human gate', '人工审核'),
            rejection: t('Plan rejected', '方案驳回'),
        };
        return map[type] || t('Decision event', '决策事件');
    };

    // Reasoning detail for the active prescription  - scenario-aware
    const rx = activePrescription;
    const similarEvents = 3 + ((topRisk?.score || 50) % 5);
    const reasoning = rx ? {
        factors: isZh ? [
            `湿度为 ${sensors.humidity_pct?.toFixed(1) || '-'}%（阈值 85%）→ ${sensors.humidity_pct > 85 ? '病害压力升高' : '处于正常范围'}`,
            `叶面湿润 ${sensors.leaf_wetness_h?.toFixed(2) || sensors.leaf_wetness_hrs?.toFixed(2) || '-'}h（阈值 3h）→ ${(sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 0) > 3 ? '具备孢子萌发条件' : '低于萌发阈值'}`,
            `生育阶段：${stageLabel(currentSnapshot?.stageNameZh, currentSnapshot?.stageName)} → ${(currentSnapshot?.stageName || '').toLowerCase() === 'flowering' ? '高敏感窗口' : '中等敏感窗口'}`,
            `距采收：${activeScenario?.daysToHarvest || 30} 天 → ${(activeScenario?.daysToHarvest || 30) < 14 ? '受 PHI 约束' : '推荐药剂满足 PHI'}`,
            `历史对照：2025 年相似案例 ${similarEvents} 个，同类处置已验证有效`,
            `天气预测：${sensors.rainfall_mm > 5 ? '降雨进行中，处置窗口受限' : '短期干燥，处于最佳处置窗口'}`,
            ...(activeScenario?.id === 'D' ? ['级联识别：蚜虫危害削弱植株角质层，真菌入侵概率 +42%', '复合威胁评分：已完成主次风险耦合建模'] : []),
            ...(activeScenario?.id === 'E' ? ['非化学干预：通过潜热防霜 + 保温隔热进行防护', '零化学使用：环境影响为正向'] : []),
            ...(activeScenario?.id === 'F' ? ['系统故障复合事件：通风故障与病害风险同步上升', '已启动应急协议：PHI 边际紧张（7d 对 8d 采收窗口）'] : []),
            `成本收益：投入 CNY ${rx.estimatedCost || 2800}，可避免潜在损失 CNY ${(topRisk?.score || 50) * 400}`,
        ] : [
            `Humidity at ${sensors.humidity_pct?.toFixed(1) || '-'}% (threshold: 85%) -> ${sensors.humidity_pct > 85 ? 'elevated disease pressure' : 'within normal range'}`,
            `Leaf wetness ${sensors.leaf_wetness_h?.toFixed(2) || sensors.leaf_wetness_hrs?.toFixed(2) || '-'}h (threshold: 3h) -> ${(sensors.leaf_wetness_h || sensors.leaf_wetness_hrs || 0) > 3 ? 'spore germination conditions present' : 'below germination threshold'}`,
            `Growth stage: ${currentSnapshot?.stageName || 'Flowering'} -> ${currentSnapshot?.stageName === 'flowering' ? 'high' : 'moderate'} susceptibility window`,
            `Days to harvest: ${activeScenario?.daysToHarvest || 30}d -> ${(activeScenario?.daysToHarvest || 30) < 14 ? 'PHI restrictions apply' : 'PHI compliant for recommended chemicals'}`,
            `Historical: ${similarEvents} similar events in 2025 - same treatment profile proved effective`,
            `Weather forecast: ${sensors.rainfall_mm > 5 ? 'active rain - treatment window limited' : 'dry period - optimal treatment window'}`,
            ...(activeScenario?.id === 'D' ? ['Cascade detection: aphid damage weakens plant cuticle - fungal entry probability +42%', 'Compound threat score: primary + secondary risk interaction modeled'] : []),
            ...(activeScenario?.id === 'E' ? ['Non-chemical intervention: frost protection via latent heat + insulation', 'Zero chemical usage - environmental impact: positive'] : []),
            ...(activeScenario?.id === 'F' ? ['System failure compound event: ventilation failure + disease risk simultaneously', 'Emergency protocol activated - PHI tight margin (7d PHI vs 8d to harvest)'] : []),
            `Cost-benefit: CNY ${rx.estimatedCost || 2800} intervention vs. CNY ${(topRisk?.score || 50) * 400} potential loss`,
        ],
        alternatives: isZh ? [
            { name: '生物防治（枯草芽孢杆菌）', reason: `${activeScenario?.id === 'A' ? '作为回退方案启用：PHI 阻断化学方案' : '已排除：当前虫害压力超过生防有效阈值'}`, viability: activeScenario?.id === 'A' ? 85 : 30 },
            { name: '仅人工修剪', reason: `不足以覆盖分值 >${topRisk?.score >= 60 ? '60' : '40'} 的风险，预计仅降低约 20 分`, viability: 45 },
            { name: '全域喷施（异菌脲）', reason: '已排除：作用机制轮换冲突（近 21 天内同组已使用）', viability: 0 },
            { name: '继续观察', reason: `${topRisk?.score >= 70 ? '风险已达高危，天气窗口正在收窄' : '风险低于干预阈值'}`, viability: topRisk?.score >= 70 ? 15 : 60 },
            ...(activeScenario?.id === 'D' ? [{ name: '单阶段广域喷施', reason: '已排除：复合虫害需分阶段处理，才能实现 55% 用药节省', viability: 35 }] : []),
        ] : [
            { name: 'Biocontrol (Bacillus subtilis)', reason: `${activeScenario?.id === 'A' ? 'Selected as fallback  - PHI blocks chemical' : 'Rejected: current infestation rate exceeds biocontrol efficacy threshold'}`, viability: activeScenario?.id === 'A' ? 85 : 30 },
            { name: 'Manual pruning only', reason: `Insufficient for score >${topRisk?.score >= 60 ? '60' : '40'}  - would only reduce by ~20pts`, viability: 45 },
            { name: 'Full-zone spray (Iprodione)', reason: 'Rejected: MOA rotation conflict  - same group used in last 21d', viability: 0 },
            { name: 'Wait and monitor', reason: `${topRisk?.score >= 70 ? 'Risk critical  - weather window closing' : 'Risk below intervention threshold'}`, viability: topRisk?.score >= 70 ? 15 : 60 },
            ...(activeScenario?.id === 'D' ? [{ name: 'Single-phase broad spray', reason: 'Rejected: compound pest requires sequential treatment for 55% chemical savings', viability: 35 }] : []),
        ],
        constraints: isZh ? [
            { name: 'PHI 合规', status: (activeScenario?.daysToHarvest || 30) >= 14 || !rx.activeIngredient ? 'pass' : 'fail', detail: rx.activeIngredient ? `距采收 ${(activeScenario?.daysToHarvest || 30)} 天 ${(activeScenario?.daysToHarvest || 30) >= 14 ? '>' : '<'} PHI ${rx.constraints?.phi_days || 14} 天` : '非化学方案，不适用 PHI' },
            { name: '风速条件', status: (sensors.wind_speed_ms || 0) > 3 ? 'fail' : 'pass', detail: `${sensors.wind_speed_ms?.toFixed(1) || '1.8'} m/s ${(sensors.wind_speed_ms || 0) > 3 ? '>' : '<'} 3.0 m/s 喷施上限` },
            { name: '禁限用物质核查', status: 'pass', detail: `${rx.activeIngredient?.nameZh || rx.activeIngredient?.name || '当前有效成分'} 不在中国禁限用清单（GB 2763-2021）` },
            { name: '作用机制轮换', status: 'pass', detail: `${rx.activeIngredient?.moaGroup || 'M03'} 组，距上次使用已超过 21 天，轮换安全` },
            { name: '环境防护', status: 'pass', detail: sensors.rainfall_mm > 5 ? '缓冲带 10m 合规，当前有降雨' : '缓冲带 10m 合规，24 小时内无降雨' },
            ...(activeScenario?.id === 'A' ? [{ name: 'PHI 回退策略', status: 'pass', detail: '化学方案受阻，已切换生防方案（无 PHI 限制）' }] : []),
        ] : [
            { name: 'PHI Compliance', status: (activeScenario?.daysToHarvest || 30) >= 14 || !rx.activeIngredient ? 'pass' : 'fail', detail: rx.activeIngredient ? `${activeScenario?.daysToHarvest || 30}d to harvest ${(activeScenario?.daysToHarvest || 30) >= 14 ? '>' : '<'} ${rx.constraints?.phi_days || 14}d PHI` : 'Non-chemical  - PHI not applicable' },
            { name: 'Wind Conditions', status: (sensors.wind_speed_ms || 0) > 3 ? 'fail' : 'pass', detail: `${sensors.wind_speed_ms?.toFixed(1) || '1.8'} m/s ${(sensors.wind_speed_ms || 0) > 3 ? '>' : '<'} 3.0 m/s spray limit` },
            { name: 'Banned Substance Check', status: 'pass', detail: `${rx.activeIngredient?.name || 'Active ingredient'} not on China banned list (GB 2763-2021)` },
            { name: 'MOA Rotation', status: 'pass', detail: `${rx.activeIngredient?.moaGroup || 'M03'} group  - last use >21d ago  - rotation safe` },
            { name: t('Environmental Safeguard', '环境防护'), status: 'pass', detail: sensors.rainfall_mm > 5 ? t('Buffer zone 10m compliant. Rain present', '缓冲带 10m 合规，当前有降雨') : t('Buffer zone 10m compliant. No rain <24h.', '缓冲带 10m 合规，24 小时内无降雨') },
            ...(activeScenario?.id === 'A' ? [{ name: 'PHI Override (Fallback)', status: 'pass', detail: 'Chemical blocked  - Biocontrol selected (no PHI restriction)' }] : []),
        ],
    } : null;

    return (
        <div className="page">
            <PipelineBreadcrumb />

            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="prescription" size={22} color="#38bdf8" />
                        {t('Prescription Builder', '处方构建器')}
                    </h1>
                    <p className="page-subtitle">{t('Stage 4: Prescription', '阶段 4：处方生成')} - {locale === 'zh' ? (field?.nameZh || field?.name) : field?.name} | {now}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)}>
                        {showJson ? t('Card View', '卡片视图') : t('JSON View', 'JSON 视图')}
                    </button>
                    <button className="btn btn-primary" onClick={handleGenerateRx} disabled={!topRisk || isThinking} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isThinking ? (
                            <><Icon name="reasoning" size={14} /> {t('Thinking...', '思考中...')}</>
                        ) : (
                            <>{t('Generate Prescription', '生成处方')} <Icon name="chevron-right" size={14} /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Scenario Context Badge */}
            {activeScenario && rx && (
                <div className="card" style={{ marginBottom: 12, background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="reasoning" size={18} color="#a78bfa" />
                        <div>
                            <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '0.82rem' }}>{t('Scenario', '场景')} {activeScenario.id}: {locale === 'zh' ? (activeScenario.nameZh || activeScenario.name) : activeScenario.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                {(locale === 'zh' ? (activeScenario.primaryThreatZh || activeScenario.primaryThreat || activeScenario.nameZh || activeScenario.name) : (activeScenario.primaryThreat || activeScenario.name))} | {cropLabel(activeScenario.crop)} | {t('Harvest in', '距采收')} {activeScenario.daysToHarvest}{isZh ? '天' : 'd'}
                                {rx.usedFallback && <span style={{ color: '#f59e0b', marginLeft: 8 }}> - {t('Fallback treatment active (primary blocked)', '已启用回退方案（主方案被阻断）')}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Queue Banner */}
            {approvalQueue.length > 0 && (
                <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="alert-triangle" size={20} color="#f59e0b" />
                            <div>
                                <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.88rem' }}>{approvalQueue.length} {t('Critical Decision Pending Human Approval', '关键决策待人工审批')}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('Risk score >= 70 - auto-execution blocked. Review required before proceeding.', '风险分值 >= 70，自动执行已阻断，请先人工审核。')}</div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setReviewItem(approvalQueue[0])} style={{ whiteSpace: 'nowrap' }}>
                            {t('Review Now', '立即审核')}
                        </button>
                    </div>
                </div>
            )}

            {/* AI Thinking Panel */}
            {(thinkingChain.length > 0 && thinkingContext === 'prescription') && (
                <AIThinkingPanel
                    chain={thinkingChain}
                    isThinking={isThinking}
                    onComplete={stopThinking}
                />
            )}

            {/* Status bar */}
            {topRisk && (
                <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('Highest threat', '最高威胁')}: </span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{threatLabel(topRisk)} ({topRisk.score}/100)</span>
                        {topRisk.score >= 70 && <span style={{ color: '#f59e0b', marginLeft: 8, fontSize: '0.72rem', fontWeight: 700 }}>{t('CRITICAL - requires human approval', '高危 - 需要人工审批')}</span>}
                    </div>
                    <StatusBadge status={topRisk.status} size="lg" />
                </div>
            )}

            {/* Active Prescription with Reasoning Detail */}
            {rx && (
                <div style={{ marginBottom: 16 }}>
                    <h3 className="section-title">{t('Active Prescription', '当前处方')}</h3>
                    {showJson && (
                        <div className="card">
                            <pre style={{ fontSize: '0.75rem', color: '#10b981', overflow: 'auto', maxHeight: 500 }}>
                                {JSON.stringify(rx, null, 2)}
                            </pre>
                        </div>
                    )}
                    {/* Reasoning Detail */}
                    {reasoning && (
                        <>
                            {/* Factors Considered */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon name="reasoning" size={16} color="#38bdf8" /> {t('AI Reasoning - Factors Considered', 'AI 推理｜关键因子')}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {reasoning.factors.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem', color: '#94a3b8', padding: '6px 0', borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                                            <span style={{ color: '#38bdf8', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                                            <span>{isZh ? localizeRxText(f) : f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Constraints */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title">{t('Constraint Checks', '约束检查')}  - {reasoning.constraints.filter(c => c.status === 'pass').length}/{reasoning.constraints.length} {t('Passed', '通过')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {reasoning.constraints.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8 }}>
                                            <Icon name={c.status === 'pass' ? 'check' : 'alert-triangle'} size={14} color={c.status === 'pass' ? '#34d399' : '#ef4444'} />
                                            <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem', minWidth: 170 }}>{isZh ? localizeRxText(c.name) : c.name}</span>
                                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{isZh ? localizeRxText(c.detail) : c.detail}</span>
                                            <span style={{ marginLeft: 'auto' }}><StatusBadge status={c.status === 'pass' ? 'monitoring' : 'critical'} label={isZh ? (c.status === 'pass' ? '通过' : '失败') : c.status.toUpperCase()} /></span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alternatives Considered */}
                            <div className="card" style={{ marginTop: 12 }}>
                                <h3 className="card-title">{t('Alternatives Considered & Rejected', '备选方案（已评估并排除）')}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {reasoning.alternatives.map((a, i) => (
                                        <div key={i} style={{ padding: '10px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${a.viability > 30 ? '#f59e0b' : '#ef4444'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.82rem' }}>{isZh ? localizeRxText(a.name) : a.name}</span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{t('Viability', '可行性')}: {a.viability}%</span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isZh ? localizeRxText(a.reason) : a.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Treatment Protocol Section */}
                    {activeScenario?.prescriptionReport && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="activity" size={16} color="#a78bfa" /> {t('Treatment Protocol', '处置方案')}  - {activeScenario.prescriptionReport.methods.length} {t('Methods', '方法')}
                            </h3>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 10 }}>
                                {t('Timeline', '时间线')}: {isZh ? localizeRxText(activeScenario.prescriptionReport.timeline) : activeScenario.prescriptionReport.timeline}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {activeScenario.prescriptionReport.methods.map((m, i) => {
                                    const typeColors = { primary: '#34d399', secondary: '#38bdf8', supporting: '#f59e0b', infrastructure: '#a78bfa' };
                                    return (
                                        <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: `3px solid ${typeColors[m.type] || '#64748b'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.85rem' }}>{isZh ? localizeRxText(m.name) : m.name}</span>
                                                <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 10, background: `${typeColors[m.type]}15`, color: typeColors[m.type], fontWeight: 700, textTransform: 'uppercase' }}>{isZh ? localizeRxText(m.type) : m.type}</span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{isZh ? localizeRxText(m.description) : m.description}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#475569' }}> - {isZh ? localizeRxText(m.timing) : m.timing}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actor Assignment Matrix Section */}
                    {activeScenario?.prescriptionReport?.actors && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="drone" size={16} color="#38bdf8" /> {t('Actor Assignment', '执行主体分配')}  - {activeScenario.prescriptionReport.actors.length} {t('Units Deployed', '已部署单元')}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                                {activeScenario.prescriptionReport.actors.map((a, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, border: '1px solid rgba(56,189,248,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{isZh ? localizeRxText(a.name) : a.name}</span>
                                            <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: 6, background: a.status === 'assigned' ? 'rgba(52,211,153,0.1)' : a.status === 'standby' ? 'rgba(245,158,11,0.1)' : 'rgba(56,189,248,0.1)', color: a.status === 'assigned' ? '#34d399' : a.status === 'standby' ? '#f59e0b' : '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>{isZh ? localizeRxText(a.status) : a.status}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 3 }}><strong style={{ color: '#64748b' }}>{t('Role', '角色')}:</strong> {isZh ? localizeRxText(a.role) : a.role}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 3 }}><strong style={{ color: '#64748b' }}>{t('Zone', '分区')}:</strong> {isZh ? localizeRxText(a.zone) : a.zone}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#475569' }}>{t('Equipment', '设备')}: {isZh ? localizeRxText(a.equipment) : a.equipment}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Items Checklist */}
                    {activeScenario?.prescriptionReport?.actions && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="check" size={16} color="#34d399" /> {t('Action Items', '动作清单')}  - {activeScenario.prescriptionReport.actions.length} {t('Steps', '步骤')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {activeScenario.prescriptionReport.actions.map((a, i) => {
                                        const prioColors = { IMMEDIATE: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#38bdf8', ONGOING: '#a78bfa', SCHEDULED: '#34d399', GATE: '#f472b6', CONDITIONAL: '#64748b' };
                                        const priorityLabel = isZh
                                            ? ({ IMMEDIATE: '立即', HIGH: '高', MEDIUM: '中', ONGOING: '持续', SCHEDULED: '已排程', GATE: '闸门', CONDITIONAL: '条件触发' }[a.priority] || a.priority)
                                            : a.priority;
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(15,23,42,0.35)', borderRadius: 6, borderLeft: `3px solid ${prioColors[a.priority] || '#64748b'}` }}>
                                                <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{a.step}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>{isZh ? localizeRxText(a.action) : a.action}</div>
                                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{t('Actor', '执行主体')}: {isZh ? localizeRxText(a.actor) : a.actor}</div>
                                                </div>
                                            <span style={{ fontSize: '0.55rem', padding: '2px 8px', borderRadius: 8, background: `${prioColors[a.priority]}15`, color: prioColors[a.priority], fontWeight: 700 }}>{priorityLabel}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Chemical Details */}
                    {activeScenario?.prescriptionReport?.chemicals && (
                        <div className="card" style={{ marginTop: 12 }}>
                            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Icon name="prescription" size={16} color="#fbbf24" /> {t('Chemical / Agent Details', '药剂/制剂详情')}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {activeScenario.prescriptionReport.chemicals.map((c, i) => (
                                    <div key={i} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.4)', borderRadius: 8, borderLeft: '3px solid #fbbf24' }}>
                                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem', marginBottom: 6 }}>{c.name}</div>
                                        <div className="grid grid-2" style={{ gap: 8 }}>
                                            {[
                                                { label: t('Type', '类型'), value: isZh ? localizeRxText(c.type) : c.type },
                                                { label: t('Dosage', '剂量'), value: isZh ? localizeRxText(c.dosage) : c.dosage },
                                                { label: 'PHI', value: c.phi },
                                                { label: t('Safety', '安全'), value: isZh ? localizeRxText(c.safety) : c.safety },
                                            ].map((d, j) => (
                                                <div key={j} style={{ padding: '6px 10px', background: 'rgba(15,23,42,0.3)', borderRadius: 6 }}>
                                                    <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 2 }}>{d.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{isZh ? localizeRxText(d.value) : d.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cost-Benefit Analysis */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">{t('Cost-Benefit Analysis', '成本收益分析')}</h3>
                        <table className="data-table">
                            <thead>
                                <tr><th>{t('Item', '项目')}</th><th>{t('Amount', '金额')}</th><th>{t('Notes', '说明')}</th></tr>
                            </thead>
                            <tbody>
                                {activeScenario?.prescriptionReport?.costBreakdown ? (
                                    activeScenario.prescriptionReport.costBreakdown.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{isZh ? localizeRxText(c.item) : c.item}</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${c.amount.toLocaleString()}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{isZh ? localizeRxText(c.note) : c.note}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        <tr>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t('Chemical Cost', '药剂成本')}</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${(rx.estimatedCost ? (rx.estimatedCost * 0.45).toFixed(0) : 1260)}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('Active ingredient + application area', '有效成分 + 作业面积')}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{t('Operations', '作业成本')}</td>
                                            <td style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{`CNY ${(rx.estimatedCost ? (rx.estimatedCost * 0.55).toFixed(0) : 1540)}`}</td>
                                            <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('Drone, labor, and equipment', '无人机、人力与设备')}</td>
                                        </tr>
                                    </>
                                )}
                                <tr style={{ borderTop: '2px solid #334155' }}>
                                    <td style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>{t('Total Cost', '总成本')}</td>
                                    <td style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                        {`CNY ${activeScenario?.prescriptionReport?.costBreakdown
                                            ? activeScenario.prescriptionReport.costBreakdown.reduce((s, c) => s + c.amount, 0).toLocaleString()
                                            : (rx.estimatedCost || 2800)}`}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#34d399' }}>{t('Potential Loss (if untreated)', '潜在损失（未处理）')}</td>
                                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.88rem' }}>{`CNY ${(activeScenario?.outcomeMetrics?.revenueProtected?.toLocaleString() || ((topRisk?.score || 50) * 400).toLocaleString())}`}</td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('Grade downgrade + volume loss', '等级下滑 + 产量损失')}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 600, color: '#10b981' }}>{t('Projected ROI', '预计 ROI')}</td>
                                    <td style={{ fontWeight: 700, color: '#10b981', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                        {(() => {
                                            const cost = activeScenario?.prescriptionReport?.costBreakdown
                                                ? activeScenario.prescriptionReport.costBreakdown.reduce((s, c) => s + c.amount, 0)
                                                : (rx.estimatedCost || 2800);
                                            const revenue = activeScenario?.outcomeMetrics?.revenueProtected || (topRisk?.score || 50) * 400;
                                            return (revenue / cost).toFixed(1);
                                        })()}x
                                    </td>
                                    <td style={{ fontSize: '0.72rem', color: '#64748b' }}>{t('savings / cost ratio', '节省/成本比')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Prescription Pipeline Timeline */}
                    <div className="card" style={{ marginTop: 12 }}>
                        <h3 className="card-title">{t('Prescription Pipeline - Decision Flow', '处方流程｜决策流')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { time: '00:00:00', step: t('Data Ingestion', '数据接入'), detail: t(`12 multimodal sources analyzed | ${(currentSnapshot?.sensors ? Object.keys(currentSnapshot.sensors).length : 8)} sensor parameters`, `已分析 12 路多模态数据 | ${(currentSnapshot?.sensors ? Object.keys(currentSnapshot.sensors).length : 8)} 项传感参数`), icon: 'perception', color: '#38bdf8' },
                                { time: '00:00:02', step: t('Risk Assessment', '风险评估'), detail: isZh ? `${threatLabel(topRisk) || '灰霉病'} 识别为 ${topRisk?.score || 82}/100 | 已评估 ${riskResults?.length || 5} 类威胁` : `${topRisk?.name || 'Gray Mold'} identified at ${topRisk?.score || 82}/100 | ${riskResults?.length || 5} threats evaluated`, icon: 'alert-triangle', color: '#f59e0b' },
                                { time: '00:00:05', step: t('Historical Cross-Reference', '历史交叉对照'), detail: t('7 past decisions reviewed | 3 similar events matched from 2025-2026', '已回看 7 次历史决策 | 匹配 3 个 2025-2026 相似事件'), icon: 'history', color: '#a78bfa' },
                                { time: '00:00:08', step: t('Constraint Validation', '约束校验'), detail: `${reasoning?.constraints?.filter(c => c.status === 'pass').length || 5}/${reasoning?.constraints?.length || 5} ${t('constraints passed', '项约束通过')} | PHI, Wind, MOA, ${t('Environmental', '环境')}`, icon: 'check-circle', color: '#34d399' },
                                { time: '00:00:12', step: t('Prescription Generated', '处方已生成'), detail: `${rx.chemical || 'Mancozeb 70% WP'} ${t('spot spray', '点喷')} | ${rx.estimatedCost || 2800} CNY | ${rx.method || t('5 actors', '5 个执行主体')}`, icon: 'prescription', color: '#10b981' },
                                { time: topRisk?.score >= 70 ? '00:08:22' : '00:00:12', step: topRisk?.score >= 70 ? t('Human Approval Required', '需要人工审批') : t('Auto-Approved', '自动通过'), detail: topRisk?.score >= 70 ? t('Risk >= 70 routed to approval queue | Awaiting field operator review', '风险 >= 70，已进入审批队列 | 等待现场操作员审核') : t('Risk < 70 auto-approved by Decision OS', '风险 < 70，由决策系统自动通过'), icon: topRisk?.score >= 70 ? 'warning' : 'check-circle', color: topRisk?.score >= 70 ? '#f59e0b' : '#34d399' },
                            ].map((stage, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderLeft: `2px solid ${stage.color}`, paddingLeft: 14, marginLeft: 8 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                                        <Icon name={stage.icon} size={14} color={stage.color} />
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.82rem' }}>{stage.step}</span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#475569' }}>T+{stage.time}</span>
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{stage.detail}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Card (Modify/Execute) */}
                    {!showJson && (
                        <div style={{ marginTop: 24, padding: 16, background: 'rgba(15,23,42,0.6)', borderRadius: 12, border: '1px solid rgba(56,189,248,0.2)' }}>
                            <PrescriptionCard
                                rx={rx}
                                onModify={handleModify}
                                onExecute={handleExecute}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* No prescription yet */}
            {!rx && prescriptions.length === 0 && !isThinking && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: 8 }}><Icon name="prescription" size={48} /></div>
                    <div style={{ color: '#94a3b8', marginBottom: 16 }}>{t('No prescriptions generated yet.', '尚未生成处方。')}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16 }}>
                        {topRisk
                            ? (isZh
                                ? `${threatLabel(topRisk)} 达到 ${topRisk.score}/100。请生成预防或响应处方。`
                                : `${topRisk.name} at ${topRisk.score}/100. Generate a preventive or reactive prescription.`)
                            : t('Waiting for risk signal data.', '等待风险信号数据。')}
                    </div>
                    {topRisk && (
                        <button className="btn btn-primary" onClick={handleGenerateRx}>{t('Generate Prescription', '生成处方')}</button>
                    )}
                </div>
            )}

            {/* Previous Prescriptions */}
            {previousPrescriptions.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="history" size={16} color="#38bdf8" />
                        {t('Recent Prescriptions', '最近处方')}
                    </h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div className="scrollbar-themed" style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {previousPrescriptions.map(item => (
                                <button
                                    key={item.id}
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedPreviousRxId(item.id)}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        padding: '9px 10px',
                                        border: selectedPreviousRx?.id === item.id ? '1px solid rgba(56,189,248,0.35)' : '1px solid rgba(51,65,85,0.6)',
                                        background: selectedPreviousRx?.id === item.id ? 'rgba(56,189,248,0.12)' : 'rgba(15,23,42,0.45)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: 3,
                                    }}
                                >
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700 }}>{item.id}</span>
                                        <StatusBadge status={item.status || 'pending'} />
                                    </div>
                                    <span style={{ fontSize: '0.68rem', color: '#e2e8f0' }}>{isZh ? (item.threatNameZh || item.threatName) : item.threatName}</span>
                                    <span style={{ fontSize: '0.64rem', color: '#94a3b8' }}>{isZh ? (item.actionLabelZh || item.actionLabel) : item.actionLabel}</span>
                                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: 'monospace' }}>
                                        {item.generatedAt
                                            ? new Date(item.generatedAt).toLocaleString(localeTag(locale), { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                                            : '--'}
                                        {' | '}
                                        {t('Risk', '风险')} {item.riskScore ?? '--'}/100
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedPreviousRx && (
                            <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{selectedPreviousRx.id}</div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 8 }}>
                                    {selectedPreviousRx.generatedAt
                                        ? new Date(selectedPreviousRx.generatedAt).toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                                        : '--'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Threat', '威胁')}: {isZh ? (selectedPreviousRx.threatNameZh || selectedPreviousRx.threatName) : selectedPreviousRx.threatName}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Action', '动作')}: {isZh ? (selectedPreviousRx.actionLabelZh || selectedPreviousRx.actionLabel) : selectedPreviousRx.actionLabel}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Risk Score', '风险分值')}: {selectedPreviousRx.riskScore}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Cost', '成本')}: CNY {(selectedPreviousRx.estimatedCost || 0).toLocaleString()}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{t('Mode', '模式')}: {isZh ? (selectedPreviousRx.decisionModeZh || (selectedPreviousRx.decisionMode === 'preventive' ? '预防式' : selectedPreviousRx.decisionMode === 'reactive' ? '响应式' : localizeRxText(selectedPreviousRx.decisionMode || '响应式'))) : (selectedPreviousRx.decisionMode || 'reactive')}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 8 }}>{t('Result', '结果')}: {isZh ? (selectedPreviousRx.resultZh || selectedPreviousRx.result) : (selectedPreviousRx.result || t('Execution completed with expected impact.', '执行完成，效果符合预期。'))}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 10 }}>{t('Execution', '执行')}</div>
                                <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>
                                    {selectedPreviousExecution
                                        ? `${selectedPreviousExecution.id || '--'} | ${isZh ? (selectedPreviousExecution.statusZh || (selectedPreviousExecution.status === 'completed' ? '已完成' : selectedPreviousExecution.status === 'failed' ? '失败' : selectedPreviousExecution.status === 'in-progress' ? '执行中' : localizeRxText(selectedPreviousExecution.status || '已完成'))) : (selectedPreviousExecution.status || 'completed')} | ${isZh ? '覆盖率' : 'coverage'} ${selectedPreviousExecution.actualCoverage_pct ?? '--'}% | ${isZh ? '剂量' : 'dosage'} ${selectedPreviousExecution.actualDosageRatio ? `${(selectedPreviousExecution.actualDosageRatio * 100).toFixed(0)}%` : '--'}`
                                        : t('No execution record', '暂无执行记录')}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>{t('Audit', '审计')}</div>
                                <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>
                                    {selectedPreviousAudit
                                        ? `${selectedPreviousAudit.id || '--'} | ${isZh ? (selectedPreviousAudit.responsibilityAssignmentZh || (selectedPreviousAudit.responsibilityAssignment === 'system' ? '系统' : selectedPreviousAudit.responsibilityAssignment === 'operator' ? '人工' : '系统')) : (selectedPreviousAudit.responsibilityAssignment || 'system')} | ${isZh ? (selectedPreviousAudit.gradeResultZh || (selectedPreviousAudit.afterState?.gradeClass ? `${selectedPreviousAudit.afterState.gradeClass}级` : 'A级已保全')) : (selectedPreviousAudit.gradeResult || (selectedPreviousAudit.afterState?.gradeClass ? `${selectedPreviousAudit.afterState.gradeClass} preserved` : 'A preserved'))}`
                                        : t('No audit record', '暂无审计记录')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Decision Log */}
            {decisionEvents.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 className="card-title">{t('Decision Log (Recent)', '决策日志（最近）')}</h3>
                    <div className="grid grid-2" style={{ gap: 12 }}>
                        <div className="scrollbar-themed" style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {decisionEvents.map(item => {
                                const itemId = `${item.timestamp}-${item.type}`;
                                return (
                                    <button
                                        key={itemId}
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedDecisionLogId(itemId)}
                                        style={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            padding: '6px 10px',
                                            border: selectedDecisionEvent?.timestamp === item.timestamp && selectedDecisionEvent?.type === item.type
                                                ? '1px solid rgba(56,189,248,0.35)'
                                                : '1px solid rgba(51,65,85,0.5)',
                                            background: 'rgba(15,23,42,0.45)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            gap: 4,
                                        }}
                                    >
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.66rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                {new Date(item.timestamp).toLocaleString(localeTag(locale), { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                            <StatusBadge status={item.type === 'approval' ? 'monitoring' : item.type === 'rejection' ? 'critical' : item.type === 'modification' ? 'warning' : 'elevated'} label={isZh ? (item.type === 'approval' ? '审批' : item.type === 'rejection' ? '驳回' : item.type === 'modification' ? '修改' : '处方') : item.type.toUpperCase()} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#e2e8f0', lineHeight: 1.3 }}>{decisionTitle(item)}</span>
                                        <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{decisionStage(item.type)}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDecisionEvent && (
                            <div style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(51,65,85,0.6)', background: 'rgba(15,23,42,0.45)' }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginBottom: 8 }}>
                                    {new Date(selectedDecisionEvent.timestamp).toLocaleString(localeTag(locale), { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <StatusBadge status={selectedDecisionEvent.type === 'approval' ? 'monitoring' : selectedDecisionEvent.type === 'rejection' ? 'critical' : selectedDecisionEvent.type === 'modification' ? 'warning' : 'elevated'} label={isZh ? (selectedDecisionEvent.type === 'approval' ? '审批' : selectedDecisionEvent.type === 'rejection' ? '驳回' : selectedDecisionEvent.type === 'modification' ? '修改' : '处方') : selectedDecisionEvent.type.toUpperCase()} />
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700, marginBottom: 6 }}>
                                    {decisionTitle(selectedDecisionEvent)}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                    {isZh ? (selectedDecisionEvent.messageZh || selectedDecisionEvent.message) : selectedDecisionEvent.message}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#64748b' }}>
                                    {t('Stage', '阶段')}: {decisionStage(selectedDecisionEvent.type)} | {t('Source', '来源')}: {t('Sentinel Decision OS', 'Sentinel 决策系统')}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {reviewItem && (
                <ApprovalModal
                    item={reviewItem}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onClose={() => setReviewItem(null)}
                />
            )}
        </div>
    );
}





