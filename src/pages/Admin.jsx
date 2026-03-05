import React, { useMemo, useState } from 'react';
import useStore from '../engine/store';
import thresholds from '../data/thresholds';
import { bannedPesticides, phiConstraints } from '../data/constraints';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/Icon';
import PipelineBreadcrumb from '../components/PipelineBreadcrumb';
import { pick } from '../i18n/locale.js';

export default function Admin() {
    const {
        fields,
        activeFieldId,
        applyThresholdConfig,
        resetThresholdConfig,
        locale,
    } = useStore();
    const t = (en, zh) => pick(locale, en, zh);
    const cropLabel = (value) => {
        const map = { blueberry: 'Blueberry', flower: 'Rose' };
        const mapZh = { blueberry: '蓝莓', flower: '鲜切花（玫瑰）' };
        return locale === 'zh' ? (mapZh[value] || value) : (map[value] || value);
    };
    const field = fields[activeFieldId];

    const initialThresholds = useMemo(() => JSON.parse(JSON.stringify(thresholds)), []);
    const [localThresholds, setLocalThresholds] = useState(initialThresholds);
    const [saved, setSaved] = useState(false);
    const [resetFlash, setResetFlash] = useState(false);

    const updateThreshold = (category, key, value) => {
        setLocalThresholds(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: Number.parseFloat(value) || value },
        }));
        setSaved(false);
        setResetFlash(false);
    };

    const handleSave = () => {
        applyThresholdConfig(localThresholds);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        resetThresholdConfig();
        const defaults = JSON.parse(JSON.stringify(thresholds));
        setLocalThresholds(defaults);
        setSaved(false);
        setResetFlash(true);
        setTimeout(() => setResetFlash(false), 2000);
    };

    return (
        <div className="page">
            <PipelineBreadcrumb />
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="admin" size={22} color="#38bdf8" />
                        {t('Admin & Configuration', '管理与配置')}
                    </h1>
                    <p className="page-subtitle">{t('System thresholds, constraints, and runtime parameters', '系统阈值、约束与运行参数')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="refresh" size={14} /> {t('Restore Defaults', '恢复默认')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {saved ? <><Icon name="check" size={14} /> {t('Saved', '已保存')}</> : <><Icon name="save" size={14} /> {t('Save Configuration', '保存配置')}</>}
                    </button>
                </div>
            </div>

            {(saved || resetFlash) && (
                <div className="card" style={{ marginBottom: 12, padding: 10, borderLeft: `3px solid ${saved ? '#34d399' : '#f59e0b'}` }}>
                    <div style={{ fontSize: '0.74rem', color: saved ? '#34d399' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name={saved ? 'check-circle' : 'refresh'} size={14} color={saved ? '#34d399' : '#f59e0b'} />
                        {saved
                            ? t('Configuration applied. Runtime thresholds were updated and risk scoring was recalculated.', '配置已生效，运行阈值已更新并重新计算风险评分。')
                            : t('Default thresholds restored and active runtime configuration reset.', '已恢复默认阈值并重置当前运行配置。')}
                    </div>
                </div>
            )}

            <div className="grid grid-2">
                <div className="card">
                    <h3 className="card-title">{t('Gray Mold (Botrytis) Thresholds', '灰霉病（Botrytis）阈值')}</h3>
                    <div className="config-grid">
                        <label>{t('Humidity (%)', '湿度（%）')}</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.humidity_pct} onChange={e => updateThreshold('botrytis', 'humidity_pct', e.target.value)} />
                        <label>{t('Leaf Wetness (hrs)', '叶面湿润时长（h）')}</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.leaf_wetness_hrs} onChange={e => updateThreshold('botrytis', 'leaf_wetness_hrs', e.target.value)} />
                        <label>{t('Overcast Days', '阴天连续天数')}</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.overcast_days} onChange={e => updateThreshold('botrytis', 'overcast_days', e.target.value)} />
                        <label>{t('Spore Index Critical', '孢子指数（高危阈值）')}</label>
                        <input type="number" className="config-input" value={localThresholds.botrytis.spore_index_critical} onChange={e => updateThreshold('botrytis', 'spore_index_critical', e.target.value)} />
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">{t('Aphid Thresholds', '蚜虫阈值')}</h3>
                    <div className="config-grid">
                        <label>{t('Per Leaf', '单叶虫量')}</label>
                        <input type="number" className="config-input" value={localThresholds.aphids.per_leaf} onChange={e => updateThreshold('aphids', 'per_leaf', e.target.value)} />
                        <label>{t('Sticky Trap Daily', '粘虫板日计数')}</label>
                        <input type="number" className="config-input" value={localThresholds.aphids.sticky_trap_daily} onChange={e => updateThreshold('aphids', 'sticky_trap_daily', e.target.value)} />
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">{t('Spider Mite Thresholds', '红蜘蛛阈值')}</h3>
                    <div className="config-grid">
                        <label>{t('Mite Density', '螨虫密度')}</label>
                        <input type="number" className="config-input" value={localThresholds.spider_mites.mite_density} onChange={e => updateThreshold('spider_mites', 'mite_density', e.target.value)} />
                        <label>{t('Temp Min (degC)', '温度下限（°C）')}</label>
                        <input type="number" className="config-input" value={localThresholds.spider_mites.temp_min} onChange={e => updateThreshold('spider_mites', 'temp_min', e.target.value)} />
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">{t('Environmental Alerts', '环境告警阈值')}</h3>
                    <div className="config-grid">
                        <label>{t('Temp High (degC)', '温度上限（°C）')}</label>
                        <input type="number" className="config-input" value={localThresholds.environment.temp_high} onChange={e => updateThreshold('environment', 'temp_high', e.target.value)} />
                        <label>{t('Temp Low (degC)', '温度下限（°C）')}</label>
                        <input type="number" className="config-input" value={localThresholds.environment.temp_low} onChange={e => updateThreshold('environment', 'temp_low', e.target.value)} />
                        <label>{t('Wind Spray Limit (m/s)', '喷施风速上限（m/s）')}</label>
                        <input type="number" className="config-input" value={localThresholds.environment.wind_spray_limit} onChange={e => updateThreshold('environment', 'wind_spray_limit', e.target.value)} step="0.1" />
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{t('Pre-Harvest Interval (PHI) Constraints', '采收前间隔（PHI）约束')}</h3>
                <table className="data-table">
                    <thead><tr><th>{t('Pesticide', '药剂')}</th><th>{t('PHI (days)', 'PHI（天）')}</th><th>{t('MoA Group', '作用机制组别')}</th></tr></thead>
                    <tbody>
                        {Object.values(phiConstraints).map(p => (
                            <tr key={p.name}><td>{locale === 'zh' ? (p.nameZh || p.name) : p.name}</td><td style={{ fontFamily: 'monospace' }}>{p.days}d</td><td>{p.moaGroup}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{t('Banned / Restricted Pesticides (China)', '禁用/限用农药（中国）')}</h3>
                <table className="data-table">
                    <thead><tr><th>{t('Substance', '物质')}</th><th>{t('Reason', '原因')}</th><th>{t('Status', '状态')}</th></tr></thead>
                    <tbody>
                        {bannedPesticides.map(p => (
                            <tr key={p.name}><td>{locale === 'zh' ? (p.nameZh || p.name) : p.name}</td><td style={{ fontSize: '0.75rem' }}>{locale === 'zh' ? (p.reasonZh || p.reason) : p.reason}</td><td><StatusBadge status="fail" label={t('BANNED', '禁用')} /></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
                <h3 className="card-title">{t('System Information', '系统信息')}</h3>
                <table className="data-table">
                    <tbody>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Engine Version', '引擎版本')}</td><td>Sentinel Engine v4.2</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Build', '构建版本')}</td><td>{t('2026.03 (Prototype)', '2026.03（原型版）')}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Active Field', '当前地块')}</td><td>{locale === 'zh' ? (field?.nameZh || field?.name) : field?.name}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Crop', '作物')}</td><td>{cropLabel(field?.crop)}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Area', '面积')}</td><td>{field?.area_mu} {t('mu', '亩')}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Mode', '模式')}</td><td>{t('Demo / Simulation', '演示 / 仿真')}</td></tr>
                        <tr><td style={{ color: '#94a3b8' }}>{t('Data Source', '数据来源')}</td><td>{t('Synthetic (60-day lifecycle)', '合成数据（60天生命周期）')}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
