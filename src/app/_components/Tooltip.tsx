"use client";

import { useState, type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export default function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute right-full top-1/2 z-[50] mr-2 -translate-y-1/2">
          <div className="whitespace-nowrap rounded bg-gray-900 p-3 text-white">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
