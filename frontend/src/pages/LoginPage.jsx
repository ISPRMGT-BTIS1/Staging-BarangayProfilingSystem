import React, { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";

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
    setTimeout(async () => {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error);
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7EEF2] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[#8A244E] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <svg className="h-8 w-8 text-white fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18h16" />
                <path d="M4 10h16" />
                <path d="M5 10v8" />
                <path d="M12 10v8" />
                <path d="M19 10v8" />
                <path d="M3 6h18" />
                <path d="m12 2-9 4h18Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide font-serif">
              Barangay 46 Zone 6
            </h1>
            <p className="text-sm text-white/80 font-sans mt-0.5">Pasay City, Metro Manila</p>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest mt-1">
              Profiling System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2">
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
              <label className="text-[11px] uppercase font-bold text-white/80 mb-1.5 tracking-widest">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
                className="border-0 bg-white text-gray-700 rounded-lg text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all font-sans placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase font-bold text-white/80 mb-1.5 tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border-0 bg-white text-gray-700 rounded-lg text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all font-sans placeholder-gray-400"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D5F2E] hover:bg-[#1B4020] disabled:bg-[#2D5F2E]/60 text-white text-base font-bold uppercase tracking-wider py-3.5 rounded-lg cursor-pointer transition-colors shadow-md hover:shadow-lg mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center space-x-2">
                  <span className="animate-pulse">Authenticating...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-[#D1A5BB]/40 px-8 py-3 text-center">
            <p className="text-[10px] text-white/70 font-mono uppercase tracking-wider">
              Authorized Personnel Only — Barangay Profiling System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
