"use client";

import { useState } from "react";

import BidTable from "@/app/_components/BidTable";
import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import MinerTable from "@/app/_components/MinerTable";
import Search from "@/app/_components/Search";
import TaoPrice from "@/app/_components/TaoPrice";
import ToggleTable from "@/app/_components/ToggleTable";
import { type AuctionState } from "@/server/api/routers/chain";
import { reactClient } from "@/trpc/react";
import { getNodes, getNodesByMiner } from "@/utils/utils";

export default function HomePage() {
  const { data, isLoading, error } =
    reactClient.chain.getAuctionState.useQuery<AuctionState>();
  const [selectedTable, setSelectedTable] = useState<"miner" | "bid">("miner");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinerUid, setSelectedMinerUid] = useState<string | null>(null);

  const handleNavigateToMiner = (uid: string) => {
    setSelectedTable("miner");
    setSearchTerm(uid);
    setSelectedMinerUid(uid);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>

        <div className="mt-8 flex justify-between">
          <ToggleTable
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            onTableChange={() => setSearchTerm("")}
          />
          <Search value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="mt-4 flex justify-between">
          <CurrentBlock block={data?.block || 0} />
          <MaxBid maxBid={data?.max_bid || 0} />
          <TaoPrice price={data?.tao_price || 0} />
          <EmissionPool pool={data?.emission_pool || 0} />
        </div>

        <div className="mt-8">
          {selectedTable === "miner" ? (
            <MinerTable
              miners={getNodesByMiner(data?.auction_results ?? {})}
              nodes={getNodes(data?.auction_results ?? {})}
              searchTerm={searchTerm}
              selectedMinerUid={selectedMinerUid}
              onSelectedMinerChange={setSelectedMinerUid}
              isLoading={isLoading}
              error={error as Error | null}
            />
          ) : (
            <BidTable
              nodes={getNodes(data?.auction_results ?? {})}
              searchTerm={searchTerm}
              onNavigateToMiner={handleNavigateToMiner}
              isLoading={isLoading}
              error={error as Error | null}
            />
          )}
        </div>
      </div>
    </div>
  );
}
