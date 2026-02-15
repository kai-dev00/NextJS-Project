import { getCurrentUserWithDetails } from "@/lib/auth";
import Sidebar from "./sidebar";
import { AuthProvider } from "../(auth)/AuthProvider";

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
      <div className="flex h-screen overflow-hidden">
        <div className="w-64 shrink-0">
          <Sidebar user={sidebarUser} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="h-14 border-b bg-white px-6 flex items-center justify-between shrink-0">
            <h1 className="text-sm font-medium">Dashboard</h1>
          </header>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
