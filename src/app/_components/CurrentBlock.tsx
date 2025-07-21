const CurrentBlock = ({ block }: { block: number }) => {
  return (
    <div className="text-xs text-mf-edge-500">
      Current Block{" "}
      <span className="ml-2 rounded-lg bg-[#272D38] px-6 py-1.5 text-mf-sybil-300">
        {" "}
        {block}{" "}
      </span>
    </div>
  );
};

export default CurrentBlock;
