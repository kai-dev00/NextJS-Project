// app/dashboard/layout.tsx (SERVER component)
import LogoutButton from "../../components/LogoutButton";
import Sidebar from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="h-14 border-b bg-white px-6 flex items-center justify-between">
          <h1 className="text-sm font-medium">Dashboard</h1>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
