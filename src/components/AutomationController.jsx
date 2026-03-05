import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../engine/store';

/**
 * AutomationController
 * Drives the UI states for the intro video recording.
 * Triggered by ?automate=true in URL.
 */
export default function AutomationController() {
    const location = useLocation();
    const {
        setIterationRound, setIterationStage, setIterating, addIterationLog, clearIteration,
        startRiskThinking, stopThinking,
    } = useStore();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('automate') === 'true') {
            const startRound = parseInt(query.get('round')) || 1;
            runVideoSequence(startRound);
        }
    }, [location.search]);

    const runVideoSequence = async (startRound = 1) => {
        console.log(`Starting Sentinel Automation Sequence (Round ${startRound})...`);

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        // Initial Reset
        clearIteration();
        setIterating(false);

        // --- SCENE 1: The Multi-Million Dollar Guess (Pain Point) ---
        // (Wait for intro titles in video edit)
        await delay(2000);

        // --- SCENE 2: Round 1 - Proactive Discovery ---
        if (startRound <= 1) {
            setIterating(true);
            setIterationRound(1);

            setIterationStage('perceiving');
            addIterationLog({ text: 'ANOMALY DETECTED: UNUSUAL LEAF WETNESS DURATION (4.2h)', type: 'system' });
            await delay(1500);

            setIterationStage('analyzing');
            addIterationLog({ text: 'CORRELATING WITH HISTORICAL SPORE PRESSURE MODELS...', type: 'ai' });
            await delay(1500);

            setIterationStage('reasoning');
            addIterationLog({ text: 'RISK: STRUCTURAL REVENUE LEAKAGE (SRL) DETECTED. HIGH PROBABILITY OF HIDDEN INFECTION.', type: 'ai' });
            await delay(1500);

            setIterationStage('deciding');
            addIterationLog({ text: 'ACTION: REQUESTING MULTIMODAL DRONE SCAN FOR MICRO-STRESS DETECTION.', type: 'ai' });
            await delay(1500);

            setIterationStage('verifying');
            addIterationLog({ text: 'DRONE AGENT DISPATCHED. COORDINATING WITH FLIGHT OPERATIONS.', type: 'system' });
            await delay(2000);
        }

        // --- SCENE 3: Round 2 - Evidence & Agent Collaboration ---
        if (startRound <= 2) {
            setIterating(true);
            setIterationRound(2);

            setIterationStage('perceiving');
            addIterationLog({ text: 'DRONE DATA INGESTED: MULTISPECTRAL IMAGERY CONFIRMS EARLY BOTRYTIS CLUSTERS.', type: 'system' });
            await delay(1500);

            setIterationStage('analyzing');
            addIterationLog({ text: 'CALCULATING PROFIT IMPACT. 42% OF GRADE A QUALITY AT IMMEDIATE RISK.', type: 'ai' });
            await delay(1500);

            setIterationStage('reasoning');
            addIterationLog({ text: 'REASONING: PREVENTATIVE APPLICATION REQUIRED WITHIN 4 HOURS TO HALT SRL.', type: 'ai' });
            await delay(1500);

            setIterationStage('deciding');
            addIterationLog({ text: 'ENGAGING AGENT MESH: FINANCE (BUDGET), SUPPLY (LOAD), LABOR (SCHEDULE).', type: 'ai' });
            await delay(1500);

            setIterationStage('verifying');
            addIterationLog({ text: 'ALL AGENTS ALIGNED. PROCUREMENT AUTHENTICATED. OPERATOR APPROVAL BYPASSED (AUTONOMOUS).', type: 'system' });
            await delay(2000);
        }

        // --- SCENE 4: Round 3 - Closing the Loop ---
        if (startRound <= 3) {
            setIterating(true);
            setIterationRound(3);

            setIterationStage('perceiving');
            addIterationLog({ text: 'SPRAY AGENT CONFIRMS COMPLETION. REAL-TIME TELEMETRY VERIFIED.', type: 'system' });
            await delay(1500);

            setIterationStage('analyzing');
            addIterationLog({ text: 'SRL MITIGATED. PROJECTED REVENUE PROTECTED: CNY 428,000.', type: 'ai' });
            await delay(1500);

            setIterationStage('reasoning');
            addIterationLog({ text: 'SENTINEL DECISION OS: UNCERTAINTY TRANSFORMED INTO DETERMINISTIC PROFIT.', type: 'ai' });
            await delay(1500);

            setIterationStage('deciding');
            addIterationLog({ text: 'UPDATING GOVERNMENT COMPLIANCE LOGS & CLIENT PORTAL.', type: 'ai' });
            await delay(1500);

            setIterationStage('verifying');
            addIterationLog({ text: 'SYSTEM STABLE. 24/7 PROACTIVE MONITORING CONTINUES.', type: 'system' });
            await delay(3000);
        }

        // Finish Sequence
        setIterating(false);
        console.log("Automation Sequence Complete.");
    };

    return null; // Side effect component
}
