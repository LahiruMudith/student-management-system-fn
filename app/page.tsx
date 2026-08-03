"use client";

import React, { useState } from "react";
import { useApp } from "./context/AppContext";
import { DashboardTab } from "./components/DashboardTab";
import { StudentsTab } from "./components/StudentsTab";
import * as Icons from "./components/Icons";

export default function Home() {
  const {
    isLoggedIn,
    login,
    logout,
    currentView,
    setCurrentView,
    error,
    successMessage,
    setErrorMessage,
  } = useApp();

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }
    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center grid-bg bg-zinc-50 dark:bg-black p-4">
        {/* Login Card */}
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white/80 p-8 shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4 animate-bounce">
              <Icons.GraduationCap size={28} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Student Management
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Sign in to manage student cohorts & database operations
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <Icons.User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50/50 border border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400">
                  <Icons.X size={16} className="rotate-45" /> {/* Lock substitute */}
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50/50 border border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700 flex items-center gap-2 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                <Icons.AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Icons.Spinner size={14} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Info Credentials helper */}
          <div className="mt-6 rounded-lg bg-zinc-50 border border-zinc-100 p-3 text-[11px] text-zinc-500 dark:bg-zinc-950/40 dark:border-zinc-800/60 dark:text-zinc-400">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Quick Login Info:</span>
            <div className="mt-1 flex justify-between">
              <span>Username: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">admin</code></span>
              <span>Password: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">admin123</code></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 grid-bg">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Icons.GraduationCap size={20} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
            Student Management
          </span>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {/* Connection Status pill */}
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
            Spring Boot API
          </span>

          {/* Divider */}
          <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />



          {/* Log out */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer text-xs font-semibold"
            title="Log Out"
          >
            <Icons.LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Core Container */}
      <div className="flex flex-1 flex-col md:flex-row max-w-[1600px] w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 flex flex-row md:flex-col gap-1.5 shrink-0">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex flex-1 md:flex-none items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "bg-white hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icons.GraduationCap size={16} />
            Dashboard
          </button>
          
          <button
            onClick={() => setCurrentView("students")}
            className={`flex flex-1 md:flex-none items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentView === "students"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "bg-white hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icons.User size={16} />
            Students Registry
          </button>
        </aside>

        {/* Tab view Content panel */}
        <main className="flex-1 min-w-0">
          {currentView === "dashboard" ? <DashboardTab /> : <StudentsTab />}
        </main>
      </div>

      {/* Floating success and error alerts */}
      {successMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-emerald-500 text-white border border-emerald-400 shadow-xl px-5 py-3 flex items-center gap-3 animate-fade-in-right">
          <Icons.CheckCircle size={18} />
          <span className="text-xs font-bold">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
