"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import XIcon from "./icons/XIcon";
import { LINKS } from "@/lib/constants";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/market", label: "Market" },
  { href: "/engine", label: "Engine" },
];

// Multi-page nav (Overview/Market/Engine tabs) is built and ready, but the
// site is single-page for now until there's enough page-specific data to
// justify splitting it up again — flip this back on when that day comes.
const SHOW_TABS = false;

export default function Nav() {
  const pathname = usePathname();

  return (
    <header>
      <div className="wrap flex h-[88px] items-center justify-between gap-4">
        <Link href="/" aria-label="stonk5.fyi home">
          <Logo />
        </Link>

        {SHOW_TABS && (
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
        )}

        <div className="hidden items-center gap-3 md:flex">
          <span className="label">Unofficial</span>
          <a
            href={LINKS.siteTwitter}
            target="_blank"
            rel="noreferrer"
            aria-label="stonk5.fyi on X"
            className="btn btn-ghost btn-sm !min-h-10 !w-10 !px-0"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a href={LINKS.stonkfun} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Trade $STONK5
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <a
            href={LINKS.stonkfun}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
          >
            Trade
          </a>
          <a
            href={LINKS.siteTwitter}
            target="_blank"
            rel="noreferrer"
            aria-label="stonk5.fyi on X"
            className="btn btn-ghost btn-sm !min-h-10 !w-10 !px-0"
          >
            <XIcon className="h-4 w-4" />
          </a>
        </div>
      </div>

      {SHOW_TABS && (
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
      )}
    </header>
  );
}
