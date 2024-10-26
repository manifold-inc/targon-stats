"use client";

import { useState } from "react";
import { LineChart } from "@tremor/react";

interface ClientPageProps {
  data: {
    date: Date;
    avgTimeToFirstToken: number;
    avgTimeForAllTokens: number;
    avgTotalTime: number;
    avgTPS: number;
    totalTokens: number;
  }[];
}

export default function ClientPage({ data }: ClientPageProps) {
  const [hiddenCharts, setHiddenCharts] = useState<string[]>([]);

  const cardStyles =
    "flex flex-col flex-grow bg-white dark:bg-neutral-800 p-8 shadow-md rounded-2xl hover:shadow-lg transition-all dark:hover:bg-gray-800 text-center items-center";

  const handleToggle = (chart: string) => {
    setHiddenCharts((prev) => {
      if (prev.includes(chart)) {
        return prev.filter((c) => c !== chart);
      } else {
        const newHidden = [...prev, chart];
        return newHidden.length < 5 ? newHidden : prev;
      }
    });
  };

  const textColor = (chart: string, color: string) => {
    return hiddenCharts.includes(chart)
      ? "text-gray-400 dark:text-gray-600"
      : color;
  };

  const chartVisibility = (chart: string) => {
    if (hiddenCharts.includes(chart)) return "hidden";
    const visibleCharts = 5 - hiddenCharts.length;
    if (visibleCharts <= 2) return "w-full";
    return "w-1/2";
  };

  const formattedData = (data ?? []).map((s) => ({
    ...s,
    date: s.date.toISOString().slice(5, 10).replace("-", "/"),
  }));

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toFixed(0);
  };

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
            <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  key: "ttft",
                  label: "AVG TTFT",
                  value: "avgTimeToFirstToken",
                  color: "blue",
                },
                {
                  key: "tfat",
                  label: "AVG TFAT",
                  value: "avgTimeForAllTokens",
                  color: "pink",
                },
                {
                  key: "totalTime",
                  label: "AVG Total Time",
                  value: "avgTotalTime",
                  color: "orange",
                },
                {
                  key: "tps",
                  label: "AVG Tokens Per Second",
                  value: "avgTPS",
                  color: "yellow",
                },
                {
                  key: "totalTokens",
                  label: "Total Tokens",
                  value: "totalTokens",
                  color: "cyan",
                },
              ].map(({ key, label, value, color }) => (
                <button
                  key={key}
                  className={cardStyles}
                  onClick={() => handleToggle(key)}
                >
                  <dt
                    className={`text-sm font-semibold leading-6 ${textColor(key, "text-gray-600 dark:text-gray-400")}`}
                  >
                    Latest {label}
                  </dt>
                  <dd
                    className={`order-first text-3xl font-semibold tracking-tight ${textColor(key, `text-${color}-500`)}`}
                  >
                    {data &&
                      (value === "totalTokens"
                        ? formatNumber(
                            Number(
                              data[data.length - 1]?.[
                                value as keyof (typeof data)[0]
                              ],
                            ),
                          )
                        : Number(
                            data[data.length - 1]?.[
                              value as keyof (typeof data)[0]
                            ],
                          ).toFixed(2))}
                  </dd>
                </button>
              ))}
            </dl>
          </div>
          <div className="mt-12 flex min-h-[400px] flex-wrap space-y-4 rounded-2xl bg-white p-8 shadow-md dark:bg-neutral-800">
            {[
              {
                key: "ttft",
                label: "Time to First Token",
                color: "blue",
                dataKey: "avgTimeToFirstToken",
              },
              {
                key: "tfat",
                label: "Time for All Tokens",
                color: "pink",
                dataKey: "avgTimeForAllTokens",
              },
              {
                key: "totalTime",
                label: "Total Time",
                color: "orange",
                dataKey: "avgTotalTime",
              },
              {
                key: "tps",
                label: "Tokens Per Second",
                color: "yellow",
                dataKey: "avgTPS",
              },
              {
                key: "totalTokens",
                label: "Total Tokens",
                color: "cyan",
                dataKey: "totalTokens",
                valueFormatter: (value: number) => formatNumber(value),
              },
            ].map(({ key, label, color, dataKey, valueFormatter }, index) => (
              <div
                key={key}
                className={`transition-all ${chartVisibility(key)} mb-4 px-2 ${
                  index === 4 && 5 - hiddenCharts.length === 5
                    ? "w-full px-0"
                    : ""
                }`}
              >
                <LineChart
                  data={formattedData}
                  index="date"
                  noDataText="Loading..."
                  categories={[dataKey]}
                  xAxisLabel="Date"
                  yAxisWidth={60}
                  showLegend={false}
                  colors={[color]}
                  valueFormatter={valueFormatter}
                />
                <p className="mt-2 text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
