"use server";

import { sendResetPasswordEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { ForgotPasswordFormValues } from "../(auth)/forgotPassword/page";

export async function forgotPasswordAction(data: ForgotPasswordFormValues) {
  const { email } = data;

  // export async function forgotPasswordAction(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Security: don't reveal if user exists
  if (!user) {
    console.log("No user found for email:", email);
    return;
  }
  const token = randomBytes(32).toString("hex");

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 mins
    },
  });

  await sendResetPasswordEmail(user.email, token);
}
