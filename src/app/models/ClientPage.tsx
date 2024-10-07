"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";

interface ClientPageProps {
  data: { hotkey: string; valiName: string | null; models: string[] }[];
}

const ClientPage = ({ data }: ClientPageProps) => {
  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Models
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Models being used as Challenges
              </p>
            </div>
            <div className="flow-root max-h-[700px] overflow-y-auto rounded border border-gray-200 shadow">
              <div className="w-full align-middle">
                <table className="w-full divide-y divide-gray-300 pt-8 dark:divide-gray-700">
                  <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th
                        scope="col"
                        className="w-1/6 whitespace-nowrap px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Hotkey
                      </th>
                      <th
                        scope="col"
                        className="w-1/6 whitespace-nowrap px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Validator
                      </th>
                      <th
                        scope="col"
                        className="w-1/3 whitespace-nowrap px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                      >
                        Models
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                    {data.map((valiModel, index) => (
                      <tr key={valiModel.hotkey + index}>
                        <td className="w-1/6 whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                          <div className="flex items-center justify-between font-mono">
                            <span>
                              {valiModel.hotkey.substring(0, 4) +
                                "..." +
                                valiModel.hotkey.substring(
                                  valiModel.hotkey.length - 4,
                                  valiModel.hotkey.length,
                                )}
                            </span>
                            <button
                              className="ml-2 cursor-pointer"
                              onClick={() =>
                                handleCopyClipboard(valiModel.hotkey)
                              }
                            >
                              <Copy className="z-10 h-4 w-4 text-gray-500 dark:text-gray-300" />
                            </button>
                          </div>
                        </td>
                        <td className="w-1/6 whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {valiModel.valiName}
                        </td>
                        <td className="max-w-[40%] px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="break-words">
                            {valiModel.models.length > 0
                              ? valiModel.models.join(", ")
                              : "-- no models are being used as challenges by this validator. Potential WC"}
                          </div>
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
