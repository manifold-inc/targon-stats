"use client";

import { useState } from "react";
import { LineChart } from "@tremor/react";
import moment from "moment";

import { reactClient } from "@/trpc/react";

export default function Page() {
  const { data, isLoading } = reactClient.overview.stats.useQuery();
  const [hiddenCharts, setHiddenCharts] = useState<string[]>([]);

  const cardStyles =
    "flex flex-col flex-grow bg-white dark:bg-neutral-800 p-8 shadow-md rounded-2xl hover:shadow-lg transition-all dark:hover:bg-gray-800 text-center items-center";

  const handleToggle = (chart: string) => {
    setHiddenCharts((prev) =>
      prev.includes(chart)
        ? prev.filter((c) => c !== chart)
        : prev.length < 2
          ? [...prev, chart]
          : [chart],
    );
  };

  const textColor = (chart: string, color: string) => {
    return hiddenCharts.includes(chart)
      ? "text-gray-400 dark:text-gray-600"
      : color;
  };

  const chartVisibility = (chart: string) => {
    if (hiddenCharts.includes(chart)) return "hidden";
    if (hiddenCharts.length === 2) return "w-full";
    if (hiddenCharts.length === 1) return "w-1/2";
    return "w-1/3";
  };

  const formattedData = (data ?? []).map((s) => ({
    day: moment(s.day).format("M/D"),
    wps: s.wps ? s.wps.toFixed(2) : "0.00",
    time_for_all_tokens: s.time_for_all_tokens ? s.time_for_all_tokens.toFixed(2) : "0.00",
    daily_validated_requests_with_responses: s.daily_validated_requests_with_responses ? s.daily_validated_requests_with_responses.toFixed(2) : "0.00",
  }));

  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Metrics
              </h2>
            </div>
            <dl className="mt-12 flex flex-col space-y-4 text-center sm:flex-row sm:justify-between sm:gap-4 sm:space-y-0">
              <button
                className={cardStyles}
                onClick={() => handleToggle("wps")}
              >
                <dt
                  className={`text-sm font-semibold leading-6 ${textColor(
                    "wps",
                    "text-gray-600 dark:text-gray-400",
                  )}`}
                >
                  Latest WPS
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "wps",
                    "text-blue-500",
                  )}`}
                >
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    data && Number(data[data.length - 1]?.wps).toFixed(2)
                  )}
                </dd>
              </button>

              <button
                className={cardStyles}
                onClick={() => handleToggle("time_for_all_tokens")}
              >
                <dt
                  className={`text-sm font-semibold leading-6 ${textColor(
                    "time_for_all_tokens",
                    "text-gray-600 dark:text-gray-400",
                  )}`}
                >
                  Time for All Tokens
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "time_for_all_tokens",
                    "text-pink-500",
                  )}`}
                >
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    data &&
                    Number(data[data.length - 1]?.time_for_all_tokens).toFixed(
                      2,
                    )
                  )}
                </dd>
              </button>

              <button
                className={cardStyles}
                onClick={() =>
                  handleToggle("daily_validated_requests_with_responses")
                }
              >
                <dt
                  className={`text-sm font-semibold leading-6 ${textColor(
                    "daily_validated_requests_with_responses",
                    "text-gray-600 dark:text-gray-400",
                  )}`}
                >
                  Validated Requests
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "daily_validated_requests_with_responses",
                    "text-orange-500",
                  )}`}
                >
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : (
                    data &&
                    Number(
                      data[data.length - 1]
                        ?.daily_validated_requests_with_responses,
                    ).toFixed(2)
                  )}
                </dd>
              </button>
            </dl>
          </div>
          <div className="mt-12 flex min-h-[400px] space-x-4 rounded-2xl bg-white p-8 shadow-md dark:bg-neutral-800">
            <div className={`transition-all ${chartVisibility("wps")}`}>
              <LineChart
                data={formattedData}
                index="day"
                noDataText="Loading..."
                categories={["wps"]}
                xAxisLabel="Time"
                yAxisWidth={40}
                showLegend={false}
                colors={["blue"]}
                className={`h-full w-full`}
              />
            </div>
            <div
              className={`transition-all ${chartVisibility(
                "time_for_all_tokens",
              )}`}
            >
              <LineChart
                data={formattedData}
                index="day"
                noDataText="Loading..."
                categories={["time_for_all_tokens"]}
                xAxisLabel="Time"
                yAxisWidth={40}
                showLegend={false}
                colors={["pink"]}
                className={`h-full w-full`}
              />
            </div>
            <div
              className={`transition-all ${chartVisibility(
                "daily_validated_requests_with_responses",
              )}`}
            >
              <LineChart
                data={formattedData}
                index="day"
                noDataText="Loading..."
                categories={["daily_validated_requests_with_responses"]}
                xAxisLabel="Time"
                yAxisWidth={40}
                showLegend={false}
                colors={["orange"]}
                className={`h-full w-full`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
