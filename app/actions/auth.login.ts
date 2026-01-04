"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { signToken } from "@/lib/auth";

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

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  const token = await signToken({
    userId: String(user.id),
    role: user.role.name,
  });

  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true };
}
