"use client";

import { useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import Branding from "@/app/_components/header/Branding";
import TopStats from "@/app/_components/header/TopStats";
import TopButtons from "@/app/_components/header/TopButtons";
import MobileMenu from "@/app/_components/header/MobileMenu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      <nav
        aria-label="Global"
        className="w-full items-center mx-auto flex p-6 lg:px-10 relative"
      >
        <Branding />

        <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
          <TopStats />
        </div>

        <div className="flex lg:hidden ml-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-300"
          >
            <RiMenuLine className="size-5 hover:opacity-80" />
          </button>
        </div>
        
        <div className="ml-auto hidden lg:block">
          <TopButtons />
        </div>
      </nav>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
