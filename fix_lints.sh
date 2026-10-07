#!/bin/bash
cd frontend/src/pages

# Dashboard
sed -i '' 's/Zap, //g' Dashboard.tsx
sed -i '' 's/Zap //g' Dashboard.tsx
sed -i '' 's/({ isFirst, /({ /g' Dashboard.tsx
sed -i '' 's/, isFirst//g' Dashboard.tsx
sed -i '' 's/isFirst, //g' Dashboard.tsx

# Experiments
sed -i '' '/import React/d' Experiments.tsx
sed -i '' '2d' Experiments.tsx

# LiveMonitor
sed -i '' '/import React/d' LiveMonitor.tsx
sed -i '' 's/Activity, //g' LiveMonitor.tsx
sed -i '' 's/, Activity//g' LiveMonitor.tsx

# Login
sed -i '' 's/onComplete={async (code: string) => {/onComplete={async () => {/g' Login.tsx

# MLAnalysis
sed -i '' '/import React/d' MLAnalysis.tsx
sed -i '' 's/BrainCircuit, //g' MLAnalysis.tsx
sed -i '' 's/Activity, //g' MLAnalysis.tsx
sed -i '' 's/, BrainCircuit//g' MLAnalysis.tsx
sed -i '' 's/, Activity//g' MLAnalysis.tsx

# Patterns
sed -i '' '/import React/d' Patterns.tsx
sed -i '' 's/Activity, //g' Patterns.tsx
sed -i '' 's/ShieldAlert, //g' Patterns.tsx
sed -i '' 's/, Activity//g' Patterns.tsx
sed -i '' 's/, ShieldAlert//g' Patterns.tsx

# Recommendations
sed -i '' '/import React/d' Recommendations.tsx

# Reports
sed -i '' '/import React/d' Reports.tsx

# SecureAssets
sed -i '' '/import React/d' SecureAssets.tsx

# Settings
sed -i '' '/import React/d' Settings.tsx
sed -i '' 's/Settings as SettingsIcon//g' Settings.tsx
sed -i '' 's/SettingsIcon, //g' Settings.tsx
sed -i '' 's/, SettingsIcon//g' Settings.tsx
sed -i '' '/import {  } from/d' Settings.tsx

# Telemetry
sed -i '' '/import React/d' Telemetry.tsx

# VMEnvironment
sed -i '' '/import React/d' VMEnvironment.tsx

echo "Done fixing lints."
