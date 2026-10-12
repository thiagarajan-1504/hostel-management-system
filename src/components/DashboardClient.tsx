"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/AdminDashboard";
import WardenDashboard from "@/components/WardenDashboard";
import StudentDashboard from "@/components/StudentDashboard";
import { User, Room, Allocation, Leave, Complaint, Fee, SystemReports } from "@/lib/types";
import { ShieldCheck, UserCheck, GraduationCap, ArrowRight, Building2, Sparkles } from "lucide-react";
import Link from "next/link";

interface DashboardClientProps {
  users: User[];
  rooms: Room[];
  allocations: Allocation[];
  leaves: Leave[];
  complaints: Complaint[];
  fees: Fee[];
  reports: SystemReports | null;
}

export default function DashboardClient({
  users,
  rooms,
  allocations,
  leaves,
  complaints,
  fees,
  reports,
}: DashboardClientProps) {
  const { currentUser, switchUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 animate-spin flex items-center justify-center">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Initializing HostelSphere Portal...</p>
      </div>
    );
  }

  // Active student state
  const studentAllocation = currentUser
    ? allocations.find((a) => a.student_id === currentUser.id)
    : null;
  const studentAllocatedRoom = studentAllocation?.room || null;
  const studentLeaves = currentUser
    ? leaves.filter((l) => l.student_id === currentUser.id)
    : [];
  const studentComplaints = currentUser
    ? complaints.filter((c) => c.student_id === currentUser.id)
    : [];
  const studentFees = currentUser
    ? fees.filter((f) => f.student_id === currentUser.id)
    : [];
  const availableRooms = rooms.filter((r) => r.status === "Available");

  const adminUser = users.find((u) => u.role === "ADMIN") || users[0];
  const wardenUser = users.find((u) => u.role === "WARDEN") || users[1];
  const firstStudent = users.find((u) => u.role === "STUDENT") || users[2];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentUser ? (
          /* Landing Role Selector if no user is selected */
          <div className="py-12 space-y-10 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Agile Hostel Management MVP
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                Welcome to HostelSphere
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                Select your persona to enter the specialized dashboard. Full role-based functionality for Students, Wardens, and Admins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Admin Card */}
              <div
                onClick={() => adminUser && switchUser(adminUser)}
                className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-purple-500/20 hover:border-purple-500/50 transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Administrator Portal</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Maintain student records, track all fees, configure rooms, and resolve maintenance tickets.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                  <span>Sign in as Admin Sharma</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Warden Card */}
              <div
                onClick={() => wardenUser && switchUser(wardenUser)}
                className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-amber-500/20 hover:border-amber-500/50 transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Warden Operations</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Execute the Activity Diagram room allocation workflow and process student leave applications.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-400">
                  <span>Sign in as Warden Rajesh</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Student Card */}
              <div
                onClick={() => firstStudent && switchUser(firstStudent)}
                className="group cursor-pointer p-6 rounded-3xl bg-slate-900/60 hover:bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Student Resident</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Apply for room preferences, submit leave requests, raise maintenance tickets, and pay fees online.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Sign in as Aarav Patel</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ) : currentUser.role === "ADMIN" ? (
          <AdminDashboard
            users={users}
            rooms={rooms}
            allocations={allocations}
            leaves={leaves}
            complaints={complaints}
            fees={fees}
            reports={reports}
          />
        ) : currentUser.role === "WARDEN" ? (
          <WardenDashboard
            warden={currentUser}
            users={users}
            rooms={rooms}
            allocations={allocations}
            leaves={leaves}
          />
        ) : (
          <StudentDashboard
            student={currentUser}
            allocatedRoom={studentAllocatedRoom}
            allocationDate={studentAllocation?.allocation_date}
            leaves={studentLeaves}
            complaints={studentComplaints}
            fees={studentFees}
            availableRooms={availableRooms}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 mt-auto">
        <p>HostelSphere &bull; Agile MVP &bull; Powered by Next.js, Prisma ORM &amp; Tailwind CSS</p>
      </footer>
    </div>
  );
}
