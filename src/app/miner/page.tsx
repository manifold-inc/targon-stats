"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import MinerTable from "@/app/_components/MinerTable";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import { reactClient } from "@/trpc/react";
import {
  getNodes,
  handleBlockChange,
  handleSearchNavigation,
} from "@/utils/utils";

function Content() {
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/miner", setSearchTerm, router),
    [setSearchTerm, router],
  );

  const onBlockChange = useCallback(
    (block: number) =>
      handleBlockChange(block, setSelectedBlock, handleSearchChange),
    [handleSearchChange],
  );

  const previousSearchParamRef = useRef<string | null>(null);

  const searchParam = searchParams.get("search");
  if (searchParam !== previousSearchParamRef.current) {
    previousSearchParamRef.current = searchParam;
    setSearchTerm(searchParam || "");
  }

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-4 py-2 md:px-8">
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Navigation />
          <div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-4">
            <div className="max-w-xs flex-1 sm:max-w-none sm:flex-initial">
              {auction && (
                <BlockSelector
                  block={selectedBlock ?? auction.block}
                  latestBlock={auctionLatest?.block ?? 0}
                  onBlockChange={onBlockChange}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                />
              )}
            </div>
            <div className="max-w-xs flex-1 sm:max-w-none sm:flex-initial">
              <Search
                value={searchTerm}
                onChange={handleSearchChange}
                onClear={() => handleSearchChange("")}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pb-20">
          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700 p-4 py-4 md:p-8">
            <h2 className="font-blinker mb-4 text-lg font-semibold tracking-wider text-mf-edge-500 md:mb-8">
              Targon Nodes
            </h2>
            <MinerTable
              nodes={getNodes(auction?.auction_results ?? {})}
              searchTerm={searchTerm}
              isLoading={isLoading}
              error={error ? new Error(error.message) : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MinerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
