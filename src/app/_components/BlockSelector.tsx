"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CalculateInterval } from "@/utils/utils";

interface BlockSelectorProps {
  block: number;
  latestBlock: number;
  isLoading: boolean;
  onBlockChange: (block: number) => void;
}

export default function BlockSelector({
  block,
  latestBlock,
  isLoading,
  onBlockChange,
}: BlockSelectorProps) {
  const [selectedBlock, setSelectedBlock] = useState<number>(block);
  const [isOpen, setIsOpen] = useState(false);

  const blocks = Array.from({ length: 10 }, (_, i) => {
    return latestBlock - i * 360;
  });

  const handleBlockSelect = (block: number) => {
    setSelectedBlock(block);
    onBlockChange(block);
    setIsOpen(false);
  };

  const getIntervalsPast = (blockNumber: number) => {
    return Math.floor((latestBlock - blockNumber) / 360);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-mf-ash-500 px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <img src="/box.svg" alt="Block" width={16} height={16} className="h-4 w-4" />
        <span className="whitespace-nowrap">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="text-mf-sally-500">{selectedBlock}</span>
              <span className="text-gray-400">  <span className="pl-1"> {getIntervalsPast(selectedBlock)} Int Past</span></span>
            </>
          )}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-full rounded-lg border-2 border-mf-ash-300 bg-mf-night-500 shadow-lg">
          <ul className="max-h-60 overflow-auto rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {blocks.map((blockNumber) => (
              <li key={blockNumber}>
                <button
                  type="button"
                  onClick={() => handleBlockSelect(blockNumber)}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-left text-sm ${
                    selectedBlock === blockNumber
                      ? "bg-mf-ash-500"
                      : "bg-mf-night-500 hover:bg-mf-ash-500"
                  }`}
                >
                  <img src="/box.svg" alt="Block" width={16} height={16} className="h-4 w-4" />
                  <span>
                    <span className="text-mf-sally-500">{blockNumber}</span>
                    <span className="text-gray-400"> <span className="pl-1">{getIntervalsPast(blockNumber)} Int Past</span></span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
