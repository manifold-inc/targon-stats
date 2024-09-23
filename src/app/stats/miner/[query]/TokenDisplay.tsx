"use client";

import { useState } from "react";

import { type Token } from "./MinerChart";

interface TokenProps {
  tokens: Token[];
  showTokenized: boolean;
}

const TokenDisplay: React.FC<TokenProps> = ({ tokens, showTokenized }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const stringView = tokens.map((token) => token.text).join("");

  return (
    <div>
      {showTokenized ? (
        <div className="flex flex-wrap gap-2 font-mono text-sm">
          {tokens.map((token, index) => (
            <span
              key={index}
              className="relative inline-block cursor-pointer rounded-md bg-gray-200 px-2 py-1 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {token.text}
              {hoveredIndex === index && (
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white">
                  {`powv: ${token.powv}, logprob: ${token.logprob.toFixed(2)}, token_id: ${token.token_id}`}
                </span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div className="whitespace-pre-wrap break-words font-mono text-sm">
          {stringView}
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;
