import { Search, Filter, Download } from 'lucide-react';

export function Telemetry() {
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = () => {
    fetch('http://localhost:8000/api/telemetry?limit=100')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telemetry Explorer</h1>
          <p className="text-muted-foreground mt-1">Raw and normalized event logs from monitored virtual machines</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-border bg-card hover:bg-secondary text-sm font-medium rounded-md flex items-center gap-2 transition-colors">
              <Filter className="w-4 h-4" /> Filter
           </button>
           <button className="px-4 py-2 border border-border bg-card hover:bg-secondary text-sm font-medium rounded-md flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search events, sources, or IPs..." 
              className="w-full bg-secondary border-none rounded-md pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">VM ID</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Integrity</th>
                <th className="px-6 py-3">ML Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No telemetry events collected yet. Run a demonstration or start an experiment.
                  </td>
                </tr>
              ) : (
                events.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}</td>
                    <td className="px-6 py-4 font-medium">{evt.vm_id}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                        {evt.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">{evt.event_type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${evt.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                          evt.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                          evt.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-500'}`}>
                        {evt.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {evt.signature ? (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-500">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Valid
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <span className={evt.anomaly_score > 0.5 ? 'text-amber-500' : 'text-emerald-500'}>
                        {evt.anomaly_score.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
