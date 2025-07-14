"use client";

import { CircleCheck, CircleMinus, CircleX } from "lucide-react";

import { type Miner } from "@/server/api/routers/miners";
import { reactClient } from "@/trpc/react";

export default function HomePage() {
  const {
    data: miners,
    isLoading,
    error,
  } = reactClient.miners.getPaidMiners.useQuery();

  const paymentStatus = (miner: Miner) => {
    switch (true) {
      case miner.average_payout >= miner.average_price:
        return <CircleCheck className="h-4 w-4 text-green-500" />;
      case miner.average_payout > 0:
        return <CircleMinus className="h-4 w-4 text-yellow-500" />;
      default:
        return <CircleX className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>

        <div className="mt-8">
          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">
              Loading miners...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              Error loading miners: {error.message}
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      UUID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Average Bid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      GPUs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {miners?.map((miner) => (
                    <tr
                      key={miner.uid}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                        {miner.uid}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {`$${(miner.average_price / 100).toFixed(2)}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {miner.gpus}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                          {paymentStatus(miner)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
