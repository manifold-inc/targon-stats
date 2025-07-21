const CurrentBlock = ({ block }: { block: number }) => {
  return (
    <div className="text-xs text-mf-edge-500 flex items-center">
      Current{" "}
      <span className="ml-2 rounded-lg bg-[#272D38] px-6 py-1.5 text-mf-sally-500 inline-flex items-center gap-2">
        <img src="/box.svg" alt="Block" width={16} height={16} className="h-4 w-4" />
        {block}
      </span>
    </div>
  );
};

export default CurrentBlock;
