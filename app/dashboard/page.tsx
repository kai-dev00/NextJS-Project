export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Welcome to your dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-bold">124</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Sessions</p>
          <p className="text-2xl font-bold">18</p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">$3,420</p>
        </div>
      </div>
    </div>
  );
}
