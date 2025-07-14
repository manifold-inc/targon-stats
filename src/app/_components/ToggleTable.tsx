import React from "react";

interface ToggleTableProps {
  selectedTable: "miner" | "bid";
  setSelectedTable: (table: "miner" | "bid") => void;
}

const ToggleTable = ({ selectedTable, setSelectedTable }: ToggleTableProps) => {
  return (
    <div className="flex justify-center gap-2">
      <button
        type="button"
        className={`rounded-md px-6 py-2 text-sm font-medium focus:z-10 focus:outline-none ${selectedTable === "miner" ? "bg-blue-600 text-white" : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"}`}
        onClick={() => setSelectedTable("miner")}
      >
        Miners
      </button>
      <button
        type="button"
        className={`rounded-md px-6 py-2 text-sm font-medium focus:z-10 focus:outline-none ${selectedTable === "bid" ? "bg-blue-600 text-white" : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"}`}
        onClick={() => setSelectedTable("bid")}
      >
        Bids
      </button>
    </div>
  );
};

export default ToggleTable;
