"use client";

import Box from "@/app/_components/Box";
import CodeBlock from "@/app/_components/CodeBlock";
import PageHeader from "@/app/_components/PageHeader";
import { API_ENDPOINT } from "@/utils/constant";
import { copyToClipboard } from "@/utils/utils";
import { RiCheckLine, RiFileCopyLine, RiFileFill } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const url = API_ENDPOINT;
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="space-y-6 pb-20">
        <PageHeader
          title="HTTP API Endpoints"
          icon={<RiFileFill className="h-7 w-7 text-mf-sally-500" />}
        />

        <div className="rounded-lg border-2 border-mf-border-600 bg-mf-night-450">
          <div className="flex items-center justify-between border-b border-mf-border-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-mf-milk-500">
              Get All Miners
            </h3>
            <div
              onClick={() =>
                copyToClipboard(
                  `${url}/api/miners`,
                  "all-miners",
                  setCopiedEndpoint,
                  2000
                )
              }
              className="cursor-pointer"
            >
              <Box
                icon={
                  copiedEndpoint === "all-miners" ? (
                    <RiCheckLine className="h-3.5 w-3.5 text-mf-sally-300" />
                  ) : (
                    <RiFileCopyLine className="h-3.5 w-3.5 text-mf-sally-300" />
                  )
                }
                value={copiedEndpoint === "all-miners" ? "Copied" : "Copy"}
                valueClassName="text-mf-milk-500"
              />
            </div>
          </div>
          <div className="p-6">
            <CodeBlock
              code={`GET ${url}/api/miners
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
              language="http"
            />
          </div>
        </div>

        <div className="rounded-lg border-2 border-mf-border-600 bg-mf-night-450">
          <div className="flex items-center justify-between border-b border-mf-border-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-mf-milk-500">
              Get Attestation Errors
            </h3>
            <div
              onClick={() =>
                copyToClipboard(
                  `${url}/api/miners/attest/error/{miner_id}`,
                  "attestation-errors",
                  setCopiedEndpoint,
                  2000
                )
              }
              className="cursor-pointer"
            >
              <Box
                icon={
                  copiedEndpoint === "attestation-errors" ? (
                    <RiCheckLine className="h-3.5 w-3.5 text-mf-sally-300" />
                  ) : (
                    <RiFileCopyLine className="h-3.5 w-3.5 text-mf-sally-300" />
                  )
                }
                value={
                  copiedEndpoint === "attestation-errors" ? "Copied" : "Copy"
                }
                valueClassName="text-mf-milk-500"
              />
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 text-sm text-mf-milk-500">
              This protected route requires to user to pass in Epistula headers.
            </div>
            <CodeBlock
              code={`GET ${url}/api/miners/attest/error/{miner_id}

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
              language="http"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center gap-2">
        <p className="text-sm text-mf-milk-700">Looking for Targon Docs?</p>
        <Link href="https://docs.targon.com" target="_blank">
          <Box
            value="Targon Docs"
            valueClassName="text-mf-milk-500"
            icon={<RiFileFill className="h-3.5 w-3.5 text-mf-sally-300" />}
          />
        </Link>
      </div>
    </div>
  );
}
