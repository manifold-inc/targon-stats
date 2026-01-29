"use client";

import MinerHardwareCards from "@/app/_components/miners/MinerHardwareCards";
import MinerHeader from "@/app/_components/miners/MinerHeader";
import MinerWeightsGraph from "@/app/_components/miners/MinerWeightsGraph";
import { reactClient } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MinerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.id as string;

  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(undefined);

  const hotkey = auction?.hotkey_to_uid?.[uid];

  // Check if miner exists
  useEffect(() => {
    if (!isLoading && auction && uid) {
      // Check if miner exists in auction_results
      const nodes = Object.values(auction.auction_results).flat();
      const minerExistsInAuction = nodes.some(
        (node) => String(node.uid) === String(uid)
      );

      // Check if miner exists in weights (some miners might have weights but no auction results)
      const minerExistsInWeights = auction.weights?.uids?.some(
        (weightUid) => String(weightUid) === String(uid)
      );

      if (!minerExistsInAuction && !minerExistsInWeights) {
        router.push("/miners");
      }
    }
  }, [isLoading, auction, uid, router]);

  if (error || (!isLoading && !auction)) {
    return (
      <div className="w-full">
        <div className="text-red-400">
          Error loading miner data: {error?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MinerHeader uid={uid} hotkey={hotkey} />
      <MinerWeightsGraph uid={uid} />
      <MinerHardwareCards
        uid={uid}
        auctionResults={auction?.auction_results}
        isLoading={isLoading}
      />
    </div>
  );
}
