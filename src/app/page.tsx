"use client";

import { useState } from "react";

import BidTable from "@/app/_components/BidTable";
import MinerTable from "@/app/_components/MinerTable";
import Search from "@/app/_components/Search";
import ToggleTable from "@/app/_components/ToggleTable";

export default function HomePage() {
  const [selectedTable, setSelectedTable] = useState<"miner" | "bid">("miner");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMinerUid, setSelectedMinerUid] = useState<string | null>(null);

  const handleNavigateToMiner = (uid: string) => {
    setSelectedTable("miner");
    setSearchTerm(uid);
    setSelectedMinerUid(uid);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
          Targon Miner Stats
        </h1>

        <div className="mt-8 flex justify-between">
          <ToggleTable
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
          />
          <Search value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="mt-8">
          {selectedTable === "miner" ? (
            <MinerTable
              searchTerm={searchTerm}
              selectedMinerUid={selectedMinerUid}
              onSelectedMinerChange={setSelectedMinerUid}
            />
          ) : (
            <BidTable
              searchTerm={searchTerm}
              onNavigateToMiner={handleNavigateToMiner}
            />
          )}
        </div>
      </div>
    </div>
  );
}
