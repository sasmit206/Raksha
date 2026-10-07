import { useEffect, useState } from 'react';
import { 
  Activity, ShieldAlert, Cpu, Network, ArrowRight, 
  Target, ShieldCheck, FileKey, Terminal, GitCommit, Database 
} from 'lucide-react';
import HoldButton from '../components/HoldButton';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 2000); 
    return () => clearInterval(interval);
  }, []);

  const runDemo = () => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/api/simulation/start?scenario=demo`, { 
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (res.status === 401) {
          alert('Unauthorized: Please log in again.');
          return null;
        }
        if (res.status === 429) {
          alert('🛑 RATE LIMIT EXCEEDED: You are making too many requests. Please wait a minute to prevent DOS.');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) console.log(data);
      })
      .catch(err => console.error(err));
  };

  const riskScore = summary?.currentRisk || 0;
  const isDemoRunning = summary?.experimentHealth === 'Healthy';
  const confidence = summary?.detectionConfidence || 94.2;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto select-none">
      
      {/* ROW 1: HERO */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-[#111115]">
        {/* Subtle radial glow background */}
        <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[200%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
        
        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase mb-3">Adaptive Cyber Defense</div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2 selection:bg-transparent">Security Intelligence Console</h1>
            <p className="text-[13px] text-muted-foreground max-w-xl selection:bg-transparent">
              Machine-learning threat analysis across multi-source VM telemetry. 
              Correlating isolated events into behavioral attack narratives.
            </p>
            
            <div className="flex items-center gap-4 mt-6 text-[11px] font-medium text-muted-foreground/80">
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Telemetry healthy</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> ML engine ready</span>
              <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> VM connected</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab?.('Live Monitor')}
              className="px-5 py-2 border border-border/50 bg-[#16161a] hover:bg-white/5 text-foreground text-[13px] font-medium rounded-lg transition-all w-full md:w-auto">
              View Live Monitor
            </button>
            <HoldButton
              doneLabel="Attack Deployed"
              backgroundColor="#27272a"
              fillColor="#4f46e5"
              textColor="#f5f5f5"
              fillTextColor="#ffffff"
              size="md"
              radius={8}
              fillDirection="right"
              holdTime={1500}
              releaseTime={200}
              pressScale={0.97}
              wave
              waveAmplitude={6}
              glow
              resetAfter={1200}
              onHold={runDemo}
              disabled={isDemoRunning}
            >
              {isDemoRunning ? 'Simulation Running...' : 'Hold to Launch Attack'}
            </HoldButton>
          </div>
        </div>
      </div>

      {/* ROW 2: KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="EVENTS COLLECTED" value={(summary?.eventsCollected || 0).toLocaleString()} icon={Activity} delta={`+${summary?.eventsDelta || 0} this session`} />
        <MetricCard title="ACTIVE ANOMALIES" value={summary?.activeAnomalies?.toString() || '0'} icon={ShieldAlert} color={summary?.activeAnomalies > 0 ? "text-amber-500" : "text-muted-foreground"} delta={summary?.activeAnomalies > 0 ? "Investigation required" : "Normal"} />
        <MetricCard title="HIGH-RISK PATTERNS" value={summary?.highRiskPatterns?.toString() || '0'} icon={Network} color={summary?.highRiskPatterns > 0 ? "text-red-500" : "text-muted-foreground"} delta={summary?.highRiskPatterns > 0 ? "+1 detected this session" : "No patterns"} />
        <MetricCard title="DETECTION CONFIDENCE" value={`${confidence}%`} icon={Cpu} color="text-indigo-400" delta="+3.1% vs baseline" />
        <div className="p-5 rounded-xl border border-border/40 bg-[#111115] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h4 className="text-[10px] font-bold text-muted-foreground tracking-wider">SYSTEM RISK</h4>
            <Target className={`w-4 h-4 ${riskScore > 50 ? 'text-red-500' : riskScore > 25 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <div className="text-3xl font-semibold tracking-tight">{riskScore}</div>
            <div className="text-[12px] text-muted-foreground font-medium">/ 100</div>
          </div>
          <div className={`text-[11px] font-bold mt-2 relative z-10
            ${riskScore > 50 ? 'text-red-500' : riskScore > 25 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {riskScore > 50 ? 'HIGH RISK' : riskScore > 25 ? 'MODERATE' : 'LOW RISK'}
          </div>
        </div>
      </div>
      
      {/* ROW 3: RISK & PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Overview (65%) */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold text-foreground mb-6">Risk Intelligence Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Gauge */}
            <div className="flex flex-col items-center justify-center border-r border-border/40 pr-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                    className={riskScore > 50 ? 'text-red-500' : riskScore > 25 ? 'text-amber-500' : 'text-emerald-500'} 
                    strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * riskScore) / 100} 
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="text-center">
                   <span className="text-4xl font-bold">{riskScore}</span>
                </div>
              </div>
              <div className={`mt-3 text-[11px] font-bold tracking-wider ${riskScore > 50 ? 'text-red-500' : riskScore > 25 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {riskScore > 50 ? 'HIGH RISK' : riskScore > 25 ? 'MODERATE' : 'LOW RISK'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 text-center">
                Risk increased <span className="text-red-400">+{riskScore > 10 ? riskScore - 10 : 0}</span> in current session
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-4 pr-4 border-r border-border/40 hidden md:block">
              <RiskBar label="Authentication anomaly" value={riskScore > 20 ? 14 : 0} max={25} />
              <RiskBar label="Privilege anomaly" value={riskScore > 30 ? 21 : 0} max={25} />
              <RiskBar label="Protected file access" value={riskScore > 40 ? 17 : 0} max={25} />
              <RiskBar label="Network anomaly" value={riskScore > 50 ? 15 : 0} max={25} />
              <RiskBar label="Sequence correlation" value={riskScore > 60 ? 11 : 0} max={25} />
            </div>

            {/* Explanation */}
            <div className="flex flex-col justify-between h-full py-2">
              <div>
                <h4 className="text-[12px] font-bold text-foreground mb-2">Why is this risk {riskScore > 50 ? 'high' : riskScore > 25 ? 'moderate' : 'low'}?</h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {riskScore > 50 
                    ? "Multiple correlated behavioral signals were observed within a short time window. Individually moderate events became high-risk when combined sequentially." 
                    : "The system is currently observing baseline behavior with no significant deviations or correlated attack sequences detected."}
                </p>
                {riskScore > 50 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <div className="text-muted-foreground mb-0.5">Evidence</div>
                      <div className="font-semibold text-foreground">5 correlated events</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Confidence</div>
                      <div className="font-semibold text-foreground">{confidence}%</div>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveTab?.('Anomalies')}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-secondary hover:bg-white/10 text-[12px] font-medium rounded-md transition-colors border border-border/50">
                View Investigation <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline (35%) */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col">
           <h3 className="text-[14px] font-semibold text-foreground mb-6">Analysis Pipeline</h3>
           
           <div className="flex-1 flex flex-col justify-between space-y-2">
             <PipelineNode label="Simulation" status={isDemoRunning ? 'active' : 'complete'} meta={isDemoRunning ? 'Generating...' : 'Ready'} isFirst />
             <PipelineNode label="Telemetry" status={summary?.eventsCollected > 0 ? (isDemoRunning ? 'active' : 'complete') : 'pending'} meta={`${summary?.eventsCollected || 0} events`} />
             <PipelineNode label="Normalization" status={summary?.eventsCollected > 0 ? (isDemoRunning ? 'active' : 'complete') : 'pending'} meta="99.8%" />
             <PipelineNode label="ML Analysis" status={summary?.activeAnomalies > 0 ? 'complete' : (summary?.eventsCollected > 50 ? 'active' : 'pending')} meta={`${confidence}% conf`} />
             <PipelineNode label="Pattern Detection" status={summary?.highRiskPatterns > 0 ? 'complete' : (summary?.activeAnomalies > 0 ? 'active' : 'pending')} meta={summary?.highRiskPatterns > 0 ? `${summary.highRiskPatterns} detected` : 'Awaiting'} />
             <PipelineNode label="Risk Assessment" status={riskScore > 10 ? 'complete' : 'pending'} meta={`${riskScore}/100`} />
             <PipelineNode label="Recommendation" status={summary?.highRiskPatterns > 0 ? 'complete' : 'pending'} meta={summary?.highRiskPatterns > 0 ? 'Controls ready' : 'Awaiting'} isLast />
           </div>
        </div>
      </div>

      {/* ROW 4 & 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (65%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Latest Behavioral Finding */}
          <div className="p-6 rounded-xl border border-red-900/30 bg-gradient-to-br from-[#1a1114] to-[#111115]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Latest Behavioral Finding</h3>
                <p className="text-[12px] text-muted-foreground mt-1">Multi-Stage Privilege & Protected Access Pattern</p>
              </div>
              <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-wider rounded">CRITICAL</div>
            </div>

            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex items-center min-w-max gap-2 text-[11px] font-mono text-muted-foreground">
                <SequenceNode icon={FileKey} label="AUTH" type="anomaly" />
                <ArrowRight className="w-4 h-4 text-border" />
                <SequenceNode icon={Terminal} label="PROCESS" type="anomaly" />
                <ArrowRight className="w-4 h-4 text-border" />
                <SequenceNode icon={ShieldCheck} label="PRIVILEGE" type="anomaly" />
                <ArrowRight className="w-4 h-4 text-border" />
                <SequenceNode icon={Database} label="FILE" type="anomaly" />
                <ArrowRight className="w-4 h-4 text-border" />
                <SequenceNode icon={Network} label="NETWORK" type="anomaly" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-6 text-[12px]">
                <div><span className="text-muted-foreground">Risk:</span> <span className="font-semibold text-red-400">91 / 100</span></div>
                <div><span className="text-muted-foreground">Confidence:</span> <span className="font-semibold text-foreground">94%</span></div>
                <div><span className="text-muted-foreground">Evidence:</span> <span className="font-semibold text-foreground">5 correlated events</span></div>
              </div>
              <button 
                onClick={() => setActiveTab?.('Behavioral Patterns')}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[12px] font-medium rounded-md transition-colors flex items-center gap-2">
                Investigate Finding <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Telemetry Source Health */}
          <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
             <h3 className="text-[14px] font-semibold text-foreground mb-5">Telemetry Source Health</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <HealthBar label="AUTHENTICATION" count="3,241" />
                <HealthBar label="PROCESS" count="6,822" />
                <HealthBar label="FILE" count="2,184" />
                <HealthBar label="PRIVILEGE" count="1,042" />
                <HealthBar label="NETWORK" count="5,203" />
             </div>
          </div>
        </div>

        {/* Right Column (35%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-xl border border-border/40 bg-[#111115] h-full">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[14px] font-semibold text-foreground">Latest Findings</h3>
              <span className="text-[11px] text-muted-foreground">Live Feed</span>
            </div>
            
            <div className="space-y-4">
              {riskScore > 50 ? (
                <>
                  <FindingItem severity="critical" title="Multi-stage behavioral anomaly" time="Just now" />
                  <FindingItem severity="high" title="Privilege anomaly detected" time="1 min ago" />
                  <FindingItem severity="medium" title="Authentication burst" time="2 min ago" />
                  <FindingItem severity="low" title="Unusual process metadata" time="5 min ago" />
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-[12px]">
                  No significant findings detected.
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/40">
               <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Engine Status</div>
               <div className="space-y-2 text-[11px]">
                 <div className="flex justify-between"><span className="text-muted-foreground">Model</span><span className="font-mono text-foreground/80">Isolation Forest</span></div>
                 <div className="flex justify-between"><span className="text-muted-foreground">Features</span><span className="font-mono text-foreground/80">24</span></div>
                 <div className="flex justify-between"><span className="text-muted-foreground">Training events</span><span className="font-mono text-foreground/80">12,840</span></div>
                 <div className="flex justify-between"><span className="text-muted-foreground">Last analysis</span><span className="font-mono text-foreground/80">{new Date().toLocaleTimeString()}</span></div>
               </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------
// COMPONENT HELPERS
// ---------------------------------------------------------

function MetricCard({ title, value, icon: Icon, delta, color = "text-muted-foreground" }: any) {
  return (
    <div className="p-5 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[10px] font-bold tracking-wider text-muted-foreground">{title}</h4>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className={`text-[11px] mt-2 font-medium ${delta.includes('+') ? 'text-emerald-500' : 'text-muted-foreground'}`}>
        {delta}
      </div>
    </div>
  );
}

function RiskBar({ label, value, max }: any) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="text-[11px]">
      <div className="flex justify-between mb-1.5">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-amber-500 font-mono">+{value}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%`, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  )
}

function PipelineNode({ label, status, meta, isLast }: any) {
  return (
    <div className="flex gap-4 relative group">
      {!isLast && <div className="absolute left-2.5 top-6 bottom-[-8px] w-[1px] bg-border/50" />}
      <div className="mt-1 relative z-10">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-[#111115]
          ${status === 'active' ? 'border-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 
            status === 'complete' ? 'border-emerald-500/50 text-emerald-500' : 'border-border/50'}`}>
          {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
          {status === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />}
        </div>
      </div>
      <div className="flex-1 pb-4">
        <div className="flex justify-between items-center">
          <div className={`text-[12px] font-semibold ${status === 'pending' ? 'text-muted-foreground/60' : 'text-foreground'}`}>
            {label}
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">{meta}</div>
        </div>
      </div>
    </div>
  )
}

function SequenceNode({ icon: Icon, label, type }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center
        ${type === 'anomaly' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-secondary border-border text-muted-foreground'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span>{label}</span>
    </div>
  )
}

function HealthBar({ label, count }: any) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-bold text-muted-foreground tracking-wider">{label}</span>
      </div>
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mb-1">
        <div className="h-full bg-emerald-500/50 rounded-full w-[90%]" />
      </div>
      <div className="text-[10px] font-mono text-muted-foreground">{count} evt</div>
    </div>
  )
}

function FindingItem({ severity, title, time }: any) {
  const colors = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  }
  const color = colors[severity as keyof typeof colors];

  return (
    <div className="flex gap-3 items-start group cursor-pointer">
      <div className="mt-0.5">
        <GitCommit className="w-4 h-4 text-border group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-1.5 py-0.5 text-[9px] font-bold tracking-wider rounded border uppercase ${color}`}>
            {severity}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">{time}</span>
        </div>
        <p className="text-[12px] text-foreground font-medium group-hover:text-indigo-400 transition-colors">
          {title}
        </p>
      </div>
    </div>
  )
}
