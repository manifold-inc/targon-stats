import { env } from "@/env.mjs";
import { google } from "@/server/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  const cookieStore = await cookies();

  cookieStore.set("google_redirect", redirect ?? "/", {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookieStore.set("google_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookieStore.set("google_code_verifier", codeVerifier, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return Response.redirect(await url);
}
