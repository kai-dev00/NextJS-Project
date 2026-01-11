"use server";

import { clearAuthCookies } from "@/lib/cookies";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    await prisma.session.updateMany({
      where: { revoked: false },
      data: { revoked: true },
    });
  }

  await clearAuthCookies();
  redirect("/login");
}
