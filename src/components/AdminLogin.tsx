/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onClose?: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === "ismath" && password === "ismath2026") {
      onLoginSuccess();
      setError("");
    } else {
      setError("Invalid Admin Username or Password. Hint: Check credentials in the box below.");
    }
  };

  return (
    <div id="admin-login-container" className="bg-[#0b2513] border border-emerald-900/50 rounded-2xl p-6 md:p-8 max-w-md w-full mx-auto shadow-2xl relative overflow-hidden">
      {/* Turf pattern visual background highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>

      <div className="text-center mb-6 relative z-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 mb-3">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white tracking-tight">PSL 2026 Scoring Panel</h2>
        <p className="text-emerald-400 text-sm mt-1">Admin Authorization Required</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div>
          <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="username-input">
            Admin Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600">
              <User className="w-4 h-4" />
            </span>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Ismath"
              className="w-full bg-[#05140b] border border-emerald-800/80 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="password-input">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#05140b] border border-emerald-800/80 rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-emerald-700/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all text-sm"
              required
            />
            <button
              id="toggle-password-btn"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 hover:text-emerald-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div id="login-error-msg" className="bg-red-950/40 border border-red-900/50 text-red-300 px-3 py-2 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="pt-2 flex gap-3">
          {onClose && (
            <button
              id="cancel-login-btn"
              type="button"
              onClick={onClose}
              className="flex-1 border border-emerald-800 text-emerald-400 hover:bg-emerald-950/50 hover:text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            id="submit-login-btn"
            type="submit"
            className="flex-grow bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-emerald-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            Authorize Login
          </button>
        </div>
      </form>

      {/* Helper credential prompt to keep the app frictionless and self-contained for the user */}
      <div id="credentials-helper" className="mt-6 border-t border-emerald-900/40 pt-4 text-center">
        <div className="inline-block bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-2.5 text-[11px] text-yellow-400/80 max-w-xs">
          <p className="font-semibold uppercase tracking-wider mb-0.5">Scoring Credentials</p>
          <p>Username: <span className="text-white font-mono font-bold">Ismath</span></p>
          <p>Password: <span className="text-white font-mono font-bold">******</span></p>
        </div>
      </div>
    </div>
  );
}
