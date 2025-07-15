const MaxBid = ({ maxBid }: { maxBid: number }) => {
  return (
    <div className="text-sm text-gray-500">
      Max Bid: ${(maxBid / 100).toFixed(2)}
    </div>
  );
};

export default MaxBid;
