# 🏨 HostelSphere - Hostel Management System (Agile MVP)

> **Production-Ready Agile MVP** built with **Next.js (App Router)**, **React 19**, **Tailwind CSS**, and **Prisma ORM with SQLite**.

---

## 📌 Executive Summary & Agile Framework
This project is an Agile MVP for a comprehensive **Hostel Management System**, modeled strictly around formal software engineering design artifacts (Class Diagrams, ER Diagrams, Use Case Diagrams, and Activity Diagrams).

### 🎯 Core Persona Dashboards
1. **Admin Control Center**:
   - **Student Record Management**: Enroll new students and purge passed-out residents (automatically frees up assigned rooms).
   - **Hostel Fee Ledger**: Audit paid vs. pending hostel fees with one-click payment reconciliation.
   - **Global Room Allocation**: Administrative room assignment overrides.
   - **Maintenance Hub**: Lifecycle tracking of student complaint tickets (Pending &rarr; In Progress &rarr; Resolved).
   - **Executive Reports**: Live occupancy metrics, revenue collection, room breakdown (AC vs Non-AC).

2. **Chief Warden Console**:
   - **Activity Diagram Room Allocation Workflow**:
     ```
     Check Room Availability
          │
          ├── [Available: Yes] ──> Allocate Room ──> Update Room Details (Occupied) ──> Display Allocation
          │
          └── [Available: No]  ──> Display "No Room Available"
     ```
   - **Leave Management Flow**: Review out-pass/leave applications with instant Approve / Reject decisioning.
   - **Hostel Oversight**: Live status toggling (Available, Occupied, Maintenance).

3. **Student Resident Portal**:
   - **Room Details & Preference**: View allocated room specifications (`viewRoomDetails()`) or submit AC / Non-AC preferences.
   - **Leave Applications**: Apply for out-pass with start/end dates and purpose; dynamic status tracking.
   - **Maintenance Tickets**: Raise electrical, plumbing, or facility complaints.
   - **Online Fee Payment**: Simulated online checkout modal with immediate database ledger receipt update.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend / API**: Next.js Server Actions & Next.js REST API Routes (`/api/rooms`, `/api/leaves`, `/api/complaints`, `/api/fees`, `/api/allocations`)
- **Database**: SQLite via Prisma ORM (zero-config local database)
- **Icons & Styling**: Lucide React, glassmorphism design system

---

## 🗄️ Database Schema (ER / Class Diagram)

| Model | Fields | Relations & Description |
|---|---|---|
| **User** | `id`, `name`, `email`, `phone`, `role`, `department`, `createdAt` | Roles: `STUDENT`, `WARDEN`, `ADMIN` |
| **Room** | `id`, `room_number`, `room_type`, `status`, `createdAt` | Types: `AC`, `Non-AC` \| Status: `Available`, `Occupied`, `Maintenance` |
| **Leave** | `id`, `student_id`, `from_date`, `to_date`, `reason`, `status` | Status: `Pending`, `Approved`, `Rejected` |
| **Allocation** | `id`, `student_id`, `room_id`, `allocation_date` | Foreign keys to `User` and `Room` |
| **Complaint** | `id`, `student_id`, `issue_description`, `status` | Status: `Pending`, `In Progress`, `Resolved` |
| **Fee** | `id`, `student_id`, `amount`, `status` | Status: `Paid`, `Pending` |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure **Node.js (v18+)** and **npm** are installed on your machine.

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database & Seed
```bash
npx prisma db push
npm run db:seed
```
This populates the database with:
- **1 Admin**: `admin@hostel.edu`
- **1 Warden**: `warden@hostel.edu`
- **3 Students**: `aarav@student.edu`, `diya@student.edu`, `rohan@student.edu`
- **5 Rooms**: `A-101` (AC), `A-102` (AC), `B-201` (Non-AC), `B-202` (Non-AC), `C-301` (AC Maintenance)

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing Personas

You can instantly switch personas using the top navigation bar or log in with credentials:

| Persona | Name | Role | Email |
|---|---|---|---|
| **Admin** | Admin Sharma | `ADMIN` | `admin@hostel.edu` |
| **Warden** | Warden Rajesh Kumar | `WARDEN` | `warden@hostel.edu` |
| **Student 1** | Aarav Patel | `STUDENT` | `aarav@student.edu` |
| **Student 2** | Diya Menon | `STUDENT` | `diya@student.edu` |
| **Student 3** | Rohan Verma | `STUDENT` | `rohan@student.edu` |

---

## 📦 API Reference
- `GET /api/rooms` &bull; `POST /api/rooms`
- `GET /api/leaves` &bull; `POST /api/leaves` &bull; `PATCH /api/leaves`
- `GET /api/complaints` &bull; `POST /api/complaints` &bull; `PATCH /api/complaints`
- `GET /api/fees` &bull; `POST /api/fees`
- `GET /api/allocations` &bull; `POST /api/allocations` &bull; `DELETE /api/allocations`
