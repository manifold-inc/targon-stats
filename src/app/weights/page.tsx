"use client";

import PageHeader from "@/app/_components/PageHeader";
import WeightsGraphWithSelector from "@/app/_components/weights/WeightsGraphWithSelector";
import WeightsTable from "@/app/_components/weights/WeightsTable";
import { reactClient } from "@/trpc/react";
import { handleBlockChange, handleSearchNavigation } from "@/utils/utils";
import { RiArrowUpBoxFill } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function WeightPage() {
  const router = useRouter();
  const [selectedBlock, setSelectedBlock] = useState<number | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = useCallback(
    (term: string) =>
      handleSearchNavigation(term, "/weight", setSearchTerm, router),
    [setSearchTerm, router]
  );

  const handleSearchEnter = useCallback(
    (uid: string) => {
      router.push(`/miners/${uid}`);
    },
    [router]
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
      <div className="mt-5 pb-20 flex flex-col gap-8">
        <WeightsGraphWithSelector
          weights={auction?.weights}
          isLoading={isLoading}
        />
        <WeightsTable
          weights={auction?.weights}
          hotkeyToUid={auction?.hotkey_to_uid ?? {}}
          searchTerm={searchTerm}
          isLoading={isLoading}
          error={error as Error | null}
          title="Targon Weights"
          block={auction ? (selectedBlock ?? auction.block) : undefined}
          latestBlock={auctionLatest?.block}
          onBlockChange={onBlockChange}
          onSearchChange={handleSearchChange}
          onSearchClear={() => handleSearchChange("")}
          onSearchEnter={handleSearchEnter}
        />
      </div>
    </div>
  );
}
