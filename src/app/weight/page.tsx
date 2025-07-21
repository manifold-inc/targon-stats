"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import TaoPrice from "@/app/_components/TaoPrice";
import WeightTable from "@/app/_components/WeightTable";
import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";

function Content() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm("");
    }
  }, [searchParams, pathname]);

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (term.trim()) {
        router.push(`/miner?search=${encodeURIComponent(term)}`);
      } else {
        router.push("/miner");
      }
    },
    [router],
  );

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
            Targon Miner Stats
          </h1>
        </div>

        <div className="mt-8 flex justify-between">
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
            <Search value={searchTerm} onChange={handleSearchChange} />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <CurrentBlock block={auction?.block || 0} />
          <MaxBid maxBid={auction?.max_bid || 0} />
          <TaoPrice price={auction?.tao_price || 0} />
          <EmissionPool pool={auction?.emission_pool || 0} />
        </div>

        <div className="mt-8">
          <WeightTable
            weights={auction?.weights ?? {}}
            nodes={getNodes(auction?.auction_results ?? {})}
            searchTerm={searchTerm}
            onNavigateToMiner={handleSearchChange}
            isLoading={isLoading}
            error={error as Error | null}
          />
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
