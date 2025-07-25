"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      <nav
        aria-label="Global"
        className="w-fullitems-center mx-auto flex justify-between p-6 lg:px-8"
      >
        <div className="flex items-center lg:flex-1">
          <Image
            src="/targon-logo.svg"
            alt="Targon-logo"
            width={24}
            height={24}
            className="mr-2 h-5 w-5"
          />
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Targon </span>
            <span className="font-blinker text-xl font-bold tracking-wider text-mf-edge-500 ">
              TARGON{" "}
            </span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-3">
          <Link
            href="/"
            className="font-poppins rounded-lg bg-[#272D38] px-7 py-0.5 text-sm/6 font-medium text-[#8DC7FE]"
          >
            Home
          </Link>
          <Link
            href="/docs"
            className="font-poppins rounded-lg bg-mf-sally-500 px-7 py-0.5 text-sm/6 font-semibold text-mf-ash-500"
          >
            API Docs
          </Link>
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-neutral-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-700/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Targon Stats</span>
              <span className="text-xl font-bold">Targon Stats</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-300"
            >
              <span className="sr-only">Close menu</span>
              <X className="size-6" />
            </button>
          </div>
          <div className="-mt-20 flex h-full flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/"
                className="font-poppins w-36 rounded-lg bg-[#272D38] px-7 py-2 text-center text-lg font-medium text-[#8DC7FE]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/docs"
                className="font-poppins w-36 rounded-lg bg-mf-sally-500 px-7 py-2 text-center text-lg font-semibold text-mf-ash-500"
                onClick={() => setMobileMenuOpen(false)}
              >
                API Docs
              </Link>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Header;
