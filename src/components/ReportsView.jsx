import React, { useState } from "react";
import { residents, households, generatedReports } from "../mockData";

export default function ReportsView() {
  // Toggle state for the demographics legend
  const [highlightGender, setHighlightGender] = useState("all"); // "all", "male", "female"
  const [openMenuId, setOpenMenuId] = useState(null);

  // Dynamic calculations
  const totalResidentsCount = residents.filter(r => r.status !== "Deceased").length;
  const totalSeniorsCount = residents.filter(r => r.age >= 60 && r.status !== "Deceased").length;
  const totalHouseholdsCount = households.length;

  const maleCount = residents.filter(r => r.sex === "Male" && r.status !== "Deceased").length;
  const femaleCount = residents.filter(r => r.sex === "Female" && r.status !== "Deceased").length;
  const malePercentage = ((maleCount / totalResidentsCount) * 100).toFixed(1);
  const femalePercentage = ((femaleCount / totalResidentsCount) * 100).toFixed(1);

  // Calculate target progress
  // Households progress against target of 10 households
  const householdProgress = Math.min((totalHouseholdsCount / 10) * 100, 100).toFixed(0);
  // Seniors progress against senior vaccination target of 10 seniors
  const seniorProgress = Math.min((totalSeniorsCount / 10) * 100, 100).toFixed(0);

  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  const handleDownload = (filename) => {
    alert(`Downloading ${filename}...`);
    setOpenMenuId(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-[#16324A]">Reports</h1>
        <p className="text-sm text-slate-500 font-sans">Barangay Profiling Analytics & Generated Registry Lists</p>
      </div>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Large card showing "Total Residents", count, delta, supporting visual */}
        <div className="ledger-container p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">Total Residents</h3>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-bold font-serif text-[#16324A] tabular-numbers">{totalResidentsCount}</span>
              <span className="text-xs font-mono font-bold text-[#2E5A44] bg-[#2E5A44]/10 px-2 py-0.5 rounded border border-[#2E5A44]/20">
                +4.2% vs last quarter
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Based on active records in the civil registry database.</p>
          </div>

          {/* Supporting Visual (SVG Sparkline Chart representing growth over 6 months) */}
          <div className="h-28 mt-6 border-t border-[#D1D7CE]/40 pt-4 flex flex-col justify-end">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jun (Current)</span>
            </div>
            <svg viewBox="0 0 400 80" className="w-full h-20 overflow-visible">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16324A" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#16324A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="3" />
              {/* Chart Path Area */}
              <path
                d="M 0 75 Q 50 68 100 62 T 200 48 T 300 35 T 400 12 L 400 80 L 0 80 Z"
                fill="url(#sparklineGrad)"
              />
              {/* Line Path */}
              <path
                d="M 0 75 Q 50 68 100 62 T 200 48 T 300 35 T 400 12"
                fill="none"
                stroke="#16324A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Marker Points */}
              <circle cx="400" cy="12" r="4" fill="#C8932B" stroke="#16324A" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Right: Two stacked smaller cards (Households and Seniors with progress bars) */}
        <div className="flex flex-col justify-between space-y-6">
          {/* Card 1: Households Progress */}
          <div className="ledger-container p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Households Indexed</h3>
                <span className="font-mono text-sm font-bold text-[#16324A]">{totalHouseholdsCount} / 10 target</span>
              </div>
              <p className="text-xs text-slate-400">Profiling progress across target housing units.</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-[#F2F4F1] border border-[#D1D7CE] h-4 rounded-xs overflow-hidden flex">
                <div
                  className="bg-[#16324A] h-full transition-all duration-500"
                  style={{ width: `${householdProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>{householdProgress}% Completed</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Seniors Progress */}
          <div className="ledger-container p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Senior Citizens Registry</h3>
                <span className="font-mono text-sm font-bold text-[#C8932B]">{totalSeniorsCount} / 10 priority</span>
              </div>
              <p className="text-xs text-slate-400">Vaccination priority profiling completion progress.</p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-[#F2F4F1] border border-[#D1D7CE] h-4 rounded-xs overflow-hidden flex">
                <div
                  className="bg-[#C8932B] h-full transition-all duration-500"
                  style={{ width: `${seniorProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>{seniorProgress}% Completed</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Overview Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Demographics Card with Toggle and Chart */}
        <div className="ledger-container p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#D1D7CE]/40 pb-3 mb-4">
            <h3 className="font-serif font-bold text-md text-[#16324A]">Gender Demographics Overview</h3>
            
            {/* Male/Female legend toggle */}
            <div className="flex space-x-1 border border-[#D1D7CE] bg-[#F2F4F1] p-0.5 rounded-sm text-[10px] font-mono font-semibold">
              <button
                onClick={() => setHighlightGender("all")}
                className={`px-2 py-1 uppercase rounded-xs transition-all cursor-pointer ${highlightGender === "all" ? "bg-white text-[#16324A] shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                All
              </button>
              <button
                onClick={() => setHighlightGender("male")}
                className={`px-2 py-1 uppercase rounded-xs transition-all cursor-pointer ${highlightGender === "male" ? "bg-[#16324A] text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Male
              </button>
              <button
                onClick={() => setHighlightGender("female")}
                className={`px-2 py-1 uppercase rounded-xs transition-all cursor-pointer ${highlightGender === "female" ? "bg-[#C8932B] text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Demographics chart (SVG horizontal visual ledger/bar) */}
          <div className="py-4 space-y-6 flex-1 flex flex-col justify-center">
            {/* Visual Bar Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-medium">
                <span className={`${highlightGender === "male" ? "font-bold text-[#16324A]" : "text-slate-600"}`}>
                  👦 Male: {maleCount} ({malePercentage}%)
                </span>
                <span className={`${highlightGender === "female" ? "font-bold text-[#C8932B]" : "text-slate-600"}`}>
                  👧 Female: {femaleCount} ({femalePercentage}%)
                </span>
              </div>
              <div className="w-full h-8 bg-slate-200 border border-[#D1D7CE] rounded-xs overflow-hidden flex">
                <div
                  className={`bg-[#16324A] h-full transition-all duration-300 ${
                    highlightGender === "female" ? "opacity-30" : "opacity-100"
                  }`}
                  style={{ width: `${malePercentage}%` }}
                ></div>
                <div
                  className={`bg-[#C8932B] h-full transition-all duration-300 ${
                    highlightGender === "male" ? "opacity-30" : "opacity-100"
                  }`}
                  style={{ width: `${femalePercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Demographics Detail Monospace Tags */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className={`p-2.5 border rounded-xs ${highlightGender === "male" ? "bg-[#16324A]/5 border-[#16324A]" : "border-[#D1D7CE] bg-[#F9FAF8]"}`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Male Residents</p>
                <p className="text-xl font-bold font-serif text-[#16324A] mt-1">{maleCount}</p>
                <p className="text-[10px] text-slate-400 mt-1">Average age: 36.2 yrs</p>
              </div>
              <div className={`p-2.5 border rounded-xs ${highlightGender === "female" ? "bg-[#C8932B]/5 border-[#C8932B]" : "border-[#D1D7CE] bg-[#F9FAF8]"}`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Female Residents</p>
                <p className="text-xl font-bold font-serif text-[#C8932B] mt-1">{femaleCount}</p>
                <p className="text-[10px] text-slate-400 mt-1">Average age: 41.5 yrs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Two stacked cards (Monthly Growth and Participation charts) */}
        <div className="flex flex-col justify-between space-y-6">
          {/* Card 1: Monthly Growth */}
          <div className="ledger-container p-5 flex flex-col justify-between">
            <h4 className="font-serif font-bold text-sm text-[#16324A] border-b border-[#D1D7CE]/40 pb-2 mb-2">
              Monthly Growth Log (Residents Registered)
            </h4>
            <div className="flex items-end justify-between h-20 pt-4">
              {[
                { m: "Jan", v: 12 },
                { m: "Feb", v: 18 },
                { m: "Mar", v: 15 },
                { m: "Apr", v: 22 },
                { m: "May", v: 25 },
                { m: "Jun", v: 26 }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1.5 flex-1">
                  <div className="w-full px-2">
                    <div
                      className="bg-[#16324A]/90 hover:bg-[#16324A] w-full rounded-t-xs transition-all duration-300"
                      style={{ height: `${(item.v / 30) * 60}px` }}
                      title={`${item.v} registered`}
                    ></div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{item.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Program Participation */}
          <div className="ledger-container p-5 flex flex-col justify-between">
            <h4 className="font-serif font-bold text-sm text-[#16324A] border-b border-[#D1D7CE]/40 pb-2 mb-2">
              Program Participation Coverage
            </h4>
            <div className="space-y-2 mt-2">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Vaccine Center</span>
                  <span className="font-bold">82% of eligible seniors</span>
                </div>
                <div className="w-full h-2 bg-slate-200 border border-[#D1D7CE] rounded-xs overflow-hidden">
                  <div className="bg-[#2E5A44] h-full" style={{ width: "82%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>Aid Distribution</span>
                  <span className="font-bold">65% of households</span>
                </div>
                <div className="w-full h-2 bg-slate-200 border border-[#D1D7CE] rounded-xs overflow-hidden">
                  <div className="bg-[#16324A] h-full" style={{ width: "65%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Generated Section */}
      <section className="ledger-container p-5">
        <div className="flex justify-between items-center mb-4 border-b border-[#D1D7CE] pb-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#16324A]">Generated Records Registry</h2>
            <p className="text-xs text-slate-500">Official registry snapshots and summaries compiled by staff.</p>
          </div>
          <button
            onClick={() => alert("Showing all archive reports snap-lists...")}
            className="text-xs font-bold text-[#16324A] hover:underline cursor-pointer"
          >
            View All →
          </button>
        </div>

        {/* Generated Reports List */}
        <div className="divide-y divide-[#D1D7CE]/40 font-sans">
          {generatedReports.map(report => (
            <div key={report.id} className="py-3 flex items-center justify-between hover:bg-[#F9FAF8] px-2 rounded-xs relative">
              <div className="flex items-center space-x-3">
                <div className="text-2xl p-1 bg-white border border-[#D1D7CE] rounded">
                  {report.type === "pdf" ? "📕" : report.type === "excel" ? "📗" : "📄"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#16324A]">{report.filename}</h4>
                  <span className="text-[9px] font-mono font-bold bg-[#F2F4F1] text-slate-600 px-1.5 py-0.5 border border-[#D1D7CE] rounded-xs mt-1 inline-block uppercase tracking-wider">
                    {report.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-8 text-xs text-slate-500">
                <span className="font-mono tabular-numbers">{report.date}</span>
                <span className="font-mono tabular-numbers text-right w-16">{report.size}</span>
                
                {/* Action button */}
                <div className="relative">
                  <button
                    onClick={() => toggleMenu(report.id)}
                    className="p-1 text-slate-400 hover:text-[#16324A] rounded hover:bg-slate-200 cursor-pointer font-bold"
                  >
                    •••
                  </button>

                  {openMenuId === report.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white border border-[#D1D7CE] rounded shadow-sm z-50 py-1">
                      <button
                        onClick={() => handleDownload(report.filename)}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#16324A] hover:bg-[#F2F4F1] font-medium cursor-pointer"
                      >
                        📥 Download File
                      </button>
                      <button
                        onClick={() => alert(`Printing report details: ${report.filename}`)}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#16324A] hover:bg-[#F2F4F1] font-medium cursor-pointer"
                      >
                        🖨️ Send to Printer
                      </button>
                      <hr className="border-[#D1D7CE]/40 my-1" />
                      <button
                        onClick={() => { alert("Flagged file check initiated."); setOpenMenuId(null); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#9B3D30] hover:bg-red-50 font-medium cursor-pointer"
                      >
                        ⚠️ Flag Registry Snap
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
