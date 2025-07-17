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
      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-400"
              >
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
      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-red-400"
              >
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
      <div className="overflow-hidden rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-400"
              >
                No nodes found matching {searchTerm}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              UUID
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-400">
              Bid
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-400">
              Payout
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-400">
              Number of GPUs
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-400">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {sortedNodes.map((node: MinerNode, idx: number) => (
            <tr
              key={idx}
              onClick={() => onNavigateToMiner(node.uid)}
              className="cursor-pointer hover:bg-gray-800"
            >
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-100">
                {node.uid}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100">
                ${(node.price / 100).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100">
                ${(node.payout / node.gpus).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100">
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
