"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import MinersSVG from "./MinersIcon";
import WeightsSVG from "./WeightsIcon";

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
        <MinersSVG isSelected={pathname === "/miner"} />
        <span className="font-blinker">Miners</span>
      </Link>
      <Link href="/weight" className={getLinkClassName("/weight")}>
        <WeightsSVG isSelected={pathname === "/weight"} />
        <span className="font-blinker">Weights</span>
      </Link>
    </div>
  );
};

export default Navigation;
