"use client";

import { useState } from "react";
import { LineChart } from "@tremor/react";

interface MinerChartClientProps {
  minerStats: {
    block: number;
    hotkey: string;
    coldkey: string;
    uid: number;
    tps: number;
    time_for_all_tokens: number;
    total_time: number;
    time_to_first_token: number;
  }[];
  query: string;
  valiNames?: string[];
  gpuStats: {
    avg: { h100: number; h200: number };
  };
}

export interface Keys {
  hotkey: string;
  coldkey: string;
}

const MinerChartClient: React.FC<MinerChartClientProps> = ({
  minerStats,
  query,
  valiNames,
  gpuStats,
}) => {
  const cardStyles =
    "flex flex-col flex-grow bg-white dark:bg-neutral-800 p-8 shadow-md rounded-2xl hover:shadow-lg transition-all dark:hover:bg-gray-800 text-center items-center";
  const [visibleCategories, setVisibleCategories] = useState<string[]>([
    "total_time",
    "tps",
    "time_for_all_tokens",
    "time_to_first_token",
  ]);

  const handleCategoryClick = (category: string) => () => {
    setVisibleCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  const categoryColorMap: Record<string, string> = {
    total_time: "red",
    tps: "green",
    time_for_all_tokens: "purple",
    time_to_first_token: "orange",
  };
  const textColor = (category: string, color: string) => {
    return visibleCategories.includes(category)
      ? color
      : "text-gray-400 dark:text-gray-600";
  };

  const displayValiNames =
    valiNames?.length === 0
      ? "All Validators"
      : valiNames!.length > 3
        ? `${valiNames![0]} ... ${valiNames![valiNames!.length - 1]}`
        : valiNames!.join(", ");

  const processedData = minerStats.map((item) => ({
    ...item,
    tps: item.tps ? Number(item.tps.toFixed(2)) : item.tps,
    total_time: item.total_time
      ? Number(item.total_time.toFixed(2))
      : item.total_time,
    time_for_all_tokens: item.time_for_all_tokens
      ? Number(item.time_for_all_tokens.toFixed(2))
      : item.time_for_all_tokens,
    time_to_first_token: item.time_to_first_token
      ? Number(item.time_to_first_token.toFixed(2))
      : item.time_to_first_token,
  }));

  return (
    <>
      {!!minerStats.length && (
        <>
          <dl className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <button
              onClick={handleCategoryClick("total_time")}
              className={cardStyles}
            >
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average Total Time
              </dt>
              <dd
                className={`order-first flex text-3xl font-semibold tracking-tight ${textColor(
                  "total_time",
                  "text-red-500",
                )}`}
              >
                {minerStats
                  ? (
                      minerStats.reduce((s, d) => s + d.total_time, 0) /
                      minerStats.length
                    ).toFixed(2)
                  : "_"}
              </dd>
            </button>

            <button onClick={handleCategoryClick("tps")} className={cardStyles}>
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average Tokens Per Second
              </dt>
              <dd
                className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                  "tps",
                  "text-green-500",
                )}`}
              >
                {minerStats
                  ? (
                      minerStats.reduce((s, d) => s + d.tps, 0) /
                      minerStats.length
                    ).toFixed(2)
                  : "_"}
              </dd>
            </button>

            <button
              onClick={handleCategoryClick("time_for_all_tokens")}
              className={cardStyles}
            >
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average Time For All tokens
              </dt>
              <dd
                className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                  "time_for_all_tokens",
                  "text-purple-500",
                )}`}
              >
                {minerStats
                  ? (
                      minerStats.reduce(
                        (s, d) => s + d.time_for_all_tokens,
                        0,
                      ) / minerStats.length
                    ).toFixed(2)
                  : "_"}
              </dd>
            </button>

            <button
              onClick={handleCategoryClick("time_to_first_token")}
              className={cardStyles}
            >
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average Time To First Token
              </dt>
              <dd
                className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                  "time_to_first_token",
                  "text-orange-500",
                )}`}
              >
                {minerStats
                  ? (
                      minerStats.reduce(
                        (s, d) => s + d.time_to_first_token,
                        0,
                      ) / minerStats.length
                    ).toFixed(2)
                  : "_"}
              </dd>
            </button>

            <div className="flex flex-grow flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-md transition-all dark:bg-neutral-800">
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average H100 GPUs
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-yellow-500">
                {gpuStats.avg.h100}
              </dd>
            </div>

            <div className="flex flex-grow flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-md transition-all dark:bg-neutral-800">
              <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                Average H200 GPUs
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-green-500">
                {gpuStats.avg.h200}
              </dd>
            </div>
          </dl>

          <div className="pt-8">
            <div className="flex w-full flex-grow flex-col items-center rounded-2xl bg-white p-8 text-center shadow-md transition-all hover:shadow-lg dark:bg-neutral-800">
              <h3 className="pb-4 text-center text-2xl font-semibold text-gray-800 dark:text-gray-50">
                Viewing Stats For: {query} on Validator: {displayValiNames}
              </h3>
              <LineChart
                data={processedData}
                index="block"
                xAxisLabel="Block"
                categories={visibleCategories}
                colors={visibleCategories.map(
                  (category) => categoryColorMap[category]!,
                )}
                yAxisWidth={40}
                className="mt-4"
                showLegend={false}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MinerChartClient;
