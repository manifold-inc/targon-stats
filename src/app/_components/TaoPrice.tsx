const TaoPrice = ({ price }: { price: number }) => {
  return (
    <div className="text-sm text-gray-500">Tao Price: {price.toFixed(4)}</div>
  );
};

export default TaoPrice;
