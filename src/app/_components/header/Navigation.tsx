"use client";

import {
  RiArrowUpBoxFill,
  RiBarChartFill,
  RiRecordCircleFill,
  RiToolsFill,
} from "@remixicon/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export const Navigation = () => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const navigation = [
    {
      pathname: "/",
      title: "Stats",
      icon: RiBarChartFill,
    },
    {
      pathname: "/miners",
      title: "Miners",
      icon: RiToolsFill,
    },
    {
      pathname: "/weights",
      title: "Weights",
      icon: RiArrowUpBoxFill,
    },
    {
      pathname: "/targets",
      title: "Targets",
      icon: RiRecordCircleFill,
    },
  ];
  return (
    <div
      onMouseLeave={() => setHoveredItem(null)}
      data-nav-header
      className="border-b border-mf-border-600 hidden lg:flex px-12"
    >
      <div className="items-center px-2 flex flex-row">
        {navigation.map((route, index) => {
          const Icon = route.icon;
          const isActive =
            route.pathname === "/"
              ? pathname === "/"
              : pathname === route.pathname ||
                pathname.startsWith(route.pathname + "/");

          return (
            <Link
              href={route.pathname}
              key={index}
              className="group relative flex p-1 px-2.5 whitespace-nowrap font-light items-center gap-2 hover:cursor-pointer"
              onMouseEnter={() => setHoveredItem(route.pathname)}
            >
              <div
                ref={(el) => {
                  if (el) navRefs.current.set(route.pathname, el);
                }}
                className="group relative flex items-center gap-1 px-2 py-1.5"
                data-nav-item
                data-pathname={route.pathname}
              >
                <Icon className="h-4.5 w-4.5 -translate-y-px relative z-10 transition-colors duration-200 ease-in-out text-mf-sally-500" />
                <p
                  className={`text-sm relative z-10 transition-colors duration-200 ease-in-out ${
                    isActive || hoveredItem?.includes(route.pathname)
                      ? "text-mf-milk-500"
                      : "text-mf-milk-700"
                  }`}
                >
                  {route.title}
                </p>

                {hoveredItem?.includes(route.pathname) && (
                  <motion.div
                    layoutId="nav-hover"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      opacity: { duration: 0.15 },
                    }}
                    className="absolute inset-0 -mx-2 bg-mf-border-600/50 border border-mf-border-600 rounded-md"
                  />
                )}

                {isActive && (
                  <motion.div
                    layoutId="nav-active-line"
                    className="absolute -bottom-1 -left-2 -right-2 h-0.25 bg-mf-sally-500"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
