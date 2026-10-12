import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    const fees = await prisma.fee.findMany({
      where: studentId ? { student_id: studentId } : undefined,
      include: { student: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: fees });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fee_id, status } = body;

    if (!fee_id) {
      return NextResponse.json({ success: false, error: "fee_id is required" }, { status: 400 });
    }

    const updated = await prisma.fee.update({
      where: { id: fee_id },
      data: { status: status || "Paid" },
      include: { student: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
