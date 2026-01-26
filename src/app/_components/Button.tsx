"use client";

import { type ReactNode } from "react";

export default function Button({
  icon,
  label,
  value,
  mobileLabel,
  valueClassName = "text-mf-sybil-300",
}: {
  icon?: ReactNode;
  label?: string;
  value: string | number | ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  valueClassName?: string;
}) {
  const displayLabel = mobileLabel || label;
  
  return (
    <div
      className="group relative flex flex-col items-center"
    >
      <div className="inline-flex items-center rounded-lg p-0.5 text-[0.8rem] border border-mf-border-600 hover:bg-mf-night-400">
        {icon && (
          <div className="rounded-sm p-1.5 border border-mf-border-600 animate-fade-in">
            {icon}
          </div>
        )}
        <span className={`flex items-center gap-0.5 px-4 ${valueClassName}`}>
          {value}
        </span>
      </div>
      {label && (
        <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[0.45rem] text-mf-milk-700 rounded-full border border-mf-border-400 px-3 py-0.5 whitespace-nowrap">
          <span className="hidden sm:inline">{label}</span>
          {mobileLabel && <span className="sm:hidden">{mobileLabel}</span>}
        </div>
      )}
    </div>
  );
}
