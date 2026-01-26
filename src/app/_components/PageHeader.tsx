"use client";

import Button from "@/app/_components/Button";
import { type ReactNode } from "react";

interface BadgeItem {
  icon: ReactNode;
  value: string;
  text: string;
}

export default function PageHeader({
  title,
  icon,
  badges = [],
}: {
  title: string;
  icon: ReactNode;
  badges?: BadgeItem[];
}) {
  return (
    <div className="w-full px-10">
      <div className="mx-auto max-w-[1325px] py-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="text-mf-sally-500">{icon}</div>
            <h1 className="text-[1.75rem] font-saira text-mf-milk-400">
              {title}
            </h1>
          </div>

          {badges.length > 0 && (
            <div className="lg:flex hidden items-center gap-3">
              {badges.map((badge, index) => (
                <Button
                  key={index}
                  icon={badge.icon}
                  value={
                    <>
                      <span className="text-mf-sally-500 pr-0.5">
                        {badge.value}
                      </span>{" "}
                      <span className="text-mf-milk-600">{badge.text}</span>
                    </>
                  }
                  valueClassName="animate-flip-up"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
