import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Role = "OWNER" | "STAFF";
export type SessionPayload = { userId: number; role: Role };

const SESSION_MAX_AGE_DAYS = 7;

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(getKey());

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    const { userId, role } = payload;
    if (typeof userId !== "number" || (role !== "OWNER" && role !== "STAFF")) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete("session");
}
