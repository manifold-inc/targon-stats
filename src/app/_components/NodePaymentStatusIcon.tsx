"use client";

import { CircleCheck, CircleMinus } from "lucide-react";

import Tooltip from "@/app/_components/Tooltip";
import { type MinerNode } from "@/server/api/routers/bids";

interface NodePaymentStatusIconProps {
  node: MinerNode;
}

export default function NodePaymentStatusIcon({
  node,
}: NodePaymentStatusIconProps) {
  const getStatusInfo = () => {
    if (!node.diluted) {
      return {
        icon: <CircleCheck className="h-4 w-4 text-green-500" />,
        tooltip: "Payment received - Node is active and receiving payments",
      };
    } else {
      return {
        icon: <CircleMinus className="h-4 w-4 text-yellow-500" />,
        tooltip: "Payment diluted - Node payments have been reduced",
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
