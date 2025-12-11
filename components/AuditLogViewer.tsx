import React, { useEffect, useRef } from 'react';
import { AuditLog } from '../types';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="glass-card w-full rounded-xl p-6 h-56 flex flex-col font-mono text-xs relative group bg-white shadow-sm border border-slate-100">
      
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
           <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">System Logs</span>
        </div>
        <span className="text-brand text-[10px] font-bold bg-brand/5 px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      
      <div className="flex-grow overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <div className="w-8 h-8 rounded-full border border-slate-200 border-t-brand animate-spin opacity-50"></div>
                <span className="text-slate-500 font-bold uppercase tracking-widest opacity-70">Awaiting protocol initiation...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 font-medium hover:bg-slate-50 p-1.5 rounded transition-colors border-l-2 border-transparent hover:border-brand">
                    <span className="text-slate-400">[{log.timestamp}]</span>
                    <span className={`${
                        log.type === 'error' ? 'text-rose-600' : 
                        log.type === 'success' ? 'text-brand' : 
                        log.type === 'warning' ? 'text-amber-600' : 
                        'text-indigo-600'
                    } font-bold`}>
                        {log.type === 'info' && 'INF'}
                        {log.type === 'success' && 'SUC'}
                        {log.type === 'warning' && 'WRN'}
                        {log.type === 'error' && 'ERR'}
                    </span>
                    <span className="text-slate-700 flex-1">{log.message}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};