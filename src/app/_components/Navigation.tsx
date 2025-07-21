"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  const getLinkClassName = (path: string) => {
    const isActive =
      pathname === path || (pathname === "/" && path === "/miner");
    return `flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold transition-colors ${
      isActive
        ? "bg-[#272D38] text-mf-edge-500"
        : "bg-transparent text-mf-edge-300 hover:bg-[#272D38]/50"
    }`;
  };

  return (
    <div className="flex items-center gap-2 p-1">
      <Link href="/miner" className={getLinkClassName("/miner")}>
        <img src="/miners.svg" alt="Miner" width={24} height={24} className="h-4 w-4 text-current" />
        <span className="font-blinker">Miners</span>
      </Link>
      <Link href="/bid" className={getLinkClassName("/bid")}>
        <img src="/buyouts.svg" alt="Buyouts" width={24} height={24} className="h-4 w-4 text-current" />
        <span className="font-blinker">Buyouts</span>
      </Link>
      <Link href="/weight" className={getLinkClassName("/weight")}>
        <img src="/weights.svg" alt="Weights" width={24} height={24} className="h-4 w-4 text-current" />
        <span className="font-blinker">Weights</span>
      </Link>
    </div>
  );
};

export default Navigation;
