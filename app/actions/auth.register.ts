"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName?: string;
  roleId: number;
};

export async function registerAction(
  data: RegisterInput
): Promise<RegisterState> {
  try {
    const { email, password, fullName, roleId } = data;

    if (!email || !password || !roleId) {
      return { error: "Missing required fields" };
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { error: "Invalid role" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        roleId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("REGISTER_ACTION_ERROR:", error);
    return { error: "Something went wrong" };
  }
}
