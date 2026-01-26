"use client";

import Button from "@/app/_components/Button";
import { RiFileFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

export default function TopButtons({
  columnLayout = false,
}: {
  columnLayout?: boolean;
}) {
  return (
    <div className={columnLayout ? "flex flex-col gap-8" : "flex gap-3"}>
      <Link href="/docs">
        <Button
          value="Docs"
          valueClassName="text-mf-milk-600 animate-flip-up"
          icon={<RiFileFill className="h-3.5 w-3.5 text-mf-sally-300" />}
        />
      </Link>
      <Link href="https://targon.com" target="_blank">
        <Button
          value="Launch"
          valueClassName="text-mf-milk-600 animate-flip-up"
          icon={
            <Image
              src="/targon-wings.svg"
              alt="Targon Wings"
              width={16}
              height={16}
              className="h-3.5 w-3.5"
              priority
            />
          }
        />
      </Link>
    </div>
  );
}
