"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";
import { type OrganicResponse } from "./MinerChart";

interface OrganicResponseComparisonProps {
  responses: OrganicResponse[];
}

const OrganicResponseComparison: React.FC<OrganicResponseComparisonProps> = ({
  responses,
}) => {
  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  if (responses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded border border-gray-200 shadow">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No organic responses found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Latest Organic Responses
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            A list of 100 latest organic responses with their details.
          </p>
        </div>
      </div>
      <div className="pt-8">
        <div className="flow-root h-96 overflow-y-auto rounded border border-gray-200 shadow">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Hotkey
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Model
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Total Tokens
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    TPS
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Time For All Tokens
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Total Time
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Time To First Token
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Error
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Cause
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                {responses.map((response, index) => (
                  <tr key={response.hotkey + index}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex items-center justify-between font-mono">
                        <span>
                          {response.hotkey.substring(0, 4) +
                            "..." +
                            response.hotkey.substring(
                              response.hotkey.length - 4,
                              response.hotkey.length,
                            )}
                        </span>
                        <button
                          className="ml-2 cursor-pointer"
                          onClick={() => handleCopyClipboard(response.hotkey)}
                        >
                          <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.model}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.total_tokens}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.tps.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.time_for_all_tokens.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.total_time.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.time_to_first_token.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.error || "No Error"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {response.cause || "No Cause"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(response.created_at).toISOString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganicResponseComparison;
