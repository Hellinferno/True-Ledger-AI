import React from 'react';

interface HeaderProps {
  status: string;
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <header className="sticky top-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
               {/* Updated Glow to Blue */}
               <div className="absolute -inset-1 bg-brand rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
               <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
               </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                TRUE-LEDGER <span className="text-brand">AI</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`
              flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-500 shadow-sm
              ${status === 'Ready' || status === 'Clean' 
                ? 'bg-brand/5 border-brand/20' 
                : status.includes('Reasoning') 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'bg-rose-50 border-rose-200'}
            `}>
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status === 'Ready' || status === 'Clean' ? 'bg-brand' : 
                  status.includes('Reasoning') ? 'bg-indigo-500' : 'bg-rose-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === 'Ready' || status === 'Clean' ? 'bg-brand' : 
                  status.includes('Reasoning') ? 'bg-indigo-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className={`text-[10px] font-bold font-mono tracking-widest ${
                status === 'Ready' || status === 'Clean' ? 'text-brand' : 
                status.includes('Reasoning') ? 'text-indigo-600' : 'text-rose-600'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};