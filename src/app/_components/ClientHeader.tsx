"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Check, ChevronDown, Menu, X } from "lucide-react";

import { useAuth } from "./providers";

interface ClientHeaderProps {
  validators: string[];
}

const ClientHeader = ({ validators }: ClientHeaderProps) => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const showValidatorRequests =
    pathname === "/" || pathname.includes("/stats/miner");

  const [selectedBits, setSelectedBits] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleValidator = (index: number) => {
    setSelectedBits((prevBits) => {
      if (!validators) return null;
      if (!prevBits) {
        prevBits = new Array(validators.length + 1).join("0");
      }
      const firstPart = prevBits.substring(0, index);
      const lastPart = prevBits.substring(index + 1);
      let nextPart = "0";
      if (prevBits[index] === "0") nextPart = "1";
      const newBits = firstPart + nextPart + lastPart;
      const params = new URLSearchParams(searchParams);
      if (!newBits.includes("0")) {
        params.delete("validators");
      } else {
        params.set("validators", newBits);
      }
      router.replace(`?${params.toString()}`);
      return newBits;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Targon Stats</span>
            <span className="text-xl font-bold">Targon Stats</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/"
            className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
          >
            Home
          </Link>
          <Link
            href="/stats/miner"
            className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
          >
            Miners
          </Link>
          <Link
            href="/stats/validator"
            className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
          >
            Validators
          </Link>
          <Link
            href="/stats/overview"
            className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
          >
            Historical
          </Link>
          <Link
            href="/docs"
            className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
          >
            API
          </Link>
          {showValidatorRequests && validators && validators.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
              >
                Validator Requests
                <ChevronDown
                  className={`size-5 flex-none text-gray-400 transition ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 dark:bg-neutral-800 dark:ring-gray-700/5">
                  <div className="p-4">
                    {validators.map((validator, index) => (
                      <div
                        key={index}
                        onClick={() => toggleValidator(index)}
                        className="group relative flex cursor-pointer items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50 dark:hover:bg-neutral-700"
                      >
                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                          {(selectedBits?.[index] ?? "1") == "1" ? (
                            <Check className="h-3 w-3" />
                          ) : null}
                        </div>
                        <div className="flex-auto">
                          <span className="block font-semibold text-gray-900 dark:text-gray-100">
                            {validator}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {auth.status === "AUTHED" ? (
            <Link
              prefetch={false}
              href="/sign-out"
              className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
            >
              Sign Out <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm/6 font-semibold text-gray-900 dark:text-gray-100"
            >
              Sign in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 dark:bg-neutral-900 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-gray-700/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Targon Stats</span>
              <span className="text-xl font-bold">Targon Stats</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            >
              <span className="sr-only">Close menu</span>
              <X className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/20">
              <div className="space-y-2 py-6">
                <Link
                  href="/"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/stats/miner"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Miners
                </Link>
                <Link
                  href="/stats/validator"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Validators
                </Link>
                <Link
                  href="/stats/overview"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Historical
                </Link>
                <Link
                  href="/docs"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  API
                </Link>

                {showValidatorRequests &&
                  validators &&
                  validators.length > 0 && (
                    <Disclosure as="div" className="-mx-3">
                      {({ open }) => (
                        <>
                          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800">
                            Validator Requests
                            <ChevronDown
                              className={`size-5 flex-none transition ${open ? "rotate-180" : ""}`}
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2 space-y-2">
                            {validators.map((validator, index) => (
                              <div
                                key={index}
                                onClick={() => toggleValidator(index)}
                                className="flex cursor-pointer items-center gap-x-3 rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                              >
                                <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                                  {(selectedBits?.[index] ?? "1") == "1" ? (
                                    <Check className="h-3 w-3" />
                                  ) : null}
                                </div>
                                {validator}
                              </div>
                            ))}
                          </DisclosurePanel>
                        </>
                      )}
                    </Disclosure>
                  )}
              </div>
              <div className="py-6">
                {auth.status === "AUTHED" ? (
                  <Link
                    prefetch={false}
                    href="/sign-out"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default ClientHeader;
