import { env } from "@/env.mjs";
import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

import { targonDb } from "./db/targon";
import { TargonLuciaAdapter } from "./db/targon-lucia-adapter";
import { TargonSession, TargonUser } from "./db/targon-schema";

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
  }
}

const adapter = new TargonLuciaAdapter(targonDb, TargonSession, TargonUser);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
      ...(env.NODE_ENV === "production" && {
        domain: ".targon.com",
      }),
    },
  },
});

export const uncachedValidateRequest = async (): Promise<
  | { user: { id: number }; session: { id: string } }
  | { user: null; session: null }
> => {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }
  const result = await lucia.validateSession(sessionId);
  if (!!result.session && result.session.fresh) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  if (!result.session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  return result;
};

export const validateRequest = cache(uncachedValidateRequest);
