"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

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
import {
  getNodes,
  handleBlockChange,
  handleSearchNavigation,
} from "@/utils/utils";

function Content() {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = useSearchParams();
  const previousSearchParamRef = useRef<string | null>(null);

  const searchParam = searchParams.get("search");
  if (searchParam !== previousSearchParamRef.current) {
    previousSearchParamRef.current = searchParam;
    setSearchTerm(searchParam || "");
  }

  const handleSearchChange = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/bid", setSearchTerm, router),
    [setSearchTerm, router],
  );

  const handleClickTab = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/miner", setSearchTerm, router),
    [setSearchTerm, router],
  );

  const onBlockChange = useCallback(
    (block: number) =>
      handleBlockChange(block, setSelectedBlock, handleSearchChange),
    [handleSearchChange],
  );

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  return (
    <div className="w-full">
      <BackgroundSVG />
      <div className="w-full border-y-2 border-mf-ash-300 bg-mf-night-500">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Image
                src="/targon-logo-dark.svg"
                alt="Targon-logo"
                width={30}
                height={30}
                className="h-7 w-7"
              />
              <h1 className="font-blinker flex items-center text-xl font-semibold text-mf-edge-500">
                Targon Stats
              </h1>
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
                onBlockChange={onBlockChange}
                isLoading={isLoading}
                searchTerm={searchTerm}
              />
            )}
            <Search
              value={searchTerm}
              onChange={handleSearchChange}
              onClear={() => handleSearchChange("")}
            />
          </div>
        </div>

        <div className="mt-5 pb-20">
          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700 p-8">
            <h2 className="font-blinker mb-7 text-lg font-semibold tracking-wider text-mf-edge-500">
              Targon Buyouts
            </h2>
            <BidTable
              nodes={getNodes(auction?.auction_results ?? {})}
              searchTerm={searchTerm}
              onNavigateToMiner={handleClickTab}
              isLoading={isLoading}
              error={error as Error | null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BidPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
