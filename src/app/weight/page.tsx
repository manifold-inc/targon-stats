"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import WeightTable from "@/app/_components/WeightTable";
import { reactClient } from "@/trpc/react";
import {
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
      handleSearchNavigation(term, "/weight", setSearchTerm, router),
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
          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700 py-4 pl-4 pr-4 md:p-8 md:py-8">
            <h2 className="font-blinker mb-4 text-lg font-semibold tracking-wider text-mf-edge-500 md:mb-8">
              Targon Weights
            </h2>
            <WeightTable
              weights={auction?.weights}
              hotkeyToUid={auction?.hotkey_to_uid ?? {}}
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

export default function WeightPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
