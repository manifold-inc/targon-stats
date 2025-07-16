const EmissionPool = ({ pool }: { pool: number }) => {
  return (
    <div className="text-sm text-gray-500">
      Emission Pool: {pool.toFixed(4)}
    </div>
  );
};

export default EmissionPool;
