import { cache } from "react";
import { cookies } from "next/headers";
import { Google } from "arctic";
import { Lucia, Scrypt, type User as LuciaUser, type Session } from "lucia";

import { env } from "@/env.mjs";
import { adapter, type db as DB } from "@/schema/db";
import { ApiKey, genId, User } from "@/schema/schema";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

export const uncachedValidateRequest = async (): Promise<
  { user: LuciaUser; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (!!result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch {
    // Probably trying to set during page rendering, can safely swallow
    console.error("Failed to set session cookie");
  }
  return result;
};
export const validateRequest = cache(uncachedValidateRequest);

export const createAccount = async ({
  db,
  email,
  googleId,
  password,
}: {
  db: typeof DB;
  email: string;
  googleId?: string;
  password?: string;
}) => {
  const userId = genId.user();

  let hashedPassword = null;
  if (password) {
    hashedPassword = await new Scrypt().hash(password);
  }
  await db.insert(User).values({
    id: userId,
    email,
    googleId,
    password: hashedPassword,
    emailConfirmed: !hashedPassword,
  });
  const apiKey = genId.apikey();
  await db.insert(ApiKey).values({
    userId: userId,
    key: apiKey,
  });
  return userId;
};
