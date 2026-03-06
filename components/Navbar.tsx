"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Chi Siamo" },
  { href: "/services", label: "Servizi" },
  { href: "/technology", label: "Tecnologie" },
  { href: "/contact", label: "Contatti" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-3 backdrop-blur-xl border-b"
            : "py-4"
        }`}
        style={{
          background: scrolled ? "rgba(12,17,32,.85)" : "transparent",
          borderColor: "rgba(201,164,76,.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-[#060910] text-sm"
              style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
            >
              MF
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Meta<span style={{ color: "#c9a44c" }}>Fan</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    active
                      ? "text-white"
                      : "text-[#8899b4] hover:text-white"
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                      style={{ background: "#c9a44c" }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="ml-4 px-5 py-2 rounded-lg text-sm font-semibold text-[#060910] transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,#c9a44c,#a88630)",
                boxShadow: "0 4px 24px rgba(201,164,76,.2)",
              }}
            >
              Area Gestione
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex md:hidden flex-col gap-[5px] p-2 z-[1001]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-0.5 bg-white rounded transition-all duration-200"
                style={{
                  transform:
                    i === 0 && open
                      ? "rotate(45deg) translate(5px,5px)"
                      : i === 1 && open
                      ? "scaleX(0)"
                      : i === 2 && open
                      ? "rotate(-45deg) translate(5px,-5px)"
                      : "none",
                  opacity: i === 1 && open ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ background: "#0c1120" }}
      >
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-2xl font-semibold text-white hover:text-[#c9a44c] transition-colors"
          >
            {label}
          </Link>
        ))}
        <Link
          href="/login"
          className="mt-4 px-8 py-3 rounded-lg text-base font-semibold text-[#060910]"
          style={{ background: "linear-gradient(135deg,#c9a44c,#a88630)" }}
        >
          Area Gestione
        </Link>
      </div>
    </>
  );
}
