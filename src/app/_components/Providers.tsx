"use client";

import { reactClient, TRPCReactProvider } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from "react";

type AuthStates = "LOADING" | "AUTHED" | "UNAUTHED";
const AuthContext = createContext<{
  refetch: () => Promise<unknown>;
  status: AuthStates;
  user: RouterOutputs["account"]["getUser"];
}>({
  refetch: () => Promise.resolve(null),
  status: "LOADING",
  user: null,
});

const AuthProvider = ({ children }: PropsWithChildren) => {
  const user = reactClient.account.getUser.useQuery(undefined, {
    staleTime: 30000,
    cacheTime: 60000,
  });

  let status: AuthStates = "UNAUTHED";
  if (user.data) status = "AUTHED";
  if (user.isLoading) status = "LOADING";

  const refetch = useCallback(async () => {
    await user.refetch();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        refetch,
        user: user.data ?? null,
        status,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return { ...ctx };
};

export function WithGlobalProvider(props: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <TRPCReactProvider>
        <AuthProvider>{props.children}</AuthProvider>
      </TRPCReactProvider>
    </div>
  );
}
