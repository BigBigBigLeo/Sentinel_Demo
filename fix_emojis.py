"""Replace all emoji characters with Icon component references across JSX files."""
import os
import sys

# Fix encoding issues on Windows
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SRC = r"c:\Users\lvyel\OneDrive\Antigravity\Sentinel\Sentinel_Demo\src"

def apply_replacements(filepath, reps):
    if not os.path.exists(filepath):
        print(f"  SKIP: {filepath} not found")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    count = 0
    for old, new in reps.items():
        if old in content:
            content = content.replace(old, new)
            count += 1
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  {count} replacements applied to {os.path.basename(filepath)}")
    else:
        print(f"  No replacements needed in {os.path.basename(filepath)}")

pages = os.path.join(SRC, "pages")

# ═══════════════════════════════════════════
# ScenarioControl.jsx
# ═══════════════════════════════════════════
print("=== ScenarioControl.jsx ===")
reps_sc = {}
reps_sc["{ disease: '\U0001f9a0', compound: '\U0001f517', environmental: '\u2744\ufe0f', system_failure: '\u2699\ufe0f' }"] = \
    "{ disease: 'virus', compound: 'link', environmental: 'snowflake', system_failure: 'gear' }"
reps_sc["return map[type] || '\u26a1';"] = "return map[type] || 'bolt';"
reps_sc["const threatTypeIcon = (type)"] = "const threatTypeIconName = (type)"
reps_sc["{ key: 'detection', label: 'Detection', icon: '\U0001f4e1' }"] = \
    "{ key: 'detection', label: 'Detection', icon: 'perception' }"
reps_sc["{ key: 'risk', label: 'Risk Analysis', icon: '\u26a1' }"] = \
    "{ key: 'risk', label: 'Risk Analysis', icon: 'bolt' }"
reps_sc["{ key: 'prescription', label: 'Prescription', icon: '\U0001f48a' }"] = \
    "{ key: 'prescription', label: 'Prescription', icon: 'prescription' }"
reps_sc["{ key: 'execution', label: 'Execution', icon: '\U0001f3af' }"] = \
    "{ key: 'execution', label: 'Execution', icon: 'target' }"
reps_sc["{ key: 'audit', label: 'Audit', icon: '\U0001f4cb' }"] = \
    "{ key: 'audit', label: 'Audit', icon: 'clipboard' }"
# Outcome metrics emojis
reps_sc["\U0001f4b0 \u00a5"] = "<Icon name=\"money\" size={10} color=\"#34d399\" /> \u00a5"
reps_sc["\U0001f48a "] = "<Icon name=\"prescription\" size={10} color=\"#f59e0b\" /> "
reps_sc["\u26a1 {s.outcomeMetrics.responseTimeMin}"] = "<Icon name=\"bolt\" size={10} color=\"#38bdf8\" /> {s.outcomeMetrics.responseTimeMin}"

apply_replacements(os.path.join(pages, "ScenarioControl.jsx"), reps_sc)

# Also need to update references to threatTypeIcon in JSX
fp = os.path.join(pages, "ScenarioControl.jsx")
with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("{threatTypeIcon(", "{threatTypeIconName(")
with open(fp, 'w', encoding='utf-8') as f:
    f.write(c)
print("  Updated threatTypeIcon references")

# ═══════════════════════════════════════════
# History.jsx
# ═══════════════════════════════════════════
print("\n=== History.jsx ===")
reps_h = {}
reps_h["A \u2713"] = "A+"
reps_h["grade.includes('\u2713')"] = "grade.includes('+')"
reps_h["'\u2713 Success'"] = "'Success'"
reps_h["'\u26a0 Issues'"] = "'Issues'"
reps_h["icon: '\U0001f4cb'"] = "icon: 'clipboard'"
reps_h["icon: '\U0001f916'"] = "icon: 'robot'"
reps_h["icon: '\u26a1'"] = "icon: 'bolt'"
reps_h["\U0001f5c2\ufe0f"] = "<Icon name=\"folder\" size={16} color=\"#38bdf8\" />"
reps_h["\u26a0 Revenue loss"] = "<Icon name=\"warning\" size={10} color=\"#f59e0b\" /> Revenue loss"
reps_h["\u26a0 Excess cost"] = "<Icon name=\"warning\" size={10} color=\"#f59e0b\" /> Excess cost"
reps_h["\u26a1 69%"] = "<Icon name=\"bolt\" size={10} color=\"#38bdf8\" /> 69%"
reps_h["icon: '\u2705'"] = "icon: 'check-circle'"
reps_h["icon: '\U0001f6e1\ufe0f'"] = "icon: 'shield'"
reps_h["icon: '\U0001f32c\ufe0f'"] = "icon: 'wind'"
reps_h["icon: '\U0001f3db\ufe0f'"] = "icon: 'building'"

apply_replacements(os.path.join(pages, "History.jsx"), reps_h)

# ═══════════════════════════════════════════
# SensorTelemetry.jsx
# ═══════════════════════════════════════════
print("\n=== SensorTelemetry.jsx ===")
reps_st = {}
reps_st["icon: '\U0001f321\ufe0f'"] = "icon: 'thermostat'"
reps_st["icon: '\u2600\ufe0f'"] = "icon: 'sun'"
reps_st["icon: '\U0001f327\ufe0f'"] = "icon: 'cloud-rain'"
reps_st["icon: '\U0001f4e1'"] = "icon: 'signal'"
# Status dots
reps_st["\u25cf Normal"] = "Normal"
reps_st["\u25cf Risky"] = "Risky"
reps_st["\u25cf Critical"] = "Critical"

apply_replacements(os.path.join(pages, "SensorTelemetry.jsx"), reps_st)

# ═══════════════════════════════════════════
# SensorData.jsx
# ═══════════════════════════════════════════
print("\n=== SensorData.jsx ===")
reps_sd = {}
reps_sd["\u26a1 {alert.prediction}"] = "<Icon name=\"bolt\" size={10} color=\"#f59e0b\" /> {alert.prediction}"

apply_replacements(os.path.join(pages, "SensorData.jsx"), reps_sd)

# ═══════════════════════════════════════════
# Check for remaining emojis across ALL jsx files
# ═══════════════════════════════════════════
import re

emoji_pattern = re.compile(
    "(?:[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|"
    "[\U0001F1E0-\U0001F1FF]|[\U00002702-\U000027B0]|[\U0001F900-\U0001F9FF]|"
    "[\U0001FA70-\U0001FAFF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\u2B50\u2B55]|"
    "[\u23CF\u23E9-\u23F3\u23F8-\u23FA]|[\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE]|"
    "[\u2934\u2935]|[\u2190-\u21FF])"
)

print("\n=== Checking for remaining emojis ===")
for root, dirs, files in os.walk(SRC):
    for fn in files:
        if fn.endswith('.jsx') or fn.endswith('.js'):
            fp = os.path.join(root, fn)
            with open(fp, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    matches = emoji_pattern.findall(line)
                    if matches:
                        # Filter out arrows used in code (→)
                        real_matches = [m for m in matches if m not in ('\u2192', '\u2190', '\u2794')]
                        if real_matches:
                            print(f"  {fn}:{line_num} => {real_matches}")

print("\nDone!")
