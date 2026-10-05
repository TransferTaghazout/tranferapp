import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "trm_session";
const MAX_AGE = 60 * 60 * 24 * 14;

const ADMIN_LOGIN = "ahmadabidar";
const ADMIN_PASSWORD = "Taghazout@1998";
const AUTH_SECRET = process.env.AUTH_SECRET || "atlas-coast-transfer-auth-secret";

function secretKey() {
  return new TextEncoder().encode(AUTH_SECRET);
}

export type SessionUser =
  | { role: "admin"; email: string }
  | { role: "driver"; email: string; driverId: string; name: string };

export function isAuthConfigured() {
  return true;
}

export function verifyCredentials(login: string, password: string) {
  return login.trim().toLowerCase() === ADMIN_LOGIN && password === ADMIN_PASSWORD;
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
    secure: process.env.AUTH_COOKIE_SECURE === "true",
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
