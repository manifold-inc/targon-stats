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
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="grid grid-cols-2 justify-items-center gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
            <div className="flex min-h-[1.5rem] items-center">
              <MaxBid maxBid={auction?.max_bid || 0} />
            </div>
            <div className="flex min-h-[1.5rem] items-center">
              <TaoPrice price={auction?.tao_price || 0} />
            </div>
            <div className="flex min-h-[1.5rem] items-center">
              <EmissionPool pool={auction?.emission_pool || 0} />
            </div>
            <div className="flex min-h-[1.5rem] items-center">
              <CurrentBlock block={auction?.block || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
