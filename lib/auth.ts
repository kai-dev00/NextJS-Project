import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import prisma from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    return {
      userId: payload.userId,
      roleId: payload.roleId,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUserWithDetails() {
  const session = await getCurrentUser();
  if (!session) return null;

  return {
    ...(await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
              select: {
                module: true,
                action: true,
                submodule: true,
              },
            },
          },
        },
      },
    })),
  };
}
