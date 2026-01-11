//Second step in implementing JWT based authentication

import { cookies } from "next/headers";

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  //   const cookieStore = cookies();
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}
