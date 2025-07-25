import Image from "next/image";

const CurrentBlock = ({ block }: { block: number }) => {
  return (
    <div className="flex items-center text-xs text-mf-edge-500 md:pr-2">
      <span className="mr-1.5 md:mr-0">Current </span>{" "}
      <span className="ml-3 inline-flex items-center gap-2 rounded-lg bg-[#272D38] px-5 py-1.5 text-mf-sally-500 md:ml-2 md:px-6">
        <Image
          src="/box.svg"
          alt="Block"
          width={16}
          height={16}
          className="hidden h-4 w-4 sm:block"
        />
        {block}
      </span>
    </div>
  );
};

export default CurrentBlock;
