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
    let newSelectedBits = selectedBits ^ bitValue;

    if (newSelectedBits === 0) {
      newSelectedBits = 0b100;
    } else if (newSelectedBits & 0b100) {
      newSelectedBits &= ~0b100;
    }

    setSelectedBits(newSelectedBits);

    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(
      "validators",
      newSelectedBits.toString(2).padStart(3, "0"),
    );
    router.replace(`?${currentParams.toString()}`, undefined);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const validator = searchParams.get("validators");
    if (validator) {
      setSelectedBits(parseInt(validator, 2));
    } else {
      const defaultBits = 0b100;
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("validators", defaultBits.toString(2).padStart(3, "0"));
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
  }, [searchParams, router, isDropdownOpen]);

  return (
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Homepage</Link>
        <Link href="/stats">Stats</Link>
        <Link href="/stats/miner">Miners</Link>
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="flex items-center gap-1">
            Validators
            {isDropdownOpen ? <ChevronUp className="px-1 py-0.5" /> : <ChevronDown className="px-1 py-0.5" />}
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
