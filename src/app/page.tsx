"use client";

import { useEffect } from "react";

import { getAuctionResults } from "@/app/query";

export default function HomePage() {
  useEffect(() => {
    const fetchAuctionResults = async () => {
      const auctionResults = await getAuctionResults();
      console.log("[Page]: Auction results: ", auctionResults);
    };
    void fetchAuctionResults();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>
      </div>
    </div>
  );
}
