"use client";

import React, { useState } from "react";
import { 
  DoorClosed, 
  CalendarCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight, 
  Sparkles,
  Building,
  RefreshCw,
  Search,
  Filter,
  Layers
} from "lucide-react";
import { User, Room, Allocation, Leave } from "@/lib/types";
import { allocateRoom, approveLeave, manageRooms } from "@/app/actions/hostelActions";
import { useRouter } from "next/navigation";

interface WardenDashboardProps {
  warden: User;
  users: User[];
  rooms: Room[];
  allocations: Allocation[];
  leaves: Leave[];
}

export default function WardenDashboard({
  warden,
  users,
  rooms,
  allocations,
  leaves,
}: WardenDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"allocation" | "leaves" | "rooms">("allocation");

  // Allocation Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [filterRoomType, setFilterRoomType] = useState<"ALL" | "AC" | "Non-AC">("ALL");

  // Flow State for Activity Diagram Visualizer
  const [flowStep, setFlowStep] = useState<"idle" | "checking" | "available" | "unavailable" | "allocated">("idle");
  const [flowResult, setFlowResult] = useState<{ success: boolean; message: string; allocation?: any } | null>(null);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const studentUsers = users.filter((u) => u.role === "STUDENT");

  // Filtered rooms for allocation
  const filteredRooms = rooms.filter((r) => {
    if (filterRoomType === "AC") return r.room_type === "AC";
    if (filterRoomType === "Non-AC") return r.room_type === "Non-AC";
    return true;
  });

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedStudent = studentUsers.find((s) => s.id === selectedStudentId);

  // Room Allocation Flow execution (Activity Diagram)
  const handleExecuteAllocationFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoomId) {
      showFeedback("Please select both a student and a room.", "error");
      return;
    }

    setIsSubmitting(true);
    setFlowStep("checking");

    // Simulate flow step 1: Check Room Availability
    await new Promise((res) => setTimeout(res, 400));
    const targetRoom = rooms.find((r) => r.id === selectedRoomId);

    if (!targetRoom || targetRoom.status !== "Available") {
      setFlowStep("unavailable");
      setFlowResult({
        success: false,
        message: `No Room Available! Room ${targetRoom?.room_number ?? "selected"} is currently marked as ${
          targetRoom?.status ?? "Unavailable"
        }.`,
      });
      setIsSubmitting(false);
      showFeedback(`No Room Available: Room is ${targetRoom?.status}`, "error");
      return;
    }

    setFlowStep("available");
    await new Promise((res) => setTimeout(res, 300));

    // Execute backend allocation (Allocates Room -> Updates Room Details to Occupied)
    const result = await allocateRoom(selectedStudentId, selectedRoomId);
    setIsSubmitting(false);

    if (result.success) {
      setFlowStep("allocated");
      setFlowResult({
        success: true,
        message: result.message || "Room allocated successfully!",
        allocation: result.allocation,
      });
      showFeedback(result.message || "Room allocated!", "success");
      setSelectedStudentId("");
      setSelectedRoomId("");
      router.refresh();
    } else {
      setFlowStep("unavailable");
      setFlowResult({
        success: false,
        message: result.error || "No Room Available",
      });
      showFeedback(result.error || "Allocation failed", "error");
    }
  };

  // Leave Management Handlers
  const handleLeaveDecision = async (leaveId: string, status: "Approved" | "Rejected") => {
    setIsSubmitting(true);
    const res = await approveLeave(leaveId, status);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || `Leave ${status}!`, "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to update leave", "error");
    }
  };

  const handleRoomStatusUpdate = async (roomId: string, status: "Available" | "Occupied" | "Maintenance") => {
    setIsSubmitting(true);
    const res = await manageRooms(roomId, status);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Status updated", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to update status", "error");
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const processedLeaves = leaves.filter((l) => l.status !== "Pending");

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
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-slate-900 border border-amber-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              Chief Warden Operations Console
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Warden Portal: {warden.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Strict Activity Diagram Room Allocation Flow, student check-in authorization, and leave approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "allocation", label: "Room Allocation Flow (Activity Diagram)", icon: DoorClosed },
          { id: "leaves", label: `Leave Applications (${pendingLeaves.length} Pending)`, icon: CalendarCheck2 },
          { id: "rooms", label: `Manage Rooms (${rooms.length})`, icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROOM ALLOCATION FLOW (Activity Diagram Logic) */}
      {activeTab === "allocation" && (
        <div className="space-y-6">
          {/* Visual Activity Diagram Flowchart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Activity Diagram Workflow Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Strict lifecycle execution: Check Room Availability &rarr; If Available &rarr; Allocate &amp; Update Details &rarr; Display Allocation; Else &rarr; &quot;No Room Available&quot;.
                </p>
              </div>
            </div>

            {/* Visual Step Pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-4">
              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  flowStep === "checking"
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 animate-pulse"
                    : "bg-slate-900/80 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Step 1</div>
                <div className="text-xs font-bold text-white">Check Availability</div>
                <div className="text-[10px] text-slate-400 mt-1">Verify room status in DB</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  flowStep === "available" || flowStep === "allocated"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                    : "bg-slate-900/80 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Step 2 (If Yes)</div>
                <div className="text-xs font-bold text-white">Allocate Room</div>
                <div className="text-[10px] text-slate-400 mt-1">Create allocation record</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  flowStep === "allocated"
                    ? "bg-blue-500/20 border-blue-500 text-blue-200"
                    : "bg-slate-900/80 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Step 3</div>
                <div className="text-xs font-bold text-white">Update Details</div>
                <div className="text-[10px] text-slate-400 mt-1">Set Room &rarr; Occupied</div>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  flowStep === "unavailable"
                    ? "bg-rose-500/20 border-rose-500 text-rose-200"
                    : flowStep === "allocated"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                    : "bg-slate-900/80 border-slate-800 text-slate-400"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Outcome</div>
                <div className="text-xs font-bold text-white">
                  {flowStep === "unavailable" ? "No Room Available" : "Display Allocation"}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {flowStep === "unavailable" ? "Allocation Terminated" : "Confirmed & Verified"}
                </div>
              </div>
            </div>

            {/* Live Flow Banner */}
            {flowResult && (
              <div
                className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
                  flowResult.success
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/80 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  {flowResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide">
                      {flowResult.success ? "Allocation Confirmed" : "Workflow Notice: No Room Available"}
                    </p>
                    <p className="text-sm">{flowResult.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFlowResult(null);
                    setFlowStep("idle");
                  }}
                  className="text-xs opacity-75 hover:opacity-100"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Allocation Action Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <DoorClosed className="w-4 h-4 text-amber-400" />
                Execute Room Allocation Flow
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Select student and desired room to trigger the availability validation check.
              </p>

              <form onSubmit={handleExecuteAllocationFlow} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Select Student Requiring Allocation *
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Student --</option>
                    {studentUsers.map((s) => {
                      const hasAllocation = allocations.some((a) => a.student_id === s.id);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.department || "Student"}) {hasAllocation ? "[Has Room]" : "[Unallocated]"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">
                      Select Target Room *
                    </label>
                    <div className="flex items-center gap-1">
                      {(["ALL", "AC", "Non-AC"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFilterRoomType(type)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            filterRoomType === type
                              ? "bg-amber-600 text-white"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Target Room --</option>
                    {filteredRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} - {r.room_type} [{r.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview Selected Room Availability */}
                {selectedRoom && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Target Room: </span>
                      <strong className="text-white font-mono">{selectedRoom.room_number}</strong>
                      <span className="text-slate-400 ml-2">Type: </span>
                      <strong className="text-white">{selectedRoom.room_type}</strong>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRoom.status === "Available"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      Status: {selectedRoom.status}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  {isSubmitting ? "Checking Availability..." : "Check Availability & Allocate"}
                </button>
              </form>
            </div>

            {/* Active Allocations List */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">Current Allocations</h3>
              <p className="text-xs text-slate-400 mb-4">Live room-resident mappings.</p>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {allocations.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">No active allocations.</div>
                ) : (
                  allocations.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300">
                          Room {a.room?.room_number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(a.allocation_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-white">{a.student?.name}</p>
                      <p className="text-[10px] text-slate-400">{a.student?.department || a.student?.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE MANAGEMENT FLOW */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-amber-400" />
                  Student Leave Applications (Authorization Flow)
                </h3>
                <p className="text-xs text-slate-400">
                  Review student leave requests &rarr; Approve or Reject &rarr; Dynamic status update.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                {pendingLeaves.length} Pending
              </span>
            </div>

            {/* Pending Applications */}
            <div className="space-y-4">
              {pendingLeaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl text-xs">
                  No pending leave applications requiring approval.
                </div>
              ) : (
                pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{leave.student?.name}</span>
                        <span className="text-xs text-slate-400">({leave.student?.department || "Student"})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Pending Decision
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        <strong>Reason:</strong> {leave.reason}
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span>
                          From: <strong>{new Date(leave.from_date).toLocaleDateString()}</strong>
                        </span>
                        <span>
                          To: <strong>{new Date(leave.to_date).toLocaleDateString()}</strong>
                        </span>
                        <span>
                          Applied: {new Date(leave.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLeaveDecision(leave.id, "Approved")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveDecision(leave.id, "Rejected")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Processed Leave History */}
            {processedLeaves.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Previously Processed Leaves
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">Student</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {processedLeaves.map((l) => (
                        <tr key={l.id} className="text-slate-300">
                          <td className="py-2.5 px-3 font-semibold text-white">{l.student?.name}</td>
                          <td className="py-2.5 px-3">
                            {new Date(l.from_date).toLocaleDateString()} to {new Date(l.to_date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate">{l.reason}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                l.status === "Approved"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE ROOMS (Warden Room Status Oversight) */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1">Hostel Room Status Oversight</h3>
            <p className="text-xs text-slate-400 mb-5">
              Quickly toggle rooms between Available, Occupied, and Maintenance for daily operations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const allocation = allocations.find((a) => a.room_id === room.id);
                return (
                  <div
                    key={room.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black text-white">{room.room_number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          room.room_type === "AC"
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {room.room_type}
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400">Resident: </span>
                      <span className="font-semibold text-white">
                        {allocation ? allocation.student?.name : "None (Vacant)"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          room.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : room.status === "Occupied"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {room.status}
                      </span>

                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleRoomStatusUpdate(room.id, "Available")}
                          title="Mark Available"
                          className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 text-[10px] border border-emerald-500/20"
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleRoomStatusUpdate(room.id, "Maintenance")}
                          title="Mark Maintenance"
                          className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-800 text-amber-300 text-[10px] border border-amber-500/20"
                        >
                          Maint.
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
