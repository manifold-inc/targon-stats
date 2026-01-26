"use client";

import PageHeader from "@/app/_components/PageHeader";
import WeightTable from "@/app/_components/WeightTable";
import { reactClient } from "@/trpc/react";
import { handleBlockChange, handleSearchNavigation } from "@/utils/utils";
import { RiArrowUpBoxFill } from "@remixicon/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useRef, useState } from "react";

function Content() {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined
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
    [setSearchTerm, router]
  );

  const handleClickTab = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/miner", setSearchTerm, router),
    [setSearchTerm, router]
  );

  const onBlockChange = useCallback(
    (block: number) =>
      handleBlockChange(block, setSelectedBlock, handleSearchChange),
    [handleSearchChange]
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
      <PageHeader
        title="Weights"
        icon={<RiArrowUpBoxFill className="h-7 w-7 text-mf-sally-500" />}
      />
      <div className="mt-5 pb-20">
        <WeightTable
          weights={auction?.weights}
          hotkeyToUid={auction?.hotkey_to_uid ?? {}}
          searchTerm={searchTerm}
          onNavigateToMiner={handleClickTab}
          isLoading={isLoading}
          error={error as Error | null}
          title="Targon Weights"
          block={auction ? (selectedBlock ?? auction.block) : undefined}
          latestBlock={auctionLatest?.block}
          onBlockChange={onBlockChange}
          onSearchChange={handleSearchChange}
          onSearchClear={() => handleSearchChange("")}
        />
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
