import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.fee.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin Sharma",
      email: "admin@hostel.edu",
      phone: "+91 9876543210",
      role: Role.ADMIN,
      department: "Hostel Administration",
    },
  });

  // 2. Create 1 Warden
  const warden = await prisma.user.create({
    data: {
      name: "Warden Rajesh Kumar",
      email: "warden@hostel.edu",
      phone: "+91 9876543211",
      role: Role.WARDEN,
      department: "Chief Warden Office",
    },
  });

  // 3. Create 3 Students
  const student1 = await prisma.user.create({
    data: {
      name: "Aarav Patel",
      email: "aarav@student.edu",
      phone: "+91 9876543221",
      role: Role.STUDENT,
      department: "Computer Science & Eng",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Diya Menon",
      email: "diya@student.edu",
      phone: "+91 9876543222",
      role: Role.STUDENT,
      department: "Mechanical Engineering",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Rohan Verma",
      email: "rohan@student.edu",
      phone: "+91 9876543223",
      role: Role.STUDENT,
      department: "Electrical Engineering",
    },
  });

  // 4. Create 5 Rooms (mix of AC/Non-AC, Available/Occupied/Maintenance)
  const room1 = await prisma.room.create({
    data: {
      room_number: "A-101",
      room_type: "AC",
      status: "Occupied",
    },
  });

  const room2 = await prisma.room.create({
    data: {
      room_number: "A-102",
      room_type: "AC",
      status: "Available",
    },
  });

  const room3 = await prisma.room.create({
    data: {
      room_number: "B-201",
      room_type: "Non-AC",
      status: "Occupied",
    },
  });

  const room4 = await prisma.room.create({
    data: {
      room_number: "B-202",
      room_type: "Non-AC",
      status: "Available",
    },
  });

  const room5 = await prisma.room.create({
    data: {
      room_number: "C-301",
      room_type: "AC",
      status: "Maintenance",
    },
  });

  // 5. Initial Allocations
  await prisma.allocation.create({
    data: {
      student_id: student1.id,
      room_id: room1.id,
      allocation_date: new Date(),
    },
  });

  await prisma.allocation.create({
    data: {
      student_id: student2.id,
      room_id: room3.id,
      allocation_date: new Date(),
    },
  });

  // 6. Initial Leaves
  await prisma.leave.create({
    data: {
      student_id: student1.id,
      from_date: new Date(Date.now() + 86400000 * 2),
      to_date: new Date(Date.now() + 86400000 * 5),
      reason: "Family function in hometown",
      status: "Approved",
    },
  });

  await prisma.leave.create({
    data: {
      student_id: student3.id,
      from_date: new Date(Date.now() + 86400000 * 1),
      to_date: new Date(Date.now() + 86400000 * 3),
      reason: "Medical checkup at home hospital",
      status: "Pending",
    },
  });

  // 7. Initial Complaints
  await prisma.complaint.create({
    data: {
      student_id: student2.id,
      issue_description: "Water heater in 2nd floor bathroom not turning on.",
      status: "Pending",
    },
  });

  await prisma.complaint.create({
    data: {
      student_id: student1.id,
      issue_description: "Study table lamp socket has a loose connection.",
      status: "Resolved",
    },
  });

  // 8. Initial Fees
  await prisma.fee.create({
    data: {
      student_id: student1.id,
      amount: 45000,
      status: "Paid",
    },
  });

  await prisma.fee.create({
    data: {
      student_id: student2.id,
      amount: 35000,
      status: "Paid",
    },
  });

  await prisma.fee.create({
    data: {
      student_id: student3.id,
      amount: 35000,
      status: "Pending",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log({
    admin: admin.email,
    warden: warden.email,
    students: [student1.email, student2.email, student3.email],
    rooms: [room1.room_number, room2.room_number, room3.room_number, room4.room_number, room5.room_number],
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
