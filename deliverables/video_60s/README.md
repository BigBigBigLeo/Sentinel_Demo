# Sentinel 60s Investor Video Package (v2.0)

## Files
- `storyboard_60s.csv`
- `subtitle_60s.srt`
- `voiceover_60s_en.txt`
- `kpi_overlay_60s.json`
- `qa_acceptance_60s.md`

## Encoding and timing
- Text files are UTF-8.
- Subtitle timing is locked to `00:00:00,000` through `00:01:00,000`.
- Subtitle cues follow the spec constraints:
  - max 2 lines per cue
  - max 18 characters per line
  - cue duration in `[1.2s, 4.0s]`

## Integration mapping
- Use `storyboard_60s.csv` as scene-level edit blueprint.
- Use `subtitle_60s.srt` as hard-subtitle source.
- Use `voiceover_60s_en.txt` for English VO session/recording.
- Use `kpi_overlay_60s.json` for KPI layer timing and style bindings.

## Notes
- KPI values are demo placeholders/ranges and can be replaced with real client metrics without changing timeline structure.
