"use client";

import Branding from "@/app/_components/header/Branding";
import MobileMenu from "@/app/_components/header/MobileMenu";
import Navigation from "@/app/_components/header/Navigation";
import TopButtons from "@/app/_components/header/TopButtons";
import TopStats from "@/app/_components/header/TopStats";
import { RiMenuLine } from "@remixicon/react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-mf-night-500/90 backdrop-blur-sm">
      <nav aria-label="Global">
        <div
          aria-label="Global"
          className="w-full items-center flex pt-6 lg:pb-3 pb-6 lg:px-10 px-4 relative lg:border-b-0 border-b border-mf-border-600"
        >
          <Branding />

          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
            <TopStats />
          </div>

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
            <TopButtons />
          </div>
        </div>

        <Navigation />

        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </nav>
    </header>
  );
};

export default Header;
