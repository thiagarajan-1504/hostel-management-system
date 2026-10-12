import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    const leaves = await prisma.leave.findMany({
      where: studentId ? { student_id: studentId } : undefined,
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, from_date, to_date, reason } = body;

    if (!student_id || !from_date || !to_date || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required leave fields" },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.create({
      data: {
        student_id,
        from_date: new Date(from_date),
        to_date: new Date(to_date),
        reason,
        status: "Pending",
      },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leave_id, status } = body;

    if (!leave_id || !["Approved", "Rejected", "Pending"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid leave_id or status" },
        { status: 400 }
      );
    }

    const updated = await prisma.leave.update({
      where: { id: leave_id },
      data: { status },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
