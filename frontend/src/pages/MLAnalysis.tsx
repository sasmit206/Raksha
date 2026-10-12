import { useState, useEffect } from 'react';
import { Network, Activity, Cpu, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export function MLAnalysis() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchML = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ml/diagnostics`);
        if (res.ok) {
          const data = await res.json();
          setDiagnostics(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchML();
    const interval = setInterval(fetchML, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-muted-foreground">Loading ML Diagnostics...</div>;
  }

  const trendData = diagnostics?.latest_anomaly_trend?.map((val: number, i: number) => ({
    time: i,
    score: (val * 100).toFixed(1)
  })) || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ML Analysis & Diagnostics</h1>
          <p className="text-muted-foreground mt-1">Real-time model evaluation, anomaly scoring trends, and feature weights</p>
        </div>
        <div className="flex items-center gap-3">
          {diagnostics?.is_trained ? (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-xs font-bold tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              MODEL TRAINED
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md text-xs font-bold tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              UNTRAINED / FALLBACK MODE
            </div>
          )}
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-xs font-bold tracking-wider">
            {diagnostics?.parameters?.algorithm?.toUpperCase() || "ISOLATION FOREST"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Model Metrics Card */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115] md:col-span-1">
          <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Model Hyperparameters
          </h3>
          <div className="space-y-4 text-[13px]">
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Contamination</span>
              <span className="font-mono text-indigo-400">{diagnostics?.parameters?.contamination}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">N-Estimators</span>
              <span className="font-mono text-indigo-400">{diagnostics?.parameters?.n_estimators}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Max Samples</span>
              <span className="font-mono text-indigo-400">{diagnostics?.parameters?.max_samples}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-2">
              <span className="text-muted-foreground">Random State</span>
              <span className="font-mono text-indigo-400">{diagnostics?.parameters?.random_state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Events Analyzed</span>
              <span className="font-mono text-indigo-400">{diagnostics?.training_samples}</span>
            </div>
          </div>
        </div>

        {/* Live Anomaly Scoring Trend */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115] md:col-span-3">
          <h3 className="text-[14px] font-semibold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Real-Time Anomaly Scores
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Tracking the latest 20 events evaluated by the Isolation Forest decision function.</p>
          <div className="h-48 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="time" stroke="#666" tick={false} />
                  <YAxis stroke="#666" domain={[0, 100]} fontSize={11} />
                  <ReTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                  <Area type="monotone" dataKey="score" stroke="#ef4444" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border/50 rounded-md">
                No active telemetry events to score.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bars */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold mb-6 flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-500" />
            Feature Importance & Weighting
          </h3>
          <div className="space-y-6">
            {diagnostics?.features?.sort((a: any, b: any) => b.importance - a.importance).map((feat: any, idx: number) => (
              <div key={idx} className="text-[12px]">
                <div className="flex justify-between mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-foreground font-medium text-[13px]">{feat.name}</span>
                    <span className="text-muted-foreground text-[11px]">{feat.description}</span>
                  </div>
                  <span className="text-indigo-400 font-mono text-[14px]">{feat.importance}%</span>
                </div>
                <div className="h-2 w-full bg-[#16161a] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${feat.importance}%`,
                      backgroundColor: feat.importance > 70 ? '#ef4444' : feat.importance > 40 ? '#f59e0b' : '#6366f1'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Space Visualization (Placeholder/Synthetic to show depth) */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col">
          <h3 className="text-[14px] font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Dimensionality Space (Top 2 Features)
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Visualizing the separation boundary. High event rates combined with high severity map directly to critical anomalies.
          </p>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnostics?.features?.slice(0,4)} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#666" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={100} />
                <ReTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '12px' }} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                  {diagnostics?.features?.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#6366f1', '#10b981'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
