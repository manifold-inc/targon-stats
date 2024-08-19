"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { useAuth } from "./providers";

const HeaderContent = () => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBits, setSelectedBits] = useState(0b1000); // Default to "All Validators"
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelection = (bitValue: number) => {
    let newSelectedBits = selectedBits ^ bitValue;

    // If no other options are selected, default to "All Validators"
    if (newSelectedBits === 0) {
      newSelectedBits = 0b1000; // Default to "All Validators"
    } else if (newSelectedBits & 0b1000) {
      newSelectedBits &= ~0b1000; // Unselect "All Validators" when another option is selected
    }

    setSelectedBits(newSelectedBits);

    // Update the URL parameters without any path restriction
    const currentParams = new URLSearchParams(searchParams);

    if (newSelectedBits === 0b1000) {
      currentParams.delete("validators");
    } else {
      currentParams.set(
        "validators",
        newSelectedBits.toString(2).padStart(4, "0"), // Pad to 4 bits for consistency
      );
    }

    // Replace the current URL with the new one
    router.replace(`?${currentParams.toString()}`);
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
    const validator = searchParams.get("validators");
    if (validator) {
      setSelectedBits(parseInt(validator, 2));
    } else if (pathName !== "/" && pathName !== "/metrics") {
      const defaultBits = 0b1000;
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("validators", defaultBits.toString(2).padStart(4, "0"));
      router.replace(`?${currentParams.toString()}`, undefined);
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchParams, router, isDropdownOpen, pathName]);

  return (
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Home</Link>
        <Link href="/metrics">Metrics</Link>
        <Link href="/stats/miner">Miners</Link>
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="flex items-center gap-1">
            Validators
            {isDropdownOpen ? (
              <ChevronUp className="px-1 py-0.5" />
            ) : (
              <ChevronDown className="px-1 py-0.5" />
            )}
          </button>
          {isDropdownOpen && (
            <div
              className={`-translate-x-1/5 absolute right-0 z-50 mt-2 min-w-fit transform whitespace-nowrap rounded-md bg-white p-2 shadow-lg dark:bg-neutral-700 dark:text-gray-300`}
            >
              <div
                onClick={() => handleSelection(0b0001)}
                className="flex cursor-pointer items-center gap-2 p-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b0001 ? (
                    <Check className="text-black dark:text-white" />
                  ) : null}
                </span>
                Manifold
              </div>
              <div
                onClick={() => handleSelection(0b0010)}
                className="flex cursor-pointer items-center gap-2 p-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b0010 ? (
                    <Check className="text-black dark:text-white" />
                  ) : null}
                </span>
                Openτensor Foundaτion
              </div>
              <div
                onClick={() => handleSelection(0b0100)}
                className="flex cursor-pointer items-center gap-2 p-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b0100 ? (
                    <Check className="text-black dark:text-white" />
                  ) : null}
                </span>
                RoundTable21
              </div>
            </div>
          )}
        </div>
        {auth.status === "AUTHED" ? (
          <>
            <Link href="/docs">API</Link>
            <Link prefetch={false} href="/sign-out">
              Sign Out
            </Link>
          </>
        ) : (
          <Link href="/sign-in">Sign in</Link>
        )}
      </nav>
    </header>
  );
};

export default function Header() {
  return (
    <Suspense fallback="Loading...">
      <HeaderContent />
    </Suspense>
  );
}
