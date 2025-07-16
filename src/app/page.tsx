"use client";

import { useState } from "react";

import BidTable from "@/app/_components/BidTable";
import BlockSelector from "@/app/_components/BlockSelector";
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
  const [selectedTable, setSelectedTable] = useState<"miner" | "bid">("miner");
  const [selectedMinerUid, setSelectedMinerUid] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: currentAuction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery<AuctionState>();
  const { data: selectedAuction } =
    reactClient.chain.getPreviousAuctionState.useQuery(
      selectedBlock ?? currentAuction?.block ?? 0,
      { enabled: !!selectedBlock || !!currentAuction?.block },
    );

  const auctionState = selectedAuction || currentAuction;
  const handleNavigateToMiner = (uid: string) => {
    setSelectedTable("miner");
    setSearchTerm(uid);
    setSelectedMinerUid(uid);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            Targon Miner Stats
          </h1>
        </div>

        <div className="mt-8 flex justify-between">
          <ToggleTable
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            onTableChange={() => setSearchTerm("")}
          />
          <div className="flex items-center gap-4">
            {currentAuction && (
              <BlockSelector
                block={currentAuction.block}
                onBlockChange={setSelectedBlock}
                isLoading={isLoading}
              />
            )}
            <Search value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <CurrentBlock block={auctionState?.block || 0} />
          <MaxBid maxBid={auctionState?.max_bid || 0} />
          <TaoPrice price={auctionState?.tao_price || 0} />
          <EmissionPool pool={auctionState?.emission_pool || 0} />
        </div>

        <div className="mt-8">
          {selectedTable === "miner" ? (
            <MinerTable
              miners={getNodesByMiner(auctionState?.auction_results ?? {})}
              nodes={getNodes(auctionState?.auction_results ?? {})}
              searchTerm={searchTerm}
              selectedMinerUid={selectedMinerUid}
              onSelectedMinerChange={setSelectedMinerUid}
              isLoading={isLoading}
              error={error as Error | null}
            />
          ) : (
            <BidTable
              nodes={getNodes(auctionState?.auction_results ?? {})}
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
