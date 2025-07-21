import { type MinerNode } from "@/app/api/bids/route";

interface WeightTableProps {
  weights: Record<string, number[]>;
  searchTerm: string;
  onNavigateToMiner: (uid: string) => void;
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

const WeightTable = ({
  weights,
  searchTerm,
  onNavigateToMiner,
  nodes,
  isLoading,
  error,
}: WeightTableProps) => {
  const uids = weights.uids;
  const incentive = weights.incentives;
  const weightMap = new Map(
    uids?.map((uid, index) => [String(uid), incentive?.[index]]),
  );

  searchTerm = searchTerm.replaceAll(" ", "");

  const searchArray = searchTerm.split(",");

  const filteredNodes = nodes.filter((node: MinerNode) => {
    for (const uid of searchArray) {
      if (node.uid.toLowerCase().includes(uid.toLowerCase())) {
        return true;
      }
    }
    return false;
  });

  // Sort by lowest to highest price
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    return a.price - b.price;
  });

  // Deduplicate nodes by uid
  const uniqueNodes = Array.from(
    new Map(sortedNodes.map((node) => [node.uid, node])).values(),
  );

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Weight
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
                Weight
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                UUID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Weight
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
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              UUID
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Weight
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {uniqueNodes.map((node: MinerNode, idx: number) => (
            <tr
              key={idx}
              onClick={() => onNavigateToMiner(node.uid)}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                {node.uid}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                {((weightMap.get(node.uid) ?? 0) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeightTable;
