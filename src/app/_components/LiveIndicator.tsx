"use client";

export default function LiveIndicator({ value }: { value: string }) {
  return (
    <div className="rounded-sm border border-mf-border-600 px-3 w-18 text-xs text-mf-sally-500 py-0.5 text-center">
      {value}
    </div>
  );
}
