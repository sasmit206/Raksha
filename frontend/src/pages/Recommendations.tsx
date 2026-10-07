import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, ServerCrash } from 'lucide-react';

export function Recommendations() {
  const [recs, setRecs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recommendations`)
      .then(res => res.json())
      .then(data => setRecs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
          <p className="text-muted-foreground mt-1">Automated mitigation strategies based on identified threat patterns</p>
        </div>
      </div>

      {recs.length === 0 ? (
        <div className="p-12 border border-border border-dashed rounded-xl flex flex-col items-center justify-center text-center">
           <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
           <h3 className="text-lg font-medium">System Secure</h3>
           <p className="text-muted-foreground mt-2 max-w-sm">No high-risk patterns detected requiring immediate mitigation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4 items-start">
                <div className="mt-1 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                  <ServerCrash className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase mb-1">{rec.action_type}</div>
                  <h3 className="text-lg font-semibold text-foreground">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-2xl">{rec.description}</p>
                  
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="font-mono">TARGET: {rec.target_entity}</span>
                    <span className="font-mono">PRIORITY: {rec.priority.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  fetch(`${import.meta.env.VITE_API_URL}/api/simulation/evaluate`, { method: 'POST' })
                    .then(() => alert('Evaluation mode started! The simulation will now re-run assuming mitigations are in place to demonstrate controlled comparison.'))
                    .catch(err => console.error(err));
                }}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[13px] font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap">
                Apply Mitigation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
