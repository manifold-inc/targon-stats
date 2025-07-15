"use client";

import { CircleCheck, CircleMinus } from "lucide-react";

import Tooltip from "@/app/_components/Tooltip";
import { type Miner } from "@/server/api/routers/miners";

interface PaymentStatusIconProps {
  miner: Miner;
}

export default function PaymentStatusIcon({ miner }: PaymentStatusIconProps) {
  const getStatusInfo = () => {
    if (!miner.diluted) {
      return {
        icon: <CircleCheck className="h-4 w-4 text-green-500" />,
        tooltip: "Payment received - Miner is active and receiving payments",
      };
    } else {
      return {
        icon: <CircleMinus className="h-4 w-4 text-yellow-500" />,
        tooltip: "Payment diluted - Miner payments have been reduced",
      };
    }
  };

  const { icon, tooltip } = getStatusInfo();

  return (
    <Tooltip content={tooltip} position="top">
      {icon}
    </Tooltip>
  );
}
