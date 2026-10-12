import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    const complaints = await prisma.complaint.findMany({
      where: studentId ? { student_id: studentId } : undefined,
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { student_id, issue_description } = body;

    if (!student_id || !issue_description) {
      return NextResponse.json(
        { success: false, error: "student_id and issue_description are required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        student_id,
        issue_description,
        status: "Pending",
      },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: complaint }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { complaint_id, status } = body;

    if (!complaint_id || !["Pending", "In Progress", "Resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid complaint_id and status are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.complaint.update({
      where: { id: complaint_id },
      data: { status },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
