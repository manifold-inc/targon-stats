import NodePaymentStatusIcon from "@/app/_components/NodePaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";

interface MinerDetailsProps {
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

export default function MinerDetails({
  nodes,
  isLoading,
  error,
}: MinerDetailsProps) {
  if (isLoading) {
    return (
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-gray-400"
        >
          Loading miner details...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-red-400"
        >
          Error loading miner details: {error.message}
        </td>
      </tr>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-gray-400"
        >
          No details found for this miner.
        </td>
      </tr>
    );
  }

  return (
    <>
      {nodes.map((node, index) => (
        <tr
          key={index}
          className="divide-y divide-gray-700 border-none bg-gray-800/50"
        >
          <td className="whitespace-nowrap px-6 py-4 bg-gray-900"></td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100 border-gray-700">
            ${(node.price / 100).toFixed(2)}/h
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100 border-gray-700">
            {/* TODO: Remove division once payout is calculated correctly */}$
            {(node.payout / 8).toFixed(2)}/h
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-100 border-gray-700">
            {node.gpus}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm border-gray-700">
            <span className="px-2">
              <NodePaymentStatusIcon node={node} />
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
