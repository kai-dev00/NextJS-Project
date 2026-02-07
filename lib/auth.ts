// import { SignJWT, jwtVerify, JWTPayload } from "jose";

// const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// export type AuthTokenPayload = {
//   userId: string;
//   role: string;
// };

// export async function signToken(payload: AuthTokenPayload): Promise<string> {
//   return new SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("1d")
//     .sign(secret);
// }

// export async function verifyToken(
//   token: string
// ): Promise<JWTPayload & AuthTokenPayload> {
//   const { payload } = await jwtVerify<AuthTokenPayload>(token, secret);
//   return payload;
// }
// lib/auth.ts
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import prisma from "./prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ async in Next 15+
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);

    return {
      userId: payload.userId,
      role: payload.role,
      permissions: payload.permissions,
    };
  } catch {
    return null;
  }
}

// export async function getCurrentUserWithDetails() {
//   const session = await getCurrentUser();
//   if (!session) return null;

//   return prisma.user.findUnique({
//     where: { id: session.userId },
//     select: {
//       id: true,
//       fullName: true,
//       email: true,
//       role: true,
//       phoneNumber: true,
//       createdAt: true,
//     },
//   });

// }

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
        role: true,
        phoneNumber: true,
        createdAt: true,
      },
    })),
    permissions: session.permissions,
  };
}

export async function requirePermission(permission: string) {
  const userId = (await cookies()).get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  return permissions;
}
