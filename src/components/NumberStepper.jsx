import React from 'react';

/**
 * Sentinel 7.2 Precision Industrial Number Stepper
 * Eliminates browser-native spin buttons and provides tactile, industrial [-] [+] controls.
 */
export default function NumberStepper({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    disabled = false,
    width = '100%'
}) {
    const numVal = parseFloat(value) || 0;

    const handleDec = (e) => {
        e.preventDefault();
        const next = Math.max(min, Math.round((numVal - step) * 100) / 100);
        onChange(next);
    };

    const handleInc = (e) => {
        e.preventDefault();
        const next = Math.min(max, Math.round((numVal + step) * 100) / 100);
        onChange(next);
    };

    const handleInputChange = (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
            onChange(Math.max(min, Math.min(max, val)));
        } else {
            onChange(e.target.value);
        }
    };

    return (
        <div
            className="sentinel-number-stepper"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(2, 6, 23, 0.95)',
                border: '1px solid rgba(51, 65, 85, 0.9)',
                borderRadius: 6,
                overflow: 'hidden',
                height: 34,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                width
            }}
        >
            <button
                type="button"
                onClick={handleDec}
                disabled={disabled || numVal <= min}
                aria-label="Decrease value"
                style={{
                    width: 32,
                    height: '100%',
                    border: 'none',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: numVal <= min ? '#475569' : '#94a3b8',
                    cursor: numVal <= min ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.15s',
                    borderRight: '1px solid rgba(51, 65, 85, 0.6)',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    if (numVal > min && !disabled) {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                        e.currentTarget.style.color = '#38bdf8';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                    e.currentTarget.style.color = numVal <= min ? '#475569' : '#94a3b8';
                }}
            >
                −
            </button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 6px' }}>
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="sentinel-stepper-input"
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        color: '#38bdf8',
                        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        padding: '0 4px',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        margin: 0
                    }}
                />
                {unit && (
                    <span
                        style={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            position: 'absolute',
                            right: 8,
                            pointerEvents: 'none',
                            fontWeight: 600,
                            fontFamily: 'sans-serif'
                        }}
                    >
                        {unit}
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={handleInc}
                disabled={disabled || numVal >= max}
                aria-label="Increase value"
                style={{
                    width: 32,
                    height: '100%',
                    border: 'none',
                    background: 'rgba(30, 41, 59, 0.6)',
                    color: numVal >= max ? '#475569' : '#94a3b8',
                    cursor: numVal >= max ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 700,
                    transition: 'all 0.15s',
                    borderLeft: '1px solid rgba(51, 65, 85, 0.6)',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                    if (numVal < max && !disabled) {
                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
                        e.currentTarget.style.color = '#38bdf8';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                    e.currentTarget.style.color = numVal >= max ? '#475569' : '#94a3b8';
                }}
            >
                +
            </button>
        </div>
    );
}
