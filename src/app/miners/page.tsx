"use client";

import MinerTable from "@/app/_components/MinerTable";
import PageHeader from "@/app/_components/PageHeader";
import { reactClient } from "@/trpc/react";
import {
  getNodes,
  handleBlockChange,
  handleSearchNavigation,
} from "@/utils/utils";
import { RiToolsFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function MinersPage() {
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const handleSearchChange = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/miners", setSearchTerm, router),
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
        title="Miners"
        icon={<RiToolsFill className="h-7 w-7 text-mf-sally-500" />}
      />
      <div className="mt-5 pb-20">
        <MinerTable
          nodes={getNodes(auction?.auction_results ?? {})}
          searchTerm={searchTerm}
          isLoading={isLoading}
          error={error ? new Error(error.message) : null}
          title="Targon Nodes"
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
