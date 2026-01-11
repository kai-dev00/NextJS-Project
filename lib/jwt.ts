//Frist step in implementing JWT based authentication

import jwt from "jsonwebtoken"; // not good in NEXTJS
import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET!
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET!
);

/**
 * Short-lived token used for authorization
 */
export async function signAccessToken(payload: {
  userId: string;
  role: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

/**
 * Long-lived token used only to refresh access token
 */
export async function signRefreshToken(payload: { userId: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

/**
 * Verify access token
 */
export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as {
    userId: string;
    role: string;
    iat: number;
    exp: number;
  };
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, REFRESH_SECRET);
  return payload as {
    userId: string;
    iat: number;
    exp: number;
  };
}
