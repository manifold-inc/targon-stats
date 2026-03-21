import { type Auction, type AuctionResults } from "@/types";
import { RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";
import type { ReactNode } from "react";

export const KNOWN_COMPUTE_SORT_ORDER = [
  "B200",
  "H200",
  "H100",
  "RTX6000B",
  "V4",
] as const;

const BADGE_FRIENDLY_LABEL: Record<string, string> = {
  TDX: "Intel TDX",
  SEV: "AMD SEV",
};

function tokenIsVendorOrSkuSegment(token: string): boolean {
  const u = token.toUpperCase();
  if (
    [
      "NVIDIA",
      "AMD",
      "INTEL",
      "HOPPER",
      "BLACKWELL",
      "EPYC",
      "CPU",
      "GPU",
    ].includes(u)
  ) {
    return true;
  }
  if (/^[BH]\d{3}$/.test(u)) return true;
  if (/^V\d+$/i.test(u)) return true;
  if (/^MI\d{2,4}$/i.test(u)) return true;
  if (/^RTX\d+/i.test(u)) return true;
  return false;
}

function badgeLabelFromComputeTypeName(
  computeTypeName: string
): string | undefined {
  for (const raw of computeTypeName.split(/[-_]/)) {
    const t = raw.trim();
    if (!t || tokenIsVendorOrSkuSegment(t)) continue;
    const u = t.toUpperCase();
    if (u.length < 2 || u.length > 8) continue;
    if (!/^[A-Z]+$/.test(u)) continue;
    return BADGE_FRIENDLY_LABEL[u] ?? u;
  }
  return undefined;
}

export interface ComputeTypeInfo {
  name: string;
  displayName: string;
  sortKey: string;
  badge?: string;
  icon: ReactNode;
  totalCards: number;
  targetCards: number;
  targetPrice: number;
  maxPrice: number;
  minClusterSize: number;
}

export function buildComputeTypesFromAuction(
  auctions: Record<string, Auction>,
  auctionResults: AuctionResults
): ComputeTypeInfo[] {
  const types: ComputeTypeInfo[] = [];

  for (const [computeTypeName, auctionData] of Object.entries(auctions)) {
    const isB200 = computeTypeName.includes("B200");
    const isH200 = computeTypeName.includes("H200");
    const isH100 = computeTypeName.includes("H100");
    const isRTX6000B = /RTX\s*6000\s*B|RTX6000B/i.test(computeTypeName);
    const isV4 = computeTypeName.includes("V4");
    const isAMD = computeTypeName.includes("AMD");
    const isNVIDIA = computeTypeName.includes("NVIDIA");

    let displayName = computeTypeName;
    let sortKey: string = computeTypeName;
    const badge = badgeLabelFromComputeTypeName(computeTypeName);

    if (isB200) {
      sortKey = "B200";
      displayName = isNVIDIA ? "INTEL NVIDIA B200" : "B200 GPU";
    } else if (isH200) {
      sortKey = "H200";
      displayName = isNVIDIA ? "INTEL NVIDIA H200" : "H200 GPU";
    } else if (isH100) {
      sortKey = "H100";
      displayName = isNVIDIA ? "INTEL NVIDIA H100" : "H100 GPU";
    } else if (isRTX6000B) {
      sortKey = "RTX6000B";
      displayName = isNVIDIA ? "INTEL NVIDIA RTX6000B" : "RTX6000B GPU";
    } else if (isV4) {
      sortKey = "V4";
      displayName = isAMD ? "AMD CPU V4" : "V4 CPU";
    }

    const totalCards =
      auctionResults[computeTypeName]?.reduce(
        (total, node) => total + (node.count || 0),
        0
      ) || 0;

    const useCpuIcon =
      isV4 ||
      (/\bCPU\b/i.test(computeTypeName) && !/\bGPU\b/i.test(computeTypeName));

    const icon = useCpuIcon ? (
      <RiCpuLine className="h-5 w-5 text-mf-sally-500" />
    ) : (
      <RiHardDrive3Fill className="h-5 w-5 text-mf-sally-500" />
    );

    types.push({
      name: computeTypeName,
      displayName,
      sortKey,
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
    const ia = KNOWN_COMPUTE_SORT_ORDER.indexOf(
      a.sortKey as (typeof KNOWN_COMPUTE_SORT_ORDER)[number]
    );
    const ib = KNOWN_COMPUTE_SORT_ORDER.indexOf(
      b.sortKey as (typeof KNOWN_COMPUTE_SORT_ORDER)[number]
    );
    const ra = ia === -1 ? KNOWN_COMPUTE_SORT_ORDER.length : ia;
    const rb = ib === -1 ? KNOWN_COMPUTE_SORT_ORDER.length : ib;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });
}

const HEADER_BADGE_MAX_BASE_LEN = 14;

function truncateHeaderBadgeBase(s: string, maxLen: number): string {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(1, maxLen - 1))}…`;
}

function isKnownSkuSortKey(
  sortKey: string
): sortKey is (typeof KNOWN_COMPUTE_SORT_ORDER)[number] {
  return (KNOWN_COMPUTE_SORT_ORDER as readonly string[]).includes(sortKey);
}

export function headerBadgeCaption(ct: ComputeTypeInfo): string {
  const isCpu =
    ct.name.includes("V4") ||
    (/\bCPU\b/i.test(ct.name) && !/\bGPU\b/i.test(ct.name));
  const unit = isCpu ? "CPUs" : "GPUs";

  let base: string;
  if (isKnownSkuSortKey(ct.sortKey)) {
    base = ct.sortKey;
  } else {
    const stripped = ct.displayName.replace(/\s+(GPU|CPU)\s*$/i, "").trim();
    base = truncateHeaderBadgeBase(
      stripped || ct.name,
      HEADER_BADGE_MAX_BASE_LEN
    );
  }

  return `${base} ${unit}`;
}

export function headerBadgeFullLabel(ct: ComputeTypeInfo): string {
  return ct.displayName;
}
