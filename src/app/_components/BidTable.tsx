import NodePaymentStatusIcon from "@/app/_components/NodePaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";

interface BidTableProps {
  searchTerm: string;
  onNavigateToMiner: (uid: string) => void;
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

const BidTable = ({
  searchTerm,
  onNavigateToMiner,
  nodes,
  isLoading,
  error,
}: BidTableProps) => {
  const filteredNodes = nodes.filter((node: MinerNode) =>
    node.uid.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort by lowest to highest price
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    return a.price - b.price;
  });

  if (isLoading) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-white">
                Loading nodes...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-red-400">
                Error loading nodes: {error.message}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (searchTerm && filteredNodes.length === 0) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-white">
                No nodes found matching {searchTerm}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <table className="min-w-full">
        <thead className="bg-mf-sally-500/15 rounded-lg">
          <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
            <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
              <div className="flex items-center gap-1">
                UUID
              </div>
            </th>
            <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
              <div className="flex items-center justify-end gap-1">
                Bid
              </div>
            </th>
            <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
              <div className="flex items-center justify-end gap-1">
                Payout
              </div>
            </th>
            <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
              <div className="flex items-center justify-end gap-1">
                Number of GPUs
              </div>
            </th>
            <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
              <div className="flex items-center justify-end gap-1">
                Payment Status
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-mf-ash-500/15">
          {sortedNodes.map((node: MinerNode, idx: number) => (
            <tr
              key={idx}
              onClick={() => onNavigateToMiner(node.uid)}
              className="cursor-pointer hover:bg-mf-ash-500/30 bg-mf-ash-500/15 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
            >
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-white">
                {node.uid}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                ${(node.price / 100).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                ${(node.payout / node.gpus).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                {node.gpus}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm">
                <span className="px-2">
                  <NodePaymentStatusIcon node={node} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BidTable;
