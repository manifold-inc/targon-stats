export interface Config {
  layers: number;
}

export type MinerNode = {
  ip: string;
  uid: string;
  payout: number;
  count: number;
};

export type MinerNodes = {
  uid: string;
  payout: number;
  compute_type: string;
  cards: number;
};

export type MinerNodesWithIP = {
  ip: string;
  uid: string;
  payout: number;
  count: number;
};

export type AuctionResults = Record<string, MinerNode[]>;

export type Auction = {
  target_cards: number;
  target_nodes: number;
  target_price: number;
  max_price: number;
  min_cluster_size: number;
};

export interface AuctionState {
  auction_results: AuctionResults;
  auctions: Record<string, Auction>;
  emission_pool: number;
  block: number;
  tao_price: number;
  timestamp: Date;
  weights: { uids: number[]; incentives: number[] };
  hotkey_to_uid: Record<string, string>;
}

export interface BarData {
  uid: string;
  value: number;
  index: number;
}
