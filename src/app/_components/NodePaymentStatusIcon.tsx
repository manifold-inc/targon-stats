"use client";

import Image from "next/image";

import Tooltip from "@/app/_components/Tooltip";
import { type MinerNode } from "@/app/api/bids/route";

interface NodePaymentStatusIconProps {
  node: MinerNode;
}

export default function NodePaymentStatusIcon({
  node,
}: NodePaymentStatusIconProps) {
  const getStatusInfo = () => {
    if (!node.diluted) {
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
        tooltip: "Individual node received full payment",
      };
    } else {
      return {
        icon: (
          <Image
            src="/diluteIcon.svg"
            alt="Diluted Payment"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        ),
        tooltip: "Individual node received a diluted payment",
      };
    }
  };
  const { icon, tooltip } = getStatusInfo();

  return <Tooltip content={tooltip}>{icon}</Tooltip>;
}
