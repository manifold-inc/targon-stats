import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TrackedMiner } from "@/server/db/schema";
import { db } from "@/server/db/targon";
import { z } from "zod";

export const trackedMinerRouter = createTRPCRouter({
  trackMiner: publicProcedure
    .input(z.object({ hotkey: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.id) {
        throw new Error("You must be logged in to track a miner");
      }

      await db.insert(TrackedMiner).values({
        userId: ctx.user.id,
        hotkey: input.hotkey,
      });

      return { success: true };
    }),
});
