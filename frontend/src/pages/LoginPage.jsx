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
    <div className="min-h-screen bg-[#FAF4F7] flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        {/* Login Card */}
        <div className="bg-[#D86B98] rounded-2xl shadow-xl overflow-hidden border border-[#F4C2D7]">
          {/* Header with Avatar Icon */}
          <div className="px-8 pt-10 pb-6 text-center">
            {/* Avatar circle */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#F4C2D7]/40 mb-5">
              <svg className="h-14 w-14 fill-[#FFFFFF]/90" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide font-serif">
              Barangay 46 Zone 6
            </h1>
            <p className="text-sm text-white/90 font-sans mt-0.5">Pasay City, Metro Manila</p>
            <p className="text-xs text-white/75 font-mono uppercase tracking-widest mt-1">
              Profiling System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2">
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
              <label className="text-[11px] uppercase font-bold text-white/90 mb-1.5 tracking-widest">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter your username"
                className="border-0 bg-white text-gray-700 rounded-lg text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all font-sans placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-[11px] uppercase font-bold text-white/90 mb-1.5 tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border-0 bg-white text-gray-700 rounded-lg text-base px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all font-sans placeholder-gray-400"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#386A45] hover:bg-[#264A2F] disabled:bg-[#386A45]/60 text-white text-base font-bold uppercase tracking-wider py-3.5 rounded-lg cursor-pointer transition-colors shadow-md hover:shadow-lg mt-2"
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
          <div className="bg-[#C45480]/30 px-8 py-3 text-center">
            <p className="text-[10px] text-white/80 font-mono uppercase tracking-wider">
              Authorized Personnel Only — Barangay Profiling System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
