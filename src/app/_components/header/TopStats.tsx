"use client";

import Button from "@/app/_components/Button";
import { reactClient } from "@/trpc/react";
import { RiDropFill } from "@remixicon/react";
import Image from "next/image";

import { useCountUp } from "./useCountUp";

export default function TopStats({
  columnLayout = false,
}: {
  columnLayout?: boolean;
}) {
  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const taoPrice = useCountUp({
    end: auction?.tao_price || 0,
    duration: 1000,
    decimals: 2,
    isReady: !isLoading && auction !== undefined,
  });

  const emissionPool = useCountUp({
    end: auction?.emission_pool || 0,
    duration: 1000,
    decimals: 2,
    isReady: !isLoading && auction !== undefined,
  });

  const currentBlock = useCountUp({
    end: auction?.block || 0,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading && auction !== undefined,
  });

  return (
    <div
      className={
        columnLayout
          ? "flex flex-col items-center gap-8"
          : "gap-3 flex flex-wrap items-center justify-center"
      }
    >
      <Button
        label="Tao Price"
        value={
          <div className="flex items-center w-16 justify-center">
            <span className="text-[0.7rem]">$</span>
            {taoPrice}
          </div>
        }
        valueClassName="text-mf-sybil-300"
        icon={
          <Image
            src="/tao.svg"
            alt="Tao"
            width={16}
            height={16}
            className="h-3.5 w-3.5"
            priority
          />
        }
      />
      <Button
        label="Emission Pool"
        mobileLabel="E. Pool"
        value={
          <div className="flex items-center w-16 justify-center">
            <span className="text-[0.7rem]">$</span>
            {emissionPool}
          </div>
        }
        valueClassName="text-mf-sybil-300"
        icon={<RiDropFill className="h-3.5 w-3.5 text-mf-sally-300" />}
      />
      <Button
        label="Current"
        value={
          <div className="flex items-center w-16 justify-center">
            {currentBlock}
          </div>
        }
        icon={
          <Image
            src="/box.svg"
            alt="Block"
            width={16}
            height={16}
            className="h-4 w-4"
            priority
          />
        }
      />
    </div>
  );
}
