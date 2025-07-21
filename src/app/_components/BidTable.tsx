  "use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import NodePaymentStatusIcon from "@/app/_components/NodePaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";

enum SortField {
  UID = "uid",
  PRICE = "price", 
  PAYOUT = "payout",
  GPUS = "gpus",
  PAYMENT_STATUS = "payment_status",
  NULL = 0,
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
  NULL = 0,
}

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
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);

  const handleSort = (selectedField: SortField) => {
    if (field === selectedField) {
      switch (direction) {
        case SortDirection.ASC:
          setDirection(SortDirection.DESC);
          break;
        case SortDirection.DESC:
          setField(SortField.NULL);
          setDirection(SortDirection.NULL);
          break;
        default:
          break;
      }
    } else {
      setField(selectedField);
      setDirection(SortDirection.ASC);
    }
  };

  const getIcon = (selectedField: SortField) => {
    if (field !== selectedField) return <ArrowUpDown className="h-4 w-4" />;

    switch (direction) {
      case SortDirection.ASC:
        return <ArrowUp className="h-4 w-4" />;
      case SortDirection.DESC:
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const sortNodes = (nodes: MinerNode[]) => {
    if (field === SortField.NULL || direction === SortDirection.NULL)
      return nodes;

    return [...nodes].sort((a, b) => {
      switch (field) {
        case SortField.UID:
          return direction === SortDirection.ASC
            ? Number(a.uid) - Number(b.uid)
            : Number(b.uid) - Number(a.uid);
        case SortField.PRICE:
          return direction === SortDirection.ASC
            ? a.price - b.price
            : b.price - a.price;
        case SortField.PAYOUT:
          return direction === SortDirection.ASC
            ? a.payout - b.payout
            : b.payout - a.payout;
        case SortField.GPUS:
          return direction === SortDirection.ASC
            ? a.gpus - b.gpus
            : b.gpus - a.gpus;
        case SortField.PAYMENT_STATUS:
          return direction === SortDirection.ASC
            ? a.diluted ? 1 : -1
            : b.diluted ? 1 : -1;
        default:
          return 0;
      }
    });
  };

  const filteredNodes = nodes.filter((node: MinerNode) =>
    node.uid.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sorted = sortNodes(filteredNodes);

  if (isLoading) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700 font-poppins">
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
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-red-400 font-poppins">
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
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Bid
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payout
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Number of GPUs
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Payment Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={5} className="whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700 font-poppins">
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
            <th 
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.UID)}
            >
              <div className="flex items-center gap-1">
                UUID
                {getIcon(SortField.UID)}
              </div>
            </th>
            <th 
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.PRICE)}
            >
              <div className="flex items-center justify-end gap-1">
                Bid
                {getIcon(SortField.PRICE)}
              </div>
            </th>
            <th 
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.PAYOUT)}
            >
              <div className="flex items-center justify-end gap-1">
                Payout
                {getIcon(SortField.PAYOUT)}
              </div>
            </th>
            <th 
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.GPUS)}
            >
              <div className="flex items-center justify-end gap-1">
                Number of GPUs
                {getIcon(SortField.GPUS)}
              </div>
            </th>
            <th 
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.PAYMENT_STATUS)}
            >
              <div className="flex items-center justify-end gap-1">
                Payment Status
                {getIcon(SortField.PAYMENT_STATUS)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-mf-ash-500/15">
          {sorted.map((node: MinerNode, idx: number) => (
            <tr
              key={idx}
              onClick={() => onNavigateToMiner(node.uid)}
              className="cursor-pointer hover:bg-mf-ash-500/30 bg-mf-ash-500/15 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
            >
              <td className="whitespace-nowrap px-6 py-4 font-poppins text-sm text-mf-edge-700">
                {node.uid}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-mf-sybil-500 font-poppins">
                ${(node.price / 100).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-mf-sybil-500 font-poppins">
                ${(node.payout / node.gpus).toFixed(2)}/h
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-mf-edge-700 font-poppins">
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
