import { z } from "zod";

import { type MinerNode } from "@/app/api/bids/route";
import { type Miner } from "@/app/api/miners/route";
import { type Auction } from "@/server/api/routers/chain";

export const StatsSchema = z.object({
  max_tokens_per_second: z.number(),
  min_tokens_per_second: z.number(),
  range_tokens_per_second: z.number(),
  average_tokens_per_second: z.number(),
});

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy"); // @TODO
    document.body.removeChild(textArea);
  }
}

export function getNodesByMiner(auction_results: Auction): Miner[] {
  const miners: Record<string, Miner> = {};

  for (const gpu in auction_results) {
    for (const miner of auction_results[gpu]!) {
      if (!miners[miner.uid]) {
        miners[miner.uid] = {
          uid: miner.uid,
          average_price: miner.price,
          total_price: miner.price,
          average_payout: miner.payout,
          total_payout: miner.payout,
          gpus: miner.gpus,
          nodes: 1,
          diluted: miner.diluted,
        };
        continue;
      }
      miners[miner.uid]!.total_price += miner.price;
      miners[miner.uid]!.total_payout += miner.payout;
      miners[miner.uid]!.nodes += 1;
    }
  }

  return Object.values(miners).map((miner) => ({
    ...miner,
    average_price: miner.total_price / miner.nodes,
    average_payout: miner.total_payout / miner.nodes,
  }));
}

export function getNodes(auction_results: Auction): MinerNode[] {
  const miners: MinerNode[] = [];
  for (const gpu in auction_results) {
    for (const miner of auction_results[gpu]!) {
      const node = {
        uid: miner.uid,
        gpus: miner.gpus,
        price: miner.price,
        payout: miner.payout,
        diluted: miner.diluted,
      } as MinerNode;
      miners.push(node);
    }
  }
  return miners;
}

export function removeIPAddress(node: MinerNode): MinerNode {
  const parsedNode = {
    uid: node.uid,
    gpus: node.gpus,
    price: node.price,
    payout: node.payout,
    diluted: node.diluted,
  } as MinerNode;
  return parsedNode;
}

export function CalculateInterval(block: number): number {
  return Math.floor(block / 360);
}
