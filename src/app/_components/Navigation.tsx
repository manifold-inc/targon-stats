"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  const getLinkClassName = (path: string) => {
    const isActive =
      pathname === path || (pathname === "/" && path === "/miner");
    return `rounded-md px-6 py-2 text-sm font-medium focus:z-10 focus:outline-none ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;
  };

  return (
    <div className="flex justify-center gap-2">
      <Link href="/miner" className={getLinkClassName("/miner")}>
        Miners
      </Link>
      <Link href="/bid" className={getLinkClassName("/bid")}>
        Bids
      </Link>
      <Link href="/weight" className={getLinkClassName("/weight")}>
        Weights
      </Link>
    </div>
  );
};

export default Navigation;
