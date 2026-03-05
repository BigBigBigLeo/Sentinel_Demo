import React, { useEffect, useMemo, useRef, useState } from 'react';
import useStore from '../engine/store';
import { pick } from '../i18n/locale.js';
import Icon from './Icon';
import { PHASES } from '../engine/thinkingEngine';

const phaseList = Object.values(PHASES);

function DataBadge({ label, value }) {
    return (
        <span className="thinking-data-badge">
            <span className="thinking-data-label">{label}</span>
            <span className="thinking-data-value">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
        </span>
    );
}

function ConfidenceMeter({ value, t }) {
    const pct = Math.min(100, Math.max(0, value * 100));
    const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#ef4444';
    return (
        <div className="confidence-meter">
            <span style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap' }}>{t('Confidence', '置信度')}</span>
            <div className="confidence-track">
                <div className="confidence-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="confidence-label" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
    );
}

export default function AIThinkingPanel({ chain = [], isThinking = false, onComplete }) {
    const locale = useStore(state => state.locale);
    const t = (en, zh) => pick(locale, en, zh);
    const isZh = locale === 'zh';
    const localizeReasoningText = (value) => {
        if (!isZh || !value) return value;
        let text = String(value);
        text = text.replace(/^(.+):\s*(lead|reviewer|executor) action by (.+)$/i, (_, task, role, who) => {
            const roleZh = role.toLowerCase() === 'lead' ? '主责' : role.toLowerCase() === 'reviewer' ? '复核' : '执行';
            return `${task}：${roleZh}动作｜${who}`;
        });
        const phraseMap = [
            ['Data Request', '数据请求'],
            ['Risk assessment', '风险评估'],
            ['Prescription generated', '处方已生成'],
            ['Execution', '执行'],
            ['Verification', '验证'],
            ['Perceiving', '感知'],
            ['Analyzing', '分析'],
            ['Reasoning', '推理'],
            ['Deciding', '决策'],
            ['Verifying', '校验'],
            ['confidence', '置信度'],
            ['iteration', '迭代'],
            ['multimodal', '多模态'],
            ['reasoning', '推理'],
            ['Cost-benefit optimization', '成本收益优化'],
            ['precision vs. broadcast', '精准施策 vs 全域喷施'],
            ['Precision spot spray', '精准点喷'],
            ['Traditional broadcast', '传统全域喷施'],
            ['Revenue protection', '收益保护'],
            ['Precision ROI', '精准方案 ROI'],
            ['broadcast ROI', '全域方案 ROI'],
            ['Chemical savings', '药剂节省'],
            ['Environmental impact reduction', '环境影响下降'],
            ['Precision execution plan compiled', '已生成精准执行方案'],
            ['Pre-execution compliance seal', '执行前合规封印'],
            ['Outcome verification & ML feedback scheduled', '结果验证与模型反馈已排程'],
            ['All 7 regulatory gates passed', '7 项监管闸门全部通过'],
            ['Wind safety', '风速安全'],
            ['Banned substance check', '禁限用物质校验'],
            ['Label rate compliance', '标签剂量合规'],
            ['Collateral assessment', '附带影响评估'],
            ['Rollback plan', '回退预案'],
            ['Confidence gate', '置信度闸门'],
            ['Decision provenance chain recorded', '决策溯源链已记录'],
            ['Ready for multi-actor dispatch', '已具备多主体下发条件'],
            ['Scheduled verification checkpoints', '已安排验证检查点'],
            ['Prediction to validate', '待验证预测'],
            ['training data points', '训练数据点'],
            ['Feature importance ranking', '特征重要性排序'],
            ['updated post-outcome', '将在结果回传后更新'],
            ['PASSPASS', '通过'],
            ['PASSREADY', '就绪'],
            ['PASSMATCH', '匹配通过'],
            ['PASSMISMATCH', '不匹配'],
            ['PASSCLEAR', '通过'],
            ['Multi-actor prescription finalized', '多主体处方已定稿'],
            ['Decision matrix complete', '决策矩阵计算完成'],
            ['Total actors', '总主体数'],
            ['Timeline', '时间线'],
            ['staggered over', '分阶段执行，总时长'],
            ['PASS', '通过'],
            ['APPROVED', '通过'],
            ['recorded', '已记录'],
            ['Rows', '第'],
            ['rows', '第'],
            ['Field Team', '田间团队'],
            ['IoT System', 'IoT 系统'],
            ['Drone', '无人机'],
            ['Actor', '主体'],
            ['covering', '覆盖'],
            ['of field', '地块'],
        ];
        phraseMap.forEach(([en, zh]) => {
            text = text.split(en).join(zh);
        });
        const tokenMap = [
            ['Humidity', '湿度'],
            ['Temperature', '温度'],
            ['Leaf Wetness', '叶面湿润'],
            ['Gray Mold', '灰霉病'],
            ['Botrytis', '灰霉病原'],
            ['Drone', '无人机'],
            ['Field Team', '田间团队'],
            ['Timeline', '时间线'],
            ['Actor', '主体'],
            ['actors', '主体'],
            ['checkpoints', '检查点'],
            ['verifying', '验证中'],
            ['analyzing', '分析中'],
            ['reasoning', '推理中'],
            ['deciding', '决策中'],
            ['Safety Officer', '安全官'],
            ['Control Engineer', '控制工程师'],
            ['Field Operator', '田间作业员'],
            ['Data Retriever', '数据采集员'],
            ['Remote Sensor Pilot', '远程传感操控员'],
            ['Drone Operator', '无人机作业员'],
            ['Ops Manager', '运营经理'],
            ['Learning Engineer', '学习工程师'],
            ['Compliance Officer', '合规官'],
            ['Crop Chemist', '植保化学师'],
            ['Field Agronomist', '田间农艺师'],
            ['Greenhouse Agronomist', '温室农艺师'],
            ['Finance Analyst', '财务分析师'],
            ['Sales Planner', '销售规划师'],
        ];
        tokenMap.forEach(([en, zh]) => {
            text = text.replace(new RegExp(en, 'gi'), zh);
        });
        text = text.replace(/\bActor\s*(\d+)/gi, '主体$1');
        text = text.replace(/->/g, '→');
        text = text.replace(/\|\s*/g, '｜');
        return text;
    };

    const [visibleCount, setVisibleCount] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!isThinking) {
            setVisibleCount(chain.length);
            return;
        }

        setVisibleCount(0);
        let idx = 0;
        const timer = setInterval(() => {
            idx += 1;
            setVisibleCount(Math.min(idx, chain.length));
            if (idx >= chain.length) {
                clearInterval(timer);
                onComplete?.();
            }
        }, 420);

        return () => clearInterval(timer);
    }, [chain, isThinking, onComplete]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visibleCount]);

    if (chain.length === 0 && !isThinking) return null;

    const visibleSteps = chain.slice(0, Math.max(visibleCount, isThinking ? 0 : chain.length));
    const total = chain.length;
    const elapsed = visibleSteps.length;
    const progress = total > 0 ? (elapsed / total) * 100 : 0;
    const currentPhase = visibleSteps[visibleSteps.length - 1]?.phase;
    const currentRound = visibleSteps[visibleSteps.length - 1]?.round || 1;
    const maxRound = Math.max(1, ...chain.map(s => s.round || 1));

    const latestConfidence = useMemo(() => {
        const confidenceSteps = visibleSteps.filter(s => s.data?.confidence || s.data?.ensemble_confidence || s.data?.preliminary_confidence);
        if (confidenceSteps.length === 0) return 0;
        const latest = confidenceSteps[confidenceSteps.length - 1];
        const value = Object.values(latest.data || {}).find(v => typeof v === 'number' && v <= 1 && v > 0);
        return value || 0;
    }, [visibleSteps]);

    return (
        <div className={`thinking-panel ${isThinking ? 'thinking-active' : 'thinking-done'}`}>
            <div className="thinking-header">
                <div className="thinking-header-left">
                    <div className={`thinking-indicator ${isThinking ? 'pulsing' : ''}`}>
                        <Icon name="reasoning" size={18} />
                    </div>
                    <div>
                        <div className="thinking-title">
                            {isThinking ? t('Sentinel AI - Iterative Reasoning', 'Sentinel AI｜迭代推理') : t('Analysis Complete - All Rounds', '分析完成｜全轮次')}
                        </div>
                        <div className="thinking-subtitle">
                            {currentPhase
                                ? `${t('Phase', '阶段')}: ${isZh ? (currentPhase.labelZh || currentPhase.label) : currentPhase.label} | ${t('Round', '轮次')} ${currentRound}/${maxRound}`
                                : t('Initializing multimodal reasoning pipeline...', '正在初始化多模态推理管线...')}
                        </div>
                    </div>
                </div>
                <div className="thinking-header-right">
                    <span className="thinking-round-badge">{t('Round', '轮次')} {currentRound}/{maxRound}</span>
                    <span className="thinking-model-badge">Sentinel-Agri v4.2</span>
                    <span className="thinking-step-count">{elapsed}/{total}</span>
                </div>
            </div>

            <div className="thinking-phases">
                {phaseList.map((phase, i) => {
                    const isActive = currentPhase?.id === phase.id;
                    const phaseIdx = phaseList.findIndex(p => p.id === currentPhase?.id);
                    const isPast = phaseIdx > i || elapsed >= total;
                    return (
                        <div key={phase.id} className={`thinking-phase-dot ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}>
                            <div className="phase-dot" style={{ background: isPast || isActive ? phase.color : 'rgba(148,163,184,0.2)' }}>
                                <Icon name={phase.icon} size={14} color={isPast || isActive ? '#fff' : '#475569'} />
                            </div>
                            <span className="phase-label" style={{ color: isPast || isActive ? phase.color : '#475569' }}>
                                {isZh ? (phase.labelZh || phase.label) : phase.label}
                            </span>
                        </div>
                    );
                })}
                <div className="thinking-progress-track">
                    <div className="thinking-progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {latestConfidence > 0 && (
                <div style={{ padding: '8px 20px', borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                    <ConfidenceMeter value={latestConfidence} t={t} />
                </div>
            )}

            <div className="thinking-steps" ref={scrollRef}>
                {visibleSteps.map((step, i) => {
                    const prevRound = i > 0 ? visibleSteps[i - 1]?.round : null;
                    const showRound = step.round && step.round !== prevRound;
                    return (
                        <React.Fragment key={step.id}>
                            {showRound && (
                                <div style={{ padding: '12px 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(244,114,182,0.15)' }} />
                                    <span className="thinking-round-badge">{t('Round', '轮次')} {step.round}</span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(244,114,182,0.15)' }} />
                                </div>
                            )}
                            <div className={`thinking-step ${i === visibleSteps.length - 1 ? 'latest' : 'completed'}`}>
                                <div className="thinking-step-header">
                                    {step.formattedTime && <span className="timestamp-label" style={{ marginRight: 6 }}>[{step.formattedTime}]</span>}
                                    <span className="step-phase-tag" style={{ background: `${step.phase.color}20`, color: step.phase.color, borderColor: `${step.phase.color}40` }}>
                                        {isZh ? (step.phase.labelZh || step.phase.label) : step.phase.label}
                                    </span>
                                    <span className="step-title">{isZh ? localizeReasoningText(step.title) : step.title}</span>
                                </div>
                                <div className="thinking-step-content">{isZh ? localizeReasoningText(step.content) : step.content}</div>

                                {step.isDataRequest && (
                                    <div className="thinking-request-card">
                                        <div className="thinking-request-title">
                                            <Icon name="perception" size={14} color="#38bdf8" />
                                            {step.requestDetails?.title || t('Data Request', '数据请求')}
                                        </div>
                                        <div className="thinking-request-body">
                                            {(step.requestDetails?.items || []).map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                                                    <span className="actor-badge actor-drone" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{item.asset}</span>
                                                    <span style={{ flex: 1, fontSize: '0.68rem', color: '#94a3b8' }}>{isZh ? localizeReasoningText(item.action) : item.action}</span>
                                                    <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 600 }}>ETA: {item.eta}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {step.data && (
                                    <div className="thinking-step-data">
                                        {Object.entries(step.data).map(([k, v]) => (
                                            <DataBadge key={k} label={isZh ? localizeReasoningText(k.replace(/_/g, ' ')) : k.replace(/_/g, ' ')} value={v} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}

                {isThinking && visibleSteps.length === 0 && (
                    <div className="thinking-step latest">
                        <div className="thinking-step-content" style={{ color: '#64748b' }}>
                            {t('Initializing multimodal reasoning pipeline...', '正在初始化多模态推理管线...')}
                        </div>
                    </div>
                )}
            </div>

            {elapsed >= total && total > 0 && (
                <div className="thinking-footer">
                    <div className="thinking-footer-left">
                        <Icon name="check" size={14} color="#34d399" />
                        <span>{t('Iterative reasoning chain validated', '迭代推理链已校验')} - {maxRound} {t('rounds', '轮')}，{total} {t('steps', '步')}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
