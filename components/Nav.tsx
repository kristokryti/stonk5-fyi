"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { LINKS } from "@/lib/constants";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/market", label: "Market" },
  { href: "/engine", label: "Engine" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header>
      <div className="wrap flex h-[88px] items-center justify-between gap-4">
        <Link href="/" aria-label="stonk5.fyi home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <div className="tabs">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={pathname === tab.href ? "page" : undefined}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="chip">Unofficial</span>
          <a href={LINKS.stonkfun} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Buy $STONK5
          </a>
        </div>

        <a
          href={LINKS.stonkfun}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm md:hidden"
        >
          Buy
        </a>
      </div>

      <nav aria-label="Primary" className="wrap pb-3 md:hidden">
        <div className="tabs w-full overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={pathname === tab.href ? "page" : undefined}
              className="shrink-0"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
