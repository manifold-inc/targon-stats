"use client";

import PageHeader from "@/app/_components/PageHeader";
import { RiBarChartFill, RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";

export default function HomePage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Stats"
        icon={<RiBarChartFill className="h-7 w-7" />}
        badges={[
          {
            icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
            value: "10",
            text: "H200 GPUs",
          },
          {
            icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
            value: "10",
            text: "H100 GPUs",
          },
          {
            icon: <RiCpuLine className="h-4 w-4 text-mf-sally-500" />,
            value: "10",
            text: "V4 CPUs",
          },
        ]}
      />
    </div>
  );
}
