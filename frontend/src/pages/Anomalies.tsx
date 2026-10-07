import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChevronRight, Target, ShieldAlert } from 'lucide-react';

export function Anomalies() {
  const [anomalies, setAnomalies] = useState<any[]>([]);

  const fetchAnomalies = () => {
    fetch('http://localhost:8000/api/anomalies')
      .then(res => res.json())
      .then(data => setAnomalies(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Isolated Anomalies</h1>
          <p className="text-muted-foreground mt-1">Events flagged by the Isolation Forest ML model</p>
        </div>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-12 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
           <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4" />
           <h3 className="text-lg font-medium">No Anomalies Detected</h3>
           <p className="text-muted-foreground mt-2 max-w-sm">The current telemetry window contains no events exceeding the configured ML anomaly threshold.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {anomalies.map((anom, idx) => (
            <div key={idx} className="p-5 border border-border bg-card hover:border-indigo-500/50 transition-colors rounded-xl flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{anom.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3"/> Score: {anom.anomaly_score.toFixed(3)}</span>
                    <span>Source: {anom.source}</span>
                    <span className="font-mono text-xs">{new Date(anom.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium">Investigating</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
