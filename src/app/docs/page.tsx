import { type HTMLProps, type PropsWithChildren } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

import { API_BASE_URL } from "@/constants";
import { ApiSection, WatchForSuccess } from "./ClientCards";

export const dynamic = "force-dynamic";

const Container = (props: PropsWithChildren & HTMLProps<HTMLDivElement>) => {
  return (
    <div className="rounded bg-white px-8 py-6 text-gray-800 shadow-lg dark:bg-neutral-800 dark:text-gray-100">
      <div {...props}>{props.children}</div>
    </div>
  );
};

export default function Page() {
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
          <ApiSection />
        </Container>
        <Container>
          <div>
            <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
              Global AVG
            </h4>
            <div className="overflow-x-scroll pb-4">
              <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
                POST {API_BASE_URL}/stats/avg
              </div>
            </div>
            <div className="pb-4">
              Fetches the average statistics across a specified block range. You
              can filter by verification status, a specific validator&apos;s
              hotkey, and paginate the results.
            </div>
            <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
              Query Parameters
            </div>
            <ul className="list-inside list-disc pb-4 pl-5">
              <li>
                <strong>verified</strong> (required, boolean): Filters the
                results based on whether the responses are verified or not.
              </li>
              <li>
                <strong>startblock</strong> (optional, number): The starting
                block number to fetch statistics from. Defaults to the latest
                block minus 360.
              </li>
              <li>
                <strong>endblock</strong> (optional, number): The ending block
                number to fetch statistics until. Defaults to the latest block.
              </li>
              <li>
                <strong>validator_hotkeys</strong> (optional, string[]): The
                validator hotkeys to filter the results. If not provided,
                results from all validators are included.
              </li>
              <li>
                <strong>limit</strong> (optional, number): The number of records
                to return in the response. Defaults to 100.{" "}
                <strong>Maximum limit is 300</strong>.
              </li>
              <li>
                <strong>offset</strong> (optional, number): The number of
                records to skip before starting to return results. Defaults to
                0.
              </li>
            </ul>
            <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
              Example Request
            </h4>
            <div className="overflow-x-scroll pb-4">
              <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
                POST {API_BASE_URL}/stats/avg
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
            <div className="overflow-x-scroll pb-4">
              <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
                <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        `{
  "verified": true,
  "startblock": 3612400,
  "endblock": 3612488,
  "validator_hotkeys": ["validator_hotkey1". "validator_hotkey2"],
  "limit": 200,
  "offset": 4
}`,
                        { language: "json" },
                      ).value,
                    }}
                  />
                </pre>
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
  "stats": [
    {
      "minute": 1683726000000,
      "avg_tps": 2.5,
      "avg_time_for_all_tokens": 0.003,
      "avg_total_time": 0.01,
      "avg_time_to_first_token": 0.002,
      "validator": "ValidatorName",
      "validator_hotkey": "validator_hotkey",
      "id": 1
    }
  ],
  "totalRecords": 500,
  "limit": 200,
  "offset": 4
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
                <strong>stats</strong>: An array of objects, each representing
                statistics for a particular block or minute.
              </li>
              <li>
                <strong>pagination</strong>: Metadata about the returned
                results, including limit, offset, and count of totalRecords.
              </li>
            </ul>
          </div>
        </Container>

        <Container>
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Miner Responses
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/responses
            </div>
          </div>
          <div className="pb-4">
            Retrieves miner responses and statistics based on a given
            hotkey/coldkey/UID, block range, validator hotkey, and pagination
            parameters.
          </div>

          <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Query Parameters
          </div>
          <ul className="list-inside list-disc pb-4 pl-5">
            <li>
              <strong>query</strong> (required, string): The miner identifier to
              search for, which could be a hotkey, coldkey, or UID.
            </li>
            <li>
              <strong>verified</strong> (required, boolean): Filters the results
              based on whether the responses are verified or not.
            </li>
            <li>
              <strong>startblock</strong> (optional, number): The starting block
              number to fetch statistics from. Defaults to the latest block
              minus 360.
            </li>
            <li>
              <strong>endblock</strong> (optional, number): The ending block
              number to fetch statistics until. Defaults to the latest block.
            </li>
            <li>
              <strong>validator_hotkeys</strong> (optional, string[]): The
              validator hotkeys to filter the results. If not provided, results
              from all validators are included.
            </li>
            <li>
              <strong>extras</strong> (optional, object): An object containing
              additional fields to include in the response. Currently supports:
              <ul className="list-inside list-[circle] pl-5">
                <li>
                  <code>tokens</code> (boolean): When true, includes the
                  token-level details in the response. Defaults to false.
                </li>
                <li>
                  <code>organics</code> (boolean): When true, returns organic
                  responses instead of synthetic responses. Defaults to false.
                </li>
              </ul>
            </li>
            <li>
              <strong>limit</strong> (optional, number): The number of records
              to return in the response. Defaults to 100.{" "}
              <strong>Maximum limit is 300</strong>.
            </li>
            <li>
              <strong>offset</strong> (optional, number): The number of records
              to skip before starting to return results. Defaults to 0.
            </li>
          </ul>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/responses
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

          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
  "query": "0",
  "verified": true,
  "startblock": 3612400,
  "endblock": 3612488,
  "validator_hotkeys": ["validator_hotkey", "validator_hotkey2"],
  "extras": {
    "tokens": true,
    "organics": false
  },
  "limit": 200,
  "offset": 4
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Synthetic Response
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
    "responses": [
        {
            "tps": 50.7754,
            "totalTime": 3.60411,
            "timeToFirstToken": 1.85199,
            "timeForAllTokens": 1.75212,
            "verified": true,
            "error": null,
            "cause": null,
            "messages": [
                {
                    "role": "system",
                    "content": "\\n### Current Date: 2024-12-19\\n### Instruction:\\nYou are to take on the role of Con..."
                },
                {
                    "role": "user",
                    "content": "Search query: What theory brings together continental drift and seafloor spreading?"
                }
            ],
            "model": "NousResearch/Meta-Llama-3.1-8B-Instruct",
            "seed": 5402214,
            "maxTokens": 802,
            "temperature": 0.326203,
            "requestEndpoint": "CHAT",
            "block": 4517585,
            "timestamp": "2024-12-19T19:11:14.000Z",
            "version": 403010,
            "validator": "Foundry",
            "validatorHotkey": "5HEo565WAy4Dbq3Sv271SAi7syBSofyfhhwRNjFNSM2gP9M2",
            "id": 46767535
        }
    ],
    "totalRecords": "207",
    "offset": 0,
    "limit": 2,
    "hasMoreRecords": true
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Organic Response
          </div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
    "responses": [
        {
            "tps": 246.988,
            "totalTime": 166,
            "timeToFirstToken": 158,
            "timeForAllTokens": 8,
            "verified": true,
            "tokens": [],
            "error": null,
            "cause": null,
            "messages": [],
            "model": "EnvyIrys/EnvyIrys_sn111_14",
            "seed": 1734554855,
            "maxTokens": 500,
            "temperature": 0.2,
            "requestEndpoint": "COMPLETION",
            "block": 0,
            "timestamp": "2024-12-18T20:48:47.000Z",
            "version": 0,
            "validator": "",
            "validatorHotkey": "",
            "id": 1
        }
    ],
    "totalRecords": "2",
    "offset": 0,
    "limit": 2,
    "hasMoreRecords": false
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-4">Note the differences in organic responses:</div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <code>tokens</code> and <code>messages</code> are empty arrays
            </li>
            <li>
              <code>block</code> and <code>version</code> are 0
            </li>
            <li>
              <code>validator</code> and <code>validator_hotkey</code> are empty
              strings
            </li>
            <li>
              All other fields maintain their actual values from the organic
              request
            </li>
          </ul>

          <div className="pb-4">
            This response contains the fetched miner responses and pagination
            metadata:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>responses</strong>: An array of objects, each representing
              the miner response and associated statistics for a particular
              block.
            </li>
            <li>
              <strong>pagination</strong>: Metadata about the returned results,
              including limit, offset, and totalRecords.
            </li>
          </ul>
        </Container>

        <Container>
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Validator Models
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/validator/model
            </div>
          </div>
          <div className="pb-4">
            Retrieves information about validator models, including their
            hotkeys, names, and their challenge models.
          </div>

          <div className="pb-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Query Parameters
          </div>
          <ul className="list-inside list-disc pb-4 pl-5">
            <li>
              <strong>validator_hotkeys</strong> (optional, string[]): An array
              of validator hotkeys to filter the results. If not provided,
              results from all validators are included.
            </li>
          </ul>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/validator/model
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

          <div className="overflow-x-scroll pb-4">
            <div className="w-full whitespace-nowrap rounded bg-gray-800 px-2 py-2 text-sm leading-3 text-gray-50 dark:bg-neutral-900">
              <pre className="hljs prose-sm w-full overflow-x-scroll rounded bg-gray-800 px-2 py-2 dark:bg-neutral-900">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(
                      `{
  "validator_hotkeys": ["validator_hotkey1", "validator_hotkey2"]
}`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
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
                      `[
  {
    "hotkey": "validator_hotkey1",
    "valiName": "Validator 1",
    "models": ["model1", "model2"]
  },
  {
    "hotkey": "validator_hotkey2",
    "valiName": "Validator 2",
    "models": ["model3", "model4"]
  }
]`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-4">
            This response contains information about the validators and their
            associated models:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>validatorModels</strong>: An array of objects, each
              representing a validator with their hotkey, name, and list of
              models.
            </li>
          </ul>
        </Container>

        <Container>
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Validator Live Stats
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/validator/live
            </div>
          </div>
          <div className="pb-4">
            Retrieves live statistics for validators, including their hotkeys,
            names, models, and the number of requests they have received in the
            last 24 hours.
          </div>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/validator/live
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
                      `[
    {
        "hotkey": "5DQ2Geab6G25wiZ4jGH6wJM8fekrm1QhV9hrRuntjBVxxKZm",
        "valiName": "Miner's Union Validator",
        "models": [
            "NousResearch/Meta-Llama-3.1-8B-Instruct"
        ],
        "requestCount": "5078"
    },
    {
        "hotkey": "5F2CsUDVbRbVMXTh9fAzF9GacjVX7UapvRxidrxe7z8BYckQ",
        "valiName": "Rizzo",
        "models": [
            "NousResearch/Meta-Llama-3.1-8B-Instruct"
        ],
        "requestCount": "4125"
    },
    {
        "hotkey": "5FFApaS75bv5pJHfAp2FVLBj9ZaXuFDjEypsaBNc1wCfe52v",
        "valiName": "RoundTable21",
        "models": [
            "NousResearch/Meta-Llama-3.1-8B-Instruct",
            "NousResearch/Hermes-3-Llama-3.1-8B",
            "EnvyIrys/EnvyIrys_sn111_14",
            "gryphe/mythomax-l2-13b",
            "deepseek-ai/deepseek-coder-33b-instruct",
            "Qwen/Qwen2.5-Coder-7B-Instruct"
        ],
        "requestCount": "5433"
    }
]`,
                      { language: "json" },
                    ).value,
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="pb-4">
            This response contains information about the validators and their
            associated live stats:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>validatorLiveStats</strong>: An array of objects, each
              representing a validator with their hotkey, name, list of models,
              and the number of requests they have received in the last 24
              hours.
            </li>
          </ul>
        </Container>

        <Container>
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Throughput Stats By Miner
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/throughput/miner
            </div>
          </div>
          <div className="pb-4">
            Retrieves throughput statistics for a specific miner, identified by
            their UID.
          </div>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/throughput/miner
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
          <div className="pb-4">Request body should include the miner UID:</div>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              {`{
  "uid": "12"  // Miner UID ONLY
}`}
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
  "_id": "67c9f0ed974f793d67eb1157",
  "uid": 0,
  "last_updated": 1741538820453,
  "targon-hub-api": {
    "miner_cache": {
      "models_error": "",
      "models": {
        "NousResearch/Hermes-3-Llama-3.1-8B": 16,
        "deepseek-ai/DeepSeek-R1": 8,
        "deepseek-ai/DeepSeek-R1-Distill-Llama-70B": 16,
        "EnvyIrys/EnvyIrys_sn111_14": 16,
        "nvidia/Llama-3.1-Nemotron-70B-Instruct-HF": 16,
        "deepseek-ai/DeepSeek-V3": 8,
        "TheDrummer/Cydonia-22B-v1.3": 16
      }
    },
    "api": {
      "completed": 0,
      "completedOverTime": [
        0,
        0,
        1,
        10,
        13,
        11,
        9,
        116,
        21,
        8
      ],
      "attempted": 0,
      "partial": 0,
      "successRateOverTime": [
        1,
        1,
        1,
        0.5882353,
        0.8666667,
        0.78571427,
        1,
        0.5888325,
        1,
        0.8
      ],
      "avgSuccessRate": 0.8629449,
      "lastReset": "2025-03-09T16:46:40.370004337Z"
    }
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
            This response contains GPU statistics and model information for the
            specified miner:
          </div>
          <ul className="list-disc pb-4 pl-5">
            <li>
              <strong>_id</strong>: Unique identifier for the miner record
            </li>
            <li>
              <strong>uid</strong>: Miner&apos;s unique identifier number
            </li>
            <li>
              <strong>last_updated</strong>: Timestamp of the last update
            </li>
            <li>
              <strong>targon-hub-api</strong>: Contains miner&apos;s API
              information
              <ul className="list-disc pl-5 pt-2">
                <li>
                  <strong>miner_cache</strong>: Cached miner information
                  <ul className="list-disc pl-5 pt-2">
                    <li>
                      <strong>models_error</strong>: Any errors related to
                      models (if present)
                    </li>
                    <li>
                      <strong>models</strong>: Dictionary of AI models supported
                      by this miner with their estimated queries per second
                      (QPS)
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>api</strong>: API usage statistics
                  <ul className="list-disc pl-5 pt-2">
                    <li>
                      <strong>completed</strong>: Number of completed requests
                    </li>
                    <li>
                      <strong>completedOverTime</strong>: Array of completed
                      requests over time periods
                    </li>
                    <li>
                      <strong>attempted</strong>: Number of attempted requests
                    </li>
                    <li>
                      <strong>partial</strong>: Number of partial completions
                    </li>
                    <li>
                      <strong>successRateOverTime</strong>: Array of success
                      rates over time periods
                    </li>
                    <li>
                      <strong>avgSuccessRate</strong>: Average success rate of
                      requests
                    </li>
                    <li>
                      <strong>lastReset</strong>: Timestamp of the last
                      statistics reset
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </Container>
      </div>
    </div>
  );
}
