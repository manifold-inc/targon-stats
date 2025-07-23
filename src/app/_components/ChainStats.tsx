"use client";

import Image from "next/image";

import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import TaoPrice from "@/app/_components/TaoPrice";
import { reactClient } from "@/trpc/react";

export default function ChainStats() {
  const { data: auction } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  return (
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
  );
}
