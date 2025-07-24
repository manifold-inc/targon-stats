"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface BlockSelectorProps {
  block: number;
  latestBlock: number;
  isLoading: boolean;
  onBlockChange: (block: number) => void;
  searchTerm: string;
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

  const getIntervalText = (blockNumber: number) => {
    const intervalsPast = getIntervalsPast(blockNumber);
    return intervalsPast === 0 ? "Current" : `${intervalsPast} Int Past`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-2 border-mf-ash-300 bg-mf-ash-500 px-2 sm:px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Image
          src="/box.svg"
          alt="Block"
          width={16}
          height={16}
          className="h-4 w-4 hidden md:block"
        />
        <span className="whitespace-nowrap">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="text-mf-sally-500">{selectedBlock}</span>
              <span className="text-gray-400">
                {" "}
                <span className="pl-1"> {getIntervalText(selectedBlock)}</span>
              </span>
            </>
          )}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-full rounded-lg border-2 border-mf-ash-300 bg-mf-night-500 shadow-lg">
          <ul className="max-h-60 overflow-auto rounded-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {blocks.map((blockNumber) => (
              <li key={blockNumber}>
                <button
                  type="button"
                  onClick={() => handleBlockSelect(blockNumber)}
                  className={`flex w-full items-center gap-2 px-2 md:px-4 py-2 text-left text-sm ${
                    selectedBlock === blockNumber
                      ? "bg-mf-ash-500"
                      : "bg-mf-night-500 hover:bg-mf-ash-500"
                  }`}
                >
                  <Image
                    src="/box.svg"
                    alt="Block"
                    width={16}
                    height={16}
                    className="h-4 w-4 hidden md:block"
                  />
                  <span>
                    <span className="text-mf-sally-500">{blockNumber}</span>
                    <span className="text-gray-400">
                      {" "}
                      <span className="pl-1">
                        {getIntervalText(blockNumber)}
                      </span>
                    </span>
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
