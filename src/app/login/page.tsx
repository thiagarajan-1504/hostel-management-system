import { getAllUsers } from "@/app/actions/hostelActions";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const users = await getAllUsers();

  return <LoginClient initialUsers={users as any} />;
}
