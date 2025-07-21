"use client";

import { Search as SearchIcon, X } from "lucide-react";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Search({
  value,
  onChange,
  placeholder = "Search by UUID...",
}: SearchProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="h-5 w-5 text-mf-edge-700" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="placeholder-font-poppins block w-full rounded-lg border border-gray-600 bg-mf-night-500 py-2 pl-10 pr-3 text-sm text-mf-edge-700 placeholder-mf-edge-700 focus:border-mf-sally-500 focus:outline-none focus:ring-2 focus:ring-mf-sally-500"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute bottom-0 right-0 top-0 px-4 py-2 text-gray-500 hover:opacity-80 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
