const TaoPrice = ({ price }: { price: number }) => {
  return (
    <div className="text-xs text-mf-edge-500">
      Tao Price{" "}
      <span className="ml-2 rounded-lg bg-[#272D38] px-7 md:px-6 py-1.5 text-mf-sybil-300">
        {"$"}
        {price.toFixed(2)}{" "}
      </span>
    </div>
  );
};

export default TaoPrice;
