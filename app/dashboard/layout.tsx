// app/dashboard/layout.tsx (SERVER component)
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
          <button className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-gray-900">
            Logout
          </button>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
