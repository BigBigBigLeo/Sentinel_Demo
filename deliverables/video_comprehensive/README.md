# Sentinel Comprehensive Investor Video Package (120s)

Files included:
- `storyboard_comprehensive_120s.csv`
- `subtitle_comprehensive_120s.srt`
- `voiceover_comprehensive_en.txt`
- `kpi_overlay_comprehensive_120s.json`

Render script:
- `scripts/video_pipeline/build_comprehensive.cjs`

Default render output:
- `scripts/video_pipeline/output_comprehensive/sentinel_investor_comprehensive_v1.mp4`
- copied to `deliverables/video_comprehensive/sentinel_investor_comprehensive_v1.mp4`

## v2 (150s Expanded Narrative)

Files included:
- `storyboard_comprehensive_v2_150s.csv`
- `subtitle_comprehensive_v2_150s.srt`
- `voiceover_comprehensive_v2_en.txt`
- `kpi_overlay_comprehensive_v2_150s.json`

Render script:
- `scripts/video_pipeline/build_comprehensive_v2.cjs`

Default render output:
- `scripts/video_pipeline/output_comprehensive_v2/sentinel_investor_comprehensive_v2_150s.mp4`
- copied to `deliverables/video_comprehensive/sentinel_investor_comprehensive_v2_150s.mp4`

## v3 (165s Subtitle Safe-Zone + Agent/Reasoning Enhanced)

Files included:
- `storyboard_comprehensive_v3_165s.csv`
- `subtitle_comprehensive_v3_165s.srt`
- `voiceover_comprehensive_v3_en.txt`

Render script:
- `scripts/video_pipeline/build_comprehensive_v3.cjs`

Default render output:
- `scripts/video_pipeline/output_comprehensive_v3/sentinel_investor_comprehensive_v3_165s.mp4`
- copied to `deliverables/video_comprehensive/sentinel_investor_comprehensive_v3_165s.mp4`

Language option:
- `VIDEO_LANG=zh` -> output suffix `_zhCN`
- `VIDEO_LANG=en` -> output suffix `_enUS` (fallback timeline if no dedicated EN track is configured)

Chinese industry-style assets:
- `subtitle_comprehensive_v3_zhCN_industry.srt`
- `voiceover_comprehensive_v3_zhCN_industry.txt`
