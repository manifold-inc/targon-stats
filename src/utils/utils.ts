import {
  type MinerNode,
  type MinerNodes,
  type MinerNodesWithIP,
} from "@/app/_components/MinerTable";
import { type AuctionResults } from "@/server/api/routers/chain";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { z } from "zod";

export const StatsSchema = z.object({
  max_tokens_per_second: z.number(),
  min_tokens_per_second: z.number(),
  range_tokens_per_second: z.number(),
  average_tokens_per_second: z.number(),
});

export async function copyToClipboard<T = string>(
  text: string,
  id: T,
  setCopiedId: (id: T | null) => void,
  resetTimeoutMs: 2000
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), resetTimeoutMs);
    return true;
  } catch (error) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (success) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), resetTimeoutMs);
        return true;
      } else {
        console.error("Fallback copy method failed");
        return false;
      }
    } catch (fallbackError) {
      console.error("Both clipboard methods failed:", fallbackError);
      return false;
    }
  }
}

export function getNodes(auction_results: AuctionResults): MinerNodes[] {
  const miners: MinerNodes[] = [];
  for (const gpu in auction_results) {
    for (const miner of auction_results[gpu]!) {
      const node = {
        uid: miner.uid,
        count: miner.count,
        payout: miner.payout,
        cards: miner.count,
        compute_type: gpu,
      } as MinerNodes;
      miners.push(node);
    }
  }
  return miners;
}

export function removeIPAddress(node: MinerNodesWithIP): MinerNode {
  const parsedNode = {
    uid: node.uid,
    payout: node.payout,
    count: node.count,
  } as MinerNode;
  return parsedNode;
}

export function handleSearchNavigation(
  term: string,
  route: string,
  setSearchTerm: (term: string) => void,
  router: AppRouterInstance
) {
  setSearchTerm(term);
  if (term.trim()) {
    router.push(`${route}?search=${encodeURIComponent(term)}`);
  } else {
    router.push(route);
  }
}

export function filterByUidSearch<T extends { uid: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) {
    return items;
  }

  const cleanedSearchTerm = searchTerm.replaceAll(" ", "");
  const searchArray = cleanedSearchTerm.split(",");

  if (searchArray.length > 1) {
    return items.filter((item) => {
      for (const uid of searchArray) {
        if (item.uid.toLowerCase() === uid.toLowerCase()) {
          return true;
        }
      }
      return false;
    });
  } else {
    return items.filter((item) => {
      return item.uid.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
}

export function handleBlockChange(
  block: number,
  setSelectedBlock: (block: number | undefined) => void,
  handleSearchChange: (term: string) => void
) {
  setSelectedBlock(block);
  handleSearchChange("");
}

export function CalculateInterval(block: number): number {
  return Math.floor(block / 360);
}
