"use client";

import React, { useState } from "react";
import { 
  Users, 
  DoorClosed, 
  CreditCard, 
  Wrench, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { User, Room, Allocation, Leave, Complaint, Fee, SystemReports } from "@/lib/types";
import { 
  addStudent, 
  removeStudent, 
  addRoom, 
  manageRooms, 
  allocateRoom, 
  deallocateRoom, 
  resolveComplaints, 
  payFees 
} from "@/app/actions/hostelActions";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
  users: User[];
  rooms: Room[];
  allocations: Allocation[];
  leaves: Leave[];
  complaints: Complaint[];
  fees: Fee[];
  reports: SystemReports | null;
}

export default function AdminDashboard({
  users,
  rooms,
  allocations,
  leaves,
  complaints,
  fees,
  reports,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "rooms" | "fees" | "maintenance">("overview");

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    initialFee: 40000,
  });

  const [roomForm, setRoomForm] = useState<{
    room_number: string;
    room_type: "AC" | "Non-AC";
    status: "Available" | "Occupied" | "Maintenance";
  }>({
    room_number: "",
    room_type: "AC",
    status: "Available",
  });

  const [allocForm, setAllocForm] = useState({
    studentId: "",
    roomId: "",
  });

  const [searchStudent, setSearchStudent] = useState("");
  const [feeFilter, setFeeFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Handlers
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addStudent(studentForm);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Student added!", "success");
      setStudentForm({ name: "", email: "", phone: "", department: "", initialFee: 40000 });
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to add student", "error");
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to remove student "${studentName}" (Passed-out/De-register)? This frees up their room.`)) {
      return;
    }
    setIsSubmitting(true);
    const res = await removeStudent(studentId);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Student removed", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to remove student", "error");
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addRoom(roomForm);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Room added!", "success");
      setRoomForm({ room_number: "", room_type: "AC", status: "Available" });
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to add room", "error");
    }
  };

  const handleForceAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocForm.studentId || !allocForm.roomId) {
      showFeedback("Please select both a student and a room", "error");
      return;
    }
    setIsSubmitting(true);
    const res = await allocateRoom(allocForm.studentId, allocForm.roomId);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Room allocated!", "success");
      setAllocForm({ studentId: "", roomId: "" });
      router.refresh();
    } else {
      showFeedback(res.error || "Allocation failed", "error");
    }
  };

  const handleDeallocate = async (allocationId: string) => {
    if (!confirm("Release this room allocation and mark room Available?")) return;
    setIsSubmitting(true);
    const res = await deallocateRoom(allocationId);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Room deallocated!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to deallocate", "error");
    }
  };

  const handleRoomStatusToggle = async (roomId: string, newStatus: "Available" | "Occupied" | "Maintenance") => {
    setIsSubmitting(true);
    const res = await manageRooms(roomId, newStatus);
    setIsSubmitting(false);
    if (res.success) {
      showFeedback(res.message || "Room status updated!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to update room", "error");
    }
  };

  const handleResolveComplaint = async (complaintId: string, status: "Pending" | "In Progress" | "Resolved") => {
    setIsSubmitting(true);
    const res = await resolveComplaints(complaintId, status);
    setIsSubmitting(false);
    if (res.success) {
      showFeedback(res.message || "Complaint updated!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to update complaint", "error");
    }
  };

  const handleFeePaymentUpdate = async (feeId: string) => {
    setIsSubmitting(true);
    const res = await payFees("", feeId);
    setIsSubmitting(false);
    if (res.success) {
      showFeedback(res.message || "Fee marked as Paid!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to update fee", "error");
    }
  };

  // Filter students
  const studentUsers = users.filter((u) => u.role === "STUDENT");
  const filteredStudents = studentUsers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  // Filter fees
  const filteredFees = fees.filter((f) => {
    if (feeFilter === "PAID") return f.status === "Paid";
    if (feeFilter === "PENDING") return f.status === "Pending";
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xl transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrative Control Center
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Hostel Admin Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Centralized management of student records, room allocations, hostel fee auditing, and facility maintenance resolution.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards (Reports Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Enrolled Students</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{reports?.totalStudents ?? 0}</span>
            <span className="text-xs text-blue-400 font-medium">Active records</span>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Hostel Occupancy Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DoorClosed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{reports?.occupancyRate ?? 0}%</span>
            <span className="text-xs text-emerald-400 font-medium">
              {reports?.occupiedRooms ?? 0} / {reports?.totalRooms ?? 0} rooms
            </span>
          </div>
        </div>

        {/* Fee Collection */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Fee Collected</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              ₹{(reports?.totalFeesPaid ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              ₹{(reports?.totalFeesPending ?? 0).toLocaleString()} pending
            </span>
          </div>
        </div>

        {/* Maintenance / Complaints */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Complaints</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{reports?.activeComplaintsCount ?? 0}</span>
            <span className="text-xs text-rose-400 font-medium">Require action</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "overview", label: "Executive Overview", icon: BarChart3 },
          { id: "students", label: `Students (${studentUsers.length})`, icon: Users },
          { id: "rooms", label: `Rooms & Allocations (${rooms.length})`, icon: DoorClosed },
          { id: "fees", label: `Fees Tracking (${fees.length})`, icon: CreditCard },
          { id: "maintenance", label: `Maintenance Hub (${complaints.length})`, icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & REPORTS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Breakdown Card */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                Room Distribution & Availability
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Available Rooms</span>
                  <span className="font-bold text-emerald-400">{reports?.availableRooms ?? 0}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        reports?.totalRooms ? ((reports.availableRooms / reports.totalRooms) * 100) : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Occupied Rooms</span>
                  <span className="font-bold text-blue-400">{reports?.occupiedRooms ?? 0}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        reports?.totalRooms ? ((reports.occupiedRooms / reports.totalRooms) * 100) : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Under Maintenance</span>
                  <span className="font-bold text-amber-400">{reports?.maintenanceRooms ?? 0}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        reports?.totalRooms ? ((reports.maintenanceRooms / reports.totalRooms) * 100) : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>AC Rooms: <strong className="text-white">{reports?.acRoomsCount ?? 0}</strong></span>
                  <span>Non-AC Rooms: <strong className="text-white">{reports?.nonAcRoomsCount ?? 0}</strong></span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Hostel Fee Ledger Summary
              </h3>
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Collected Amount</p>
                    <p className="text-2xl font-black text-emerald-400">
                      ₹{(reports?.totalFeesPaid ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Pending Dues</p>
                    <p className="text-2xl font-black text-amber-400">
                      ₹{(reports?.totalFeesPending ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500/40" />
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <p>
                    Tip: Use the <strong>Fees Tracking</strong> tab to view individual student payment records or collect pending fees directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE STUDENT DETAILS */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Add Student Form */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              Register New Student (Maintain Accurate Hostel Records)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add new student details. Automatically generates their hostel ledger entry.
            </p>

            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@student.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543200"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isSubmitting ? "Adding..." : "Add Student"}
                </button>
              </div>
            </form>
          </div>

          {/* Student Roster Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Student Hostel Directory</h3>
                <p className="text-xs text-slate-400">
                  Manage active residents or remove passed-out students to release allocated rooms.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, branch..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Allocated Room</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No students found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const allocation = allocations.find((a) => a.student_id === student.id);
                      return (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{student.name}</div>
                            <div className="text-[11px] text-slate-400">{student.email}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono">{student.phone}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                              {student.department || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {allocation ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold font-mono">
                                <DoorClosed className="w-3 h-3" />
                                Room {allocation.room?.room_number} ({allocation.room?.room_type})
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Not Allocated</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleRemoveStudent(student.id, student.name)}
                              disabled={isSubmitting}
                              title="Remove passed-out student"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL ROOM ALLOCATION & ROOMS */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          {/* Force Allocate Room & Add Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Force-Allocation Tool */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Global Room Allocation (Admin Override)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Force allocate any student to an available room.
              </p>

              <form onSubmit={handleForceAllocate} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Select Student</label>
                  <select
                    value={allocForm.studentId}
                    onChange={(e) => setAllocForm({ ...allocForm, studentId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose Student --</option>
                    {studentUsers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department || s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Select Available Room</label>
                  <select
                    value={allocForm.roomId}
                    onChange={(e) => setAllocForm({ ...allocForm, roomId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- Choose Room --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} - {r.room_type} [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
                >
                  Confirm Force Allocation
                </button>
              </form>
            </div>

            {/* Add New Room Form */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-blue-400" />
                Add New Hostel Room
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Expand hostel capacity by creating new AC or Non-AC rooms.
              </p>

              <form onSubmit={handleAddRoom} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C-401"
                    value={roomForm.room_number}
                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">Room Type</label>
                    <select
                      value={roomForm.room_type}
                      onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="AC">AC Room</option>
                      <option value="Non-AC">Non-AC Room</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">Initial Status</label>
                    <select
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Create Room
                </button>
              </form>
            </div>
          </div>

          {/* Rooms Inventory & Current Allocations */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Complete Hostel Room Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Room No</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Current Resident</th>
                    <th className="py-3 px-3 text-right">Status Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rooms.map((room) => {
                    const allocation = allocations.find((a) => a.room_id === room.id);
                    return (
                      <tr key={room.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                          {room.room_number}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              room.room_type === "AC"
                                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                : "bg-slate-700/50 text-slate-300"
                            }`}
                          >
                            {room.room_type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              room.status === "Available"
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : room.status === "Occupied"
                                ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                room.status === "Available"
                                  ? "bg-emerald-400"
                                  : room.status === "Occupied"
                                  ? "bg-blue-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {room.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {allocation ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-white">{allocation.student?.name}</span>
                                <p className="text-[10px] text-slate-400">{allocation.student?.email}</p>
                              </div>
                              <button
                                onClick={() => handleDeallocate(allocation.id)}
                                className="text-[10px] text-rose-400 hover:text-rose-300 underline ml-2"
                              >
                                Release
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No resident</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => handleRoomStatusToggle(room.id, "Available")}
                              className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-800/60 text-emerald-300 text-[10px] font-medium border border-emerald-500/20"
                            >
                              Available
                            </button>
                            <button
                              onClick={() => handleRoomStatusToggle(room.id, "Occupied")}
                              className="px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-800/60 text-blue-300 text-[10px] font-medium border border-blue-500/20"
                            >
                              Occupied
                            </button>
                            <button
                              onClick={() => handleRoomStatusToggle(room.id, "Maintenance")}
                              className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-800/60 text-amber-300 text-[10px] font-medium border border-amber-500/20"
                            >
                              Maintenance
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE FEES */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Student Fee Ledger Tracker
                </h3>
                <p className="text-xs text-slate-400">
                  Track fee obligations, verify online payments, and reconcile cash/counter payments.
                </p>
              </div>

              {/* Fee Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                {(["ALL", "PAID", "PENDING"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFeeFilter(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      feeFilter === mode
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email & Branch</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Reconciliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {fee.student?.name || "Unknown Student"}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        <div>{fee.student?.email}</div>
                        <div className="text-[10px] text-slate-500">{fee.student?.department}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${
                            fee.status === "Paid"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {fee.status === "Paid" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-400" />
                          )}
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {fee.status === "Pending" ? (
                          <button
                            onClick={() => handleFeePaymentUpdate(fee.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MAINTENANCE HUB */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-rose-400" />
              Student Maintenance Hub & Complaints Resolver
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Review maintenance tickets raised by students and update resolution lifecycle.
            </p>

            <div className="space-y-4">
              {complaints.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl">
                  No complaints reported in the system.
                </div>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{c.student?.name}</span>
                        <span className="text-xs text-slate-400">({c.student?.department || "Student"})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.status === "Resolved"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : c.status === "In Progress"
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-medium">{c.issue_description}</p>
                      <p className="text-[11px] text-slate-500">
                        Reported on: {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveComplaint(c.id, "In Progress")}
                        disabled={isSubmitting || c.status === "In Progress"}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleResolveComplaint(c.id, "Resolved")}
                        disabled={isSubmitting || c.status === "Resolved"}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
