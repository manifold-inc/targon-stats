import { useCountUp } from "@/app/_components/header/useCountUp";
import { type Auction, type AuctionResults } from "@/server/api/routers/chain";
import { RiCpuLine, RiHardDrive3Fill, RiLockLine } from "@remixicon/react";
import { useMemo } from "react";

interface TargetCardsProps {
  auctionResults?: AuctionResults;
  auction?: Record<string, Auction>;
  isLoading: boolean;
  error: Error | null;
}

interface ComputeTypeInfo {
  name: string;
  displayName: string;
  type: "H200" | "H100" | "V4" | "OTHER";
  badge?: "Intel TDX" | "AMD SEV";
  icon: React.ReactNode;
  totalCards: number;
  targetCards: number;
  targetPrice: number;
  maxPrice: number;
  minClusterSize: number;
}

const TargetCards = ({
  auctionResults,
  auction,
  isLoading,
  error,
}: TargetCardsProps) => {
  const computeTypes = useMemo<ComputeTypeInfo[]>(() => {
    if (!auction || !auctionResults) return [];

    const types: ComputeTypeInfo[] = [];

    for (const [computeTypeName, auctionData] of Object.entries(auction)) {
      const isH200 = computeTypeName.includes("H200");
      const isH100 = computeTypeName.includes("H100");
      const isV4 = computeTypeName.includes("V4");
      const isTDX = computeTypeName.includes("TDX");
      const isSEV = computeTypeName.includes("SEV");
      const isAMD = computeTypeName.includes("AMD");
      const isNVIDIA = computeTypeName.includes("NVIDIA");

      let displayName = "";
      let type: "H200" | "H100" | "V4" | "OTHER" = "OTHER";
      let badge: "Intel TDX" | "AMD SEV" | undefined = undefined;

      if (isH200) {
        type = "H200";
        displayName = isNVIDIA ? "NVIDIA H200" : "H200 GPU";
      } else if (isH100) {
        type = "H100";
        displayName = isNVIDIA ? "NVIDIA H100" : "H100 GPU";
      } else if (isV4) {
        type = "V4";
        displayName = isAMD ? "AMD CPU V4" : "V4 CPU";
      } else {
        displayName = computeTypeName;
      }

      if (isTDX) {
        badge = "Intel TDX";
      } else if (isSEV) {
        badge = "AMD SEV";
      }

      const totalCards =
        auctionResults[computeTypeName]?.reduce(
          (total, node) => total + (node.count || 0),
          0
        ) || 0;

      const icon =
        type === "V4" ? (
          <RiCpuLine className="h-5 w-5 text-mf-sally-500" />
        ) : (
          <RiHardDrive3Fill className="h-5 w-5 text-mf-sally-500" />
        );

      types.push({
        name: computeTypeName,
        displayName,
        type,
        badge,
        icon,
        totalCards,
        targetCards: auctionData.target_cards ?? auctionData.target_nodes ?? 0,
        targetPrice: auctionData.target_price ?? 0,
        maxPrice: auctionData.max_price ?? 0,
        minClusterSize: auctionData.min_cluster_size ?? 0,
      });
    }

    return types.sort((a, b) => {
      const order = { H200: 0, H100: 1, V4: 2, OTHER: 3 };
      return order[a.type] - order[b.type];
    });
  }, [auction, auctionResults]);

  const h200Value = useMemo(
    () => computeTypes.find((t) => t.type === "H200")?.totalCards || 0,
    [computeTypes]
  );
  const h100Value = useMemo(
    () => computeTypes.find((t) => t.type === "H100")?.totalCards || 0,
    [computeTypes]
  );
  const v4Value = useMemo(
    () => computeTypes.find((t) => t.type === "V4")?.totalCards || 0,
    [computeTypes]
  );

  const h200Count = useCountUp({
    end: h200Value,
    duration: 1000,
    decimals: 0,
    isReady:
      !isLoading &&
      auction !== undefined &&
      !error &&
      auctionResults !== undefined,
  });

  const h100Count = useCountUp({
    end: h100Value,
    duration: 1000,
    decimals: 0,
    isReady:
      !isLoading &&
      auction !== undefined &&
      !error &&
      auctionResults !== undefined,
  });

  const v4Count = useCountUp({
    end: v4Value,
    duration: 1000,
    decimals: 0,
    isReady:
      !isLoading &&
      auction !== undefined &&
      !error &&
      auctionResults !== undefined,
  });

  const summaryCards = useMemo(() => {
    const h200 = computeTypes.find((t) => t.type === "H200");
    const h100 = computeTypes.find((t) => t.type === "H100");
    const v4 = computeTypes.find((t) => t.type === "V4");

    return [
      h200 && {
        title: "H200 GPU",
        icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
        totalCards: h200.totalCards,
        countUpValue: h200Count,
      },
      h100 && {
        title: "H100 GPU",
        icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
        totalCards: h100.totalCards,
        countUpValue: h100Count,
      },
      v4 && {
        title: "V4 CPU",
        icon: <RiCpuLine className="h-4 w-4 text-mf-sally-500" />,
        totalCards: v4.totalCards,
        countUpValue: v4Count,
      },
    ].filter(Boolean) as Array<{
      title: string;
      icon: React.ReactNode;
      totalCards: number;
      countUpValue: string;
    }>;
  }, [computeTypes, h200Count, h100Count, v4Count]);

  if (isLoading || error || !auction || !auctionResults) {
    if (isLoading) {
      return (
        <div className="space-y-7">
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6"
              >
                <div className="h-6 w-32 mb-4 rounded bg-mf-night-400 animate-pulse" />
                <div className="h-16 w-full rounded bg-mf-night-400 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6"
              >
                <div className="h-6 w-40 mb-4 rounded bg-mf-night-400 animate-pulse" />
                <div className="h-26 w-full rounded bg-mf-night-400 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <></>;
  }

  return (
    <div className="space-y-7">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {card.icon}
              <h3 className="text-xs">{card.title}</h3>
            </div>
            <div
              className={`text-5xl font-saira font-[500] mb-1 ${
                card.totalCards === 0
                  ? "text-mf-night-200"
                  : "text-mf-sally-500"
              }`}
            >
              {card.totalCards === 0 ? "00" : card.countUpValue}
            </div>
            <div className="text-xs text-mf-milk-600">Total Cards</div>
          </div>
        ))}
      </div>

      {/* Detailed Target Cards Row */}
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-3">
        {computeTypes.map((computeType, index) => (
          <div
            key={index}
            className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 pb-8"
          >
            <div className="flex items-center gap-2 mb-4 group">
              <div className="flex items-center gap-2">
                {computeType.icon}
                <h3 className="text-sm">{computeType.displayName}</h3>
              </div>
              {computeType.badge && (
                <span className="bg-mf-sally-800 group-hover:bg-mf-sally-700 transition-colors rounded-full w-15 h-3.75 flex items-center justify-center gap-0.5">
                  <RiLockLine className="size-2 text-mf-sally-500" />
                  <span className="text-[0.45rem] font-light text-mf-milk-600">
                    {computeType.badge}
                  </span>
                </span>
              )}
            </div>

            <div className="border-t border-mf-border-600 pt-4">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                      <div className="text-sm text-mf-sally-500">
                        {computeType.targetCards.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <div className="text-xs text-mf-milk-600 whitespace-nowrap">
                      Target Cards
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                      <div className="text-sm text-mf-sally-500">
                        {(computeType.minClusterSize || 1)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>
                    <div className="text-xs text-mf-milk-600 whitespace-nowrap">
                      Min Cards Per Cluster
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                      <div className="text-sm text-mf-sybil-300">
                        ${(computeType.targetPrice / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs text-mf-milk-600 whitespace-nowrap">
                      Target Price
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                      <div className="text-sm text-mf-sybil-300">
                        ${(computeType.maxPrice / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-xs text-mf-milk-600 whitespace-nowrap">
                      Max Price
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetCards;
