import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileSpreadsheet, 
  Video, 
  Cpu, 
  AlertOctagon, 
  CheckCircle2, 
  Activity, 
  Download, 
  Search,
  ChevronRight,
  Terminal,
  Lock
} from 'lucide-react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";

// --- Types ---
type AuditStatus = 'IDLE' | 'EXTRACTING' | 'REASONING' | 'COMPLETED' | 'ERROR';

interface AuditResult {
  risk_score: 'HIGH' | 'LOW' | 'MEDIUM';
  discrepancy_found: boolean;
  financial_impact: string;
  confidence_score: number;
  details: string;
  summary: string;
  stats: { name: string; claimed: number; actual: number }[];
}

const App = () => {
  // --- State ---
  const [status, setStatus] = useState<AuditStatus>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- 1. Frame Extraction Pipeline ---
  const extractFrames = async (): Promise<string[]> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return [];

    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const duration = video.duration || 10; // Fallback if duration extraction fails
    const timePoints = [duration * 0.1, duration * 0.5, duration * 0.9];
    const frames: string[] = [];

    addLog(`Initiating temporal extraction on 3 keyframes...`);

    for (let i = 0; i < timePoints.length; i++) {
      video.currentTime = timePoints[i];
      // Wait for seek
      await new Promise(resolve => {
        const onSeek = () => {
          video.removeEventListener('seeked', onSeek);
          resolve(true);
        };
        video.addEventListener('seeked', onSeek);
      });
      
      // Draw
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      frames.push(base64);
      addLog(`> Frame ${i + 1}/3 captured at ${timePoints[i].toFixed(2)}s`);
    }

    return frames;
  };

  // --- 2. Gemini Forensic Analysis ---
  const runForensicAudit = async () => {
    if (!csvData.length || !videoRef.current) {
      alert("Missing Evidence: Please upload both Ledger (CSV) and Site Video.");
      return;
    }

    setStatus('EXTRACTING');
    setLogs([]); // Clear logs
    addLog("TRUE-LEDGER AI v2.0 Initialized.");
    addLog("Secure environment established.");

    try {
      const frames = await extractFrames();
      
      setStatus('REASONING');
      addLog("Visual evidence secured. Connecting to Gemini 3 Pro Neural Network...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const ledgerSnippet = JSON.stringify(csvData.slice(0, 15)); // Analyze first 15 rows

      const prompt = `
        You are an Expert Forensic Auditor performing a "Test of Details".
        
        INPUT DATA:
        1. CLAIMED INVENTORY (CSV Ledger): ${ledgerSnippet}
        2. VISUAL EVIDENCE: 3 temporal frames from the warehouse video.

        PROTOCOL:
        1. Identify items in the video frames.
        2. Count visible quantities strictly.
        3. Cross-reference with the CSV Ledger.
        4. Calculate financial impact of any missing items (assume avg unit cost $500 if unknown).

        OUTPUT REQUIREMENTS:
        Return ONLY valid JSON. No markdown formatting.
        Schema:
        {
          "risk_score": "HIGH" | "LOW" | "MEDIUM",
          "discrepancy_found": boolean,
          "financial_impact": "$ string",
          "confidence_score": number (0-100),
          "details": "Technical explanation of findings...",
          "summary": "Executive summary...",
          "stats": [
            { "name": "Item Name", "claimed": number, "actual": number }
          ]
        }
      `;

      addLog("Payload transmission started...");

      const parts: any[] = [{ text: prompt }];
      frames.forEach(f => parts.push({ inlineData: { mimeType: 'image/jpeg', data: f } }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts },
        config: { responseMimeType: 'application/json' }
      });

      addLog("Response received. Parsing forensic data...");
      
      const responseText = response.text || "{}";
      // Sanitize potential markdown wrapping just in case
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const auditResult = JSON.parse(cleanJson);

      setResult(auditResult);
      setStatus('COMPLETED');
      addLog(`AUDIT COMPLETE. Risk Level: ${auditResult.risk_score}`);

    } catch (e: any) {
      console.error(e);
      setStatus('ERROR');
      addLog(`CRITICAL ERROR: ${e.message}`);
    }
  };

  // --- 3. Certificate Generation ---
  const downloadCertificate = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59); // Dark blue/slate header
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("TRUE-LEDGER FORENSIC AUDIT", 15, 25);
    
    // Meta Details
    doc.setTextColor(0, 0, 0); // Reset to black for body
    doc.setFontSize(10);
    doc.text(`AUDIT ID: TL-${Math.floor(Math.random() * 100000)}`, 15, 50);
    doc.text(`DATE: ${new Date().toLocaleString()}`, 15, 55);
    
    // Executive Findings Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE FINDINGS", 15, 75);
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 78, 195, 78);
    
    // Summary Body
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summary = doc.splitTextToSize(result.summary || "No summary available.", 180);
    doc.text(summary, 15, 85);
    
    // Stats Table Header
    let y = 110 + (summary.length * 5); // Dynamic positioning
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 5, 180, 10, 'F');
    doc.text("Item", 20, y);
    doc.text("Claimed", 100, y);
    doc.text("Actual", 130, y);
    doc.text("Status", 160, y);
    
    // Stats Rows
    doc.setFont("helvetica", "normal");
    y += 10;
    
    if (result.stats && Array.isArray(result.stats)) {
      result.stats.forEach(item => {
        // Safe check for page overflow
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(String(item.name), 20, y);
        doc.text(String(item.claimed), 100, y);
        doc.text(String(item.actual), 130, y);
        
        if (item.claimed !== item.actual) {
          doc.setTextColor(220, 38, 38); // Red
          doc.text("DISCREPANCY", 160, y);
        } else {
          doc.setTextColor(22, 163, 74); // Green
          doc.text("MATCH", 160, y);
        }
        doc.setTextColor(0, 0, 0); // Reset
        y += 8;
        doc.setDrawColor(240, 240, 240);
        doc.line(15, y - 4, 195, y - 4);
      });
    }
    
    // Footer Signature
    const pageHeight = doc.internal.pageSize.height;
    y = pageHeight - 30;
    doc.setDrawColor(0, 0, 0);
    doc.line(15, y, 80, y);
    doc.setFontSize(10);
    doc.text("Digitally Signed by True-Ledger AI 2.0", 15, y + 5);
    doc.text("Principal Architect & CA", 15, y + 10);
    
    doc.save("Audit_Certificate.pdf");
  };

  // --- Handlers ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (res) => {
          setCsvData(res.data);
          addLog(`Ledger ingested: ${file.name} (${res.data.length} records)`);
        }
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      addLog(`Video evidence staged: ${file.name}`);
    }
  };

  // --- Render Components ---

  const ConfidenceGauge = ({ score }: { score: number }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="#334155" strokeWidth="6" fill="transparent" />
          <circle 
            cx="48" cy="48" r={radius} 
            stroke={score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#f43f5e"}
            strokeWidth="6" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-white">{score}%</span>
          <span className="text-[8px] uppercase text-slate-400">Confidence</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 selection:bg-brand selection:text-white font-sans overflow-x-hidden">
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* --- Navbar --- */}
      <nav className="relative z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-brand to-accent p-2 rounded-lg shadow-lg shadow-brand/20">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">TRUE-LEDGER <span className="text-brand font-mono">2.0</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Automated Forensic Workstation</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">ENCRYPTED</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        
        {/* --- LEFT COLUMN (Inputs & Terminals) --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Evidence Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search className="w-4 h-4 text-brand" /> Evidence Ingestion
            </h2>

            <div className="space-y-4">
              {/* CSV Input */}
              <div className="relative">
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`flex items-center justify-between p-4 rounded-xl border ${csvData.length ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5'} transition-all group-hover:border-brand/30`}>
                   <div className="flex items-center gap-3">
                      <FileSpreadsheet className={`w-5 h-5 ${csvData.length ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-sm font-medium text-slate-200">Ledger Data (.csv)</div>
                        <div className="text-xs text-slate-500 font-mono">{csvData.length ? `${csvData.length} records parsed` : 'Waiting for upload...'}</div>
                      </div>
                   </div>
                   {csvData.length > 0 && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Video Input */}
              <div className="relative">
                <input type="file" accept="video/mp4,video/mov" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className={`flex items-center justify-between p-4 rounded-xl border ${videoUrl ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5'} transition-all group-hover:border-brand/30`}>
                   <div className="flex items-center gap-3">
                      <Video className={`w-5 h-5 ${videoUrl ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-sm font-medium text-slate-200">Site Video (.mp4)</div>
                        <div className="text-xs text-slate-500 font-mono">{videoFile ? videoFile.name : 'Waiting for upload...'}</div>
                      </div>
                   </div>
                   {videoUrl && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
              </div>

              {/* Hidden Video & Canvas for Processing */}
              {videoUrl && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-black mt-4">
                  <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" controls />
                  <canvas ref={canvasRef} width="800" height="450" className="hidden" />
                </div>
              )}
            </div>
            
            <button 
              onClick={runForensicAudit}
              disabled={status !== 'IDLE' && status !== 'COMPLETED' && status !== 'ERROR'}
              className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-brand to-accent hover:from-brand/90 hover:to-accent/90 text-white font-bold tracking-wide shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {status === 'IDLE' || status === 'COMPLETED' || status === 'ERROR' ? (
                 <> <Cpu className="w-5 h-5" /> INITIATE AUDIT PROTOCOL </>
               ) : (
                 <> <Activity className="w-5 h-5 animate-spin" /> PROCESSING... </>
               )}
            </button>
          </div>

          {/* 2. Neural Terminal */}
          <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col h-64 font-mono text-xs">
             <div className="bg-white/5 p-2 px-4 border-b border-white/5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400"><Terminal className="w-3 h-3" /> NEURAL_LOGS</span>
                <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/40">
                {logs.length === 0 && <span className="text-slate-600 italic">System ready. Awaiting input...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="text-emerald-400/80 break-words font-mono">
                    <span className="text-slate-600 mr-2">{'>'}</span>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
             </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Results & Visualization) --- */}
        <div className="lg:col-span-7 space-y-6">
          
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* 1. Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Risk Score */}
                 <div className={`glass-panel p-5 rounded-2xl flex items-center justify-between relative overflow-hidden ${result.risk_score === 'HIGH' ? 'border-rose-500/30' : 'border-emerald-500/30'}`}>
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-40 ${result.risk_score === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                    <div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Assessment</div>
                       <div className={`text-3xl font-bold ${result.risk_score === 'HIGH' ? 'text-rose-400 neon-text' : 'text-emerald-400'}`}>{result.risk_score}</div>
                    </div>
                    <AlertOctagon className={`w-8 h-8 ${result.risk_score === 'HIGH' ? 'text-rose-500' : 'text-emerald-500'}`} />
                 </div>

                 {/* Financial Impact */}
                 <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                    <div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Impact</div>
                       <div className="text-2xl font-bold text-slate-200">{result.financial_impact}</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg"><Activity className="w-5 h-5 text-brand" /></div>
                 </div>

                 {/* Confidence */}
                 <div className="glass-panel p-2 rounded-2xl flex items-center justify-center">
                    <ConfidenceGauge score={result.confidence_score} />
                 </div>
              </div>

              {/* 2. Discrepancy Chart */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Inventory Discrepancy Analysis</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.stats} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={10} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                          cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="claimed" name="Claimed (Ledger)" fill="#475569" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="actual" name="Actual (Video)" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20}>
                          {result.stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.actual < entry.claimed ? '#f43f5e' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* 3. Findings & Certificate */}
              <div className="glass-panel p-6 rounded-2xl">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auditor Summary</h3>
                    <button onClick={downloadCertificate} className="flex items-center gap-2 text-xs font-bold text-brand hover:text-white transition-colors">
                       <Download className="w-4 h-4" /> EXPORT CERTIFICATE
                    </button>
                 </div>
                 <div className="bg-black/40 rounded-lg p-4 border border-white/5 text-sm text-slate-300 leading-relaxed font-mono">
                    {result.summary}
                 </div>
                 <div className="mt-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-400">Technical Details:</span> {result.details}
                 </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[500px] glass-panel rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8">
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse-slow">
                 <Search className="w-8 h-8 text-slate-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-200 mb-2">Ready for Analysis</h3>
               <p className="text-slate-500 max-w-md mx-auto">Upload your CSV ledger and site video to begin the multimodal forensic audit. The system will extract frames and cross-reference inventory counts.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;