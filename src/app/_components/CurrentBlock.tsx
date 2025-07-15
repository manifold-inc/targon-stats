import { reactClient } from "@/trpc/react";

const CurrentBlock = () => {
  const { data: currentBlock } = reactClient.chain.getCurrentBlock.useQuery();

  return (
    <div className="text-sm text-gray-500">Current Block: {currentBlock}</div>
  );
};

export default CurrentBlock;
