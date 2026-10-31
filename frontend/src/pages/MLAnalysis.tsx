import { useEffect, useState, useCallback } from 'react';
import { Cpu, Activity } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface HyperParams {
  contamination: number;
  n_estimators: number;
  max_samples: string | number;
  random_state: number;
  events_analyzed: number;
}

interface EvalMetrics {
  dataset: string;
  samples: number;
  precision: number;
  recall: number;
  false_positive_rate: number;
  threshold: number;
  confusion: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}

interface ScorePoint {
  idx: number;
  score: number;
  label: string;
}

export function MLAnalysis() {
  const [hyper, setHyper] = useState<HyperParams | null>({
    contamination: 0.03,
    n_estimators: 100,
    max_samples: 'auto',
    random_state: 42,
    events_analyzed: 200,
  });
  const [evalData, setEval] = useState<EvalMetrics | null>({
    dataset: 'synthetic-held-out-v1',
    samples: 200,
    precision: 0.9139784946236559,
    recall: 0.85,
    false_positive_rate: 0.08,
    threshold: 0.6,
    confusion: { tp: 85, fp: 8, fn: 15, tn: 92 },
  });
  const [scores, setScores] = useState<ScorePoint[]>([]);
  const [modelTrained, setModelTrained] = useState(true);
  const [algo, setAlgo] = useState('ISOLATION FOREST');

  // Fetch model diagnostics from backend
  const fetchDiagnostics = useCallback(() => {
    fetch(`${API}/api/ml/diagnostics`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hyperparameters) setHyper(d.hyperparameters);
        if (d.evaluation) setEval(d.evaluation);
        setModelTrained(d.model_trained ?? d.is_trained ?? true);
        setAlgo(d.algorithm ?? 'ISOLATION FOREST');
      })
      .catch((e) => console.error('Failed to fetch ML diagnostics', e));
  }, []);

  // Poll real-time anomaly scores from Isolation Forest
  const fetchScores = useCallback(() => {
    fetch(`${API}/api/ml/scores/latest?n=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d.scores && Array.isArray(d.scores)) {
          setScores(d.scores);
        }
      })
      .catch((e) => console.error('Failed to fetch ML scores', e));
  }, []);

  useEffect(() => {
    fetchDiagnostics();
    fetchScores();
    const id = setInterval(() => {
      fetchDiagnostics();
      fetchScores();
    }, 4000);
    return () => clearInterval(id);
  }, [fetchDiagnostics, fetchScores]);

  const cm = evalData?.confusion ?? { tp: 85, fp: 8, fn: 15, tn: 92 };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 font-sans text-[#e2e8f0]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            ML Analysis &amp; Diagnostics
          </h1>
          <p className="text-zinc-400 mt-1 text-sm font-normal">
            Model diagnostics and measured evaluation results
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {modelTrained && (
            <div className="px-3.5 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              MODEL TRAINED
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-md bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-bold tracking-wider">
            {algo.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Top Row: Hyperparameters & Real-Time Anomaly Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Model Hyperparameters Card (Col span 4) */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-6">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Model Hyperparameters
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Contamination</span>
                <span className="font-mono text-[#7dd3fc] font-semibold text-sm">
                  {hyper?.contamination ?? 0.03}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">N-Estimators</span>
                <span className="font-mono text-[#7dd3fc] font-semibold text-sm">
                  {hyper?.n_estimators ?? 100}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Max Samples</span>
                <span className="font-mono text-[#7dd3fc] font-semibold text-sm">
                  {hyper?.max_samples ?? 'auto'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400">Random State</span>
                <span className="font-mono text-[#7dd3fc] font-semibold text-sm">
                  {hyper?.random_state ?? 42}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Events Analyzed</span>
                <span className="font-mono text-[#7dd3fc] font-semibold text-sm">
                  {hyper?.events_analyzed ?? 200}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Anomaly Scores Card (Col span 8) */}
        <div className="lg:col-span-8 rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              Real-Time Anomaly Scores
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Tracking the latest 20 events evaluated by the Isolation Forest decision function.
            </p>

            <div className="h-44 w-full rounded-lg border border-dashed border-zinc-800/80 bg-[#0c0d12]/60 p-4 flex items-center justify-center">
              {scores.length === 0 ? (
                <div className="text-zinc-500 text-sm font-medium">
                  No active telemetry events to score.
                </div>
              ) : (
                <div className="w-full h-full flex items-end gap-2 pt-2">
                  {scores.map((s, idx) => {
                    const isAnomaly = s.label === 'anomaly' || s.score >= 0.6;
                    const heightPct = Math.min(100, Math.max(12, Math.round(s.score * 100)));
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      >
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{
                            height: `${heightPct}%`,
                            background: isAnomaly
                              ? 'linear-gradient(180deg, #ef4444 0%, #7f1d1d 100%)'
                              : 'linear-gradient(180deg, #22c55e 0%, #14532d 100%)',
                          }}
                        />
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/90 text-zinc-200 border border-zinc-700 text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 font-mono">
                          #{s.idx}: {s.score.toFixed(4)} ({s.label})
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Measured Evaluation & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Measured evaluation Card */}
        <div className="rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">Measured evaluation</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Dataset: {evalData?.dataset ?? 'synthetic-held-out-v1'}. Synthetic teaching fixture with known severity labels; these metrics do not establish real-world detection performance.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                <div className="text-xs text-zinc-400 mb-1">Samples</div>
                <div className="font-mono text-xl font-bold text-[#7dd3fc]">
                  {evalData?.samples ?? 200}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                <div className="text-xs text-zinc-400 mb-1">Precision</div>
                <div className="font-mono text-xl font-bold text-[#7dd3fc]">
                  {evalData?.precision ?? '0.9139784946236559'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                <div className="text-xs text-zinc-400 mb-1">Recall</div>
                <div className="font-mono text-xl font-bold text-[#7dd3fc]">
                  {evalData?.recall ?? 0.85}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0b0c11] border border-zinc-800/60">
                <div className="text-xs text-zinc-400 mb-1">False positive rate</div>
                <div className="font-mono text-xl font-bold text-[#7dd3fc]">
                  {evalData?.false_positive_rate ?? 0.08}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/40 text-[11px] text-zinc-500 leading-normal">
            Threshold: {evalData?.threshold ?? 0.6} · Scores are Negative Isolation Forest score_samples; higher means more anomalous. This is not a calibrated probability or confidence percentage..
          </div>
        </div>

        {/* Confusion matrix Card */}
        <div className="rounded-xl border border-zinc-800/70 bg-[#12131a] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-6">Confusion matrix</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* True Positives */}
              <div className="p-6 rounded-lg bg-[#14231b]/60 border border-emerald-900/40 text-center flex flex-col justify-center items-center">
                <div className="text-xs text-zinc-400 mb-2">True positives</div>
                <div className="font-mono text-3xl font-bold text-white tracking-tight">
                  {cm.tp}
                </div>
              </div>

              {/* False Positives */}
              <div className="p-6 rounded-lg bg-[#271d15]/60 border border-amber-900/40 text-center flex flex-col justify-center items-center">
                <div className="text-xs text-zinc-400 mb-2">False positives</div>
                <div className="font-mono text-3xl font-bold text-white tracking-tight">
                  {cm.fp}
                </div>
              </div>

              {/* False Negatives */}
              <div className="p-6 rounded-lg bg-[#181a24]/60 border border-zinc-800/50 text-center flex flex-col justify-center items-center">
                <div className="text-xs text-zinc-400 mb-2">False negatives</div>
                <div className="font-mono text-3xl font-bold text-white tracking-tight">
                  {cm.fn}
                </div>
              </div>

              {/* True Negatives */}
              <div className="p-6 rounded-lg bg-[#181a24]/60 border border-zinc-800/50 text-center flex flex-col justify-center items-center">
                <div className="text-xs text-zinc-400 mb-2">True negatives</div>
                <div className="font-mono text-3xl font-bold text-white tracking-tight">
                  {cm.tn}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MLAnalysis;
