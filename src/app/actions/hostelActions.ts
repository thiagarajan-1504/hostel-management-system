"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SystemReports } from "@/lib/types";

// ==========================================
// AUTH & USER RETRIEVAL HELPERS
// ==========================================

export async function getAllUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        allocations: {
          include: { room: true },
        },
        leaves: {
          orderBy: { createdAt: "desc" },
        },
        complaints: {
          orderBy: { createdAt: "desc" },
        },
        fees: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        allocations: {
          include: { room: true },
        },
        leaves: {
          orderBy: { createdAt: "desc" },
        },
        complaints: {
          orderBy: { createdAt: "desc" },
        },
        fees: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// ==========================================
// STUDENT METHODS (Based on Class Diagram)
// ==========================================

/**
 * Student Method: viewRoomDetails()
 * Fetches allocated room details for the student, or list of rooms if not yet allocated
 */
export async function viewRoomDetails(studentId: string) {
  try {
    const allocation = await prisma.allocation.findFirst({
      where: { student_id: studentId },
      include: { room: true },
      orderBy: { allocation_date: "desc" },
    });

    const availableRooms = await prisma.room.findMany({
      where: { status: "Available" },
      orderBy: { room_number: "asc" },
    });

    return {
      success: true,
      allocation,
      allocatedRoom: allocation?.room || null,
      availableRooms,
    };
  } catch (error: any) {
    console.error("viewRoomDetails error:", error);
    return { success: false, error: error.message || "Failed to fetch room details" };
  }
}

/**
 * Student Method: applyLeave()
 */
export async function applyLeave(studentId: string, formData: {
  fromDate: string;
  toDate: string;
  reason: string;
}) {
  try {
    if (!studentId || !formData.fromDate || !formData.toDate || !formData.reason) {
      return { success: false, error: "All fields are required" };
    }

    const leave = await prisma.leave.create({
      data: {
        student_id: studentId,
        from_date: new Date(formData.fromDate),
        to_date: new Date(formData.toDate),
        reason: formData.reason.trim(),
        status: "Pending",
      },
    });

    revalidatePath("/");
    return { success: true, leave, message: "Leave application submitted successfully." };
  } catch (error: any) {
    console.error("applyLeave error:", error);
    return { success: false, error: error.message || "Failed to apply for leave" };
  }
}

/**
 * Student Method: payFees()
 */
export async function payFees(studentId: string, feeId?: string) {
  try {
    if (feeId) {
      const fee = await prisma.fee.update({
        where: { id: feeId },
        data: { status: "Paid" },
      });
      revalidatePath("/");
      return { success: true, fee, message: "Fee payment completed successfully!" };
    }

    // If no specific feeId provided, pay the first pending fee for student
    const pendingFee = await prisma.fee.findFirst({
      where: { student_id: studentId, status: "Pending" },
    });

    if (!pendingFee) {
      return { success: false, error: "No pending fee found for this student." };
    }

    const fee = await prisma.fee.update({
      where: { id: pendingFee.id },
      data: { status: "Paid" },
    });

    revalidatePath("/");
    return { success: true, fee, message: "Fee payment of ₹" + fee.amount + " completed successfully!" };
  } catch (error: any) {
    console.error("payFees error:", error);
    return { success: false, error: error.message || "Failed to process fee payment" };
  }
}

/**
 * Student Method: raiseComplaint()
 */
export async function raiseComplaint(studentId: string, issueDescription: string) {
  try {
    if (!studentId || !issueDescription.trim()) {
      return { success: false, error: "Complaint description cannot be empty." };
    }

    const complaint = await prisma.complaint.create({
      data: {
        student_id: studentId,
        issue_description: issueDescription.trim(),
        status: "Pending",
      },
    });

    revalidatePath("/");
    return { success: true, complaint, message: "Complaint ticket raised successfully." };
  } catch (error: any) {
    console.error("raiseComplaint error:", error);
    return { success: false, error: error.message || "Failed to register complaint" };
  }
}

/**
 * Student Room Preference Application
 */
export async function submitRoomPreference(studentId: string, preferredType: "AC" | "Non-AC") {
  try {
    // Check if student already has a room
    const existingAllocation = await prisma.allocation.findFirst({
      where: { student_id: studentId },
      include: { room: true },
    });

    if (existingAllocation) {
      return {
        success: false,
        error: `You are already allocated to Room ${existingAllocation.room.room_number}. Please contact Warden for room changes.`,
      };
    }

    // Find first available room matching preference
    const availableRoom = await prisma.room.findFirst({
      where: {
        room_type: preferredType,
        status: "Available",
      },
    });

    if (!availableRoom) {
      return {
        success: false,
        error: `No ${preferredType} room currently available. Your request has been logged for Warden review.`,
      };
    }

    // Allocate room
    const allocation = await prisma.allocation.create({
      data: {
        student_id: studentId,
        room_id: availableRoom.id,
      },
    });

    // Update room status
    await prisma.room.update({
      where: { id: availableRoom.id },
      data: { status: "Occupied" },
    });

    revalidatePath("/");
    return {
      success: true,
      allocation,
      room: availableRoom,
      message: `Successfully allocated Room ${availableRoom.room_number} (${availableRoom.room_type})!`,
    };
  } catch (error: any) {
    console.error("submitRoomPreference error:", error);
    return { success: false, error: error.message || "Failed to submit room preference" };
  }
}

