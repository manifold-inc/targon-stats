"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { reactClient } from "@/trpc/react";
import validatorMap, { setValidatorMap } from "@/utils/validatorMap";
import { useAuth } from "./providers";

const HeaderContent = () => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBits, setSelectedBits] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: validators } = reactClient.overview.activeValidators.useQuery();

  useEffect(() => {
    if (validators) {
      console.log("Setting validator map with:", validators);
      setValidatorMap(validators.filter((v): v is string => v !== null));
      console.log("Validator map set. Current map:", validatorMap);

      // Handle URL params
      const validatorParam = searchParams.get("validators");
      if (validatorParam) {
        setSelectedBits(parseInt(validatorParam, 2));
      } else {
        setSelectedBits(0); // Reset if no param
      }
    }
  }, [validators, searchParams]);

  const toggleValidator = (index: number) => {
    setSelectedBits((prevBits) => {
      const newBits = prevBits ^ (1 << index);

      // Update URL
      const params = new URLSearchParams(searchParams);
      if (newBits !== 0) {
        params.set(
          "validators",
          newBits.toString(2).padStart(validators?.length ?? 0, "0"),
        );
      } else {
        params.delete("validators");
      }
      router.replace(`?${params.toString()}`);

      return newBits;
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Calculate the number of selected validators
  const selectedCount = selectedBits.toString(2).split("1").length - 1;

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
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Home</Link>
        <Link href="/metrics">Metrics</Link>
        <Link href="/stats/miner">Miners</Link>
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleDropdown} className="flex items-center gap-1">
            Validators ({selectedCount}/{validators?.length ?? 0})
            {isDropdownOpen ? (
              <ChevronUp className="px-1 py-0.5" />
            ) : (
              <ChevronDown className="px-1 py-0.5" />
            )}
          </button>
          {isDropdownOpen && validators && (
            <div
              className={`-translate-x-1/5 absolute right-0 z-50 mt-2 min-w-fit transform whitespace-nowrap rounded-md bg-white p-2 shadow-lg dark:bg-neutral-700 dark:text-gray-300`}
            >
              {validators.length > 0 ? (
                validators.map((validator, index) => (
                  <div
                    key={index}
                    onClick={() => toggleValidator(index)}
                    className="flex cursor-pointer items-center gap-2 p-2"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-gray-400">
                      {selectedBits & (1 << index) ? (
                        <Check className="text-black dark:text-white" />
                      ) : null}
                    </span>
                    {validator}
                  </div>
                ))
              ) : (
                <div>No validators available</div>
              )}
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
