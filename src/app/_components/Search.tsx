"use client";

import { Search as SearchIcon } from "lucide-react";

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
        className="block w-full rounded-lg border border-gray-600 bg-mf-night-500 py-2 pl-10 pr-3 text-sm text-mf-edge-700 placeholder-font-poppins placeholder-mf-edge-700"
        placeholder={placeholder}
      />
    </div>
  );
}
