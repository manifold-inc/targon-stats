import { accountRouter } from "@/server/api/routers/account";
import { chainRouter } from "@/server/api/routers/chain";
import { trackedMinerRouter } from "@/server/api/routers/trackedMiner";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  chain: chainRouter,
  account: accountRouter,
  trackedMiner: trackedMinerRouter,
});

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// export type definition of API
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
