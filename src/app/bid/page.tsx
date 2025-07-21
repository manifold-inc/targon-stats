"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import BackgroundSVG from "@/app/_components/BackgroundSVG";
import BidTable from "@/app/_components/BidTable";
import BlockSelector from "@/app/_components/BlockSelector";
import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import TaoPrice from "@/app/_components/TaoPrice";
import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";

export default function BidPage() {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const handleNavigateToMiner = (uid: string) => {
    router.push(`/miner?search=${encodeURIComponent(uid)}`);
  };

  return (
    <div className="w-full">
      <BackgroundSVG />
      <div className="w-full border-y-2 border-mf-ash-300 bg-mf-night-500">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <img
                src="/targonStatsLogo.svg"
                alt="Targon-logo"
                width={30}
                height={30}
                className="h-7 w-7"
              />
              <h1 className="text-xl font-semibold text-mf-edge-500 flex items-center font-blinker">Targon Stats</h1>
            </div>
            <div className="flex items-center gap-2">
              <MaxBid maxBid={auction?.max_bid || 0} />
              <TaoPrice price={auction?.tao_price || 0} />
              <EmissionPool pool={auction?.emission_pool || 0} />
              <CurrentBlock block={auction?.block || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-2">
        <div className="mt-4 flex justify-between">
          <Navigation />
          <div className="flex items-center gap-4">
            {auction && (
              <BlockSelector
                block={selectedBlock ?? auction.block}
                latestBlock={auctionLatest?.block ?? 0}
                onBlockChange={setSelectedBlock}
                isLoading={isLoading}
              />
            )}
            <Search value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        <div className="mt-5 pb-20">
          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700 p-8">
            <h2 className="mb-7 text-lg font-semibold text-mf-edge-500 font-blinker tracking-wider">Targon Buyouts</h2>
            <BidTable
              nodes={getNodes(auction?.auction_results ?? {})}
              searchTerm={searchTerm}
              onNavigateToMiner={handleNavigateToMiner}
              isLoading={isLoading}
              error={error as Error | null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
