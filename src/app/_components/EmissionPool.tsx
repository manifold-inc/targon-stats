const EmissionPool = ({ pool }: { pool: number }) => {
  return (
    <div className="text-xs text-mf-edge-500">
      <span className="hidden sm:inline"> Emission </span>Pool{" "}
      <span className="ml-2 rounded-lg bg-[#272D38] px-6 py-1.5 text-mf-sybil-300">
        {" "}
        {pool.toFixed(4)}{" "}
      </span>
    </div>
  );
};

export default EmissionPool;
