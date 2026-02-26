"use client";

import Branding from "@/app/_components/header/Branding";
import MobileMenu from "@/app/_components/header/MobileMenu";
import Navigation from "@/app/_components/header/Navigation";
import TopButtons from "@/app/_components/header/TopButtons";
import TopStats from "@/app/_components/header/TopStats";
import { RiMenuLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Box from "../Box";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-mf-night-500 border-b border-mf-border-600 backdrop-blur-sm">
      <nav aria-label="Global">
        <div
          aria-label="Global"
          className="w-full items-center flex pt-6 lg:pb-3 pb-6 lg:px-10 px-4 relative lg:border-b-0 border-b border-mf-border-600"
        >
          <Branding />

          {pathname !== "/sign-in" && (
            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
              <TopStats />
            </div>
          )}

          <div className="flex lg:hidden ml-auto">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            >
              <RiMenuLine className="size-5 hover:opacity-80" />
            </button>
          </div>

          <div className="ml-auto hidden lg:block">
            {pathname !== "/sign-in" ? (
              <TopButtons />
            ) : (
              <Link href="/">
                <Box
                  value="Back"
                  valueClassName="animate-flip-up w-18 px-auto justify-center"
                />
              </Link>
            )}
          </div>
        </div>

        {pathname !== "/sign-in" ? <Navigation /> : <div className="h-3" />}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </nav>
    </header>
  );
};

export default Header;
