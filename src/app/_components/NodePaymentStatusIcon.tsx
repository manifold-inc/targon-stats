"use client";

import { CircleCheck } from "lucide-react";

import Tooltip from "@/app/_components/Tooltip";
import { type MinerNode } from "@/app/api/bids/route";

interface NodePaymentStatusIconProps {
  node: MinerNode;
}

const DilutedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 49 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24.5" cy="24.1773" r="23.8227" fill="#FFD37A" />
    <rect
      x="10.708"
      y="22.9235"
      width="27.5842"
      height="5.01531"
      rx="2.50765"
      fill="#22242E"
    />
  </svg>
);

export default function NodePaymentStatusIcon({
  node,
}: NodePaymentStatusIconProps) {
  const getStatusInfo = () => {
    if (!node.diluted) {
      return {
        icon: <CircleCheck className="h-4 w-4 text-green-500" />,
        tooltip: "Individual node received full payment",
      };
    } else {
      return {
        icon: <DilutedIcon />,
        tooltip: "Individual node received a diluted payment",
      };
    }
  };
  const { icon, tooltip } = getStatusInfo();

  return <Tooltip content={tooltip}>{icon}</Tooltip>;
}
