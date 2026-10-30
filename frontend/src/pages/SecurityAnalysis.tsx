import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Cpu, Key, Lock, Network, 
  Terminal, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Activity, Database
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface CryptoAlgo {
  id: string;
  name: string;
  category: string;
  use_case: string;
  encryption_time_ms: number;
  decryption_time_ms: number;
  total_time_ms: number;
  throughput_mb_s: number;
  key_size_bits: number;
  block_size_bits: number;
  security_level: string;
  security_status: string;
  quantum_resistance: string;
  attacks_mitigated: string[];
  nist_standard: string;
}

interface BenchmarkData {
  benchmark_timestamp: number;
  sample_size_bytes: number;
  iterations: number;
  algorithms: CryptoAlgo[];
  vm_host_crypto_architecture: {
    channel: string;
    primary_protocol: string;
    key_exchange_mechanism: string;
    integrity_enforcement: string;
    file_tripwire_mechanism: string;
  };
  recent_intermediate_hashes: any[];
}

export function SecurityAnalysis() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<CryptoAlgo | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'algorithms' | 'vm_architecture' | 'hashes'>('algorithms');
  
  // Interactive Live Cryptographic Calculator & Hash Inspector
  const [inputText, setInputText] = useState('Confidential VM-to-Host Syslog Event: admin executed /usr/bin/sudo');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchBenchmark = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/crypto/benchmark?sample_size_bytes=1024&iterations=20`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.algorithms && json.algorithms.length > 0 && !selectedAlgo) {
          setSelectedAlgo(json.algorithms[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch benchmark data', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBenchmark();
  }, []);

  const runLiveTest = async () => {
    setIsTesting(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/crypto/encrypt/text`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const json = await res.json();
        setTestResult(json);
      }
    } catch (err) {
      console.error(err);
    }
    setIsTesting(false);
  };

  const chartData = data?.algorithms.map(a => ({
    name: a.name.split(' ')[0],
    fullName: a.name,
    total_time_ms: a.total_time_ms,
    enc_time: a.encryption_time_ms,
    dec_time: a.decryption_time_ms,
    throughput: a.throughput_mb_s,
    category: a.category
  })) || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" /> Cryptographic Telemetry & Defense Assessment
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Time Analysis</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Empirical benchmark of execution latencies, intermediate hash calculations, and quantum/threat posture across all algorithms.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchBenchmark}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1a1a24] hover:bg-[#232333] border border-border/50 text-foreground text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Benchmarking...' : 'Re-Run Latency Benchmark'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button
          onClick={() => setActiveSubTab('algorithms')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'algorithms' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
              : 'text-muted-foreground hover:bg-white/5'
          }`}
        >
          Algorithm Performance & Security Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('vm_architecture')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'vm_architecture' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
              : 'text-muted-foreground hover:bg-white/5'
          }`}
        >
          VM ⇄ Host Cryptographic Architecture
        </button>
        <button
          onClick={() => setActiveSubTab('hashes')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            activeSubTab === 'hashes' 
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' 
              : 'text-muted-foreground hover:bg-white/5'
          }`}
        >
          Intermediate Hash Inspector & Console Traces
        </button>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'algorithms' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border/40 bg-[#111115]">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Fastest Symmetric Cipher</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-2">AES-128 / AES-256</div>
              <div className="text-[11px] text-muted-foreground mt-1">&lt;0.05 ms per block (Hardware AES-NI)</div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-[#111115]">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Asymmetric Overhead</span>
                <Key className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-2">RSA-2048 PSS</div>
              <div className="text-[11px] text-muted-foreground mt-1">~1.2 ms per signature with SHA-256 MGF1</div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-[#111115]">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Envelope Integrity</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-2">HMAC-SHA-256</div>
              <div className="text-[11px] text-muted-foreground mt-1">Real-time VM log authentication</div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-[#111115]">
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Quantum Resistance Posture</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono text-purple-400 mt-2">AES-256 (Protected)</div>
              <div className="text-[11px] text-muted-foreground mt-1">Grover resistant; RSA requires PQC</div>
            </div>
          </div>

          {/* Latency Comparison Graph */}
          <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Execution Latency per Operation (Milliseconds)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Benchmarked over {data?.iterations || 20} sample rounds with {data?.sample_size_bytes || 1024} bytes buffer payload.
                </p>
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-black/40 px-3 py-1.5 rounded border border-border/50">
                Logarithmic Scaled View (Symmetric vs Asymmetric)
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis stroke="#888" fontSize={11} label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111115', border: '1px solid #333', borderRadius: '8px' }}
                    formatter={(val: any) => [`${val} ms`, 'Latency']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="total_time_ms" radius={[4, 4, 0, 0]}>
                    {chartData.map((_entry, index) => {
                      const colors = ['#3b82f6', '#06b6d4', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#ec4899'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>

                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Algorithm Breakdown Table & Detailed Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-xl border border-border/40 bg-[#111115] overflow-x-auto">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Cryptographic Algorithm Directory
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-3 font-semibold">Algorithm</th>
                    <th className="pb-3 font-semibold">Primary Use Case</th>
                    <th className="pb-3 font-semibold">Time (ms)</th>
                    <th className="pb-3 font-semibold">Security Level</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-mono">
                  {data?.algorithms.map((algo) => (
                    <tr 
                      key={algo.id}
                      onClick={() => setSelectedAlgo(algo)}
                      className={`cursor-pointer transition-colors hover:bg-white/5 ${
                        selectedAlgo?.id === algo.id ? 'bg-indigo-600/10' : ''
                      }`}
                    >
                      <td className="py-3 font-sans font-medium text-foreground flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          algo.security_status === 'SECURE' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {algo.name}
                      </td>
                      <td className="py-3 text-muted-foreground font-sans max-w-[220px] truncate">
                        {algo.use_case}
                      </td>
                      <td className="py-3 text-indigo-400">
                        {algo.total_time_ms} ms
                      </td>
                      <td className="py-3 text-muted-foreground font-sans text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">
                          {algo.security_status}
                        </span>
                      </td>
                      <td className="py-3 text-indigo-400 font-sans">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Algorithm Deep-Dive Pane */}
            <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between">
              {selectedAlgo ? (
                <div className="space-y-4">
                  <div className="border-b border-border/40 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">{selectedAlgo.category}</span>
                    <h3 className="text-xl font-bold text-foreground mt-0.5">{selectedAlgo.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{selectedAlgo.use_case}</p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Standard</span>
                      <span className="font-mono text-foreground">{selectedAlgo.nist_standard}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Key / Block Length</span>
                      <span className="font-mono text-foreground">{selectedAlgo.key_size_bits || 'N/A'} bits / {selectedAlgo.block_size_bits} bits</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Encryption / Calc Time</span>
                      <span className="font-mono text-emerald-400">{selectedAlgo.encryption_time_ms} ms</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Decryption Time</span>
                      <span className="font-mono text-cyan-400">{selectedAlgo.decryption_time_ms} ms</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-muted-foreground">Calculated Throughput</span>
                      <span className="font-mono text-indigo-300">{selectedAlgo.throughput_mb_s} MB/s</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Quantum Threat Resilience
                    </div>
                    <p className="text-xs text-muted-foreground bg-purple-500/5 border border-purple-500/20 p-2.5 rounded-lg leading-relaxed">
                      {selectedAlgo.quantum_resistance}
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Mitigated Threat Vectors
                    </div>
                    <ul className="space-y-1">
                      {selectedAlgo.attacks_mitigated.map((atk, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{atk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Select an algorithm to view in-depth security analysis
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VM Architecture Sub-Tab */}
      {activeSubTab === 'vm_architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[#111115] to-[#111115]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Network className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">VM ⇄ Host Cryptographic Channel</h3>
                <p className="text-xs text-indigo-200/70">Encrypted socket pipe isolating VM Guest (`RAKSHA-01`) from Host Analysis Core</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Whenever the VM transmits telemetry logs, processes execution records, or deploys honeytokens, communication between 
              the isolated virtual container environment and the Raksha host system is cryptographically sealed. 
              Below is the exact multi-tier cryptographic security architecture actively in place:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-black/40 border border-border/50">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
                  <Lock className="w-4 h-4" /> 1. Confidentiality: AES-256-CBC
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Used for encrypting VM disk artifacts and isolated socket communication. With 256-bit symmetric entropy, 
                  it ensures that even if an adversary achieves container escape or hypervisor-adjacent memory inspection, 
                  telemetry streams cannot be sniffed or exfiltrated in plaintext.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-border/50">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" /> 2. Message Authentication: HMAC-SHA-256
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every single event ingested from the VM is signed using HMAC-SHA-256 with deterministic canonical JSON serialization. 
                  Any unauthorized insertion, omission, or parameter manipulation by an attacker is detected prior to ML training.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-border/50">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
                  <Key className="w-4 h-4" /> 3. Session Attestation: RSA-2048 PSS
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  During session reports and hypervisor registration, asymmetric RSA-PSS with SHA-256 MGF1 ensures mathematical 
                  non-repudiation. Forensic evidence captured from the VM is permanently verifiable against the public key fingerprint.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-border/50">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-xs mb-1">
                  <ShieldAlert className="w-4 h-4" /> 4. Tripwire Honeytokens: Fernet (AES-128 + HMAC)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Decoy credentials and honeytoken files deployed into `/home/admin` in the VM are packaged using authenticated 
                  Fernet encryption. Any attempt to decrypt or exfiltrate them immediately triggers critical IoC alerts in syslog.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive VM-to-Host Encryption Benchmark Simulator */}
          <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Live VM-Host Packet Encryption & Intermediate Hash Test
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Type or paste a sample VM payload below to observe live AES execution time, ciphertext hex, and intermediate SHA-256 calculations:
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Plaintext VM Telemetry Message</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a0a0b] border border-border/60 rounded-lg p-3 text-xs font-mono text-foreground focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={runLiveTest}
                disabled={isTesting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isTesting ? 'Encrypting & Computing Hashes...' : 'Encrypt with AES & Trace Hashes'}
              </button>

              {testResult && (
                <div className="mt-4 p-4 rounded-lg bg-black/50 border border-border/50 space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Execution Latency: </span>
                      <span className="text-emerald-400 font-bold">{testResult.execution_time_ms.toFixed(4)} ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Key Fingerprint: </span>
                      <span className="text-foreground">{testResult.key_used}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[11px] block mb-1">Intermediate Hashes Computed:</span>
                    <div className="space-y-2">
                      {testResult.intermediate_hashes?.map((h: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-white/5 border border-white/5">
                          <div className="text-[10px] text-indigo-400 font-semibold">{h.step} ({h.algorithm}) - Took {h.computation_time_ms}ms</div>
                          <div className="text-[11px] text-foreground break-all">{h.hash_value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-[11px] block mb-1">AES Encrypted Payload (Base64):</span>
                    <div className="p-2 rounded bg-white/5 border border-white/5 text-amber-300 break-all text-[11px]">
                      {testResult.encrypted_base64}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hashes & Console Log Trace Tab */}
      {activeSubTab === 'hashes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-foreground">Intermediate Hash Trace Engine</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              All cryptographic operations compute and stream intermediate cryptographic digests to verify zero-tampering at every pipeline stage. 
              The backend logs every hash calculation to the standard output terminal via <code className="text-indigo-300 bg-white/5 px-1 py-0.5 rounded">[CRYPTO-HASH-TRACE]</code> and <code className="text-indigo-300 bg-white/5 px-1 py-0.5 rounded">[HASH-CALC]</code>.
            </p>

            <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/20 font-mono text-xs text-emerald-400 space-y-2 max-h-96 overflow-y-auto">
              <div className="text-muted-foreground text-[11px] pb-1 border-b border-white/10">
                # Live Intermediate Hashes Streamed from Engine:
              </div>
              {data?.recent_intermediate_hashes && data.recent_intermediate_hashes.length > 0 ? (
                data.recent_intermediate_hashes.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 pb-2 border-b border-white/5">
                    <div className="text-[11px] text-indigo-300">
                      [CRYPTO-HASH-TRACE] Step: {item.step} | Algo: {item.algorithm} | Time: {item.computation_time_ms}ms
                    </div>
                    <div className="text-[10px] text-muted-foreground">Input bytes: {item.input_len_bytes} | Hex preview: {item.input_hex_preview}</div>
                    <div className="text-[11px] text-foreground break-all">{item.hash_value}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No recent intermediate hashes available. Re-run benchmark to stream.</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> Database Field Hash Protection
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Raw syslog telemetry and audit records stored in SQLite / PostgreSQL are protected using the <code className="text-indigo-300">EncryptedString</code> TypeDecorator. 
                Before committing to disk, the raw text has its intermediate SHA-256 hash verified and is converted to an AES ciphertext envelope.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> VM File Integrity Monitoring (FIM)
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The VM agent executes continuous background <code className="text-indigo-300">sha256sum /etc/shadow</code> polling. 
                Any delta between expected hash state and calculated runtime hash triggers an immediate critical <code className="text-red-400">shadow_file_access</code> security alert.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
