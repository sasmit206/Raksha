import { FileText, Download } from 'lucide-react';

export function Reports() {
  
  const exportCSV = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/telemetry?limit=1000`);
      const data = await res.json();
      if (!data || data.length === 0) return alert("No telemetry to export.");
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((obj: any) => Object.values(obj).map(v => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raksha-telemetry-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV.");
    }
  };

  const exportPDF = async () => {
    try {
      const [summary, anomalies, patterns] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/api/anomalies`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/api/patterns`).then(r => r.json()),
      ]);

      const printWindow = window.open('', '', 'width=800,height=800');
      if (!printWindow) return alert('Pop-up blocked. Please allow pop-ups to generate PDF.');

      const html = `
        <html>
          <head>
            <title>Incident Report</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              h1 { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
              h2 { margin-top: 40px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .metric { display: inline-block; background: #f4f4f5; padding: 15px 25px; border-radius: 8px; margin-right: 15px; margin-bottom: 15px; }
              .metric strong { display: block; font-size: 24px; color: #ef4444; }
              .metric span { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
              th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
              th { background-color: #f9fafb; color: #374151; font-weight: 600; }
              .pattern { margin-bottom: 20px; padding: 20px; border: 1px solid #fecaca; background: #fef2f2; border-radius: 8px; border-left: 5px solid #ef4444; }
              .pattern h3 { margin:0 0 10px 0; color:#b91c1c; font-size: 18px; }
            </style>
          </head>
          <body>
            <h1>Raksha Incident Report</h1>
            <p style="color: #666; margin-top: -20px; margin-bottom: 30px;">Generated: ${new Date().toLocaleString()}</p>
            
            <div style="margin-bottom: 30px;">
              <div class="metric">
                <strong>${summary.currentRisk} / 100</strong>
                <span>Overall Risk Score</span>
              </div>
              <div class="metric">
                <strong>${summary.activeAnomalies}</strong>
                <span>Active Anomalies</span>
              </div>
              <div class="metric">
                <strong>${summary.eventsCollected}</strong>
                <span>Events Analyzed</span>
              </div>
            </div>
            
            <h2>Detected Threat Patterns</h2>
            ${patterns.length === 0 ? '<p>No high-risk patterns detected in the current session.</p>' : 
              patterns.map((p: any) => `
                <div class="pattern">
                  <h3>${p.name} (Risk: ${p.risk_level})</h3>
                  <p style="margin:0; color: #7f1d1d;">Confidence: ${(p.confidence * 100).toFixed(1)}% | Underlying Evidence Count: ${p.evidence_count}</p>
                </div>
              `).join('')
            }

            <h2>Top Anomalies (Recent)</h2>
            ${anomalies.length === 0 ? '<p>No anomalies detected.</p>' : `
            <table>
              <tr><th>Timestamp</th><th>Source</th><th>Alert Title</th><th>Anomaly Score</th></tr>
              ${anomalies.slice(0, 15).map((a: any) => `
                <tr>
                  <td>${new Date(a.timestamp).toLocaleString()}</td>
                  <td><strong>${a.source}</strong></td>
                  <td>${a.title}</td>
                  <td><span style="color: #ef4444; font-weight: bold;">${(a.anomaly_score * 100).toFixed(1)}</span></td>
                </tr>
              `).join('')}
            </table>
            `}
          </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      
      // small delay to let browser render HTML before triggering print dialog
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);

    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Export analysis summaries and incident logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Incident Summary Report</h3>
              <p className="text-sm text-muted-foreground mt-1">PDF export containing risk metrics, behavioral patterns, and mitigation steps from the current session.</p>
            </div>
          </div>
          <button 
            onClick={exportPDF}
            className="mt-6 px-4 py-2 bg-secondary hover:bg-white/10 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 border border-border/50">
            <Download className="w-4 h-4" /> Generate PDF
          </button>
        </div>

        <div className="p-6 rounded-xl border border-border/40 bg-[#111115] flex flex-col justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Raw Telemetry Dump</h3>
              <p className="text-sm text-muted-foreground mt-1">CSV export of all generated telemetry and anomaly scores for external analysis.</p>
            </div>
          </div>
          <button 
            onClick={exportCSV}
            className="mt-6 px-4 py-2 bg-secondary hover:bg-white/10 text-[13px] font-medium rounded-md transition-colors flex items-center gap-2 border border-border/50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
