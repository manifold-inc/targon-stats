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
    <div className="flex items-center gap-2 p-1">
      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${
          selectedTable === "miner"
            ? "bg-[#272D38] text-white"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("miner")}
      >
        <img
          src="/miners.svg"
          alt="Miner"
          width={24}
          height={24}
          className="h-4 w-4 text-current"
        />
        <span>Miners</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium ${
          selectedTable === "bid"
            ? "bg-[#272D38] text-white"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("bid")}
      >
        <img
          src="/buyouts.svg"
          alt="Buyouts"
          width={24}
          height={24}
          className="h-4 w-4 text-current"
        />
        <span>Buyouts</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium  ${
          selectedTable === "weight"
            ? "bg-[#272D38] text-white"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("weight")}
      >
        <img
          src="/weights.svg"
          alt="Weights"
          width={24}
          height={24}
          className="h-4 w-4 text-current"
        />
        <span>Weights</span>
      </button>
    </div>
  );
};

export default ToggleTable;
