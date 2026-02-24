import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { targonDb } from "@/server/db/targon";
import { TargonUser } from "@/server/db/targon-schema";
import { eq } from "drizzle-orm";

export const accountRouter = createTRPCRouter({
  getUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) return null;
    const [user] = await targonDb
      .select({
        id: TargonUser.id,
        name: TargonUser.name,
        email: TargonUser.email,
      })
      .from(TargonUser)
      .where(eq(TargonUser.id, ctx.user.id))
      .limit(1);
    return user ?? null;
  }),
});
