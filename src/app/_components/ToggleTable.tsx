import React from "react";

interface ToggleTableProps {
  selectedTable: "miners" | "buyout";
  setSelectedTable: (table: "miners" | "buyout") => void;
}

const ToggleTable = ({ selectedTable, setSelectedTable }: ToggleTableProps) => {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          className={`rounded-l-md border border-gray-200 px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-400 ${selectedTable === "miners" ? "bg-blue-600 text-white" : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"}`}
          onClick={() => setSelectedTable("miners")}
        >
          Miners
        </button>
        <button
          type="button"
          className={`rounded-r-md border-b border-r border-t border-gray-200 px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-400 ${selectedTable === "buyout" ? "bg-blue-600 text-white" : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"}`}
          onClick={() => setSelectedTable("buyout")}
        >
          Buyout
        </button>
      </div>
    </div>
  );
};

export default ToggleTable;
