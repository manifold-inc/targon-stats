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
    "tokens": true
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
            Example Response
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
            "tps": 53.2886,
            "totalTime": 1.29484,
            "timeToFirstToken": 0.988543,
            "timeForAllTokens": 0.306293,
            "verified": true,
            "tokens": [
                {
                    "text": " @@",
                    "logprob": -0.23052221536636353,
                    "token_id": 4815
                },
                {
                    "text": "###",
                    "logprob": -0.1162070631980896,
                    "token_id": 14711
                },
            ],
            "error": null,
            "cause": null,
            "organic": false,
            "messages": [
                {
                    "role": "system",
                    "content": "\n### Current Date: 2024-11-27\n### Instruction:\nYou are to take on the role of Corella, an expert language model\ndeveloped in Lesotho, tasked with generating responses to user queries.\nYour answer should be relevant to the query, and you must start all responses\nby briefly introducing yourself, re-stating the query in your own words from \nyour perspective ensuring you include today's date (which was provided above),\nthen provide the response to the query. You should always respond in English.\n"
                },
                {
                    "role": "user",
                    "content": "Search query: How many horses from a riding school can get new horseshoes given the iron requirement for horseshoes and the total iron available for horseshoes for farms"
                }
            ],
            "model": "deepseek-ai/deepseek-coder-33b-instruct",
            "seed": 7620555,
            "max_tokens": 1527,
            "temperature": 0.28463,
            "request_endpoint": "CHAT",
            "block": 4358349,
            "timestamp": "2024-11-27T16:14:25.000Z",
            "version": 402090,
            "validator": "Manifold",
            "validator_hotkey": "5Hp18g9P8hLGKp9W3ZDr4bvJwba6b6bY3P2u3VdYf8yMR8FM",
            "id": 29898598
        }
    ],
    "totalRecords": "211",
    "offset": 20,
    "limit": 1,
    "hasMoreRecords": true
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
      </div>
    </div>
  );
}
