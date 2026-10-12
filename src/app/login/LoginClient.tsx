"use client";

import React, { useState } from "react";
import { User } from "@/lib/types";
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  ArrowRight, 
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginClient({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hostel_user_id", user.id);
    }
    router.push("/");
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const found = initialUsers.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (found) {
      handleLogin(found);
    } else {
      setError("No user found with this email. Try one of the demo accounts below.");
    }
  };

  const adminUsers = initialUsers.filter((u) => u.role === "ADMIN");
  const wardenUsers = initialUsers.filter((u) => u.role === "WARDEN");
  const studentUsers = initialUsers.filter((u) => u.role === "STUDENT");

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            HostelSphere Auth Portal
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Sign in with demo role credentials or select any seed persona below
          </p>
        </div>

        {/* Form Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@hostel.edu or aarav@student.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign In to Dashboard
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" /> 1-Click Demo Personas:
              </span>
              <span className="text-[10px] text-slate-500">Instant Access</span>
            </div>

            {/* Admin Persona */}
            {adminUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u)}
                className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {u.name} (Admin)
                    </p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}

            {/* Warden Persona */}
            {wardenUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u)}
                className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      {u.name} (Warden)
                    </p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}

            {/* Student Personas */}
            {studentUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u)}
                className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {u.name} (Student)
                    </p>
                    <p className="text-[10px] text-slate-400">{u.email} &bull; {u.department}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-blue-400 hover:underline">
            &larr; Return to Home Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
