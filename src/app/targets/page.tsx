"use client";

import BlockSelector from "@/app/_components/BlockSelector";
import TargetCards from "@/app/_components/targets/TargetCards";
import { reactClient } from "@/trpc/react";
import { RiRecordCircleFill } from "@remixicon/react";
import { useCallback, useState } from "react";

export default function TargetsPage() {
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined
  );
  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(selectedBlock);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const onBlockChange = useCallback((block: number) => {
    setSelectedBlock(block);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="text-mf-sally-500">
            <RiRecordCircleFill className="h-7 w-7 text-mf-sally-500" />
          </div>
          <h1 className="text-[1.75rem] font-saira text-mf-milk-400">
            Targets
          </h1>
        </div>

        <div className="lg:flex hidden items-center gap-3">
          {auction && (
            <BlockSelector
              block={selectedBlock ?? auction.block}
              latestBlock={auctionLatest?.block ?? 0}
              onBlockChange={onBlockChange}
              isLoading={isLoading}
              searchTerm=""
            />
          )}
        </div>
      </div>
      <div className="mt-5 pb-20">
        <TargetCards
          auctionResults={auction?.auction_results}
          auction={auction?.auctions}
          isLoading={isLoading}
          error={error ? new Error(error.message) : null}
        />
      </div>
    </div>
  );
}
