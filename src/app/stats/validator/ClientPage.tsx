"use client";

import { useState } from "react";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { Copy, Search, X } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";

interface ClientPageProps {
  data: {
    hotkey: string;
    valiName: string | null;
    models: string[];
    requestCount: string | null;
    scores: Record<string, number | number[] | null>;
    lastUpdated: Date;
  }[];
}

const ClientPage = ({ data }: ClientPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [validatorFilter, setValidatorFilter] = useState<string>("all");
  const [selectedScores, setSelectedScores] = useState<Record<
    string,
    number | number[] | null
  > | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<{
    hotkey: string;
    valiName: string | null;
    lastUpdated: Date;
  } | null>(null);
  const [uidFilter, setUidFilter] = useState<string>("");

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  const openScoresModal = (
    scores: Record<string, number | number[] | null>,
    validator: { hotkey: string; valiName: string | null; lastUpdated: Date },
  ) => {
    setSelectedScores(scores);
    setSelectedValidator(validator);
    setUidFilter(""); // Reset UID filter when opening modal
  };

  const closeScoresModal = () => {
    setSelectedScores(null);
    setSelectedValidator(null);
    setUidFilter("");
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
                          {Object.keys(vali.scores || {}).length > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="rounded bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
                                onClick={() =>
                                  openScoresModal(vali.scores, {
                                    hotkey: vali.hotkey,
                                    valiName: vali.valiName,
                                    lastUpdated: vali.lastUpdated,
                                  })
                                }
                              >
                                View Scores
                              </button>
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

      {/* Scores Modal */}
      {selectedScores && selectedValidator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-neutral-800">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-neutral-800">
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Validator Scores
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedValidator.valiName || "Unnamed Validator"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      (
                      {selectedValidator.hotkey.substring(0, 4) +
                        "..." +
                        selectedValidator.hotkey.substring(
                          selectedValidator.hotkey.length - 4,
                        )}
                      )
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleCopyClipboard(JSON.stringify(selectedScores))
                    }
                    className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
                  >
                    <Copy className="h-4 w-4" /> Copy All Scores
                  </button>
                  <button
                    onClick={closeScoresModal}
                    className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-neutral-700 dark:hover:text-gray-100"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-100 px-6 py-2 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last Updated:{" "}
                    {new Date(selectedValidator.lastUpdated).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      },
                    )}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* UID Filter Input */}
                    <div className="relative z-20 w-64">
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Filter by UID..."
                          value={uidFilter}
                          onChange={(e) => setUidFilter(e.target.value)}
                          className="w-full rounded border border-gray-200 bg-white py-1.5 pl-3 pr-3 text-xs text-gray-700 shadow-sm dark:border-gray-600 dark:bg-neutral-700 dark:text-gray-200"
                        />
                        {uidFilter && (
                          <button
                            onClick={() => setUidFilter("")}
                            className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="h-[calc(90vh-130px)] overflow-y-auto p-6 pt-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-800">
                      <tr>
                        <th className="w-1/6 px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          UID
                        </th>
                        <th className="w-4/6 px-6 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Scores
                        </th>
                        <th className="w-1/6 px-6 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                      {Object.entries(selectedScores || {})
                        .filter(([key]) => {
                          // Apply UID filter if set
                          if (uidFilter.trim() !== "") {
                            return key === uidFilter.trim();
                          }

                          return true;
                        })
                        .map(([key, value], _index) => {
                          // Use the value directly
                          const displayValue: number | number[] | null = value;

                          return (
                            <tr
                              key={key}
                              className="border-b border-gray-200 dark:border-gray-700"
                            >
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                                {key}
                              </td>
                              <td className="px-6 py-4">
                                {typeof displayValue === "number" ? (
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                      {displayValue.toFixed(4)}
                                    </span>
                                  </div>
                                ) : Array.isArray(displayValue) ? (
                                  <div className="max-w-full">
                                    <div className="mb-2 flex items-center">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {
                                          displayValue.filter((v) => v !== null)
                                            .length
                                        }{" "}
                                        values,{" "}
                                        {
                                          displayValue.filter((v) => v === null)
                                            .length
                                        }{" "}
                                        nulls
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {displayValue.map((v, i) => (
                                        <span
                                          key={i}
                                          className={`inline-block rounded px-1.5 py-0.5 text-xs ${
                                            v === null
                                              ? "bg-gray-100 text-gray-400 dark:bg-neutral-700 dark:text-gray-500"
                                              : "bg-gray-200 text-gray-700 dark:bg-neutral-600 dark:text-gray-300"
                                          }`}
                                        >
                                          {v === null ? "null" : v.toFixed(2)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ) : displayValue === null ? (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    null
                                  </span>
                                ) : (
                                  <pre className="max-w-full overflow-hidden rounded bg-white p-3 font-mono text-xs text-gray-700 dark:bg-neutral-800 dark:text-gray-300">
                                    <code className="whitespace-pre-wrap break-all">
                                      {JSON.stringify(displayValue, null, 2)}
                                    </code>
                                  </pre>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() =>
                                    handleCopyClipboard(
                                      JSON.stringify({ [key]: displayValue }),
                                    )
                                  }
                                  className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
                                  title="Copy this row's data"
                                >
                                  <Copy className="h-3 w-3" /> Copy UID Scores
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPage;
