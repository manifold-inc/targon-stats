"use client";

import { API_ENDPOINT } from "@/utils/constant";

export default function DocsPage() {
  const url = API_ENDPOINT;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Public API Documentation
        </h1>

        <div className="flex flex-col gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              HTTP API Endpoints
            </h2>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-50">
                Get Specific Miner
              </h3>
              <pre className="overflow-x-auto text-sm text-gray-700 dark:text-gray-300">
                {`GET ${url}/api/miners/miner_id

Response:
{
  "success": true,
    "data": [
      {
      "uid": "miner_id",
      "price": 100,
      "payout": 1,
      "gpus": 1,
      "diluted": false
      }
    ],
}`}
              </pre>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-50">
              Get All Miners
            </h3>
            <pre className="overflow-x-auto text-sm text-gray-700 dark:text-gray-300">
              {`GET ${url}/api/miners

Response:
{
  "success": true,
  "data": [
    {
      "uid": "miner_id",
      "average_price": 100,
      "average_payout": 1,
      "total_price": 100,
      "total_payout": 1,
      "gpus": 1,
      "nodes": 1,
      "diluted": false
    }
  ],
}`}
            </pre>
          </div>

          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-50">
              Get All Bids
            </h3>
            <pre className="overflow-x-auto text-sm text-gray-700 dark:text-gray-300">
              {`GET ${url}/api/bids

Response:
{
  "success": true,
  "data": [
    {
      "uid": "miner_id",
      "price": 100,
      "payout": 1,
      "gpus": 1,
      "diluted": false
    }
  ],
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
