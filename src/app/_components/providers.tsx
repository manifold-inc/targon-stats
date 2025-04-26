"use client";

import { TRPCReactProvider } from "@/trpc/react";

export function WithGlobalProvider(props: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <TRPCReactProvider>{props.children}</TRPCReactProvider>
    </div>
  );
}
