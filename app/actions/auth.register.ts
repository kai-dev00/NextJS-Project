"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterInput = {
  token: string;
  password: string;
  phoneNumber: string;
};

export async function registerUserAction(data: RegisterInput) {
  const { token, password, phoneNumber } = data;

  const invite = await prisma.userInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new Error("Invalid token");
  }

  if (invite.expiresAt < new Date()) {
    throw new Error("Token expired");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });

  if (existingUser) {
    throw new Error("User already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        fullName: `${invite.firstName} ${invite.lastName}`,
        roleId: invite.roleId,
        password: hashedPassword,
        phoneNumber: phoneNumber,
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.userInvite.delete({
      where: { token },
    }),
  ]);
}
