import { redirect } from "next/navigation";
import prisma from "./prisma";
import { getCurrentUser } from "./auth";

export async function requirePermission(permission: string) {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      role: {
        select: {
          permissions: {
            select: {
              action: true,
              module: true,
              submodule: true,
            },
          },
        },
      },
    },
  });

  const permissions =
    user?.role.permissions.map((p) =>
      [p.module, p.action, p.submodule].filter(Boolean).join(":"),
    ) ?? [];

  if (!permissions.includes(permission)) {
    redirect("/dashboard/no-permission");
  }

  return user;
}
