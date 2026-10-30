import { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Network, ShieldCheck } from 'lucide-react';

export function VMEnvironment() {
  const [vms, setVms] = useState<any[]>([]);

  useEffect(() => {
    // We mock the VM environment data for the demo
    setVms([
      { id: 'RAKSHA-01', os: 'Ubuntu 22.04 LTS', status: 'Running', cpu: '14%', ram: '2.4 GB', ip: '10.0.0.14' },
      { id: 'RAKSHA-02', os: 'Debian 11', status: 'Running', cpu: '8%', ram: '1.2 GB', ip: '10.0.0.15' },
      { id: 'RAKSHA-DMZ', os: 'Alpine Linux', status: 'Running', cpu: '2%', ram: '512 MB', ip: '192.168.1.5' },
    ]);
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VM / Environment</h1>
          <p className="text-muted-foreground mt-1">Status of isolated execution environments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vms.map((vm, idx) => (
          <div key={idx} className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{vm.id}</h3>
                  <div className="text-[12px] text-muted-foreground">{vm.os}</div>
                </div>
              </div>
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold tracking-wider rounded border border-emerald-500/20">
                {vm.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-2 text-[12px]">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground/80 font-mono">{vm.cpu}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground/80 font-mono">{vm.ram}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Network className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground/80 font-mono">{vm.ip}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Secured</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 text-[11px] font-mono text-muted-foreground flex justify-between items-center">
              <span>Channel: <span className="text-indigo-400">AES-256-CBC</span></span>
              <span>Integrity: <span className="text-emerald-400">HMAC-SHA256</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* VM-Host Cryptographic Interconnect Details */}
      <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Network className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">VM-Host Secure Interconnect & Algorithm Analysis</h3>
            <p className="text-xs text-muted-foreground">End-to-end cryptographic safeguards between virtual sandbox instances and the host core</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
            <div className="font-semibold text-indigo-400">AES-256-CBC Tunneling</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Virtual socket communication between Guest VM and Host Engine is encapsulated via hardware AES-256-CBC. Latency: &lt;0.05ms per 1KB packet.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
            <div className="font-semibold text-emerald-400">HMAC-SHA-256 Signatures</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Every single telemetry packet emitted by VM processes is sealed with an HMAC signature to detect injection attacks before ingestion into the ML model.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/40 border border-white/5 space-y-1.5">
            <div className="font-semibold text-amber-400">Tripwire Decoy Deployment</div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Honeytokens deployed into VM directories are packaged with authenticated Fernet/AES envelopes. Unauthorized access trips host FIM alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