// ==========================================
// WARDEN METHODS (Based on Class Diagram)
// ==========================================

/**
 * Warden Method: manageRooms()
 * Update room status (Available, Occupied, Maintenance)
 */
export async function manageRooms(roomId: string, status: "Available" | "Occupied" | "Maintenance") {
  try {
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status },
    });

    // If marked Available, remove existing allocations if needed or keep history
    if (status === "Available") {
      await prisma.allocation.deleteMany({
        where: { room_id: roomId },
      });
    }

    revalidatePath("/");
    return { success: true, room: updatedRoom, message: `Room ${updatedRoom.room_number} status updated to ${status}.` };
  } catch (error: any) {
    console.error("manageRooms error:", error);
    return { success: false, error: error.message || "Failed to update room status" };
  }
}

/**
 * Warden Method: allocateRoom() (Activity Diagram Logic)
 * 1. Check Room Availability
 * 2. If Available (Yes) -> Allocate Room -> Update Room Details -> Display Allocation
 * 3. If Available (No) -> Display "No Room Available"
 */
export async function allocateRoom(studentId: string, roomId: string) {
  try {
    if (!studentId || !roomId) {
      return { success: false, error: "Student ID and Room ID are required." };
    }

    // Step 1: Check Room Availability
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return { success: false, error: "Room not found in records." };
    }

    if (room.status !== "Available") {
      // Step 3 (No): Display "No Room Available"
      return {
        success: false,
        error: `No Room Available! Room ${room.room_number} is currently marked as ${room.status}.`,
      };
    }

    // Step 2 (Yes): Remove previous active allocation for this student if any
    await prisma.allocation.deleteMany({
      where: { student_id: studentId },
    });

    // Allocate Room
    const allocation = await prisma.allocation.create({
      data: {
        student_id: studentId,
        room_id: roomId,
      },
      include: {
        student: true,
        room: true,
      },
    });

    // Update Room Details to Occupied
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { status: "Occupied" },
    });

    revalidatePath("/");
    return {
      success: true,
      allocation,
      room: updatedRoom,
      message: `Room ${updatedRoom.room_number} successfully allocated to ${allocation.student.name}!`,
    };
  } catch (error: any) {
    console.error("allocateRoom error:", error);
    return { success: false, error: error.message || "Room allocation failed." };
  }
}

/**
 * Warden Method: approveLeave()
 * Approve or Reject leave application -> Update status
 */
export async function approveLeave(leaveId: string, status: "Approved" | "Rejected") {
  try {
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: { status },
      include: { student: true },
    });

    revalidatePath("/");
    return {
      success: true,
      leave: updatedLeave,
      message: `Leave application for ${updatedLeave.student.name} marked as ${status}.`,
    };
  } catch (error: any) {
    console.error("approveLeave error:", error);
    return { success: false, error: error.message || "Failed to update leave status." };
  }
}

// ==========================================
// ADMIN METHODS (Based on Class Diagram)
// ==========================================

/**
 * Admin Method: manageStudentDetails() - Add new student
 */
export async function addStudent(formData: {
  name: string;
  email: string;
  phone: string;
  department?: string;
  initialFee?: number;
}) {
  try {
    if (!formData.name || !formData.email || !formData.phone) {
      return { success: false, error: "Name, email, and phone are required." };
    }

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: formData.email.trim().toLowerCase() },
    });

    if (existing) {
      return { success: false, error: "A user with this email address already exists." };
    }

    const student = await prisma.user.create({
      data: {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department?.trim() || "General Engineering",
        role: "STUDENT",
      },
    });

    // Generate initial hostel fee entry
    const feeAmount = formData.initialFee && formData.initialFee > 0 ? formData.initialFee : 40000;
    await prisma.fee.create({
      data: {
        student_id: student.id,
        amount: feeAmount,
        status: "Pending",
      },
    });

    revalidatePath("/");
    return { success: true, student, message: `Student ${student.name} registered successfully with ID ${student.id}!` };
  } catch (error: any) {
    console.error("addStudent error:", error);
    return { success: false, error: error.message || "Failed to register student" };
  }
}

/**
 * Admin Method: manageStudentDetails() - Remove student (e.g. passed-outs)
 */
