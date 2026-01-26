"use client";

import { RiBarChartFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

const Branding = () => {
  return (
    <div className="flex items-center lg:flex-1">
      <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-1 group">
        <Image
          src="/targon-logo.svg"
          alt="Targon-logo"
          width={24}
          height={24}
          className="h-5 w-5"
          priority
        />
        <Image
          src="/targon-text.svg"
          alt="Targon-text"
          width={120}
          height={24}
          className="h-7 w-22 mt-0.5"
          priority
        />
        <span className="bg-mf-sally-800 group-hover:bg-mf-sally-700 transition-colors rounded-full w-18 h-5 flex items-center justify-center gap-0.5">
          <RiBarChartFill className="size-3 text-mf-sally-500" />
          <span className="text-xs font-light text-mf-milk-600">Stats</span>
        </span>
      </Link>
    </div>
  );
};

export default Branding;
