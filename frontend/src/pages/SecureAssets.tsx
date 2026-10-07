import { useState, useRef } from 'react';
import { Lock, Unlock, FileText, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

export function SecureAssets() {
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTextAction = async (action: 'encrypt' | 'decrypt') => {
    if (!textInput) return;
    setIsTextLoading(true);
    try {
      const formData = new FormData();
      if (action === 'encrypt') {
        formData.append('text', textInput);
      } else {
        formData.append('encrypted_text', textInput);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crypto/${action}/text`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        setTextOutput(data.encrypted_text || data.decrypted_text);
      } else {
        setTextOutput(`Error: ${data.detail}`);
      }
    } catch (err) {
      setTextOutput('Failed to connect to the encryption service.');
    }
    setIsTextLoading(false);
  };

  const handleFileAction = async (action: 'encrypt' | 'decrypt') => {
    if (!selectedFile) return;
    setIsFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crypto/${action}/file`, {
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
      alert('Failed to connect to the encryption service.');
    }
    setIsFileLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Secure Assets Vault</h2>
          <p className="text-sm text-muted-foreground mt-1">Encrypt and decrypt sensitive text, images, and audio files.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            AES-128 Enabled
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Encryption Panel */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-[14px] font-semibold text-foreground">Text Encryption</h3>
          </div>
          
          <div className="space-y-4">
            <textarea 
              className="w-full h-32 bg-[#0a0a0b] border border-border/50 rounded-md p-3 text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
              placeholder="Enter text to encrypt or decrypt..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => handleTextAction('encrypt')}
                disabled={isTextLoading || !textInput}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-md font-medium text-sm transition-colors flex justify-center items-center gap-2"
              >
                {isTextLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Encrypt
              </button>
              <button 
                onClick={() => handleTextAction('decrypt')}
                disabled={isTextLoading || !textInput}
                className="flex-1 bg-[#1a1a24] hover:bg-[#232333] disabled:opacity-50 text-foreground py-2 rounded-md font-medium text-sm transition-colors flex justify-center items-center gap-2 border border-border/50"
              >
                {isTextLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                Decrypt
              </button>
            </div>
            {textOutput && (
              <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-md">
                <div className="text-xs font-semibold text-indigo-400 mb-1">Result:</div>
                <div className="text-sm font-mono text-foreground/90 break-all">{textOutput}</div>
              </div>
            )}
          </div>
        </div>

        {/* File Encryption Panel */}
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-[14px] font-semibold text-foreground">Multimedia Encryption</h3>
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
                  <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports Images (PNG, JPG) and Audio (MP3, WAV)</p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleFileAction('encrypt')}
                disabled={isFileLoading || !selectedFile}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-md font-medium text-sm transition-colors flex justify-center items-center gap-2"
              >
                {isFileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Encrypt File
              </button>
              <button 
                onClick={() => handleFileAction('decrypt')}
                disabled={isFileLoading || !selectedFile}
                className="flex-1 bg-[#1a1a24] hover:bg-[#232333] disabled:opacity-50 text-foreground py-2 rounded-md font-medium text-sm transition-colors flex justify-center items-center gap-2 border border-border/50"
              >
                {isFileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                Decrypt File
              </button>
            </div>
            
            <div className="pt-2 border-t border-border/40">
              <button 
                onClick={async () => {
                  if (!selectedFile) return;
                  setIsFileLoading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/crypto/honeytoken/deploy`, {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok) alert(data.message);
                    else alert('Error deploying honeytoken.');
                  } catch (e) {
                    alert('Network error.');
                  }
                  setIsFileLoading(false);
                }}
                disabled={isFileLoading || !selectedFile}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 disabled:opacity-50 py-2 rounded-md font-medium text-sm transition-colors flex justify-center items-center gap-2"
              >
                Deploy as Honeytoken (Tripwire)
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Encrypts the file and places it into the simulation VM. Any unauthorized access triggers a critical anomaly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

