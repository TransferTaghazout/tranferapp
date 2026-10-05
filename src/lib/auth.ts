import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "trm_session";
const MAX_AGE = 60 * 60 * 24 * 14;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser =
  | { role: "admin"; email: string }
  | { role: "driver"; email: string; driverId: string; name: string };

export function isAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.AUTH_SECRET,
  );
}

export function verifyCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  return (
    email.trim().toLowerCase() === expectedEmail &&
    password === expectedPassword
  );
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role === "driver" && typeof payload.driverId === "string") {
      return {
        role: "driver",
        email: String(payload.email || ""),
        driverId: payload.driverId,
        name: String(payload.name || ""),
      };
    }
    const email = typeof payload.email === "string" ? payload.email : null;
    return email ? { role: "admin", email } : null;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireDriverSession() {
  const session = await getSession();
  if (!session || session.role !== "driver") {
    throw new Error("Unauthorized");
  }
  return session;
}
