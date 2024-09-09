"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { useAuth } from "./providers";

interface ClientHeaderProps {
  validators: string[];
}
const ClientHeader = ({ validators }: ClientHeaderProps) => {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBits, setSelectedBits] = useState<string | null>(null);
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
    <header>
      <nav className="fixed right-5 top-5 z-40 flex space-x-8">
        <Link href="/">Home</Link>
        <Link href="/metrics" className="hidden">
          Metrics
        </Link>
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
                      {(selectedBits?.[index] ?? "1") == "1" ? (
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

export default ClientHeader;
