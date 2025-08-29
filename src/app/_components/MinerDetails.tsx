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
        <td colSpan={5} className="font-poppins py-4 text-center text-gray-400">
          Loading miner details...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={5} className="font-poppins py-4 text-center text-red-400">
          Error loading miner details: {error.message}
        </td>
      </tr>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="font-poppins py-4 text-center text-gray-400">
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
            <div className="rounded-xl border-2 border-mf-ash-300 border-opacity-25 bg-mf-night-700/50">
              <table className="w-full">
                <tr>
                  <td
                    style={{ width: "22.5%" }}
                    className="font-poppins whitespace-nowrap px-3 py-3 text-end text-xs text-mf-edge-500 md:px-9 md:text-sm"
                  >
                    ${(node.price / 100).toFixed(2)}
                  </td>
                  <td
                    style={{ width: "25%" }}
                    className="font-poppins whitespace-nowrap py-3 text-end text-xs text-mf-edge-500 md:px-9 md:text-sm"
                  >
                    ${(node.payout / 8).toFixed(2)}
                  </td>
                  <td
                    style={{ width: "25%" }}
                    className="font-poppins whitespace-nowrap px-0 py-3 text-end text-xs text-mf-edge-500 md:px-6 md:text-sm"
                  >
                    {node.count}
                  </td>
                  <td
                    style={{ width: "25%" }}
                    className="whitespace-nowrap px-0 py-3 text-end text-xs md:px-6 md:text-sm"
                  >
                    <span className="px-3.5 md:px-1.5">
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
