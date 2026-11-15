import React, { useState, useRef, useEffect } from 'react';

/**
 * Sentinel 7.2 Industrial Delayed Hover Tooltip
 * Appears gently after hovering for delayMs (default: 1000ms / 1.0s)
 * Avoids screen flickering while providing deep agronomic and operational context.
 */
export default function Tooltip({
    children,
    title = '',
    content = '',
    formula = '',
    delayMs = 1000,
    placement = 'top'
}) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => {
            setVisible(true);
        }, delayMs);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!content && !title) return children;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', flexDirection: 'column' }}
        >
            {children}
            {visible && (
                <div
                    role="tooltip"
                    style={{
                        position: 'absolute',
                        bottom: placement === 'top' ? 'calc(100% + 8px)' : 'auto',
                        top: placement === 'bottom' ? 'calc(100% + 8px)' : 'auto',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 99999,
                        background: 'rgba(9, 13, 22, 0.96)',
                        border: '1px solid #38bdf8',
                        borderRadius: 6,
                        padding: '10px 12px',
                        width: 'max-content',
                        maxWidth: 280,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.75), 0 0 12px rgba(56, 189, 248, 0.15)',
                        backdropFilter: 'blur(8px)',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.2s ease',
                        textAlign: 'left'
                    }}
                >
                    {title && (
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', marginBottom: 4 }}>
                            {title}
                        </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                        {content}
                    </div>
                    {formula && (
                        <div style={{ fontSize: '0.65rem', color: '#10b981', fontFamily: 'monospace', marginTop: 4, borderTop: '1px solid #1e293b', paddingTop: 4 }}>
                            {formula}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
