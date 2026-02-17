import { getCurrentUserWithDetails } from "@/lib/auth";
import { AuthProvider } from "../(auth)/AuthProvider";
import DashboardLayoutWrapper from "./layout-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithDetails();
  const sidebarUser = user
    ? {
        fullName: user.fullName ?? null,
        email: user.email ?? "",
        role: user.role?.name ?? "USER",
      }
    : null;

  return (
    <AuthProvider
      value={{
        role: user?.role?.name ?? "GUEST",
      }}
    >
      <DashboardLayoutWrapper sidebarUser={sidebarUser}>
        {children}
      </DashboardLayoutWrapper>
    </AuthProvider>
  );
}
