"use client";

import Link from "next/link";
import { Dialog, DialogPanel } from "@headlessui/react";
import { RiCloseLine } from "@remixicon/react";
import TopStats from "@/app/_components/header/TopStats";
import TopButtons from "@/app/_components/header/TopButtons";
import Branding from "@/app/_components/header/Branding";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  columnLayout?: boolean;
}

const MobileMenu = ({ open, onClose, columnLayout = true }: MobileMenuProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="lg:hidden"
    >
      <div className="fixed inset-0 z-10" />
      <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-mf-night-500 px-6 py-6 sm:max-w-sm border-l border-mf-border-600">
        <div className="flex items-center justify-between sm:justify-end">
          <div className="sm:hidden -translate-x-[1px]">
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
        <div className="-mt-20 flex h-full flex-col items-center justify-center">
          <div className={`flex ${columnLayout ? 'flex-col' : 'flex-row'} items-center gap-8`}>
            <TopStats columnLayout={columnLayout} />
            <TopButtons columnLayout={columnLayout} />
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default MobileMenu;
