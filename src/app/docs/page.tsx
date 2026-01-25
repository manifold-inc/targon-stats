"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";

import BlockSelector from "@/app/_components/BlockSelector";
import Navigation from "@/app/_components/Navigation";
import Search from "@/app/_components/Search";
import { reactClient } from "@/trpc/react";
import { API_ENDPOINT } from "@/utils/constant";
import { copyToClipboard } from "@/utils/utils";

function Content() {
  const url = API_ENDPOINT;
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

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
          <h2 className="mb-3 text-2xl font-semibold tracking-wider text-mf-edge-500">
            HTTP API Endpoints
          </h2>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get All Miners
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${url}/api/miners`,
                    "all-miners",
                    setCopiedEndpoint,
                    2000,
                  )
                }
                className="w-24 rounded-lg bg-mf-sally-500 py-1 text-center text-xs font-semibold text-mf-ash-500 transition-opacity hover:opacity-80"
              >
                {copiedEndpoint === "all-miners" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
                {`GET ${url}/api/miners
Response:
{
  "data": [
    {
      "uid": "1",
      "payout": 100,
      "compute_type": "H200",
      "cards": 8
    },
    {
      "uid": "2",
      "payout": 100,
      "compute_type": "H200",
      "cards": 8
    }
  ],
}`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg border-2 border-mf-ash-300 bg-mf-ash-700">
            <div className="flex items-center justify-between border-b border-mf-ash-300 px-6 py-4">
              <h3 className="text-lg font-semibold text-mf-edge-500">
                Get Attestation Errors
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${url}/api/miners/attest/error/{miner_id}`,
                    "attestation-errors",
                    setCopiedEndpoint,
                    2000,
                  )
                }
                className="w-24 rounded-lg bg-mf-sally-500 py-1 text-center text-xs font-semibold text-mf-ash-500 transition-opacity hover:opacity-80"
              >
                {copiedEndpoint === "attestation-errors" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto text-sm text-mf-edge-700">
                This protected route requires to user to pass in Epistula
                headers.
                <br />
                <br />
                {`GET ${url}/api/miners/attest/error/{miner_id}

Headers:
{
  "Epistula-Request-Signature": "signature",
  "Epistula-Uuid": "uuid",
  "Epistula-Timestamp": "timestamp",
  "Epistula-Signed-For": "",
  "Epistula-Signed-By": "hotkey"
}

Response:
{
  "data": {
    "miner_id": {
      "ip_address_1": "error_message_1",
      "ip_address_2": "error_message_2"
    },
    "hotkey_to_uid": {
      "hotkey": "miner_id"
    }
  }
}`}
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
