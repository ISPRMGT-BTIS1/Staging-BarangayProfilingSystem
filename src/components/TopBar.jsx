import React from "react";

export default function TopBar({ searchQuery, setSearchQuery, onNewProfiling }) {
  return (
    <header className="h-16 border-b-2 border-[#16324A] bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      {/* App Name */}
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold tracking-tight font-serif flex items-center space-x-2 text-[#16324A]">
          <svg className="h-5 w-5 stroke-current fill-none text-[#C8932B]" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18h16" />
            <path d="M4 10h16" />
            <path d="M5 10v8" />
            <path d="M12 10v8" />
            <path d="M19 10v8" />
            <path d="M3 6h18" />
            <path d="m12 2-9 4h18Z" />
          </svg>
          <span>Brgy. System</span>
        </span>
        <span className="text-xs uppercase px-2 py-0.5 border border-[#D1D7CE] bg-[#F2F4F1] font-mono rounded text-slate-600 tracking-wider">
          Internal Console
        </span>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search resident name, address, or ID..."
          className="w-full pl-9 pr-4 py-1.5 bg-[#F2F4F1] border border-[#D1D7CE] rounded-xs text-sm focus:outline-none focus:border-[#16324A] focus:bg-white text-[#16324A] font-sans placeholder-slate-400 transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* New Profiling Button */}
      <div>
        <button
          onClick={onNewProfiling}
          className="bg-[#16324A] hover:bg-[#1f4260] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-sm hover:shadow transition-all inline-flex items-center space-x-2 border border-transparent"
        >
          <span className="text-sm">+</span>
          <span>New Profiling</span>
        </button>
      </div>
    </header>
  );
}
