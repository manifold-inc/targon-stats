"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { useAuth } from "./providers";

export const Header = () => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBits, setSelectedBits] = useState(0b100); // Default to "All Validators"

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelection = (bitValue: number) => {
    // Toggle the selected bit value
    let newSelectedBits = selectedBits ^ bitValue;

    // If no bits are selected, default to "All Validators"
    if (newSelectedBits === 0) {
      newSelectedBits = 0b100;
    } else if (newSelectedBits & 0b100) {
      // If any other bits are selected, deselect "All Validators"
      newSelectedBits &= ~0b100;
    }

    setSelectedBits(newSelectedBits);

    // Update the router's query parameters with the new bit value
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(
      "validators",
      newSelectedBits.toString(2).padStart(3, "0"),
    );
    router.replace(`?${currentParams.toString()}`, undefined);
  };

  useEffect(() => {
    const validator = searchParams.get("validators");
    if (validator) {
      setSelectedBits(parseInt(validator, 2)); // Parse the binary string into an integer
    } else {
      // Ensure "All Validators" is selected by default
      const defaultBits = 0b100;
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("validators", defaultBits.toString(2).padStart(3, "0"));
      router.replace(`?${currentParams.toString()}`, undefined);
    }
  }, [searchParams, router]);

  return (
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Homepage</Link>
        <Link href="/stats">Stats</Link>
        <Link href="/stats/miner">Miners</Link>
        <div className="relative">
          <button onClick={toggleDropdown} className="flex items-center gap-2">
            Validators
            {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isDropdownOpen && (
            <div
              className={`-translate-x-1/5 absolute right-0 z-50 mt-2 min-w-fit transform whitespace-nowrap rounded-md bg-white p-2 shadow-lg dark:bg-neutral-700 dark:text-gray-300`}
            >
              <div
                onClick={() => handleSelection(0b010)}
                className="flex cursor-pointer items-center gap-2 p-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b010 ? (
                    <Check className="text-black dark:text-white" />
                  ) : null}
                </span>
                Openτensor Foundaτion
              </div>
              <div
                onClick={() => handleSelection(0b001)}
                className="flex cursor-pointer items-center gap-2 p-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b001 ? (
                    <Check className="text-black dark:text-white" />
                  ) : null}
                </span>
                Manifold
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
