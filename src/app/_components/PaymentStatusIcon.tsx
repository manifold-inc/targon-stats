"use client";

import { CircleCheck, CircleMinus } from "lucide-react";

import Tooltip from "@/app/_components/Tooltip";
import { type Miner } from "@/server/api/routers/miners";

export default function PaymentStatusIcon({ miner }: { miner: Miner }) {
  const getStatusInfo = () => {
    if (!miner.diluted) {
      return {
        icon: <CircleCheck className="h-4 w-4 text-green-500" />,
        tooltip: "Miner received full payment",
      };
    } else {
      return {
        icon: <CircleMinus className="h-4 w-4 text-yellow-500" />,
        tooltip: "Miner received a diluted payment",
      };
    }
  };
  const { icon, tooltip } = getStatusInfo();

  return <Tooltip content={tooltip}>{icon}</Tooltip>;
}
