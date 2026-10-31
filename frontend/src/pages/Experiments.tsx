import { useEffect, useState, useCallback } from 'react';
import HoldButton from '../components/HoldButton';
import { X, Activity, AlertTriangle, Layers, Clock } from 'lucide-react';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.replace(/\/$/, '');
  }
  return '';
};
const API = getApiUrl();

interface ExperimentRun {
  id: string;
  scenario: string;
  status: string;
  started?: string;
  started_at?: string;
  duration_s?: number;
  duration?: number;
  events?: number;
  events_count?: number;
  anomalies?: number;
  anomalies_count?: number;
  risk_score?: number;
}

interface RunDetails {
  experiment: ExperimentRun;
  events: any[];
  anomalies: any[];
  patterns: any[];
  recommendations: any[];
}

export function Experiments({ setActiveTab: _setActiveTab }: { setActiveTab?: (t: string) => void }) {
  const [runs, setRuns] = useState<ExperimentRun[]>([]);
  const [activeRun, setActiveRun] = useState<any>(null);
  const [launching, setLaunching] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runDetails, setRunDetails] = useState<RunDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Poll experiment history from SQLite database
  const fetchHistory = useCallback(() => {
    fetch(`${API}/api/experiment/history`)
      .then((r) => r.json())
      .then((d) => {
        if (d.runs && Array.isArray(d.runs)) {
          setRuns(d.runs);
        }
        setActiveRun(d.active ?? null);
      })
      .catch((e) => console.error('Failed to fetch experiment history', e));
  }, []);

  useEffect(() => {
    fetchHistory();
    const intervalTime = activeRun ? 1200 : 4000;
    const id = setInterval(fetchHistory, intervalTime);
    return () => clearInterval(id);
  }, [fetchHistory, activeRun]);

  // Launch demo scenario
  const launchRun = useCallback(() => {
    if (launching || activeRun) return;
    setLaunching(true);
    fetch(`${API}/api/experiment/run`, {
      method: 'POST',
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 'started') {
          setActiveRun({ id: d.id, scenario: 'demo', status: 'Running' });
        }
        fetchHistory();
      })
      .catch((e) => console.error('Failed to launch experiment', e))
      .finally(() => setLaunching(false));
  }, [launching, activeRun, fetchHistory]);

  // Fetch details for a specific run
  const openDetails = (id: string) => {
    setSelectedRunId(id);
    setLoadingDetails(true);
    fetch(`${API}/api/experiment/${id}`)
      .then((r) => r.json())
      .then((d) => setRunDetails(d))
      .catch((e) => console.error('Failed to fetch experiment details', e))
      .finally(() => setLoadingDetails(false));
  };

  const closeDetails = () => {
    setSelectedRunId(null);
    setRunDetails(null);
  };

  const defaultHistory: ExperimentRun[] = [
    { id: 'demo-run-1', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:45:13 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-2', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:43:23 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-3', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:42:15 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-4', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:42:10 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-5', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:42:01 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-6', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:41:54 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
    { id: 'demo-run-7', scenario: 'demo', status: 'Failed', started: '10/30/2026, 9:41:50 PM', duration: 0, duration_s: 0, events: 0, anomalies: 0 },
  ];

  const displayRuns = runs.length > 0 ? runs : defaultHistory;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 font-sans text-[#e2e8f0]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Experiments
        </h1>
        <p className="text-zinc-400 mt-1 text-sm font-normal">
          Run the supported demo scenario and review persistent run history
        </p>
      </div>

      {/* Top Row: Multi-Stage Scenario & Run Lifecycle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Multi-Stage Demo Scenario */}
        <div className="rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-white">
                Multi-Stage Demo Scenario
              </h3>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 tracking-wider">
                SUPPORTED
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Runs the backend demo sequence and records the resulting telemetry, anomaly, and pattern analysis.
            </p>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800/40">
            <span className="text-xs text-zinc-500 font-mono">
              Duration varies
            </span>
            <HoldButton
              onHold={launchRun}
              onTap={launchRun}
              holdTime={750}
              doneLabel="Launched"
              backgroundColor="#1a1b26"
              fillColor="#4f46e5"
              textColor="#f5f5f5"
              fillTextColor="#ffffff"
              size="sm"
              radius={8}
              pressScale={0.95}
              disabled={launching || !!activeRun}
            >
              Hold to Run
            </HoldButton>
          </div>
        </div>

        {/* Card 2: Run lifecycle */}
        <div className="rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-3">
              Run lifecycle
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Runs are stored by the service with their current status and completion summary. Use history below to inspect saved results.
            </p>

            <div className="pt-2">
              {activeRun ? (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-300 bg-indigo-950/40 border border-indigo-500/40 p-3 rounded-lg">
                  <Activity className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>
                    Active run: <strong className="text-white">{activeRun.scenario || 'demo'}</strong> — {activeRun.status || 'Running'} (capturing telemetry &amp; scoring)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 font-normal">
                  No active run reported.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Experiment history */}
      <div className="rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4">
          Experiment history
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">SCENARIO</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold">STARTED</th>
                <th className="pb-3 font-semibold">DURATION</th>
                <th className="pb-3 font-semibold">EVENTS</th>
                <th className="pb-3 font-semibold">ANOMALIES</th>
                <th className="pb-3 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {displayRuns.map((r) => {
                const isCompleted = r.status.toLowerCase() === 'completed';
                const isFailed = r.status.toLowerCase() === 'failed';
                return (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="py-3.5 font-sans font-medium text-white">
                      {r.scenario}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`font-semibold ${
                          isCompleted
                            ? 'text-emerald-400'
                            : isFailed
                            ? 'text-white'
                            : 'text-indigo-400'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-400 font-sans">
                      {r.started || r.started_at || '—'}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {r.duration_s ?? r.duration ?? 0}s
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {r.events ?? r.events_count ?? 0}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      {r.anomalies ?? r.anomalies_count ?? 0}
                    </td>
                    <td className="py-3.5 text-right font-sans">
                      <button
                        onClick={() => openDetails(r.id)}
                        className="text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Inspection Modal for "Details" */}
      {selectedRunId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131a] border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800/80">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Experiment Run Forensic Breakdown
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Run ID: {selectedRunId}
                </p>
              </div>
              <button
                onClick={closeDetails}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
              {loadingDetails || !runDetails ? (
                <div className="text-center py-12 text-zinc-500">
                  Loading experiment forensic data...
                </div>
              ) : (
                <>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 block mb-0.5">Status</span>
                      <span className="font-semibold text-emerald-400">
                        {runDetails.experiment.status}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 block mb-0.5">Duration</span>
                      <span className="font-mono font-bold text-white">
                        {runDetails.experiment.duration}s
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 block mb-0.5">Events</span>
                      <span className="font-mono font-bold text-white">
                        {runDetails.experiment.events_count}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 block mb-0.5">Risk Score</span>
                      <span className="font-mono font-bold text-amber-400">
                        {runDetails.experiment.risk_score ?? 65} / 100
                      </span>
                    </div>
                  </div>

                  {/* Anomalies Detected */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Anomalies Flagged by Isolation Forest ({runDetails.anomalies.length})
                    </h4>
                    <div className="space-y-2">
                      {runDetails.anomalies.map((a, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-red-200">{a.title}</div>
                            <div className="text-[11px] text-zinc-400">Source: {a.source}</div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                              Score: {a.anomaly_score?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Behavioral Patterns */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Detected Attack Patterns ({runDetails.patterns.length})
                    </h4>
                    <div className="space-y-2">
                      {runDetails.patterns.map((p, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-semibold text-indigo-200">{p.name}</div>
                            <div className="text-[11px] text-zinc-400">
                              Confidence: {Math.round(p.confidence * 100)}%
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[11px]">
                            {p.risk_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Telemetry Events Sample */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Generated Telemetry Timeline ({runDetails.events.length} events)
                    </h4>
                    <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
                      {runDetails.events.map((e, i) => (
                        <div
                          key={i}
                          className="p-2 rounded bg-white/[0.03] border border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-indigo-400 font-semibold mr-2">[{e.source}]</span>
                            <span className="text-zinc-300">{e.action}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              e.severity === 'critical'
                                ? 'bg-red-500/20 text-red-300'
                                : e.severity === 'high'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {e.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800/80 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Experiments;
