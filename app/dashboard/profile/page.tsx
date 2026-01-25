import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserWithDetails } from "@/lib/auth";
import ProfileClient from "./components/ProfileClient";

export default async function ProfilePage() {
  const session = await getCurrentUser();
  const user = await getCurrentUserWithDetails();

  if (!session || !user) {
    redirect("/login");
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.name,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt.toISOString(),
      }}
      session={{
        role: session.role,
      }}
    />
  );
}
