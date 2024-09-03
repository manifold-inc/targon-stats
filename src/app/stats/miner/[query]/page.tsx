import { Suspense } from "react";

import { bitsToNames } from "@/utils/validatorMap";
import MinerInputForm from "../MinerInputForm";
import MinerChart from "./MinerChart";

export default function Page({
  params,
  searchParams,
}: {
  params: { query: string };
  searchParams: { block?: string; validators?: string };
}) {
  const block = searchParams.block ?? "360";
  console.log("Validators binary:", searchParams.validators);

  const validatorsBinary = searchParams.validators ?? "";
  console.log("validatorsBinary:", validatorsBinary);
  const validatorsNumber = parseInt(validatorsBinary, 2);
  console.log("Validators as number:", validatorsNumber);

  console.log("Calling bitsToNames with:", validatorsNumber);
  const valiNames = bitsToNames(validatorsNumber);
  console.log("Validator names:", valiNames);

  return (
    <div className="mx-auto max-w-7xl px-12 pb-12">
      <div className="py-24 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="items-center justify-center text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                Targon Miner Status
              </h2>
              <MinerInputForm
                initialQuery={params.query}
                initialBlock={block}
              />
              {params.query && (
                <Suspense fallback="Loading data...">
                  <MinerChart
                    query={params.query}
                    block={parseInt(block)}
                    valiNames={valiNames}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