export async function removeStudent(studentId: string) {
  try {
    // Find any allocated room to free it
    const allocation = await prisma.allocation.findFirst({
      where: { student_id: studentId },
    });

    if (allocation) {
      await prisma.room.update({
        where: { id: allocation.room_id },
        data: { status: "Available" },
      });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: studentId },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Student record for ${deletedUser.name} removed successfully (Passed-out/De-registered).`,
    };
  } catch (error: any) {
    console.error("removeStudent error:", error);
    return { success: false, error: error.message || "Failed to remove student." };
  }
}

/**
 * Admin Method: manageRooms() - Add a new room
 */
export async function addRoom(formData: {
  room_number: string;
  room_type: "AC" | "Non-AC";
  status?: "Available" | "Occupied" | "Maintenance";
}) {
  try {
    if (!formData.room_number) {
      return { success: false, error: "Room number is required." };
    }

    const existing = await prisma.room.findUnique({
      where: { room_number: formData.room_number.trim().toUpperCase() },
    });

    if (existing) {
      return { success: false, error: `Room ${formData.room_number} already exists.` };
    }

    const room = await prisma.room.create({
      data: {
        room_number: formData.room_number.trim().toUpperCase(),
        room_type: formData.room_type,
        status: formData.status || "Available",
      },
    });

    revalidatePath("/");
    return { success: true, room, message: `Room ${room.room_number} added successfully!` };
  } catch (error: any) {
    console.error("addRoom error:", error);
    return { success: false, error: error.message || "Failed to create room." };
  }
}

/**
 * Admin Method: deallocateRoom()
 */
export async function deallocateRoom(allocationId: string) {
  try {
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { room: true },
    });

    if (!allocation) {
      return { success: false, error: "Allocation record not found." };
    }

    await prisma.allocation.delete({
      where: { id: allocationId },
    });

    await prisma.room.update({
      where: { id: allocation.room_id },
      data: { status: "Available" },
    });

    revalidatePath("/");
    return { success: true, message: `Room ${allocation.room.room_number} has been de-allocated and is now Available.` };
  } catch (error: any) {
    console.error("deallocateRoom error:", error);
    return { success: false, error: error.message || "Failed to deallocate room." };
  }
}

/**
 * Admin Method: resolveComplaints()
 */
export async function resolveComplaints(complaintId: string, status: "Pending" | "In Progress" | "Resolved") {
  try {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
      include: { student: true },
    });

    revalidatePath("/");
    return {
      success: true,
      complaint,
      message: `Complaint ticket #${complaint.id.slice(-5)} status updated to ${status}.`,
    };
  } catch (error: any) {
    console.error("resolveComplaints error:", error);
    return { success: false, error: error.message || "Failed to update complaint." };
  }
}

/**
 * Admin Method: viewReports()
 */
export async function viewReports(): Promise<{ success: boolean; data?: SystemReports; error?: string }> {
  try {
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });

    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({ where: { status: "Occupied" } });
    const availableRooms = await prisma.room.count({ where: { status: "Available" } });
    const maintenanceRooms = await prisma.room.count({ where: { status: "Maintenance" } });

    const acRoomsCount = await prisma.room.count({ where: { room_type: "AC" } });
    const nonAcRoomsCount = await prisma.room.count({ where: { room_type: "Non-AC" } });

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const feesPaid = await prisma.fee.aggregate({
      _sum: { amount: true },
      where: { status: "Paid" },
    });

    const feesPending = await prisma.fee.aggregate({
      _sum: { amount: true },
      where: { status: "Pending" },
    });

    const pendingLeavesCount = await prisma.leave.count({ where: { status: "Pending" } });
    const activeComplaintsCount = await prisma.complaint.count({
      where: { status: { in: ["Pending", "In Progress"] } },
    });

    const reports: SystemReports = {
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
      acRoomsCount,
      nonAcRoomsCount,
      occupancyRate,
      totalFeesPaid: feesPaid._sum.amount || 0,
      totalFeesPending: feesPending._sum.amount || 0,
      pendingLeavesCount,
      activeComplaintsCount,
    };

    return { success: true, data: reports };
  } catch (error: any) {
    console.error("viewReports error:", error);
    return { success: false, error: error.message || "Failed to compute system reports." };
  }
}

/**
 * Helper to fetch complete dashboard state for real-time reactivity
 */
export async function getDashboardData() {
  try {
    const [users, rooms, allocations, leaves, complaints, fees, reports] = await Promise.all([
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.room.findMany({
        orderBy: { room_number: "asc" },
        include: {
          allocations: {
            include: { student: true },
          },
        },
      }),
      prisma.allocation.findMany({
        orderBy: { allocation_date: "desc" },
        include: { student: true, room: true },
      }),
      prisma.leave.findMany({
        orderBy: { createdAt: "desc" },
        include: { student: true },
      }),
      prisma.complaint.findMany({
        orderBy: { createdAt: "desc" },
        include: { student: true },
      }),
      prisma.fee.findMany({
        orderBy: { createdAt: "desc" },
        include: { student: true },
      }),
      viewReports(),
    ]);

    return {
      success: true,
      users,
      rooms,
      allocations,
      leaves,
      complaints,
      fees,
      reports: reports.data,
    };
  } catch (error: any) {
    console.error("getDashboardData error:", error);
    return {
      success: false,
      error: error.message || "Failed to load dashboard data",
      users: [],
      rooms: [],
      allocations: [],
      leaves: [],
      complaints: [],
      fees: [],
      reports: null,
    };
  }
}
