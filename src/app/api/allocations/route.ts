import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        student: true,
        room: true,
      },
      orderBy: { allocation_date: "desc" },
    });
    return NextResponse.json({ success: true, data: allocations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, room_id } = body;

    if (!student_id || !room_id) {
      return NextResponse.json(
        { success: false, error: "student_id and room_id are required" },
        { status: 400 }
      );
    }

    // Check Room Availability
    const room = await prisma.room.findUnique({ where: { id: room_id } });
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "Available") {
      return NextResponse.json(
        { success: false, error: `No Room Available: Room ${room.room_number} is ${room.status}` },
        { status: 400 }
      );
    }

    // Remove prior allocation for student
    await prisma.allocation.deleteMany({ where: { student_id } });

    // Create allocation
    const allocation = await prisma.allocation.create({
      data: { student_id, room_id },
      include: { student: true, room: true },
    });

    // Update room status
    await prisma.room.update({
      where: { id: room_id },
      data: { status: "Occupied" },
    });

    return NextResponse.json({ success: true, data: allocation }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const allocationId = searchParams.get("id");

    if (!allocationId) {
      return NextResponse.json({ success: false, error: "id parameter required" }, { status: 400 });
    }

    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation) {
      return NextResponse.json({ success: false, error: "Allocation not found" }, { status: 404 });
    }

    await prisma.allocation.delete({ where: { id: allocationId } });
    await prisma.room.update({
      where: { id: allocation.room_id },
      data: { status: "Available" },
    });

    return NextResponse.json({ success: true, message: "Room deallocated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
