"use server";

import { setAuthCookies } from "@/lib/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { LoginFormValues } from "../(auth)/login/page";

export async function loginAction(data: LoginFormValues) {
  const { email, password } = data;

  if (typeof email !== "string" || typeof password !== "string")
    throw new Error("Invalid form data");

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const permissions = user.role.permissions.map(
    (p) => `${p.module}:${p.action}${p.submodule ? `:${p.submodule}` : ""}`,
  );

  const accessToken = await signAccessToken({
    userId: user.id,
    role: user.role.name,
    permissions,
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

  await setAuthCookies(accessToken, refreshToken);
  return { success: true };
}
