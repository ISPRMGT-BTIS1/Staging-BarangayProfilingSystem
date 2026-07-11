import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate brief delay for realism
    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#16324A] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.1) 39px, rgba(255,255,255,0.1) 40px),
                           repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.1) 39px, rgba(255,255,255,0.1) 40px)`
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white border-2 border-[#16324A] rounded-xs shadow-2xl overflow-hidden">
          {/* Header with Seal */}
          <div className="bg-[#16324A] px-8 py-8 text-center border-b-4 border-[#C8932B]">
            {/* Barangay Seal */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-double border-[#C8932B]/60 bg-[#1f4260] mb-4">
              <svg className="h-10 w-10 stroke-current fill-none text-[#C8932B]" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18h16" />
                <path d="M4 10h16" />
                <path d="M5 10v8" />
                <path d="M12 10v8" />
                <path d="M19 10v8" />
                <path d="M3 6h18" />
                <path d="m12 2-9 4h18Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-serif text-white tracking-wide">
              Barangay Profiling System
            </h1>
            <p className="text-xs text-slate-300 font-mono uppercase tracking-widest mt-1">
              Internal Console Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-[#9B3D30]/10 border border-[#9B3D30]/30 text-[#9B3D30] text-xs font-semibold px-4 py-2.5 rounded-xs flex items-center space-x-2">
                <svg className="h-4 w-4 stroke-current fill-none flex-shrink-0" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
                className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-sm px-4 py-2.5 focus:outline-none focus:border-[#16324A] focus:ring-1 focus:ring-[#16324A]/20 transition-colors font-sans"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border border-[#D1D7CE] bg-[#F2F4F1] focus:bg-white text-[#16324A] rounded-xs text-sm px-4 py-2.5 focus:outline-none focus:border-[#16324A] focus:ring-1 focus:ring-[#16324A]/20 transition-colors font-sans"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2E5A44] hover:bg-[#234533] disabled:bg-[#2E5A44]/60 text-white text-sm font-semibold uppercase tracking-wider py-3 rounded-xs cursor-pointer transition-colors shadow-sm hover:shadow"
            >
              {isLoading ? (
                <span className="inline-flex items-center space-x-2">
                  <span className="animate-pulse">Authenticating...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-[#F2F4F1] border-t border-[#D1D7CE] px-8 py-3 text-center">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              Authorized Personnel Only — Barangay Profiling System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
