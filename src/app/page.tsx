"use client";

import MinerTable from "@/app/_components/MinerTable";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>

        <div className="mt-8">
          <MinerTable />
        </div>
      </div>
    </div>
  );
}
