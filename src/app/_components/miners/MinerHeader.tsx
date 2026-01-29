"use client";

import { copyToClipboard } from "@/utils/utils";
import {
  RiCheckboxMultipleBlankLine,
  RiCheckboxMultipleLine,
  RiToolsFill,
} from "@remixicon/react";
import { useState } from "react";

export default function MinerHeader({
  uid,
  hotkey,
}: {
  uid: string;
  hotkey?: string;
}) {
  const [copiedHotkey, setCopiedHotkey] = useState<string | null>(null);

  const handleCopyHotkey = () => {
    if (hotkey) {
      void copyToClipboard(hotkey, "hotkey", setCopiedHotkey, 2000);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-1.5">
        <div className="text-mf-sally-500">
          <RiToolsFill className="h-7 w-7" />
        </div>
        <h1 className="text-[1.75rem] font-saira text-mf-milk-400">
          Miner {uid}
        </h1>
      </div>

      {hotkey && (
        <button
          onClick={handleCopyHotkey}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-mf-border-600 bg-mf-night-450 hover:bg-mf-night-400 transition-colors"
        >
          {copiedHotkey === "hotkey" ? (
            <RiCheckboxMultipleLine className="h-4 w-4 text-mf-sally-500" />
          ) : (
            <RiCheckboxMultipleBlankLine className="h-4 w-4" />
          )}
          <span className="text-sm text-mf-milk-500">Hotkey</span>
        </button>
      )}
    </div>
  );
}
