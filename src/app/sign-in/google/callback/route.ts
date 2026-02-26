import { google, lucia } from "@/server/auth";
import { User } from "@/server/db/schema";
import { db } from "@/server/db/targon";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

async function handle(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState =
    (await cookies()).get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    (await cookies()).get("google_code_verifier")?.value ?? null;
  const storedRedirect =
    (await cookies()).get("google_redirect")?.value ?? null;
  if (!code || !storedCodeVerifier || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: { accessToken: string };
  try {
    tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
  } catch {
    return new Response(null, { status: 500 });
  }

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: "Bearer " + tokens.accessToken,
      },
    }
  );
  if (!response.ok) {
    return new Response(null, { status: 500 });
  }

  const googleUser = (await response.json()) as GoogleUser;
  let [existing] = await db
    .select({ id: User.id, googleId: User.googleId })
    .from(User)
    .where(eq(User.googleId, googleUser.sub));

  if (!existing) {
    [existing] = await db
      .select({ id: User.id, googleId: User.googleId })
      .from(User)
      .where(eq(User.email, googleUser.email));
  }

  if (!existing) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/sign-in?error=account_required",
      },
    });
  }

  if (!existing.googleId) {
    await db
      .update(User)
      .set({ googleId: googleUser.sub, emailVerified: true })
      .where(eq(User.id, existing.id));
  }

  const session = await lucia.createSession(existing.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return new Response(null, {
    status: 302,
    headers: {
      Location: storedRedirect ?? "/dashboard",
    },
  });
}

interface GoogleUser {
  sub: string; // unique google identifier
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
  hd: string;
}
export const GET = handle;
