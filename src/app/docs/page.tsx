"use client";

import { Suspense } from "react";
import Image from "next/image";

import BackgroundSVG from "@/app/_components/BackgroundSVG";
import BlockSelector from "@/app/_components/BlockSelector";
import CurrentBlock from "@/app/_components/CurrentBlock";
import EmissionPool from "@/app/_components/EmissionPool";
import MaxBid from "@/app/_components/MaxBid";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import TaoPrice from "@/app/_components/TaoPrice";
import { reactClient } from "@/trpc/react";
import { API_ENDPOINT } from "@/utils/constant";

function Content() {
  const url = API_ENDPOINT;
  
  const {
    data: auction,
    isLoading,
  } = reactClient.chain.getAuctionState.useQuery(undefined);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  return (
    <div className="w-full">
      <BackgroundSVG />
      <div className="w-full border-y-2 border-mf-ash-300 bg-mf-night-500">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Image
                src="/targonStatsLogo.svg"
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

      <div className="mx-auto max-w-5xl px-8 py-2">
        <div className="mt-4 flex justify-between">
          <Navigation />
          <div className="flex items-center gap-4">
            {auction && (
              <BlockSelector
                block={auction.block}
                latestBlock={auctionLatest?.block ?? 0}
                onBlockChange={() => {}}
                isLoading={isLoading}
              />
            )}
            <Search value="" onChange={() => {}} />
          </div>
        </div>

        <div className="mt-5 pb-20 space-y-6">
          <h2 className="font-blinker mb-3 text-2xl font-semibold tracking-wider text-mf-edge-500">
            HTTP API Endpoints
          </h2>
          
          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get Specific Endpoints
              </h3>
              <button className="rounded-lg bg-mf-sally-500 px-8 py-1 text-xs text-mf-ash-500 font-poppins font-semibold">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
{`GET ${url}/api/miners/miner_id
Response:
"success": 
true,
"data": [
"uid": "miner_id",
"price": 100,
"payout": 1,
"gpus": 1,
"diluted": false`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get All Miners
              </h3>
              <button className="rounded-lg bg-mf-sally-500 px-8 py-1 text-xs text-mf-ash-500 font-poppins font-semibold">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
{`GET ${url}/api/miners/miner_id
Response:
"success":
true,
"data": [
"uid": "miner_id",
"price": 100,
"payout": 1,
"gpus": 1,`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get All Bids
              </h3>
              <button className="rounded-lg bg-mf-sally-500 px-8 py-1 text-xs text-mf-ash-500 font-poppins font-semibold">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
{`GET ${url}/api/bids
Response:
"success":
true,
"data": [
"uid": "bid_id",
"price": 100,
"payout": 1,
"gpus": 1,
"diluted": false`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get Max Bid
              </h3>
              <button className="rounded-lg bg-mf-sally-500 px-8 py-1 text-xs text-mf-ash-500 font-poppins font-semibold">
                Copy
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
{`GET ${url}/api/bids/max
Response:
"success":
true,
"data": {
"max_bid": 100
},
"timestamp": "2024-01-01T00:00:00.000Z"`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
