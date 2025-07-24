import React from "react";

import BuyoutsSVG from "./BuyoutsIcon";
import MinersSVG from "./MinersIcon";
import WeightsSVG from "./WeightsIcon";

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
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold md:text-lg ${
          selectedTable === "miner"
            ? "bg-[#272D38] text-mf-sally-500"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("miner")}
      >
        <MinersSVG isSelected={selectedTable === "miner"} />
        <span className="font-blinker">Miners</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold ${
          selectedTable === "bid"
            ? "bg-[#272D38] text-mf-sally-500"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("bid")}
      >
        <BuyoutsSVG isSelected={selectedTable === "bid"} />
        <span className="font-blinker">Buyouts</span>
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold  ${
          selectedTable === "weight"
            ? "bg-[#272D38] text-mf-sally-300"
            : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
        }`}
        onClick={() => handleTableChange("weight")}
      >
        <WeightsSVG isSelected={selectedTable === "weight"} />
        <span className="font-blinker">Weights</span>
      </button>
    </div>
  );
};

export default ToggleTable;
