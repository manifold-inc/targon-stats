"use client";

import Image from "next/image";

import Tooltip from "@/app/_components/Tooltip";
import { type Miner } from "@/app/api/miners/route";

export default function PaymentStatusIcon({ miner }: { miner: Miner }) {
  const getStatusInfo = () => {
    if (!miner.diluted) {
      return {
        icon: (
          <Image
            src="/checkmark.svg"
            alt="Full Payment"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        ),
        tooltip: "Miner received full payment",
      };
    } else {
      return {
        icon: (
          <Image
            src="/dilute-icon.svg"
            alt="Diluted Payment"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        ),
        tooltip: "Miner received a diluted payment",
      };
    }
  };
  const { icon, tooltip } = getStatusInfo();

  return <Tooltip content={tooltip}>{icon}</Tooltip>;
}
