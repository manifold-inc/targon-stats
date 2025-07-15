import { reactClient } from "@/trpc/react";

const MaxBid = () => {
  const { data } = reactClient.bids.getMaxBid.useQuery();
  if (!data) return null;

  return (
    <div className="text-sm text-gray-500">
      Max Bid: ${(data / 100).toFixed(2)}
    </div>
  );
};

export default MaxBid;
