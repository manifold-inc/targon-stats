"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MinerInputFormProps {
  initialQuery?: string;
}

const MinerInputForm: React.FC<MinerInputFormProps> = ({
  initialQuery = "",
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/stats/miner/${query}`);
  };

  return (
    <>
      <div className="flex w-full items-center justify-center py-4">
        <div className="w-full px-4 sm:w-1/2">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400"
                htmlFor="query"
              >
                Hotkey / Coldkey / UID
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="mt-4 w-full rounded bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-600 dark:bg-neutral-800 dark:hover:bg-gray-800 sm:w-2/3"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MinerInputForm;
