"use client";

import { useEffect, useRef, useState } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelection = (bitValue: number) => {
    let newSelectedBits;
    if (bitValue === 0b100) {
      // "All Validators" selected
      newSelectedBits = 0b100;
    } else {
      // Specific validator selected, deselect "All Validators"
      newSelectedBits = bitValue;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Homepage</Link>
        <Link href="/stats">Stats</Link>
        <Link href="/stats/miner">Miners</Link>
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="flex items-center gap-2">
            Validators
            {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-64 rounded-md bg-white shadow-lg">
              <div
                onClick={() => handleSelection(0b100)}
                className="flex cursor-pointer items-center px-4 py-2"
              >
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b100 ? (
                    <Check className="text-black" />
                  ) : null}
                </span>
                All Validators
              </div>
              <div
                onClick={() => handleSelection(0b001)}
                className="flex cursor-pointer items-center px-4 py-2"
              >
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b001 ? (
                    <Check className="text-black" />
                  ) : null}
                </span>
                Manifold
              </div>
              <div
                onClick={() => handleSelection(0b010)}
                className="flex cursor-pointer items-center px-4 py-2"
              >
                <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                  {selectedBits & 0b010 ? (
                    <Check className="text-black" />
                  ) : null}
                </span>
                Openτensor Foundaτion
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
