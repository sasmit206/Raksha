import { useState, useRef } from 'react';
import { Target, Upload, Loader2, Lock } from 'lucide-react';

export function Honeytoken() {
  const [isFileLoading, setIsFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileAction = async (action: 'encrypt' | 'decrypt') => {
    if (!selectedFile) return;
    setIsFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/crypto/${action}/file`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const contentDisp = response.headers.get('Content-Disposition');
        let filename = `${action}ed_${selectedFile.name}`;
        if (contentDisp && contentDisp.includes('filename=')) {
          filename = contentDisp.split('filename=')[1].replace(/"/g, '');
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('File processing failed.');
      }
    } catch (err) {
      alert('Failed to connect to the service.');
    }
    setIsFileLoading(false);
  };

  const handleDeploy = async () => {
    if (!selectedFile) return;
    setIsFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/crypto/honeytoken/deploy`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) alert(data.message || 'Honeytoken deployed successfully.');
      else alert('Error deploying honeytoken.');
    } catch (e) {
      alert('Network error.');
    }
    setIsFileLoading(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deploy Honeytoken</h1>
          <p className="text-muted-foreground mt-1">Encrypt and deploy decoy files (tripwires) into the VM environment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-red-500" />
            <h3 className="text-[14px] font-semibold text-foreground">Honeytoken Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer bg-[#0a0a0b]/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop a decoy file</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports Images, Documents, and Archives</p>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleFileAction('encrypt')}
                disabled={isFileLoading || !selectedFile}
                className="flex-1 bg-[#1a1a24] hover:bg-[#232333] border border-border/50 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isFileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Encrypt File Only
              </button>
            </div>
            
            <div className="pt-4 border-t border-border/40 mt-4">
              <h4 className="text-sm font-semibold mb-2">Active Deployment</h4>
              <p className="text-xs text-muted-foreground mb-4">
                This will automatically encrypt the file and place it in the VM. If an attacker accesses or interacts with the deployed file, a critical anomaly will be triggered in the Telemetry Explorer.
              </p>
              <button 
                onClick={handleDeploy}
                disabled={isFileLoading || !selectedFile}
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 py-3 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Deploy as Honeytoken (Tripwire)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <h3 className="text-[14px] font-semibold mb-4 text-foreground">How Honeytokens Work</h3>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              A <strong>honeytoken</strong> is a decoy digital asset—such as a file, database record, or API key—that is intentionally left in a system to detect unauthorized access or lateral movement.
            </p>
            <p>
              Unlike standard files, honeytokens have no legitimate use. Therefore, any interaction with a honeytoken is a high-confidence indicator of compromise (IoC).
            </p>
            <div className="p-4 rounded bg-red-500/10 border border-red-500/20 text-red-200 mt-4">
              <h4 className="font-semibold text-red-400 mb-1">RAKSHA Simulation Engine</h4>
              <p className="text-xs">
                When you deploy a honeytoken here, RAKSHA encrypts the asset and places it inside the sandbox VM (`RAKSHA-01`). An automated adversary simulation will eventually attempt to exfiltrate it, triggering a critical alert in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
