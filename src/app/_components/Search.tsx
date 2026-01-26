"use client";

import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";
import { RiArrowDownSLine, RiCloseLine, RiSearchLine } from "@remixicon/react";
import { useMemo, useRef, useState } from "react";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export default function Search({
  value,
  onChange,
  onClear,
  placeholder = "Search by UID...",
}: SearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const availableUids = useMemo(() => {
    if (!auction?.auction_results) return [];
    const miners = getNodes(auction.auction_results);
    return miners
      .map((miner) => miner.uid)
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [auction?.auction_results]);

  const filteredUids = useMemo(() => {
    const parts = value.split(",");
    const alreadySelected = parts
      .slice(0, -1)
      .map((uid) => uid.trim())
      .filter(Boolean);

    // Always return all available UIDs minus already selected ones
    const ret = availableUids.filter((uid) => !alreadySelected.includes(uid));
    return [...new Set(ret)]; // fuck you, it works.
  }, [value, availableUids]);

  const handleBlur = (e: React.FocusEvent) => {
    if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);

    // Always show dropdown when typing, especially when comma is added
    setIsDropdownOpen(true);
  };

  const handleUidSelect = (uid: string) => {
    const parts = value.split(",");
    const alreadySelected = parts
      .slice(0, -1)
      .map((u) => u.trim())
      .filter(Boolean);

    if (alreadySelected.length > 0) {
      const newValue = alreadySelected.join(", ") + ", " + uid;
      onChange(newValue);
    } else {
      onChange(uid);
    }

    setIsDropdownOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleClear = () => {
    onChange("");
    onClear();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <RiSearchLine className="h-5 w-5 text-mf-edge-700" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleBlur}
          className="block w-full rounded-lg border border-mf-border-600 bg-mf-night-500 py-2 pl-10 pr-10 text-sm text-mf-milk-700 placeholder-mf-milk-700 focus:outline-none"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && (
            <button
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
              className="px-2 py-2 text-gray-500 hover:opacity-80 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RiCloseLine className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
            className="px-2 py-2 text-mf-edge-700 hover:opacity-80"
          >
            <RiArrowDownSLine
              className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-mf-border-600 bg-mf-night-500 shadow-lg [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-mf-edge-700">
                Loading UIDs...
              </div>
            ) : filteredUids.length > 0 ? (
              filteredUids.map((uid) => (
                <button
                  key={uid}
                  onClick={() => handleUidSelect(uid)}
                  onMouseDown={(e) => e.preventDefault()}
                  className="block w-full px-4 py-2 text-left text-sm text-mf-edge-700 hover:bg-mf-ash-500/30 focus:bg-mf-ash-500/30 focus:outline-none"
                >
                  <span className="font-mono">{uid}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-mf-edge-700">
                {availableUids.length === 0
                  ? "No UIDs available"
                  : "No matching UIDs found"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
