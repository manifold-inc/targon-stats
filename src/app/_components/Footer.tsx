import Link from "next/link";
import {
  RiDiscordFill,
  RiTwitterXFill,
  RiGithubFill,
  RiLinkedinFill,
} from "@remixicon/react";
import Branding from "@/app/_components/header/Branding";

const socialLinks = [
  {
    href: "https://discord.gg/manifold",
    label: "Discord",
    icon: RiDiscordFill,
  },
  {
    href: "https://x.com/targoncompute",
    label: "X (Twitter)",
    icon: RiTwitterXFill,
  },
  {
    href: "https://github.com/manifold-inc",
    label: "GitHub",
    icon: RiGithubFill,
  },
  {
    href: "https://www.linkedin.com/company/manifoldlabs",
    label: "LinkedIn",
    icon: RiLinkedinFill,
  },
];

export default function Footer() {
  return (
    <footer className="bg-mf-night-500 py-20 px-10">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <div className="scale-125">
          <Branding />
        </div>
        
        <div className="flex items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mf-milk-500 hover:text-mf-sally-500 transition-colors"
                aria-label={social.label}
              >
                <Icon className="h-7 w-7" />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
