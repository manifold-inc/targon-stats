"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { type AuctionState } from "@/server/api/routers/chain";
import { reactClient } from "@/trpc/react";
import { CalculateInterval } from "@/utils/utils";

interface BlockSelectorProps {
  block: number;
  isLoading: boolean;
  onBlockChange: (auctionState: AuctionState | null) => void;
}

export default function BlockSelector({
  block,
  isLoading,
  onBlockChange,
}: BlockSelectorProps) {
  const [selectedBlock, setSelectedBlock] = useState<number>(block);
  const [isOpen, setIsOpen] = useState(false);
  const { data: selectedAuctionData } =
    reactClient.chain.getPreviousAuctionState.useQuery(selectedBlock, {
      enabled: selectedBlock !== block,
    });

  const intervals = Array.from({ length: 10 }, (_, i) => {
    const interval = CalculateInterval(block) - i;
    return interval * 360;
  });

  const selectedAuctionState =
    selectedBlock === block ? null : selectedAuctionData || null;

  useEffect(() => {
    onBlockChange(selectedAuctionState);
  }, [selectedAuctionState, onBlockChange]);

  const handleBlockSelect = (block: number) => {
    setSelectedBlock(block);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span>
          {isLoading
            ? "Loading..."
            : `Interval ${CalculateInterval(selectedBlock)} (Block ${selectedBlock})`}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <ul className="max-h-60 overflow-auto py-1">
            {intervals.map((interval) => (
              <li key={interval}>
                <button
                  type="button"
                  onClick={() => handleBlockSelect(interval)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedBlock === interval
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {`Interval ${interval} (Block ${interval})`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
