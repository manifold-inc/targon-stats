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
          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            GPU Nodes By Miner
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/gpu/miner
            </div>
          </div>
          <div className="pb-4">
            Retrieves gpu nodes for a specific miner, identified by their UID.
          </div>

          <h4 className="pb-2 text-xl font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Example Request
          </h4>
          <div className="overflow-x-scroll pb-4">
            <div className="w-fit whitespace-nowrap rounded bg-gray-200 px-2 py-2 font-mono text-sm leading-3 dark:bg-neutral-900">
              POST {API_BASE_URL}/stats/nodes/miner
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
        </Container>
      </div>
    </div>
  );
}
