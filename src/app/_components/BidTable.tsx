import { NodePaymentStatus } from "@/app/_components/MinerDetails";
import { type MinerNode } from "@/server/api/routers/miners";
import { reactClient } from "@/trpc/react";

interface BidTableProps {
  searchTerm: string;
}

const BidTable = ({ searchTerm }: BidTableProps) => {
  const {
    data: nodes,
    isLoading,
    error,
  } = reactClient.miners.getAllNodes.useQuery();

  const filteredNodes =
    nodes?.filter((node) =>
      node.uid.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Sort by lowest to highest price
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    return a.price - b.price;
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-600 dark:text-gray-400"
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
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-red-600 dark:text-red-400"
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
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Bid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Number of GPUs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-600 dark:text-gray-400"
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
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              UUID
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Bid
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Number of GPUs
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Payout
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {sortedNodes.map((node: MinerNode, idx: number) => (
            <tr key={idx}>
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                {node.uid}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                ${(node.price / 100).toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                {node.gpus}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                ${(node.payout / node.gpus / 1.233).toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm">
                <span className="inline-flex rounded-full px-2 text-end text-xs font-semibold leading-5">
                  {NodePaymentStatus(node)}
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
