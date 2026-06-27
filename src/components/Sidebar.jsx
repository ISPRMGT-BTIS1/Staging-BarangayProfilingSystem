import React from "react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "residents", label: "Residents" },
    { id: "households", label: "Households" },
    { id: "reports", label: "Reports" },
    { id: "settings", label: "Settings" }
  ];

  const getIcon = (id, isActive) => {
    const strokeColor = isActive ? "text-[#16324A]" : "text-slate-300 group-hover:text-white";
    
    switch (id) {
      case "dashboard":
        return (
          <svg className={`h-4 w-4 fill-none stroke-current ${strokeColor}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
        );
      case "residents":
        return (
          <svg className={`h-4 w-4 fill-none stroke-current ${strokeColor}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case "households":
        return (
          <svg className={`h-4 w-4 fill-none stroke-current ${strokeColor}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case "reports":
        return (
          <svg className={`h-4 w-4 fill-none stroke-current ${strokeColor}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
        );
      case "settings":
        return (
          <svg className={`h-4 w-4 fill-none stroke-current ${strokeColor}`} viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-[#16324A] text-white flex flex-col justify-between border-r border-[#16324A] select-none h-[calc(100vh-4rem)] sticky top-16 z-30">
      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 group text-sm font-medium tracking-wide uppercase text-left rounded-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-[#F2F4F1] text-[#16324A] font-semibold border-l-4 border-[#C8932B]"
                  : "text-slate-300 hover:text-white hover:bg-[#1f4260]"
              }`}
            >
              <span className="flex-shrink-0">{getIcon(item.id, isActive)}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Sign Out */}
      <div className="border-t border-[#1f4260] p-4 bg-[#0f2436] space-y-3">
        {/* Logged in user info */}
        <div className="flex items-center space-x-3 bg-[#16324A]/50 p-2.5 rounded-sm border border-[#1f4260]/60">
          <div className="h-8 w-8 rounded-full bg-[#C8932B] flex items-center justify-center font-bold text-white text-xs shadow-inner">
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate font-sans">
              Admin User
            </p>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-mono truncate">
              Manager
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => alert("Signing out of system...")}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-300 hover:text-red-300 hover:bg-red-950/20 border border-[#1f4260] rounded-xs cursor-pointer transition-all"
        >
          <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
