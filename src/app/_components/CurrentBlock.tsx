import { reactClient } from "@/trpc/react";

const CurrentBlock = () => {
  const { data } = reactClient.chain.getCurrentBlock.useQuery();

  return <div className="text-sm text-gray-500">Current Block: {data}</div>;
};

export default CurrentBlock;
