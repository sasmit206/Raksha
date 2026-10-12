import { useState } from 'react';
import { FileText, Download, ShieldCheck, Check, X, BarChart } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Reports() {
  const [reportData, setReportData] = useState<any>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<any>(null);

  const finalizeReport = async () => {
    setIsFinalizing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reports/finalize`, {
        method: 'POST',
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      alert("Failed to finalize session.");
    }
    setIsFinalizing(false);
  };

  const verifyReport = async () => {
    if (!reportData) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reports/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canonical_payload: reportData.cryptographic_integrity.canonical_payload,
          signature_hex: reportData.cryptographic_integrity.signature_hex
        }),
      });
      const data = await res.json();
      setVerifyStatus(data);
    } catch (err) {
      alert("Verification failed.");
    }
  };

  const exportPDF = async () => {
    if (!reportData) return alert('Please finalize the report first.');
    const { report_metadata, cryptographic_integrity, avalanche_analysis } = reportData;

    const printWindow = window.open('', '', 'width=800,height=800');
    if (!printWindow) return alert('Pop-up blocked. Please allow pop-ups to generate PDF.');

    const html = `
      <html>
        <head>
          <title>Session Integrity Report - ${report_metadata.session_id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 10px; }
            h2 { margin-top: 40px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .metric { display: inline-block; background: #f4f4f5; padding: 15px 25px; border-radius: 8px; margin-right: 15px; margin-bottom: 15px; }
            .metric strong { display: block; font-size: 24px; color: #ef4444; }
            .metric span { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .crypto-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-top: 15px; }
            .crypto-box pre { white-space: pre-wrap; word-break: break-all; font-size: 11px; background: #fff; padding: 10px; border: 1px solid #cbd5e1; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background-color: #f9fafb; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>RAKSHA Security Assessment Report</h1>
          <p style="color: #666;">Session ID: ${report_metadata.session_id}<br/>Generated: ${new Date(report_metadata.timestamp).toLocaleString()}</p>
          
          <div style="margin-bottom: 30px; margin-top: 20px;">
            <div class="metric">
              <strong>${report_metadata.risk_score} / 100</strong>
              <span>Overall Risk Score</span>
            </div>
            <div class="metric">
              <strong>${report_metadata.anomalies_count}</strong>
              <span>Anomalies Detected</span>
            </div>
            <div class="metric">
              <strong>${report_metadata.patterns_count}</strong>
              <span>Threat Patterns</span>
            </div>
          </div>
          
          <h2>Recommendations</h2>
          ${report_metadata.recommendations.length === 0 ? '<p>No recommendations generated.</p>' : 
            '<ul>' + report_metadata.recommendations.map((r: any) => `<li><strong>${r.title}</strong> (${r.priority}): ${r.reason}</li>`).join('') + '</ul>'
          }

          <h2>Cryptographic Integrity & Digital Signature</h2>
          <div class="crypto-box">
            <p><strong>Hash Algorithm:</strong> ${cryptographic_integrity.hash_algorithm}</p>
            <p><strong>Session Hash:</strong></p>
            <pre>${cryptographic_integrity.session_hash}</pre>
            <p><strong>Signature Algorithm:</strong> ${cryptographic_integrity.signature_algorithm}</p>
            <p><strong>Digital Signature (Hex):</strong></p>
            <pre>${cryptographic_integrity.signature_hex}</pre>
            <p><strong>Public Key Fingerprint (PEM):</strong></p>
            <pre>${cryptographic_integrity.public_key_pem}</pre>
          </div>

          <h2>Avalanche Effect Analysis (${avalanche_analysis.algorithm})</h2>
          <p>An experiment was performed demonstrating how a single bit change affects the AES ciphertext using fixed keys and IVs.</p>
          <table>
            <tr><th>Bit Flipped</th><th>Differing Bits</th><th>% Changed</th></tr>
            ${avalanche_analysis.experiments.map((ex: any) => `
              <tr>
                <td>Bit ${ex.bit_flipped}</td>
                <td>${ex.differing_bits} / ${ex.total_bits}</td>
                <td>${ex.percentage_changed.toFixed(2)}%</td>
              </tr>
            `).join('')}
          </table>
          <p style="font-size: 11px; margin-top: 10px; color: #666;">Note: A well-configured block cipher should yield approximately 50% bit variance per bit flipped.</p>
          
          <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666;">
            <p><strong>Verification Instructions:</strong> To verify this report outside the application, extract the canonical JSON payload and the Digital Signature. Use the provided Public Key PEM with an RSA-PSS verifier supporting SHA-256 MGF1.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const graphData = reportData?.avalanche_analysis?.experiments?.map((e: any) => ({
    name: `Bit ${e.bit_flipped}`,
    changed: e.percentage_changed,
    reference: 50
  })) || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Integrity & Reporting</h1>
          <p className="text-muted-foreground mt-1">Finalize session, generate cryptographic signatures, and export verifiable reports</p>
        </div>
      </div>

      {!reportData ? (
        <div className="p-8 rounded-xl border border-border/40 bg-[#111115] text-center">
          <ShieldCheck className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Finalize Security Session</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Lock in the current analysis session. This will generate a unique Session ID, construct a canonical representation of your findings and recommendations, and sign it using a secure RSA-PSS digital signature.
          </p>
          <button 
            onClick={finalizeReport}
            disabled={isFinalizing}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors shadow-lg disabled:opacity-50"
          >
            {isFinalizing ? 'Finalizing & Signing...' : 'Finalize & Sign Report'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download Card */}
            <div className="p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex flex-col justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-100">Signed Incident Report</h3>
                  <p className="text-sm text-indigo-200/70 mt-1">Download the PDF. Includes executive summary, recommendations, avalanche analysis, and cryptographic metadata.</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3 w-full">
                <button 
                  onClick={exportPDF}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium rounded-md transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>

            {/* Verification Card */}
            <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Independent Verification</h3>
                  <p className="text-sm text-muted-foreground mt-1">Verify that the canonical payload matches the digital signature against the public key.</p>
                </div>
              </div>
              <div className="mt-6 w-full space-y-3">
                <button 
                  onClick={verifyReport}
                  className="w-full px-4 py-2 bg-secondary hover:bg-white/10 text-[13px] font-medium rounded-md transition-colors flex items-center justify-center gap-2 border border-border/50">
                  Verify Report Signature
                </button>
                {verifyStatus && (
                  <div className={`p-3 rounded flex items-center gap-2 text-sm ${verifyStatus.is_valid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {verifyStatus.is_valid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {verifyStatus.reason}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Integrity Metadata Panel */}
            <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
              <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Cryptographic Integrity Metadata</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">Session ID</div>
                  <div className="text-sm font-mono">{reportData.report_metadata.session_id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Session Hash ({reportData.cryptographic_integrity.hash_algorithm})</div>
                  <div className="text-sm font-mono break-all">{reportData.cryptographic_integrity.session_hash}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Digital Signature ({reportData.cryptographic_integrity.signature_algorithm})</div>
                  <div className="text-sm font-mono break-all h-20 overflow-y-auto bg-black/50 p-2 rounded border border-white/5">{reportData.cryptographic_integrity.signature_hex}</div>
                </div>
                <details>
                  <summary className="text-xs text-muted-foreground cursor-pointer outline-none">Show Public Key PEM</summary>
                  <pre className="text-[10px] mt-2 font-mono text-muted-foreground overflow-x-auto bg-black/50 p-2 rounded">{reportData.cryptographic_integrity.public_key_pem}</pre>
                </details>
              </div>
            </div>

            {/* Avalanche Effect Graph */}
            <div className="p-6 rounded-xl border border-border/40 bg-[#111115]">
              <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-amber-500" /> Avalanche Analysis ({reportData.avalanche_analysis.algorithm})
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Actual experimental measurements showing % of ciphertext bits changed when exactly 1 plaintext bit is flipped. 
                Expected behavior is ~50%.
              </p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={graphData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                    <Bar dataKey="changed" fill="#f59e0b" name="% Changed" radius={[2, 2, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
