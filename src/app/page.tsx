import { getDashboardData } from "@/app/actions/hostelActions";
import { AuthProvider } from "@/context/AuthContext";
import DashboardClient from "@/components/DashboardClient";

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <AuthProvider initialUsers={data.users as any}>
      <DashboardClient
        users={data.users as any}
        rooms={data.rooms as any}
        allocations={data.allocations as any}
        leaves={data.leaves as any}
        complaints={data.complaints as any}
        fees={data.fees as any}
        reports={data.reports as any}
      />
    </AuthProvider>
  );
}
