"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import { reactClient } from "@/trpc/react";
import { API_ENDPOINT } from "@/utils/constant";

function Content() {
  const url = API_ENDPOINT;
  const router = useRouter();

  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const { data: auctionLatest } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const handleBlockChange = (_block: number) => {
    router.push(`/miner`);
  };

  const handleSearchChange = (searchTerm: string) => {
    if (searchTerm.trim()) {
      router.push(`/miner?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/miner");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-8 py-2">
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Navigation />
          <div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-4">
            <div className="max-w-xs flex-1 sm:max-w-none sm:flex-initial">
              {auction && (
                <BlockSelector
                  block={auction.block}
                  latestBlock={auctionLatest?.block ?? 0}
                  onBlockChange={handleBlockChange}
                  isLoading={isLoading}
                  searchTerm=""
                />
              )}
            </div>
            <div className="max-w-xs flex-1 sm:max-w-none sm:flex-initial">
              <Search
                value=""
                onChange={handleSearchChange}
                onClear={() => router.push("/miner")}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-6 pb-20">
          <h2 className="font-blinker mb-3 text-2xl font-semibold tracking-wider text-mf-edge-500">
            HTTP API Endpoints
          </h2>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get Specific Endpoints
              </h3>
              <button className="font-poppins rounded-lg bg-mf-sally-500 px-8 py-1 text-xs font-semibold text-mf-ash-500">
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
              <button className="font-poppins rounded-lg bg-mf-sally-500 px-8 py-1 text-xs font-semibold text-mf-ash-500">
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
              <button className="font-poppins rounded-lg bg-mf-sally-500 px-8 py-1 text-xs font-semibold text-mf-ash-500">
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
              <button className="font-poppins rounded-lg bg-mf-sally-500 px-8 py-1 text-xs font-semibold text-mf-ash-500">
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
