"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  ChevronDown, 
  LogOut, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { currentUser, switchUser, allUsers, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return {
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />,
          label: "ADMIN",
        };
      case "WARDEN":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <UserCheck className="w-3.5 h-3.5 text-amber-400" />,
          label: "WARDEN",
        };
      default:
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
          label: "STUDENT",
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">HostelSphere</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    MVP
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Agile Automated Hostel Management</p>
              </div>
            </Link>
          </div>

          {/* Quick Persona Switcher & Role Badges */}
          <div className="flex items-center space-x-3">
            {/* Quick Switch Pills for Desktop */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
              <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" /> Switch Role:
              </span>
              {allUsers.slice(0, 5).map((user) => {
                const isSelected = currentUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <span>{user.name.split(" ")[0]}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                        user.role === "ADMIN"
                          ? "bg-purple-900/60 text-purple-300"
                          : user.role === "WARDEN"
                          ? "bg-amber-900/60 text-amber-300"
                          : "bg-emerald-900/60 text-emerald-300"
                      }`}
                    >
                      {user.role[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active User Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 pl-3 pr-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                    {currentUser.name[0]}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800/80">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-2">
                      <p className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-1">
                        Select Persona:
                      </p>
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {allUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                              currentUser.id === u.id
                                ? "bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30"
                                : "text-slate-300 hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="text-left">
                              <p className="font-medium text-slate-200">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.department || u.email}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                u.role === "ADMIN"
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : u.role === "WARDEN"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <Link
                        href="/login"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Login Portal</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
