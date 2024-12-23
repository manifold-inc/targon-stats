"use client";

import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Copy, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";
import { type Response, type Token } from "./MinerChart";
import TokenDisplay from "./TokenDisplay";

interface ResponseComparisonProps {
  responses: Response[];
}

const ResponseComparison: React.FC<ResponseComparisonProps> = ({
  responses,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(
    null,
  );
  const [showTokenized, setShowTokenized] = useState(true);
  const handleViewDetails = (response: Response) => {
    setSelectedResponse(response);
    setOpen(true);
  };

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  if (responses.length === 0) {
    return <div>No responses found</div>;
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Latest Synthetic Responses
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            A list of 100 latest responses with their details.
          </p>
        </div>
      </div>
      <div className="pt-8">
        <div className="flow-root h-96 overflow-y-auto rounded border border-gray-200 shadow">
          <div className="inline-block min-w-full align-middle">
            <div>
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6"
                    >
                      Hotkey
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Validator
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Verified
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Message
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Response Tokens
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Model
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3  py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Tokens Per Second
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
                      Time To First Token
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3  py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Total Time
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      LogProb
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Seed
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Max N Tokens
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Temperature
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3  py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Endpoint
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
                      NanoID
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Version
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-900 dark:text-gray-200"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="sticky right-0 whitespace-nowrap bg-gray-50 px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:bg-neutral-800 dark:text-gray-200 sm:pr-6"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                  {responses.map((response: Response, index) => (
                    <tr key={response.hotkey + index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6">
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
                        {response.validator}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.verified ? "Yes" : "No"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex items-center justify-between">
                          <span>
                            {(() => {
                              const messageContent = Array.isArray(
                                response.messages,
                              )
                                ? response.messages
                                    .map(
                                      (msg: { content: string }) => msg.content,
                                    )
                                    .join(" ")
                                : response.messages || "N/A";

                              return messageContent.length > 100
                                ? messageContent.substring(46, 100) +
                                    "..." +
                                    messageContent.substring(
                                      messageContent.length - 50,
                                    )
                                : messageContent;
                            })()}
                          </span>
                          <button
                            className="ml-2 cursor-pointer"
                            onClick={() =>
                              handleCopyClipboard(
                                response.messages
                                  ? JSON.stringify(response.messages)
                                  : response.messages || "N/A",
                              )
                            }
                          >
                            <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex items-center justify-between">
                          <span>
                            {`[${response.tokens
                              .slice(0, 10)
                              .map((token: Token) => `"${token.text}"`)
                              .join(
                                ", ",
                              )}${response.tokens.length > 10 ? ", ..." : ""}]`}
                          </span>
                          <button
                            className="ml-2 cursor-pointer"
                            onClick={() =>
                              handleCopyClipboard(
                                JSON.stringify(response.tokens),
                              )
                            }
                          >
                            <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.model}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.tps.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.time_for_all_tokens.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.time_to_first_token.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.total_time.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {"(" +
                          response.tokens
                            .slice(0, 10)
                            .map((token: Token) => token.logprob.toFixed(2))
                            .join(", ") +
                          ")"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.seed}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.max_tokens}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.temperature.toFixed(4)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.request_endpoint}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.error
                          ? response.error.substring(0, 15) +
                            "..." +
                            response.error.substring(
                              response.error.length - 15,
                              response.error.length,
                            )
                          : "No Error"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.cause ? response.cause : "No Cause"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.r_nanoid}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {response.version}
                      </td>
                      <td className="py-4 whitespace-nowrap px-3 text-sm text-gray-500 dark:text-gray-300">
                        {response.timestamp.toISOString()}
                      </td>
                      <td className="sticky right-0 whitespace-nowrap bg-white px-3 py-4 text-right text-sm font-medium dark:bg-neutral-800 sm:pr-6">
                        <button
                          onClick={() => handleViewDetails(response)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-200 dark:hover:text-indigo-100"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedResponse && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          className="relative z-50"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-neutral-800"
          />
          <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto">
            <div className="flex h-4/5 w-4/5 items-center justify-center p-6 text-center sm:p-0">
              <DialogPanel
                transition
                className="relative h-full w-full transform overflow-auto rounded-lg bg-white p-10 text-left shadow-xl transition-all dark:bg-neutral-900"
              >
                <div className="px-4 sm:px-0">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                      Response Details on {selectedResponse.validator} Validator
                    </h3>
                    <button onClick={() => setOpen(false)}>
                      <X className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                    </button>
                  </div>
                  <p className="mt-1 max-w-2xl text-lg leading-6 text-gray-500">
                    Validator Version: {selectedResponse.version}
                  </p>
                  <p className="mt-1 max-w-2xl text-lg leading-6 text-gray-500">
                    Detailed {selectedResponse.hotkey.substring(0, 5) + "..."}{" "}
                    Response View
                  </p>
                </div>
                <div className="pt-4">
                  <dl className="grid grid-cols-4">
                    {[
                      [
                        "Hotkey",
                        selectedResponse.hotkey.substring(0, 5) +
                          "..." +
                          selectedResponse.hotkey.substring(
                            selectedResponse.hotkey.length - 5,
                            selectedResponse.hotkey.length,
                          ),
                      ],
                      ["Tokens Per Second", selectedResponse.tps.toFixed(2)],
                      [
                        "Time For All Tokens",
                        selectedResponse.time_for_all_tokens.toFixed(2),
                      ],
                      ["Total Time", selectedResponse.total_time.toFixed(2)],
                      [
                        "Time To First Token",
                        selectedResponse.time_to_first_token.toFixed(2),
                      ],
                      ["Seed", selectedResponse.seed],
                      ["Temperature", selectedResponse.temperature.toFixed(4)],
                      ["Max N Tokens", selectedResponse.max_tokens],
                      ["Verified", selectedResponse.verified ? "Yes" : "No"],
                      ["Endpoint", selectedResponse.request_endpoint],
                      ["Model", selectedResponse.model],
                      ["", ""],
                    ].map(([label, value], index) => (
                      <div
                        key={index}
                        className="border-t border-gray-300 p-4 sm:col-span-1 sm:px-0"
                      >
                        <dt className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                          {label}
                        </dt>
                        <dd className="mt-1 flex justify-between pr-10 text-sm leading-6 text-gray-500 dark:text-gray-400">
                          {value}
                          {label === "Hotkey" && (
                            <button
                              className="ml-2 cursor-pointer"
                              onClick={() =>
                                handleCopyClipboard(selectedResponse.hotkey)
                              }
                            >
                              <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                            </button>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="border-t border-gray-300 p-4 sm:col-span-2 sm:px-0">
                  <dt className="flex justify-between pb-2 pr-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    Validator NanoID
                    <button
                      className="ml-2 cursor-pointer"
                      onClick={() =>
                        handleCopyClipboard(
                          JSON.stringify(selectedResponse.r_nanoid),
                        )
                      }
                    >
                      <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </button>
                  </dt>
                  <pre className="max-w-full overflow-auto">
                    <code className="inline-block items-center space-x-4 break-words text-left text-sm text-gray-700 dark:text-gray-400">
                      {selectedResponse.r_nanoid}
                    </code>
                  </pre>
                </div>
                <div className="border-t border-gray-300 p-4 sm:col-span-2 sm:px-0">
                  <dt className="flex justify-between pb-2 pr-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    Validator Request
                    <button
                      className="ml-2 cursor-pointer"
                      onClick={() =>
                        handleCopyClipboard(
                          JSON.stringify(selectedResponse.messages),
                        )
                      }
                    >
                      <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </button>
                  </dt>
                  <pre className="max-w-full overflow-auto">
                    <code className="inline-block items-center space-x-4 break-words text-left text-sm text-gray-700 dark:text-gray-400">
                      {JSON.stringify(selectedResponse.messages)}
                    </code>
                  </pre>
                </div>
                <div className="border-t border-gray-300 p-4 sm:col-span-2 sm:px-0">
                  <dt className="flex justify-between pb-2 pr-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    Validator Error
                    <button
                      className="ml-2 cursor-pointer"
                      onClick={() =>
                        handleCopyClipboard(
                          JSON.stringify(selectedResponse.error),
                        )
                      }
                    >
                      <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </button>
                  </dt>
                  <pre className="max-w-full overflow-auto">
                    <code className="inline-block items-center space-x-4 break-words text-left text-sm text-gray-700 dark:text-gray-400">
                      {selectedResponse.error
                        ? JSON.stringify(selectedResponse.error)
                        : selectedResponse.error || "No Error"}
                    </code>
                  </pre>
                </div>
                <div className="border-t border-gray-300 p-4 sm:col-span-2 sm:px-0">
                  <dt className="flex justify-between pb-2 pr-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    Validator Error Cause
                    <button
                      className="ml-2 cursor-pointer"
                      onClick={() =>
                        handleCopyClipboard(
                          JSON.stringify(selectedResponse.cause),
                        )
                      }
                    >
                      <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </button>
                  </dt>
                  <pre className="max-w-full overflow-auto">
                    <code className="inline-block items-center space-x-4 break-words text-left text-sm text-gray-700 dark:text-gray-400">
                      {selectedResponse.cause
                        ? JSON.stringify(selectedResponse.cause)
                        : selectedResponse.cause || "No Cause"}
                    </code>
                  </pre>
                </div>
                <div className="border-t border-gray-300 p-4 sm:col-span-2 sm:px-0">
                  <dt className="flex items-center justify-between pb-2 pr-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className="inline-block w-40">
                        {showTokenized
                          ? "Tokenized Response"
                          : "String Response"}
                      </span>
                      <div
                        onClick={() => setShowTokenized(!showTokenized)}
                        className="ml-2 cursor-pointer"
                      >
                        <Pencil
                          size={18}
                          className={
                            showTokenized
                              ? "text-gray-800 dark:text-gray-400"
                              : "text-black dark:text-white"
                          }
                        />
                      </div>
                    </div>
                    <button
                      className="cursor-pointer"
                      onClick={() =>
                        handleCopyClipboard(
                          showTokenized
                            ? JSON.stringify(selectedResponse.tokens)
                            : selectedResponse.tokens
                                .map((token: Token) => token.text)
                                .join(""),
                        )
                      }
                    >
                      <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                    </button>
                  </dt>
                  <dd className="mt-1 font-mono text-sm leading-6 text-gray-700 dark:text-gray-400">
                    <TokenDisplay
                      tokens={selectedResponse.tokens}
                      showTokenized={showTokenized}
                    />
                  </dd>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
export default ResponseComparison;
