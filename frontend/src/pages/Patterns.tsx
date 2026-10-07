import React, { useEffect, useState } from 'react';
import { GitMerge, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

export function Patterns() {
  const [patterns, setPatterns] = useState<any[]>([]);

  const fetchPatterns = () => {
    fetch('http://localhost:8000/api/patterns')
      .then(res => res.json())
      .then(data => setPatterns(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPatterns();
    const interval = setInterval(fetchPatterns, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Behavioral Patterns</h1>
          <p className="text-muted-foreground mt-1">Multi-stage attack sequences correlated by the pattern engine</p>
        </div>
      </div>

      {patterns.length === 0 ? (
        <div className="p-12 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
           <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
           <h3 className="text-lg font-medium">No Malicious Patterns Detected</h3>
           <p className="text-muted-foreground mt-2 max-w-sm">System behavior is normal. No correlated sequences of anomalous behavior have been identified.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {patterns.map((pattern, idx) => (
            <div key={idx} className="border border-border bg-card rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded">
                      {pattern.risk_level} RISK
                    </span>
                    <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded">
                      {pattern.confidence > 0.8 ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{pattern.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Detected {pattern.evidence_count} correlated events within {pattern.time_window_seconds}s</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center text-xl font-bold">
                  {Math.round(pattern.confidence * 100)}%
                </div>
              </div>
              
              <div className="p-6 bg-secondary/10">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><GitMerge className="w-4 h-4" /> Attack Narrative</h4>
                <div className="space-y-4">
                  {pattern.evidence_events?.map((evt: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        {i !== pattern.evidence_events.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{evt.source}</span>
                          <span className="text-xs text-muted-foreground font-mono">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{evt.event_type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
