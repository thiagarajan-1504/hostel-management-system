"use client";

import React, { useState } from "react";
import { 
  DoorClosed, 
  Calendar, 
  Wrench, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Send, 
  Sparkles,
  Building,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info
} from "lucide-react";
import { User, Room, Allocation, Leave, Complaint, Fee } from "@/lib/types";
import { 
  applyLeave, 
  raiseComplaint, 
  payFees, 
  submitRoomPreference 
} from "@/app/actions/hostelActions";
import { useRouter } from "next/navigation";

interface StudentDashboardProps {
  student: User;
  allocatedRoom: Room | null;
  allocationDate?: Date | string | null;
  leaves: Leave[];
  complaints: Complaint[];
  fees: Fee[];
  availableRooms: Room[];
}

export default function StudentDashboard({
  student,
  allocatedRoom,
  allocationDate,
  leaves,
  complaints,
  fees,
  availableRooms,
}: StudentDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"room" | "leave" | "ticket" | "fees">("room");

  // Form states
  const [roomPreference, setRoomPreference] = useState<"AC" | "Non-AC">("AC");

  const [leaveForm, setLeaveForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [ticketDescription, setTicketDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Mock Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Handlers
  const handleRoomPreferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await submitRoomPreference(student.id, roomPreference);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Room preference registered!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to submit room request", "error");
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason.trim()) {
      showFeedback("Please complete all leave fields.", "error");
      return;
    }

    setIsSubmitting(true);
    const res = await applyLeave(student.id, leaveForm);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Leave application submitted!", "success");
      setLeaveForm({ fromDate: "", toDate: "", reason: "" });
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to submit leave", "error");
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      showFeedback("Please enter issue details.", "error");
      return;
    }

    setIsSubmitting(true);
    const res = await raiseComplaint(student.id, ticketDescription);
    setIsSubmitting(false);

    if (res.success) {
      showFeedback(res.message || "Complaint submitted!", "success");
      setTicketDescription("");
      router.refresh();
    } else {
      showFeedback(res.error || "Failed to raise ticket", "error");
    }
  };

  const handlePayFee = async (fee: Fee) => {
    setSelectedFee(fee);
    setPaymentModalOpen(true);
  };

  const confirmMockPayment = async () => {
    if (!selectedFee) return;
    setIsSubmitting(true);
    const res = await payFees(student.id, selectedFee.id);
    setIsSubmitting(false);
    setPaymentModalOpen(false);

    if (res.success) {
      showFeedback(res.message || "Payment completed!", "success");
      router.refresh();
    } else {
      showFeedback(res.error || "Payment failed", "error");
    }
  };

  const pendingFee = fees.find((f) => f.status === "Pending");

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Student Resident Portal
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {student.name}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Department: <span className="text-slate-200 font-medium">{student.department || "General Engineering"}</span> | 
              Email: <span className="text-slate-200 font-mono text-xs">{student.email}</span>
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

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Allocated Room Card */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Allocated Room</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DoorClosed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {allocatedRoom ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">{allocatedRoom.room_number}</span>
                <span className="text-xs text-blue-400 font-semibold">{allocatedRoom.room_type}</span>
              </div>
            ) : (
              <div>
                <span className="text-sm font-semibold text-amber-400">Not Allocated</span>
                <p className="text-[10px] text-slate-500">Submit preference below</p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Status Card */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Latest Leave Status</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {leaves.length > 0 ? (
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    leaves[0].status === "Approved"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : leaves[0].status === "Rejected"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {leaves[0].status}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{leaves[0].reason}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No leaves applied</span>
            )}
          </div>
        </div>

        {/* Maintenance Tickets */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Maintenance Tickets</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{complaints.length}</span>
            <span className="text-xs text-slate-400">
              ({complaints.filter((c) => c.status !== "Resolved").length} open)
            </span>
          </div>
        </div>

        {/* Fee Dues */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fee Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {pendingFee ? (
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-amber-400 font-mono">
                  ₹{pendingFee.amount.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Due Now
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" /> All Fees Paid
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "room", label: "Room Details & Preference", icon: DoorClosed },
          { id: "leave", label: `Apply Leave (${leaves.length})`, icon: Calendar },
          { id: "ticket", label: `Raise Ticket (${complaints.length})`, icon: Wrench },
          { id: "fees", label: `Pay Fees (${fees.length})`, icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROOM DETAILS & APPLY FOR ROOM */}
      {activeTab === "room" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Allocated Room Details */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DoorClosed className="w-4 h-4 text-blue-400" />
              Allocated Room Specification (viewRoomDetails)
            </h3>

            {allocatedRoom ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 border border-blue-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Room Number</p>
                    <p className="text-3xl font-black text-white font-mono mt-0.5">{allocatedRoom.room_number}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                    Assigned &amp; Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Room Category:</span>
                    <p className="font-semibold text-white mt-0.5">{allocatedRoom.room_type} Room</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Hostel Block:</span>
                    <p className="font-semibold text-white mt-0.5">Block {allocatedRoom.room_number[0]}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Status:</span>
                    <p className="font-semibold text-white mt-0.5">{allocatedRoom.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Allocation Date:</span>
                    <p className="font-semibold text-white mt-0.5">
                      {allocationDate ? new Date(allocationDate).toLocaleDateString() : "Active Semester"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <Info className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-white">No Room Allocated Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Submit your room preference using the form to reserve an available AC or Non-AC room.
                </p>
              </div>
            )}
          </div>

          {/* Form to Apply for Room (AC vs Non-AC) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Apply for Room (Preference Submission)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Submit room preference (AC vs Non-AC) for automatic allocation if available or Warden review.
            </p>

            <form onSubmit={handleRoomPreferenceSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">
                  Select Room Preference *
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setRoomPreference("AC")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      roomPreference === "AC"
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold">AC Room</div>
                    <div className="text-[10px] text-slate-400 mt-1">Air-conditioned luxury block</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomPreference("Non-AC")}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      roomPreference === "Non-AC"
                        ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-xs font-bold">Non-AC Room</div>
                    <div className="text-[10px] text-slate-400 mt-1">Standard ventilated block</div>
                  </button>
                </div>
              </div>

              {/* Available Rooms Insight */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400">Currently Available in Hostel: </span>
                <strong className="text-emerald-400">
                  {availableRooms.filter((r) => r.room_type === roomPreference).length} {roomPreference} room(s)
                </strong>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Submitting Request..." : `Submit Preference for ${roomPreference} Room`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: APPLY FOR LEAVE */}
      {activeTab === "leave" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Application Form */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Apply for Hostel Out-Pass / Leave
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Submit dates and reason. Sent directly to Chief Warden for approval.
              </p>

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">From Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">To Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Reason for Leave *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Attending sister's wedding in home town, returning Monday."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Submitting..." : "Submit Leave Application"}
                </button>
              </form>
            </div>

            {/* Dynamic Leave Status List */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">Your Leave Applications</h3>
              <p className="text-xs text-slate-400 mb-4">Real-time status dynamic updates.</p>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {leaves.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No leave requests submitted.
                  </div>
                ) : (
                  leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {new Date(leave.from_date).toLocaleDateString()} &rarr; {new Date(leave.to_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            leave.status === "Approved"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : leave.status === "Rejected"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{leave.reason}</p>
                      <p className="text-[10px] text-slate-500">
                        Applied: {new Date(leave.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RAISE TICKET */}
      {activeTab === "ticket" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raise Complaint Form */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-400" />
                Raise Maintenance Ticket
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Report electrical, plumbing, carpentry, or cleanliness issues.
              </p>

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">
                    Issue Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the issue clearly (e.g. Tap leaking in bathroom, fan regulator loose, AC not cooling)..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Submitting..." : "Submit Maintenance Ticket"}
                </button>
              </form>
            </div>

            {/* Ticket Status Tracker */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">Your Maintenance Tickets</h3>
              <p className="text-xs text-slate-400 mb-4">Track progress from Pending to Resolved.</p>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {complaints.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No tickets raised.
                  </div>
                ) : (
                  complaints.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">
                          #{c.id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === "Resolved"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : c.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{c.issue_description}</p>
                      <p className="text-[10px] text-slate-500">
                        Raised: {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAY FEES */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Online Hostel Fee Payment Portal
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Review semester hostel fee invoices and pay online securely.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fees.length === 0 ? (
                <div className="col-span-full p-8 text-center text-slate-500 text-xs">
                  No fee records generated for this student.
                </div>
              ) : (
                fees.map((fee) => (
                  <div
                    key={fee.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Hostel Fee Invoice</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          fee.status === "Paid"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Amount Due</p>
                      <p className="text-3xl font-black text-white font-mono mt-0.5">
                        ₹{fee.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Generated: {new Date(fee.createdAt).toLocaleDateString()}</span>
                    </div>

                    {fee.status === "Pending" ? (
                      <button
                        onClick={() => handlePayFee(fee)}
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Online (₹{fee.amount.toLocaleString()})
                      </button>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid &amp; Receipt Confirmed
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOCK ONLINE PAYMENT GATEWAY MODAL */}
      {paymentModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Mock Payment Gateway</h4>
                  <p className="text-[11px] text-slate-400">Secure Hostel Fee Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Student:</span>
                <span className="text-white font-medium">{student.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Purpose:</span>
                <span className="text-white">Hostel Semester Room Fee</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Total Amount:</span>
                <span className="font-black text-emerald-400 font-mono">
                  ₹{selectedFee.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300">
              ℹ️ Simulated Payment Simulator: Clicking &apos;Complete Payment&apos; will instantly update your status to Paid in the SQLite database.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMockPayment}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
