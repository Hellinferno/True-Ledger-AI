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
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
               <div className="relative w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
               </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                TRUE-LEDGER <span className="text-indigo-500">AI</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`
              flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-500
              ${status === 'Ready' || status === 'Clean' 
                ? 'bg-emerald-950/30 border-emerald-500/30' 
                : status.includes('Reasoning') 
                  ? 'bg-indigo-950/30 border-indigo-500/30' 
                  : 'bg-rose-950/30 border-rose-500/30'}
            `}>
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status === 'Ready' || status === 'Clean' ? 'bg-emerald-400' : 
                  status.includes('Reasoning') ? 'bg-indigo-400' : 'bg-rose-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === 'Ready' || status === 'Clean' ? 'bg-emerald-500' : 
                  status.includes('Reasoning') ? 'bg-indigo-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className={`text-[10px] font-bold font-mono tracking-widest ${
                status === 'Ready' || status === 'Clean' ? 'text-emerald-400' : 
                status.includes('Reasoning') ? 'text-indigo-400' : 'text-rose-400'
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