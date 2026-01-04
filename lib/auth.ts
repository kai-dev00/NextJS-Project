import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export type AuthTokenPayload = {
  userId: string;
  role: string;
};

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<JWTPayload & AuthTokenPayload> {
  const { payload } = await jwtVerify<AuthTokenPayload>(token, secret);
  return payload;
}
