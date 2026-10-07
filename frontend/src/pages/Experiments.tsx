import HoldButton from '../components/HoldButton';

export function Experiments({ setActiveTab }: { setActiveTab?: (t: string) => void }) {
  
  const runExperiment = (scenarioId: string) => {
    const token = localStorage.getItem('token');
    fetch(`${import.meta.env.VITE_API_URL}/api/simulation/start?scenario=${scenarioId}`, { 
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
        if (!data) return;
        console.log(data);
        if (setActiveTab) setActiveTab('Overview');
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground mt-1">Manage and run predefined attack simulations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExperimentCard 
          title="Multi-Stage Demo Scenario"
          desc="Simulates a 5-stage attack sequence including auth failures, suspicious processes, privilege escalation, file access, and network anomalies."
          status="READY"
          duration="~15s"
          onRun={() => runExperiment('demo')}
        />
        <ExperimentCard 
          title="Brute Force SSH (Volume Test)"
          desc="Generates 10,000 rapid failed authentication logs to test ML throughput and normalization performance."
          status="READY"
          duration="~30s"
          onRun={() => runExperiment('demo')} // For demo purposes, route to the same simulation
        />
        <ExperimentCard 
          title="Ransomware File Pattern"
          desc="Simulates rapid sequential file modification across the /home directory to test high-frequency temporal pattern matching."
          status="DRAFT"
          duration="-"
        />
      </div>
    </div>
  );
}

function ExperimentCard({ title, desc, status, duration, onRun }: any) {
  return (
    <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className={`px-2 py-1 text-[10px] font-bold rounded tracking-wider
            ${status === 'READY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
            {status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
        <span className="text-xs text-muted-foreground font-mono">EST. DURATION: {duration}</span>
        <HoldButton
          doneLabel="Deployed"
          backgroundColor="#1a1a24"
          fillColor="#4f46e5"
          textColor="#f5f5f5"
          fillTextColor="#ffffff"
          size="sm"
          radius={6}
          fillDirection="right"
          holdTime={1000}
          releaseTime={200}
          pressScale={0.95}
          wave
          waveAmplitude={4}
          glow
          resetAfter={1200}
          onHold={onRun}
          disabled={status === 'DRAFT'}
        >
          Hold to Run
        </HoldButton>
      </div>
    </div>
  )
}
