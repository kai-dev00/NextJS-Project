"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type ResetPasswordInput = {
  token: string;
  password: string;
};

export async function resetPasswordAction(data: ResetPasswordInput) {
  const { token, password } = data;

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset) {
    throw new Error("Invalid token");
  }

  if (reset.usedAt) {
    throw new Error("Token already used");
  }

  if (reset.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
