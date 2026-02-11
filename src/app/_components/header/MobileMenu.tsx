"use client";

import Box from "@/app/_components/Box";
import Branding from "@/app/_components/header/Branding";
import TopButtons from "@/app/_components/header/TopButtons";
import TopStats from "@/app/_components/header/TopStats";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  RiArrowUpBoxFill,
  RiBarChartFill,
  RiCloseLine,
  RiRecordCircleFill,
  RiToolsFill,
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  columnLayout?: boolean;
}

const MobileMenu = ({
  open,
  onClose,
  columnLayout = true,
}: MobileMenuProps) => {
  const pathname = usePathname();

  const navigation = [
    {
      pathname: "/",
      title: "Stats",
      icon: RiBarChartFill,
    },
    {
      pathname: "/miners",
      title: "Miners",
      icon: RiToolsFill,
    },
    {
      pathname: "/weights",
      title: "Weights",
      icon: RiArrowUpBoxFill,
    },
    {
      pathname: "/targets",
      title: "Targets",
      icon: RiRecordCircleFill,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="lg:hidden">
      <div className="fixed inset-0 z-10" />
      <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-mf-night-500 px-6 py-6 sm:max-w-sm border-l border-mf-border-600">
        <div className="flex items-center justify-between sm:justify-end">
          <div className="sm:hidden -translate-x-px">
            <Branding />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-m-2.5 rounded-md p-2.5 text-gray-300 sm:-mt-[5px]"
          >
            <RiCloseLine className="size-5 hover:opacity-80" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-8 translate-y-20 pb-20">
          {/* Navigation Items */}
          <div className="flex flex-col items-center gap-8">
            {navigation.map((route, index) => {
              const Icon = route.icon;
              const isActive = pathname === route.pathname;

              return (
                <Link
                  key={index}
                  href={route.pathname}
                  onClick={onClose}
                  className="cursor-pointer"
                >
                  <Box
                    icon={<Icon className="h-3.5 w-3.5 text-mf-sally-500" />}
                    value={route.title}
                    valueClassName={
                      isActive ? "text-mf-milk-500" : "text-mf-milk-700"
                    }
                  />
                </Link>
              );
            })}
          </div>

          {/* TopStats and TopButtons */}
          <div
            className={`flex ${columnLayout ? "flex-col" : "flex-row"} items-center gap-8`}
          >
            <TopStats columnLayout={columnLayout} />
            <TopButtons columnLayout={columnLayout} />
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default MobileMenu;
