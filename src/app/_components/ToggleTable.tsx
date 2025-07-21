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
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold ${
          selectedTable === "miner"
            ? "bg-[#272D38] text-mf-edge-500"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("miner")}
      >
        <img
          src="/miners.svg"
          alt="Miner"
          width={24}
          height={24}
          className="h-5 w-5 text-current"
        />
        <span className="font-blinker">Miners</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold ${
          selectedTable === "bid"
            ? "bg-[#272D38] text-mf-edge-500"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("bid")}
      >
        <img
          src="/buyouts.svg"
          alt="Buyouts"
          width={24}
          height={24}
          className="h-5 w-5 text-current"
        />
        <span className="font-blinker">Buyouts</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold  ${
          selectedTable === "weight"
            ? "bg-[#272D38] text-mf-edge-500"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("weight")}
      >
        <img
          src="/weights.svg"
          alt="Weights"
          width={24}
          height={24}
          className="h-5 w-5 text-current"
        />
        <span className="font-blinker">Weights</span>
      </button>
    </div>
  );
};

export default ToggleTable;
