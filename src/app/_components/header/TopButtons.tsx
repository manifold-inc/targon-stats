"use client";

import Box from "@/app/_components/Box";
import { RiFileFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "../Providers";

export default function TopButtons({
  columnLayout = false,
  onClose,
}: {
  columnLayout?: boolean;
  onClose?: () => void;
}) {
  const isAuthed = useAuth().status === "AUTHED";
  return (
    <div className={columnLayout ? "flex flex-col gap-8" : "flex gap-3"}>
      <Link href="/docs">
        <Box
          value="Docs"
          valueClassName="animate-flip-up w-18 px-auto justify-center"
          icon={<RiFileFill className="h-3.5 w-3.5 text-mf-sally-300" />}
        />
      </Link>
      <Link href="https://targon.com/dashboard">
        <Box
          value="Launch"
          valueClassName="animate-flip-up w-18 px-auto justify-center"
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
      {isAuthed ? (
        <a href="/sign-out">
          <Box
            value="Sign Out"
            valueClassName="animate-flip-up w-18 px-auto justify-center"
          />
        </a>
      ) : (
        <Link href="/sign-in" onClick={onClose}>
          <Box
            value="Sign In"
            valueClassName="animate-flip-up w-18 px-auto justify-center"
          />
        </Link>
      )}
    </div>
  );
}
