const MaxBid = ({ maxBid }: { maxBid: number }) => {
  return (
    <div className="text-xs text-mf-edge-500">
      Max Bid{" "}
      <span className="ml-2 rounded-lg bg-[#272D38] px-9 py-1.5 text-mf-sybil-300 md:px-6">
        ${(maxBid / 100).toFixed(2)}
      </span>
    </div>
  );
};

export default MaxBid;
