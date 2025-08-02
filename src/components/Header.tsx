"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSelector } from "react-redux";

import { signOut } from "@/app/auth/actions";

import { selectUser } from "@/entities/user/model/selectors";

export default function Header() {
  const user = useSelector(selectUser);
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll-based hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper function to check if a link is active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navLinks = [
    { href: "/dictionary", label: "Dictionary" },
    { href: "/reviews", label: "Reviews" },
    { href: "/hub", label: "Hub", disabled: true },
    { href: "/training", label: "Training", disabled: true },
  ];

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  if (!user) {
    return (
      <header className="fixed top-4 right-4 left-4 z-50 rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-2xl font-bold text-gray-800 transition-colors hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                >
                  Word Flow
                </Link>
              </div>
            </div>

            {/* Auth Links */}
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/signin"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-4 right-4 left-4 z-50 transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <nav className="rounded-2xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  onClick={closeMenus}
                  className="text-2xl font-bold text-gray-800 transition-colors hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                >
                  Word Flow
                </Link>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden items-center space-x-1 md:flex">
              {user && (
                <>
                  {navLinks.map((link) => {
                    const isActive = isLinkActive(link.href);
                    const isDisabled = link.disabled;

                    if (isDisabled) {
                      return (
                        <div
                          key={link.href}
                          className="group relative"
                          title="Coming Soon"
                        >
                          <button
                            disabled
                            className="cursor-not-allowed rounded-xl px-3 py-2 text-sm font-medium text-gray-400 opacity-50 transition-all duration-200 dark:text-gray-500"
                          >
                            {link.label}
                          </button>
                          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <div className="rounded-lg bg-gray-900 px-2 py-1 text-xs text-white dark:bg-gray-700">
                              Coming Soon
                              <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenus}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gray-100/50 text-blue-600 dark:bg-gray-700/50 dark:text-blue-400"
                            : "text-gray-600 hover:bg-gray-100/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 rounded-xl p-2 transition-all duration-200 hover:bg-gray-100/50 focus:outline-none dark:hover:bg-gray-700/50"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.email}
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${
                          isUserMenuOpen ? "rotate-180 transform" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200/50 bg-white/90 py-1 shadow-lg ring-1 ring-black/5 backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/90 dark:ring-white/10">
                        <Link
                          href="/profile"
                          className="mx-1 block w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                          onClick={closeMenus}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="mx-1 block w-full rounded-lg px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button and Dropdown */}
            <div className="flex items-center md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset dark:text-gray-200"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              {/* Mobile Menu Dropdown */}
              <div
                className={`absolute top-16 left-0 w-full rounded-xl border border-gray-200/50 bg-white/90 shadow-lg backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-800/90 ${
                  isMenuOpen ? "block" : "hidden"
                }`}
              >
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {user && (
                    <>
                      {navLinks.map((link) => {
                        const isActive = isLinkActive(link.href);
                        const isDisabled = link.disabled;

                        if (isDisabled) {
                          return (
                            <div
                              key={link.href}
                              className="group relative"
                              title="Coming Soon"
                            >
                              <button
                                disabled
                                className="block w-full cursor-not-allowed rounded-xl px-3 py-2 text-base font-medium text-gray-400 opacity-50 transition-all duration-200 dark:text-gray-500"
                              >
                                {link.label}
                              </button>
                              <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <div className="rounded-lg bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white dark:bg-gray-700">
                                  Coming Soon
                                  <div className="absolute top-1/2 left-0 -translate-y-1/2 transform border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenus}
                            className={`block rounded-xl px-3 py-2 text-base font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-gray-100/50 text-blue-600 dark:bg-gray-700/50 dark:text-blue-400"
                                : "text-gray-600 hover:bg-gray-100/50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white"
                            }`}
                          >
                            {link.label}
                          </Link>
                        );
                      })}
                      <div className="my-2 border-t border-gray-200/50 pt-4 dark:border-gray-700/50">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Signed in as
                          </p>
                          <p className="text-base font-medium text-gray-800 dark:text-white">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          onClick={closeMenus}
                          className="block w-full rounded-xl px-3 py-2 text-left text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full rounded-xl px-3 py-2 text-left text-base font-medium text-red-600 transition-all duration-200 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
