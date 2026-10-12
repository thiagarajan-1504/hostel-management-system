export type UserRole = "STUDENT" | "WARDEN" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Room {
  id: string;
  room_number: string;
  room_type: "AC" | "Non-AC" | string;
  status: "Available" | "Occupied" | "Maintenance" | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  allocations?: Allocation[];
}

export interface Leave {
  id: string;
  student_id: string;
  from_date: Date | string;
  to_date: Date | string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  student?: User;
}

export interface Allocation {
  id: string;
  student_id: string;
  room_id: string;
  allocation_date: Date | string;
  student?: User;
  room?: Room;
}

export interface Complaint {
  id: string;
  student_id: string;
  issue_description: string;
  status: "Pending" | "In Progress" | "Resolved" | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  student?: User;
}

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  status: "Paid" | "Pending" | string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  student?: User;
}

export interface SystemReports {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  acRoomsCount: number;
  nonAcRoomsCount: number;
  occupancyRate: number;
  totalFeesPaid: number;
  totalFeesPending: number;
  pendingLeavesCount: number;
  activeComplaintsCount: number;
}
