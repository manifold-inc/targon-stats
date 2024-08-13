import { type HTMLProps, type PropsWithChildren } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

import { API_BASE_URL } from "@/constants";
import { uncachedValidateRequest } from "@/server/auth";
import { ApiSection, WatchForSuccess } from "./ClientCards";

export const dynamic = "force-dynamic";

const Container = (props: PropsWithChildren & HTMLProps<HTMLDivElement>) => {
  return (
    <div className="rounded bg-white px-8 py-6 text-gray-800 shadow-lg dark:bg-neutral-800 dark:text-gray-100">
      <div {...props}>{props.children}</div>
    </div>
  );
};

const cardStyles =
  "flex flex-col flex-grow bg-white dark:bg-neutral-800 p-8 shadow-md rounded-2xl hover:shadow-lg transition-all dark:hover:bg-neutral-600 text-center items-center";

export default async function Page() {
  const { user } = await uncachedValidateRequest();
  if (!user) redirect("/");
  hljs.registerLanguage("json", json);
  return (
    <div className="mx-auto max-w-7xl px-12 pb-20 pt-20">
      <WatchForSuccess />
      <div className="pb-10 text-6xl font-bold">Docs</div>
      <div className="flex flex-col gap-8">
        <Container>
          <h3 className="pb-8 text-3xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            API Reference
          </h3>
          <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-3">
            <Link href="#globalavg" className={cardStyles}>
              Global Average
            </Link>
            <Link href="#miner-responses" className={cardStyles}>
              Miner Responses
            </Link>
            <Link href="#miner-statistics" className={cardStyles}>
              Miner Statistics
            </Link>
          </div>
          <ApiSection />
        </Container>
        <Container>
          <h4
            id="globalavg"
            className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50"
          >
            Global AVG
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}/stats/global/avg
            </div>
          </div>
          <div className="pb-4">
            Fetches the average statistics for a given chat conversation across
            a specified block range. You can filter by verification status and
            paginate the results.
          </div>
          <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Query Parameters
          </div>
          <ul className="list-inside list-disc pb-4 pl-5">
            <li>
              <strong>verified</strong> (required): Filters the results based on
              whether the responses are verified or not. Accepts a boolean
              value.
            </li>
            <li>
              <strong>startblock</strong> (optional): The starting block number
              to fetch statistics from. Defaults to the latest block minus 360.
            </li>
            <li>
              <strong>endblock</strong> (optional): The ending block number to
              fetch statistics until. Defaults to the latest block.
            </li>
            <li>
              <strong>limit</strong> (optional): The number of records to return
              in the response. Defaults to 100.
            </li>
            <li>
              <strong>offset</strong> (optional): The number of records to skip
              before starting to return results. Defaults to 0.
            </li>
          </ul>
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}
              /stats/global/avg?verified=true&startblock=100&endblock=200&limit=50&offset=10
            </div>
          </div>
          <div className="pb-4">
            Ensure the request includes a Bearer Token in the Authorization
            header:
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              Authorization: Bearer [your-api-key]
            </div>
          </div>
          <div className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Response
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
  "data": [
    {
      "block": 101,
      "avg_jaro": 0.95,
      "avg_wps": 2.5,
      "avg_time_for_all_tokens": 0.003,
      "avg_total_time": 0.01,
      "avg_time_to_first_token": 0.002,
      "id": 1
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 10,
    "totalRecords": 500,
    "hasMore": true
  }
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>
          <div className="pb-4">
            This response contains the fetched statistics and pagination
            metadata:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>data</strong>: An array of objects, each representing
              statistics for a particular block.
            </li>
            <li>
              <strong>pagination</strong>: Metadata about the returned results,
              including limit, offset, totalRecords, and whether there are more
              records to fetch.
            </li>
          </ul>
        </Container>

        <Container>
          <h4
            id="miner-responses"
            className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50"
          >
            Miner Responses
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}/stats/responses
            </div>
          </div>
          <div className="pb-4">
            Retrieves miner responses and statistics based on a given query,
            block range, and other parameters. The API supports authentication,
            filtering, and pagination.
          </div>

          <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Query Parameters
          </div>
          <ul className="list-inside list-disc pb-4 pl-5">
            <li>
              <strong>query</strong> (required): The miner identifier to search
              for, which could be a hotkey, coldkey, or UID.
            </li>
            <li>
              <strong>startblock</strong> (optional): The starting block number
              to fetch responses from. Defaults to the latest block minus 360.
            </li>
            <li>
              <strong>endblock</strong> (optional): The ending block number to
              fetch responses until. Defaults to the latest block.
            </li>
            <li>
              <strong>limit</strong> (optional): The number of records to return
              in the response. Defaults to 100.
            </li>
            <li>
              <strong>offset</strong> (optional): The number of records to skip
              before starting to return results. Defaults to 0.
            </li>
          </ul>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}
              /miner/responses?query=abcd1234&startblock=100&endblock=200&limit=50&offset=10
            </div>
          </div>
          <div className="pb-4">
            Ensure the request includes a Bearer Token in the Authorization
            header:
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              Authorization: Bearer [your-api-key]
            </div>
          </div>

          <div className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Response
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
  "data": [
    {
      "response": "response data",
      "ground_truth": "ground truth data",
      "prompt": "prompt data",
      "hotkey": "abcd1234",
      "coldkey": "efgh5678",
      "uid": 1,
      "block": 101,
      "timestamp": "2024-08-13T12:34:56Z",
      "seed": "seed_value",
      "top_k": "top_k_value",
      "top_p": "top_p_value",
      "best_of": "best_of_value",
      "typical_p": "typical_p_value",
      "temperature": "temperature_value",
      "top_n_tokens": "top_n_tokens_value",
      "max_n_tokens": "max_n_tokens_value",
      "repetition_penalty": "repetition_penalty_value",
      "stream": true,
      "details": true,
      "do_sample": true,
      "watermark": true,
      "return_full_text": true,
      "decoder_input_details": true,
      "version": "v1",
      "jaro_score": 0.95,
      "words_per_second": 2.5,
      "time_for_all_tokens": 0.003,
      "total_time": 0.01,
      "time_to_first_token": 0.002,
      "id": 1
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 10,
    "totalRecords": 500,
    "hasMore": true
  }
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-4">
            This response contains the fetched miner responses and pagination
            metadata:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>data</strong>: An array of objects, each representing the
              miner response and associated statistics for a particular block.
            </li>
            <li>
              <strong>pagination</strong>: Metadata about the returned results,
              including limit, offset, totalRecords, and whether there are more
              records to fetch.
            </li>
          </ul>

        </Container>

        <Container>
          <h4
            id="miner-statistics"
            className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50"
          >
            Miner Statistics
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}/api/stats
            </div>
          </div>
          <div className="pb-4">
            Retrieves miner statistics based on a given query, block range, and
            other parameters. The API supports authentication, filtering, and
            pagination.
          </div>

          <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Query Parameters
          </div>
          <ul className="list-inside list-disc pb-4 pl-5">
            <li>
              <strong>query</strong> (required): The miner identifier to search
              for, which could be a hotkey, coldkey, or UID.
            </li>
            <li>
              <strong>startblock</strong> (optional): The starting block number
              to fetch statistics from. Defaults to the latest block minus 360.
            </li>
            <li>
              <strong>endblock</strong> (optional): The ending block number to
              fetch statistics until. Defaults to the latest block.
            </li>
            <li>
              <strong>limit</strong> (optional): The number of records to return
              in the response. Defaults to 100.
            </li>
            <li>
              <strong>offset</strong> (optional): The number of records to skip
              before starting to return results. Defaults to 0.
            </li>
          </ul>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              GET {API_BASE_URL}
              /miner/stats?query=abcd1234&startblock=100&endblock=200&limit=50&offset=10
            </div>
          </div>
          <div className="pb-4">
            Ensure the request includes a Bearer Token in the Authorization
            header:
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              Authorization: Bearer [your-api-key]
            </div>
          </div>

          <div className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Response
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
  "data": [
    {
      "jaro_score": 0.95,
      "words_per_second": 2.5,
      "time_for_all_tokens": 0.003,
      "total_time": 0.01,
      "time_to_first_token": 0.002,
      "uid": 1,
      "hotkey": "abcd1234",
      "coldkey": "efgh5678",
      "block": 101,
      "id": 1
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 10,
    "totalRecords": 500,
    "hasMore": true
  }
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-4">
            This response contains the fetched miner statistics and pagination
            metadata:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>data</strong>: An array of objects, each representing the
              miner statistics for a particular block.
            </li>
            <li>
              <strong>pagination</strong>: Metadata about the returned results,
              including limit, offset, totalRecords, and whether there are more
              records to fetch.
            </li>
          </ul>
        </Container>
      </div>
    </div>
  );
}
