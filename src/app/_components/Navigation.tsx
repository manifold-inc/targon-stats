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
        <span>Miners</span>
      </Link>
      <Link href="/weight" className={getLinkClassName("/weight")}>
        <WeightsSVG isSelected={pathname === "/weight"} />
        <span>Weights</span>
      </Link>
      <Link href="/target" className={getLinkClassName("/target")}>
        <MinersSVG isSelected={pathname === "/target"} />
        <span>Targets</span>
      </Link>
    </div>
  );
};

export default Navigation;
