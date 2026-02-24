"use client";

import PageHeader from "@/app/_components/PageHeader";
import { useAuth } from "@/app/_components/Providers";
import { RiLayoutGridFill } from "@remixicon/react";

export default function DashboardPage() {
  const { user, status } = useAuth();

  if (status === "LOADING") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-mf-milk-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard"
        icon={<RiLayoutGridFill className="h-7 w-7" />}
      />
      <div className="mt-5 pb-20">
        <div className="rounded-lg border border-mf-border-600 bg-mf-metal-500/30 p-6">
          <h2 className="text-lg font-medium text-mf-milk-500">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h2>
          {user?.email && (
            <p className="mt-2 text-sm text-mf-milk-600">{user.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}
