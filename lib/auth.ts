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

export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ async in Next 15+
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUserWithDetails() {
  const session = await getCurrentUser();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phoneNumber: true,
      createdAt: true,
    },
  });
}
