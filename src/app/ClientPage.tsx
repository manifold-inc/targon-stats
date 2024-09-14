"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, Label, Switch } from "@headlessui/react";
import { LineChart } from "@tremor/react";
import moment from "moment";

interface ClientPageProps {
  data: {
    minute: number;
    avg_tps: number;
    avg_time_to_first_token: number;
    avg_time_for_all_tokens: number;
    avg_total_time: number;
    valiName: string | null;
  }[];
  initialVerified: boolean;
  initialValidators: string[];
}

const ClientPage = ({
  data,
  initialVerified,
  initialValidators: valiNames,
}: ClientPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardStyles =
    "flex flex-col flex-grow bg-white dark:bg-neutral-800 p-8 shadow-md rounded-2xl hover:shadow-lg transition-all dark:hover:bg-gray-800 items-center text-center justify-center";
  const [verified, setVerified] = useState(initialVerified);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (verified) {
      newSearchParams.set("verified", "true");
    } else {
      newSearchParams.delete("verified");
    }
    router.push(`?${newSearchParams.toString()}`);
  }, [verified, router, searchParams]);

  const [visibleCategories, setVisibleCategories] = useState<string[]>([
    "avg_wps",
    "avg_total_time",
    "avg_time_to_first_token",
    "avg_time_for_all_tokens",
  ]);
  const processedData = data
    ? data.map((item) => ({
        ...item,
        avg_tps: item.avg_tps ? Number(item.avg_tps.toFixed(2)) : item.avg_tps,
        avg_total_time: item.avg_total_time
          ? Number(item.avg_total_time.toFixed(2))
          : item.avg_total_time,
        avg_time_to_first_token: item.avg_time_to_first_token
          ? Number(item.avg_time_to_first_token.toFixed(2))
          : item.avg_time_to_first_token,
        avg_time_for_all_tokens: item.avg_time_for_all_tokens
          ? Number(item.avg_time_for_all_tokens.toFixed(2))
          : item.avg_time_for_all_tokens,
      }))
    : []; // Return an empty array if data is undefined


  const handleCategoryClick = (category: string) => () => {
    setVisibleCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category],
    );
  };

  const categoryColorMap: Record<string, string> = {
    avg_tps: "red",
    avg_total_time: "green",
    avg_time_to_first_token: "purple",
    avg_time_for_all_tokens: "orange",
  };
  const textColor = (category: string, color: string) => {
    return visibleCategories.includes(category)
      ? color
      : "text-gray-400 dark:text-gray-600";
  };
  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Validator Status
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Your hub for validator stats!
              </p>
            </div>
            <dl className="mt-16 flex justify-between gap-4 text-center">
              <button
                onClick={handleCategoryClick("avg_tps")}
                className={cardStyles}
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                  Peak Tokens Per Second
                </dt>
                <dd
                  className={`order-first text-center text-3xl font-semibold tracking-tight ${textColor(
                    "avg_wps",
                    "text-red-500",
                  )}`}
                >
                  {data
                    ? Math.max(...data.map((d) => d.avg_tps)).toFixed(0)
                    : "_"}
                </dd>
              </button>

              <button
                onClick={handleCategoryClick("avg_total_time")}
                className={cardStyles}
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                  Min Total Time
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "avg_total_time",
                    "text-green-500",
                  )}`}
                >
                  {data
                    ? Math.min(...data.map((d) => d.avg_total_time)).toFixed(
                        2,
                      ) + "s"
                    : "_"}
                </dd>
              </button>

              <button
                onClick={handleCategoryClick("avg_time_to_first_token")}
                className={cardStyles}
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                  Avg Time to First Token
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "avg_time_to_first_token",
                    "text-purple-500",
                  )}`}
                >
                  {data
                    ? Math.min(
                        ...data.map((d) => d.avg_time_to_first_token),
                      ).toFixed(2) + "s"
                    : "_"}
                </dd>
              </button>

              <button
                onClick={handleCategoryClick("avg_time_for_all_tokens")}
                className={cardStyles}
              >
                <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                  Avg Time for All Tokens
                </dt>
                <dd
                  className={`order-first text-3xl font-semibold tracking-tight ${textColor(
                    "avg_time_for_all_tokens",
                    "text-orange-500",
                  )}`}
                >
                  {data
                    ? Math.min(...data.map((d) => d.avg_time_for_all_tokens)).toFixed(2) + "s"
                    : "_"}
                </dd>
              </button>
            </dl>
          </div>
          <div className="pt-8">
            <div
              className={`flex w-full flex-1 flex-col rounded-2xl bg-white p-8 shadow-md dark:bg-neutral-800 sm:w-full`}
            >
              <h3 className="pb-4 text-center text-2xl font-semibold text-gray-800 dark:text-gray-50">
                Avg Stats of Last 2 Hours on{" "}
                {valiNames.length === 0
                  ? " All Validators"
                  : valiNames.length > 3
                    ? `${valiNames[0]}, ... , ${valiNames[valiNames.length - 1]}`
                    : valiNames.join(", ")}
              </h3>
              <LineChart
                data={(processedData ?? []).map((s) => ({
                  ...s,
                  minute: moment(s.minute).format("LT"),
                }))}
                index="minute"
                noDataText="Loading..."
                xAxisLabel="Time"
                categories={visibleCategories}
                colors={visibleCategories.map(
                  (category) => categoryColorMap[category]!,
                )}
                yAxisWidth={40}
                showLegend={false}
              />
              <div className="flex flex-wrap items-center justify-end gap-3 pb-2 pt-4">
                <Field className="flex items-center py-2">
                  <Switch
                    checked={verified}
                    onChange={setVerified}
                    className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 data-[checked]:bg-blue-600"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                    />
                  </Switch>
                  <Label as="span" className="ml-3 text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-50">
                      Verified Only
                    </span>
                  </Label>
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientPage;
