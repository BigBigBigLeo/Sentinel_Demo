export default function Icon({ name, size = 18, color = "currentColor", className = "" }) {
    const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", className, style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 } };

    switch (name) {
        // 鈹佲攣鈹?Navigation Icons 鈹佲攣鈹?
        case 'home': return <svg {...p}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>;
        case 'dashboard': return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="4" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>;
        case 'sensors':
        case 'activity': return <svg {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth="1.8" /><circle cx="9" cy="3" r="0.5" fill={color} /><circle cx="15" cy="21" r="0.5" fill={color} /></svg>;
        case 'risk':
        case '!':
        case 'alert-triangle': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="1.5" /><line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" /><circle cx="12" cy="16.5" r="0.8" fill={color} stroke="none" /></svg>;
        case 'prescription':
        case 'file-text': return <svg {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" opacity="0.6" /><line x1="16" y1="17" x2="8" y2="17" opacity="0.6" /><line x1="10" y1="9" x2="8" y2="9" opacity="0.6" /></svg>;
        case 'execution':
        case 'play': return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth="1.2" opacity="0.3" /><polygon points="10 8 16 12 10 16 10 8" fill={color} stroke="none" /></svg>;
        case 'pause': return <svg {...p}><circle cx="12" cy="12" r="10" strokeWidth="1.2" opacity="0.3" /><rect x="9" y="8" width="2.5" height="8" rx="0.5" fill={color} stroke="none" /><rect x="13.5" y="8" width="2.5" height="8" rx="0.5" fill={color} stroke="none" /></svg>;
        case 'audit':
        case 'shield': return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" strokeWidth="2" /></svg>;
        case 'history': return <svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" strokeWidth="1.8" /><path d="M12 3V1" opacity="0.4" /><path d="M12 23v-2" opacity="0.4" /></svg>;
        case 'scenarios':
        case 'layers': return <svg {...p}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" opacity="0.5" /><path d="M2 12l10 5 10-5" opacity="0.7" /></svg>;
        case 'admin':
        case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" opacity="0.5" strokeWidth="1.3" /></svg>;

        // 鈹佲攣鈹?AI Agent Icons 鈹佲攣鈹?
        case 'perception': return <svg {...p} stroke="#38bdf8"><circle cx="12" cy="12" r="9" strokeWidth="1.2" opacity="0.4" /><circle cx="12" cy="12" r="5" strokeWidth="1.5" /><circle cx="12" cy="12" r="1.5" fill="#38bdf8" stroke="none" /><path d="M12 3v2" opacity="0.5" /><path d="M12 19v2" opacity="0.5" /><path d="M3 12h2" opacity="0.5" /><path d="M19 12h2" opacity="0.5" /></svg>;
        case 'reasoning':
        case 'brain': return <svg {...p} stroke="#f472b6"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.97-3.06 2.5 2.5 0 0 1-1.55-4.43 2.5 2.5 0 0 1 1.55-4.43 2.5 2.5 0 0 1 2.97-3.06A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.97-3.06 2.5 2.5 0 0 0 1.55-4.43 2.5 2.5 0 0 0-1.55-4.43 2.5 2.5 0 0 0-2.97-3.06A2.5 2.5 0 0 0 14.5 2z" /><circle cx="12" cy="7" r="0.6" fill="#f472b6" stroke="none" /><circle cx="12" cy="11" r="0.6" fill="#f472b6" stroke="none" /><circle cx="12" cy="15" r="0.6" fill="#f472b6" stroke="none" /></svg>;
        case 'drone': return <svg {...p} stroke="#f87171"><circle cx="12" cy="12" r="2.5" strokeWidth="1.5" /><path d="M12 9.5V6" /><path d="M12 18v-3.5" /><path d="M9.5 12H6" /><path d="M18 12h-3.5" /><circle cx="6" cy="6" r="1.8" strokeWidth="1.2" /><circle cx="18" cy="6" r="1.8" strokeWidth="1.2" /><circle cx="6" cy="18" r="1.8" strokeWidth="1.2" /><circle cx="18" cy="18" r="1.8" strokeWidth="1.2" /><line x1="7.3" y1="7.3" x2="9.7" y2="9.7" opacity="0.5" /><line x1="14.3" y1="9.7" x2="16.7" y2="7.3" opacity="0.5" /><line x1="7.3" y1="16.7" x2="9.7" y2="14.3" opacity="0.5" /><line x1="14.3" y1="14.3" x2="16.7" y2="16.7" opacity="0.5" /></svg>;
        case 'lock': return <svg {...p} stroke="#fbbf24"><rect x="3" y="11" width="18" height="11" rx="2.5" /><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="1.5" /><circle cx="12" cy="16" r="1.5" fill="#fbbf24" stroke="none" /><line x1="12" y1="17.5" x2="12" y2="19" strokeWidth="1.5" /></svg>;
        case 'audit-alt': return <svg {...p} stroke="#34d399"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" strokeWidth="2" /></svg>;

        // 鈹佲攣鈹?Status & Action Icons 鈹佲攣鈹?
        case 'star': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
        case 'box': return <svg {...p}><path d="M21 8V21H3V8" /><path d="M23 3H1v5h22V3z" /><line x1="10" y1="12" x2="14" y2="12" /></svg>;
        case 'dollar': return <svg {...p}><line x1="12" y1="1" x2="12" y2="23" strokeWidth="1.2" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
        case 'money': return <svg {...p}><rect x="2" y="6" width="20" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="6" cy="12" r="0.5" fill={color} stroke="none" /><circle cx="18" cy="12" r="0.5" fill={color} stroke="none" /></svg>;
        case 'trending-up': return <svg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeWidth="1.8" /><polyline points="16 7 22 7 22 13" /></svg>;
        case 'check': return <svg {...p} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
        case 'OK':
        case 'check-circle': return <svg {...p}><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" strokeWidth="2" /></svg>;
        case 'x': return <svg {...p} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
        case 'x-circle': return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" /><line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" /></svg>;
        case 'circle': return <svg {...p}><circle cx="12" cy="12" r="9" /></svg>;
        case 'dot': return <svg {...p}><circle cx="12" cy="12" r="3" fill={color} stroke="none" /></svg>;
        case 'chevron-right': return <svg {...p} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>;
        case 'chevron-down': return <svg {...p} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>;
        case 'arrow-right': return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
        case 'search': return <svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" /></svg>;

        // 鈹佲攣鈹?NEW: Bolt / Zap (replaces  鈹佲攣鈹?
        case 'bolt':
        case 'zap': return <svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.15" /></svg>;

        // 鈹佲攣鈹?NEW: Pathogen / Virus (replaces 馃) 鈹佲攣鈹?
        case 'pathogen':
        case 'virus': return <svg {...p}><circle cx="12" cy="12" r="5" /><line x1="12" y1="2" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="22" /><line x1="2" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="8.46" y2="8.46" /><line x1="15.54" y1="15.54" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="8.46" y2="15.54" /><line x1="15.54" y1="8.46" x2="19.07" y2="4.93" /></svg>;

        // 鈹佲攣鈹?NEW: Link / Chain (replaces 馃敆) 鈹佲攣鈹?
        case 'link':
        case 'chain': return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;

        // 鈹佲攣鈹?NEW: Snowflake (replaces 鉂勶笍) 鈹佲攣鈹?
        case 'snowflake':
        case 'frost': return <svg {...p}><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="19.07" y2="4.93" /><line x1="12" y1="2" x2="9" y2="5" opacity="0.6" /><line x1="12" y1="2" x2="15" y2="5" opacity="0.6" /><line x1="12" y1="22" x2="9" y2="19" opacity="0.6" /><line x1="12" y1="22" x2="15" y2="19" opacity="0.6" /></svg>;

        // 鈹佲攣鈹?NEW: Gear / Cog (replaces 鈿欙笍) 鈹佲攣鈹?
        case 'gear':
        case 'cog': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

        // 鈹佲攣鈹?NEW: Robot / AI (replaces 馃) 鈹佲攣鈹?
        case 'robot':
        case 'ai': return <svg {...p}><rect x="4" y="8" width="16" height="12" rx="2.5" /><circle cx="9" cy="14" r="1.5" fill={color} fillOpacity="0.3" /><circle cx="15" cy="14" r="1.5" fill={color} fillOpacity="0.3" /><line x1="9" y1="18" x2="15" y2="18" opacity="0.4" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" /></svg>;

        // 鈹佲攣鈹?NEW: User / Person (replaces 馃懁馃懛) 鈹佲攣鈹?
        case 'user':
        case 'person': return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        case 'users': return <svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" opacity="0.5" /><path d="M16 3.13a4 4 0 0 1 0 7.75" opacity="0.5" /></svg>;

        // 鈹佲攣鈹?NEW: Folder (replaces 馃梻锔? 鈹佲攣鈹?
        case 'folder': return <svg {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;

        // 鈹佲攣鈹?NEW: Building / Government (replaces 馃彌锔? 鈹佲攣鈹?
        case 'building':
        case 'government': return <svg {...p}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><line x1="9" y1="21" x2="9" y2="14" /><line x1="15" y1="21" x2="15" y2="14" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /></svg>;

        // 鈹佲攣鈹?NEW: Battery (replaces 馃攱) 鈹佲攣鈹?
        case 'battery': return <svg {...p}><rect x="1" y="7" width="18" height="10" rx="2" /><line x1="23" y1="11" x2="23" y2="13" /><rect x="3" y="9" width="8" height="6" rx="1" fill={color} fillOpacity="0.2" stroke="none" /></svg>;

        // 鈹佲攣鈹?NEW: Signal (replaces 馃摱) 鈹佲攣鈹?
        case 'signal':
        case 'wifi': return <svg {...p}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill={color} stroke="none" /></svg>;

        // 鈹佲攣鈹?NEW: Camera (replaces 馃摴) 鈹佲攣鈹?
        case 'camera': return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;

        // 鈹佲攣鈹?NEW: Clock / Timer (replaces 鈴? 鈹佲攣鈹?
        case 'clock':
        case 'timer': return <svg {...p}><circle cx="12" cy="13" r="8" /><polyline points="12 9 12 13 14.5 15" strokeWidth="1.8" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="16" y1="2" x2="14" y2="4" opacity="0.5" /><line x1="8" y1="2" x2="10" y2="4" opacity="0.5" /></svg>;

        // 鈹佲攣鈹?NEW: Wrench / Tool (replaces 馃敡) 鈹佲攣鈹?
        case 'wrench':
        case 'tool': return <svg {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;

        // 鈹佲攣鈹?NEW: Rotate / Refresh (replaces 馃攧) 鈹佲攣鈹?
        case 'refresh':
        case 'rotate': return <svg {...p}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" /></svg>;

        // 鈹佲攣鈹?NEW: Book / Library (replaces 馃摎) 鈹佲攣鈹?
        case 'book':
        case 'library': return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="7" x2="16" y2="7" opacity="0.4" /><line x1="8" y1="11" x2="14" y2="11" opacity="0.3" /></svg>;

        // 鈹佲攣鈹?NEW: Clipboard / Report (replaces 馃搵) 鈹佲攣鈹?
        case 'clipboard':
        case 'report': return <svg {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="8" y1="12" x2="16" y2="12" opacity="0.5" /><line x1="8" y1="16" x2="13" y2="16" opacity="0.4" /></svg>;

        // 鈹佲攣鈹?NEW: Facility / Factory (replaces 馃彮) 鈹佲攣鈹?
        case 'facility':
        case 'factory': return <svg {...p}><path d="M2 20h20" /><path d="M6 20V8l5 4V8l5 4V4h4v16" /><line x1="10" y1="16" x2="10" y2="20" opacity="0.4" /><line x1="16" y1="16" x2="16" y2="20" opacity="0.4" /></svg>;

        // 鈹佲攣鈹?Sensor Icons 鈹佲攣鈹?
        case 'thermostat': return <svg {...p}><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /><circle cx="11.5" cy="17.5" r="1.5" fill={color} stroke="none" opacity="0.4" /></svg>;
        case 'water-drop': return <svg {...p}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /><path d="M10 13a2.5 2.5 0 0 0 0 3" opacity="0.4" /></svg>;
        case 'leaf': return <svg {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
        case 'sun': return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" strokeWidth="1.3" /></svg>;
        case 'wind': return <svg {...p}><path d="M9.59 4.59A2 2 0 1 1 11 8H2" /><path d="M13.59 19.41A2 2 0 1 0 15 16H2" /><path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" /></svg>;
        case 'cloud-rain': return <svg {...p}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M16 14v6M8 14v6M12 16v6" strokeWidth="1.3" /></svg>;

        // 鈹佲攣鈹?Utility Icons 鈹佲攣鈹?
        case 'save': return <svg {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
        case 'download': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
        case 'export': return <svg {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
        case 'info': return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" /><circle cx="12" cy="8" r="0.8" fill={color} stroke="none" /></svg>;
        case 'warning': return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" /><circle cx="12" cy="16.5" r="0.8" fill={color} stroke="none" /></svg>;
        case 'map-pin': return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
        case 'target': return <svg {...p}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;

        default: return <svg {...p}><circle cx="12" cy="12" r="9" opacity="0.5" /><path d="M9 9h6M9 12h6M9 15h4" opacity="0.8" /></svg>;
    }
}

