"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import MinerTable from "@/app/_components/MinerTable";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import TaoPrice from "@/app/_components/TaoPrice";
import { reactClient } from "@/trpc/react";
import { getNodesByMiner } from "@/utils/utils";

function Content() {

  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleNavigateToMiner = useCallback((uid: string) => {
    router.push(`/miner?search=${encodeURIComponent(uid)}`);
  }, [router]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      router.push(`/miner?search=${encodeURIComponent(term)}`);
    } else {
      router.push('/miner');
    }
  }, [router]);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm("");
    }
  }, [searchParams, pathname]);

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);


    const handleClearSearch = () => {
      router.push('/miner');
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
            <Search value={searchTerm} onChange={handleSearchChange} onClear={handleClearSearch} />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <CurrentBlock block={auction?.block || 0} />
          <MaxBid maxBid={auction?.max_bid || 0} />
          <TaoPrice price={auction?.tao_price || 0} />
          <EmissionPool pool={auction?.emission_pool || 0} />
        </div>

        <div className="mt-8">
          <MinerTable
            miners={getNodesByMiner(auction?.auction_results ?? {})}
            searchTerm={searchTerm}
            isLoading={isLoading}
            error={error ? new Error(error.message) : null}
            onNavigateToMiner={handleNavigateToMiner}
          />
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
