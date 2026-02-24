"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type MenuLink = { href: string; label: string };

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target;
      if (!(target instanceof Node)) return;
      const wrap = menuWrapRef.current;
      if (!wrap) return;
      if (!wrap.contains(target)) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  const libraryLinks = useMemo<MenuLink[]>(
    () => [
      { href: "/tools", label: "Tools" },
      { href: "/tools/collections", label: "Collections" },
      { href: "/tools/compare", label: "Compare" },
      { href: "/playbooks", label: "Playbooks" },
      { href: "/prompts", label: "Prompts" },
      { href: "/prompts/packs", label: "Prompt packs" },
      { href: "/skills", label: "Skills" },
      { href: "/insights", label: "Insights" }
    ],
    []
  );

  const libraryActive = libraryLinks.some((l) => isActive(pathname, l.href));

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main navigation">
      <div className="nav__inner">
        <Link className="nav__logo" href="/">
          COUNTERBENCH<span>AI</span>
        </Link>

        <div style={{ flex: 1, maxWidth: 520, margin: "0 1.25rem", display: "none" }} className="cb-search-desktop">
          <GlobalSearch />
        </div>

        <button
          className={`nav__toggle ${mobileOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav__links ${mobileOpen ? "open" : ""}`}>
          <div style={{ marginBottom: "0.75rem" }} className="cb-search-mobile">
            <GlobalSearch />
          </div>

          <div className="nav__menuWrap" ref={menuWrapRef}>
            <button
              type="button"
              className={`btn btn--secondary btn--sm nav__exploreBtn ${libraryActive ? "is-active" : ""}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              AI Law Library
              <span className="nav__chev" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="nav__dropdown" role="menu" aria-label="AI Law Library">
                {/* Use a list so items don't concatenate even if CSS is stale/missing. */}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {libraryLinks.map((l) => (
                    <li key={l.href}>
                      <Link
                        role="menuitem"
                        className={`nav__dropdownItem ${isActive(pathname, l.href) ? "active" : ""}`}
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link className={`btn btn--secondary btn--sm ${isActive(pathname, "/advisory") ? "is-active" : ""}`} href="/advisory">
            AI Advisory
          </Link>

          <Link className={`btn btn--secondary btn--sm ${isActive(pathname, "/newsletter") ? "is-active" : ""}`} href="/newsletter">
            Newsletter
          </Link>
        </div>
      </div>
    </nav>
  );
}
