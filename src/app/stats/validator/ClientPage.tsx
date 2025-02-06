"use client";

import { useState } from "react";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { Copy, Search } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";

interface ClientPageProps {
  data: {
    hotkey: string;
    valiName: string | null;
    models: string[];
    requestCount: string | null;
    scores: Record<string, number>;
    lastUpdated: Date;
  }[];
}

const ClientPage = ({ data }: ClientPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [validatorFilter, setValidatorFilter] = useState<string>("all");

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  const filteredData = data.filter((vali) => {
    const matchesSearch =
      vali.valiName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vali.hotkey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vali.models.some((model) =>
        model.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const isLive = vali.models.length > 0 && vali.requestCount !== "0";

    if (validatorFilter === "live") return matchesSearch && isLive;
    return matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Validator Stats
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Request Count Per Validator
              </p>
            </div>
            <div className="relative flex items-center space-x-4 py-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by validator, hotkey, or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded border border-gray-200 bg-white pl-10 pr-4 text-gray-600 placeholder-gray-400 shadow focus:border-gray-300 focus:outline-none focus:ring-0 dark:border-white dark:bg-neutral-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-white"
                />
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-white" />
              </div>
              <TabGroup className="w-1/3">
                <TabList className="flex h-10 rounded border border-gray-200 bg-white shadow dark:border-white dark:bg-neutral-800">
                  {["All", "Live"].map((category) => (
                    <Tab
                      key={category}
                      onClick={() => setValidatorFilter(category.toLowerCase())}
                      className={({ selected }) =>
                        `flex h-full flex-1 items-center justify-center rounded text-sm font-medium leading-5 text-gray-600 focus:outline-none dark:text-white
                        ${
                          selected
                            ? "bg-gray-100 dark:bg-neutral-700"
                            : "hover:bg-gray-200 dark:hover:bg-neutral-500"
                        }`
                      }
                    >
                      {category}
                    </Tab>
                  ))}
                </TabList>
              </TabGroup>
            </div>
            <div className="flow-root max-h-[700px] overflow-y-auto rounded border border-gray-200 shadow">
              <div className="w-full align-middle">
                <table className="w-full divide-y divide-gray-300 pt-8 dark:divide-gray-700">
                  <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Hotkey
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Validator
                      </th>
                      <th
                        scope="col"
                        className="w-1/4 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Models
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Request Count Today
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Scores
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                    {filteredData.map((vali, index) => (
                      <tr key={vali.hotkey + index}>
                        <td className="w-1/6 px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                          <div className="flex items-center gap-4 font-mono">
                            <span>
                              {vali.hotkey.substring(0, 4) +
                                "..." +
                                vali.hotkey.substring(
                                  vali.hotkey.length - 4,
                                  vali.hotkey.length,
                                )}
                            </span>
                            <button
                              className=" cursor-pointer"
                              onClick={() => handleCopyClipboard(vali.hotkey)}
                            >
                              <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                            </button>
                          </div>
                        </td>
                        <td className="w-1/6 px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center space-x-2">
                            <span>{vali.valiName}</span>
                          </div>
                        </td>
                        <td className="w-1/4 px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="break-words">
                            {vali.models.length > 0 ? (
                              <ul className="list-inside list-disc">
                                {vali.models.sort().map((model, index) => (
                                  <li key={index}>{model}</li>
                                ))}
                              </ul>
                            ) : (
                              "No Models are being used as Challenges"
                            )}
                          </div>
                        </td>
                        <td className="w-1/6 px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {vali.requestCount === "0"
                            ? "No Requests"
                            : vali.requestCount}
                        </td>
                        <td className="w-1/6 px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {vali.scores ? (
                            <div className="flex items-center gap-2">
                              <span>View Scores</span>
                              <button
                                className="cursor-pointer"
                                onClick={() =>
                                  handleCopyClipboard(
                                    JSON.stringify(vali.scores),
                                  )
                                }
                              >
                                <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                              </button>
                            </div>
                          ) : (
                            <span>No Scores</span>
                          )}
                        </td>
                        <td className="w-1/6 whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {new Date(vali.lastUpdated).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
