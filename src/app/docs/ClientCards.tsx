"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { API_BASE_URL } from "@/constants";

export const ApiSection = () => {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Endpoint
        </label>
        <div className="overflow-x-auto">
          <div className="whitespace-nowrap font-mono text-sm sm:text-base">
            {API_BASE_URL}
          </div>
        </div>
      </div>
    </div>
  );
};

export const WatchForSuccess = () => {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (params.get("success")) {
      router.push("/docs");
      setTimeout(() => toast.success("Successfully purchased more tokens"));
    }
    if (params.get("canceled")) {
      router.push("/docs");
      setTimeout(() => toast.info("Canceled transaction"));
    }
  }, [params, router]);
  return null;
};
