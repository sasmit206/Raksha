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
          </div>
        ))}
      </div>
    </div>
  );
}
