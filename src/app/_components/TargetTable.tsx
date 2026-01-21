import { type Auction, type AuctionResults } from "@/server/api/routers/chain";

interface TargetTableProps {
  auctionResults?: AuctionResults;
  auction?: Record<string, Auction>;
  isLoading: boolean;
  error: Error | null;
}

const TargetTable = ({
  auctionResults,
  auction,
  isLoading,
  error,
}: TargetTableProps) => {
  if (!auction || isLoading || error || !auctionResults) {
    return <></>;
  }
  let block = "";
  for (const auc in auction) {
    block += auc + "\n";
    block +=
      "\t" +
      "TargetNodes " +
      (auction[auc]?.target_cards ?? auction[auc]?.target_nodes);
    block += "\n\t" + "TargetPrice " + auction[auc]?.target_price;
    block += "\n\t" + "MaxPrice " + auction[auc]?.max_price;
    block += "\n\t" + "MinClusterSize " + auction[auc]?.min_cluster_size;
    block += "\n\n";
  }
  let res = "";
  for (const r in auctionResults) {
    res += `${r}: ${auctionResults[r]?.reduce((total, re) => re.count + total, 0)} Cards\n`;
  }

  return (
    <>
      <div className="prose">
        <pre>
          <code>{block}</code>
        </pre>
      </div>
      <div className="prose pt-12">
        <h2 className="font-blinker text-lg font-semibold tracking-wider text-mf-edge-500">
          Current Compute Online
        </h2>
        <pre>
          <code>{res}</code>
        </pre>
      </div>
    </>
  );
};
export default TargetTable;
