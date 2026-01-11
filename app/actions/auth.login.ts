"use server";

import { setAuthCookies } from "@/lib/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type LoginActionResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(
  formData: FormData
): Promise<LoginActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { success: false, error: "Invalid form data" };
  }
  console.log("LOGIN ACTION START");
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
  console.log("USER FOUND:", !!user);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  console.log("is it valid:", isValid);

  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  const accessToken = await signAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  const refreshToken = await signRefreshToken({
    userId: user.id,
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 3️⃣ Store cookies
  await setAuthCookies(accessToken, refreshToken);
  redirect("/dashboard");
  return { success: true };
}
