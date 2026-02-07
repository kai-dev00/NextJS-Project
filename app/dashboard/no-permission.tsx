// components/NoPermission.tsx
"use client";

export default function NoPermission({
  message = "You do not have permission to view this page.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
