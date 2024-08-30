"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { useAuth } from "./providers";
import { reactClient } from "@/trpc/react";
import { setValidatorMap } from "@/utils/validatorMap";

const HeaderContent = () => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBits, setSelectedBits] = useState(0); // Default to no selection
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: validators } = reactClient.overview.activeValidators.useQuery();

  useEffect(() => {
    if (validators) {
      setValidatorMap(validators.filter((v): v is string => v !== null));
    }
  }, [validators]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelection = (bitValue: number) => {
    console.log("Clicked validator bit value:", bitValue);
    let newSelectedBits = selectedBits ^ bitValue;
    console.log("New selected bits after XOR:", newSelectedBits);

    // Calculate the bitmask for "All Validators"
    const allValidatorsBitmask = (1 << validators!.length) - 1;
    console.log("All validators bitmask:", allValidatorsBitmask);

    // If no other options are selected, default to "All Validators"
    if (newSelectedBits === 0) {
      newSelectedBits = allValidatorsBitmask;
    } else if (newSelectedBits === allValidatorsBitmask) {
      newSelectedBits = 0; // Unselect "All Validators" when it is the only option selected
    }
    console.log("Final selected bits:", newSelectedBits);

    setSelectedBits(newSelectedBits);

    // Update the URL parameters without any path restriction
    const currentParams = new URLSearchParams(searchParams);

    if (newSelectedBits === allValidatorsBitmask) {
      currentParams.delete("validators");
    } else {
      currentParams.set(
        "validators",
        newSelectedBits.toString(2).padStart(validators!.length, "0"), // Pad to the number of validators for consistency
      );
    }

    // Replace the current URL with the new one
    console.log("Updated URL params:", currentParams.toString());
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
    if (validators) {
      const validator = searchParams.get("validators");
      if (validator) {
        setSelectedBits(parseInt(validator, 2));
      } else if (pathName !== "/" && pathName !== "/metrics") {
        const defaultBits = (1 << validators.length) - 1;
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set("validators", defaultBits.toString(2).padStart(validators.length, "0"));
        router.replace(`?${currentParams.toString()}`, undefined);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchParams, router, isDropdownOpen, pathName, validators]);

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
              {validators?.map((validator, index) => (
                <div
                  key={index}
                  onClick={() => handleSelection(1 << index)}
                  className="flex cursor-pointer items-center gap-2 p-2"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                    {selectedBits & (1 << index) ? (
                      <Check className="text-black dark:text-white" />
                    ) : null}
                  </span>
                  {validator}
                </div>
              ))}
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
