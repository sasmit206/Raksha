import { Terminal } from 'lucide-react';

export function LiveMonitor() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = () => {
    fetch('http://localhost:8000/api/telemetry?limit=20')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 1000); // Fast polling for live feel
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Monitor</h1>
          <p className="text-muted-foreground mt-1">Real-time streaming telemetry feed</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs font-bold tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          STREAMING ACTIVE
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0b] border border-border/40 rounded-xl overflow-hidden font-mono text-[11px] p-4 flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground mb-4 border-b border-border/40 pb-2">
          <Terminal className="w-4 h-4" />
          <span>RAKSHA-01 /var/log/syslog (Aggregated)</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {logs.length === 0 ? (
            <div className="text-muted-foreground/50">Awaiting telemetry streams...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex gap-4 hover:bg-white/5 px-2 py-1 rounded">
                <span className="text-muted-foreground shrink-0">{new Date(log.timestamp).toISOString()}</span>
                <span className="text-indigo-400 shrink-0 w-20">{log.source}</span>
                <span className={`shrink-0 w-16 ${log.severity === 'critical' ? 'text-red-500' : log.severity === 'high' ? 'text-amber-500' : 'text-emerald-500'}`}>
                  [{log.severity.toUpperCase()}]
                </span>
                <span className={log.anomaly_score > 0.6 ? 'text-red-400' : 'text-foreground/80'}>
                  {log.event_type} {log.anomaly_score > 0.6 && `(Anomaly Score: ${log.anomaly_score.toFixed(2)})`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
