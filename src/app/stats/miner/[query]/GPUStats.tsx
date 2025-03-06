"use client";

interface GPUStatsProps {
  gpuStats: {
    avg: { h100: number; h200: number };
    validators: Array<{
      name: string;
      gpus: { h100: number; h200: number };
      models: string[];
    }>;
  };
}

const GPUStats: React.FC<GPUStatsProps> = ({ gpuStats }) => {
  if (gpuStats.validators.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded border border-gray-200 shadow">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No GPU stats found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
            GPU Stats by Validator
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            A list of GPU counts and supported models reported by each validator
            for this miner.
          </p>
        </div>
      </div>
      <div className="pt-8">
        <div className="flow-root h-96 overflow-y-auto rounded border border-gray-200 shadow">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th
                    scope="col"
                    className="w-[15%] whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Validator
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] whitespace-nowrap px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    H100 GPUs
                  </th>
                  <th
                    scope="col"
                    className="w-[10%] whitespace-nowrap px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    H200 GPUs
                  </th>
                  <th
                    scope="col"
                    className="w-[65%] px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
                  >
                    Supported Models
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-800">
                {gpuStats.validators.map((validator) => (
                  <tr key={validator.name}>
                    <td className="whitespace-nowrap px-3 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-200">
                      {validator.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      {validator.gpus.h100}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      {validator.gpus.h200}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex flex-wrap gap-1.5">
                        {validator.models?.map((model) => (
                          <span
                            key={model}
                            className="inline-flex items-center rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
                          >
                            {model}
                          </span>
                        )) || (
                          <span className="text-gray-400 dark:text-gray-500">
                            No models reported
                          </span>
                        )}
                      </div>
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

export default GPUStats;
