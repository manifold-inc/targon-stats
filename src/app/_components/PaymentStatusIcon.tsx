"use client";

import { CircleCheck } from "lucide-react";

import Tooltip from "@/app/_components/Tooltip";
import { type Miner } from "@/app/api/miners/route";

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

export default function PaymentStatusIcon({ miner }: { miner: Miner }) {
  const getStatusInfo = () => {
    if (!miner.diluted) {
      return {
        icon: <CircleCheck className="h-4 w-4 text-green-500" />,
        tooltip: "Miner received full payment",
      };
    } else {
      return {
        icon: <DilutedIcon />,
        tooltip: "Miner received a diluted payment",
      };
    }
  };
  const { icon, tooltip } = getStatusInfo();

  return <Tooltip content={tooltip}>{icon}</Tooltip>;
}
