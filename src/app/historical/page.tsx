"use client";

import PageHeader from "@/app/_components/PageHeader";
import PayoutGraph from "@/app/_components/PayoutGraph";
import WeightsGraph from "@/app/_components/weights/WeightsGraph";
import { RiLineChartFill } from "@remixicon/react";

export default function HistoricalPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Historical"
        icon={<RiLineChartFill className="h-7 w-7" />}
      />
      <div className="mt-5 flex flex-col gap-8 pb-20">
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
