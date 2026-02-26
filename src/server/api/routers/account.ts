import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { lucia } from "@/server/auth";
import { User } from "@/server/db/schema";
import { db } from "@/server/db/targon";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { Scrypt } from "lucia";
import { cookies } from "next/headers";
import { z } from "zod";

export const accountRouter = createTRPCRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) return null;
    const [user] = await db
      .select({
        id: User.id,
        name: User.name,
        email: User.email,
      })
      .from(User)
      .where(eq(User.id, ctx.user.id))
      .limit(1);
    return user ?? null;
  }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [foundUser] = await db
        .select({
          id: User.id,
          password: User.password,
          emailVerified: User.emailVerified,
        })
        .from(User)
        .where(eq(User.email, input.email));
      if (!foundUser)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid Credentials",
        });
      if (!foundUser.password)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid Credentials",
        });
      const validPassword = await new Scrypt().verify(
        foundUser.password,
        input.password
      );
      if (!validPassword)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid Credentials",
        });
      if (!foundUser.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Email not verified",
        });
      }
      const session = await lucia.createSession(foundUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }),
});
