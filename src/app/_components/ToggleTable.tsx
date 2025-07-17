import React from "react";

interface ToggleTableProps {
  selectedTable: "miner" | "bid" | "weight";
  setSelectedTable: (table: "miner" | "bid" | "weight") => void;
  onTableChange: () => void;
}

const ToggleTable = ({
  selectedTable,
  setSelectedTable,
  onTableChange,
}: ToggleTableProps) => {
  const handleTableChange = (table: "miner" | "bid" | "weight") => {
    setSelectedTable(table);
    onTableChange();
  };

  return (
    <div className="flex justify-center gap-2">
      <button
        type="button"
        className={`rounded-md px-6 py-2 text-lg font-medium focus:z-10 focus:outline-none ${selectedTable === "miner" ? "bg-blue-600 text-white" : "bg-gray-900 text-mf-edge-500"}`}
        onClick={() => handleTableChange("miner")}
      >
        Miners
      </button>
      <button
        type="button"
        className={`rounded-md px-6 py-2 text-lg font-medium focus:z-10 focus:outline-none ${selectedTable === "bid" ? "bg-blue-600 text-white" : "bg-gray-900 text-mf-edge-500"}`}
        onClick={() => handleTableChange("bid")}
      >
        Buyouts
      </button>
      <button
        type="button"
        className={`rounded-md px-6 py-2 text-lg font-medium focus:z-10 focus:outline-none ${selectedTable === "weight" ? "bg-blue-600 text-white" : "bg-gray-900 text-mf-edge-500"}`}
        onClick={() => handleTableChange("weight")}
      >
        Weights
      </button>
    </div>
  );
};

export default ToggleTable;
