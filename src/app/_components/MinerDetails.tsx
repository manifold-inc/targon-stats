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
        <td colSpan={5} className="py-4 text-center text-gray-400">
          Loading miner details...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={5} className="py-4 text-center text-red-400">
          Error loading miner details: {error.message}
        </td>
      </tr>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="py-4 text-center text-gray-400">
          No details found for this miner.
        </td>
      </tr>
    );
  }

  return (
    <>
      {nodes.map((node, index) => (
        <tr key={index}>
          <td className="bg-mf-ash-700" />
          <td colSpan={4} className="p-0 align-middle">
            <div className="rounded-xl border-2 border-mf-ash-300 bg-mf-ash-500/15">
              <table className="w-full">
                <tr>
                  <td style={{ width: '22.5%' }} className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                    ${(node.price / 100).toFixed(5)}
                  </td>
                  <td style={{ width: '25%' }} className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                    ${(node.payout / 8).toFixed(5)}
                  </td>
                  <td style={{ width: '25%' }} className="whitespace-nowrap px-6 py-4 text-end text-sm text-white">
                    {node.gpus}
                  </td>
                  <td style={{ width: '25%' }} className="whitespace-nowrap px-6 py-4 text-end text-sm">
                    <span className="px-2">
                      <NodePaymentStatusIcon node={node} />
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
