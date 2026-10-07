import React from 'react';
import { BrainCircuit, Network, Activity } from 'lucide-react';

export function MLAnalysis() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ML Analysis</h1>
          <p className="text-muted-foreground mt-1">Isolation Forest engine diagnostics and feature importance</p>
        </div>
        <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-xs font-bold tracking-wider">
          MODEL: ISOLATION FOREST v2.4
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold mb-4">Model Parameters</h3>
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Algorithm</span><span className="font-medium">Isolation Forest</span></div>
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Contamination</span><span className="font-mono text-indigo-400">0.05 (5%)</span></div>
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">N-Estimators</span><span className="font-mono text-indigo-400">100</span></div>
            <div className="flex justify-between border-b border-border/40 pb-2"><span className="text-muted-foreground">Max Samples</span><span className="font-mono text-indigo-400">"auto"</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Random State</span><span className="font-mono text-indigo-400">42</span></div>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold mb-6 flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-500" />
            Feature Importance (Relative)
          </h3>
          <div className="space-y-4">
            <FeatureBar label="Failed Authentication Count (10s window)" value={85} />
            <FeatureBar label="SUDO Invocation Frequency" value={72} />
            <FeatureBar label="Unexpected Outbound Port Usage" value={64} />
            <FeatureBar label="Process Tree Anomaly Score" value={45} />
            <FeatureBar label="Sensitive File Access (/etc/*)" value={38} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="text-[12px]">
      <div className="flex justify-between mb-1.5">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono">{value}%</span>
      </div>
      <div className="h-2 w-full bg-[#16161a] rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
