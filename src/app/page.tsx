"use client";

import PageHeader from "@/app/_components/PageHeader";
import PayoutGraph from "@/app/_components/PayoutGraph";
import WeightsGraph from "@/app/_components/weights/WeightsGraph";
import { RiBarChartFill } from "@remixicon/react";

export default function HomePage() {
  return (
    <div className="w-full">
      <PageHeader title="Stats" icon={<RiBarChartFill className="h-7 w-7" />} />
      <div className="flex flex-col gap-8 mt-5 pb-20">
        <PayoutGraph />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <PayoutGraph
            defaultComputeType="SEV-CPU-AMD-EPYC-V4"
            isHalfSize={true}
          />

          <WeightsGraph isHalfSize={true} />
        </div>
      </div>
    </div>
  );
}
