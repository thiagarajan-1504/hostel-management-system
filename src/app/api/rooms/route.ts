import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        allocations: {
          include: { student: true },
        },
      },
      orderBy: { room_number: "asc" },
    });
    return NextResponse.json({ success: true, data: rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room_number, room_type, status } = body;

    if (!room_number || !room_type) {
      return NextResponse.json(
        { success: false, error: "room_number and room_type are required" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        room_number: room_number.toUpperCase(),
        room_type,
        status: status || "Available",
      },
    });

    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
