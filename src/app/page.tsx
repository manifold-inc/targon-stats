"use client";

import { useState } from "react";

import { getMinerData } from "./query";

export interface TargonDoc {
  uid: number;
  nodes: string[];
}

export default function HomePage() {
  const [uid, setUid] = useState("");
  const [data, setData] = useState<TargonDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const minerDoc = await getMinerData(uid);
      console.log(minerDoc);
      setData(minerDoc);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>

        <div className="flex w-full items-center justify-center py-4">
          <div className="w-full px-4 sm:w-1/2">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="mb-2 block text-center text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400"
                  htmlFor="uid"
                >
                  Miner UID
                </label>
                <input
                  id="uid"
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-600 disabled:opacity-50 dark:bg-neutral-800 dark:hover:bg-gray-800 sm:w-2/3"
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {data && (
          <div className="mt-8">
            <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-neutral-900">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
