import { , Save } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Platform configuration and threshold tuning</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold mb-4">ML Engine Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Anomaly Threshold</label>
              <input type="range" min="0" max="100" defaultValue="60" className="w-full accent-indigo-500" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>More sensitive</span>
                <span>Less sensitive</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Time Window (seconds)</label>
              <input type="number" defaultValue="30" className="w-full bg-[#0a0a0b] border border-border/50 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium rounded-lg transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
