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
    <div className="glass-card rounded-2xl p-6 h-56 overflow-hidden flex flex-col font-mono text-xs relative group">
      
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">System Logs</span>
        </div>
        <span className="text-slate-600 text-[10px]">LIVE</span>
      </div>
      
      <div className="overflow-y-auto space-y-2 custom-scrollbar flex-grow">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-700 italic opacity-40">
            <span>Awaiting protocol initiation...</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 font-medium hover:bg-white/5 p-1 rounded transition-colors border-l-2 border-transparent hover:border-white/20">
              <span className="text-slate-600">[{log.timestamp}]</span>
              <span className={`${
                log.type === 'error' ? 'text-rose-500' : 
                log.type === 'success' ? 'text-emerald-500' : 
                log.type === 'warning' ? 'text-amber-500' : 
                'text-blue-500'
              } font-bold`}>
                {log.type === 'info' && 'INF'}
                {log.type === 'success' && 'SUC'}
                {log.type === 'warning' && 'WRN'}
                {log.type === 'error' && 'ERR'}
              </span>
              <span className="text-slate-400 flex-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};