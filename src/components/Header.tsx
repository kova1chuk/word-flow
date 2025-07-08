"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import LoadingSpinner from "./LoadingSpinner";

export default function Header() {
  const user = useSelector(selectUser);
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
      await signOut(auth);
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { href: "/words", label: "My Words" },
    { href: "/analyze", label: "Analyze Text" },
    { href: "/analyses", label: "My Analyses" },
    { href: "/training", label: "Training" },
  ];

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  if (!user) {
    return (
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Word Flow
              </span>
            </div>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  onClick={closeMenus}
                  className="text-2xl font-bold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Word Flow
                </Link>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {user && (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.email}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                          isUserMenuOpen ? "transform rotate-180" : ""
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
                      <div className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg py-1 ring-1 ring-black/5 dark:ring-white/10 border border-gray-200/50 dark:border-gray-700/50">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg mx-1 transition-colors"
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
            <div className="md:hidden flex items-center" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 dark:text-gray-200 hover:text-white hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
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
                className={`absolute top-16 left-0 w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 ${
                  isMenuOpen ? "block" : "hidden"
                }`}
              >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {user && (
                    <>
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenus}
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-200"
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2 pt-4">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Signed in as
                          </p>
                          <p className="text-base font-medium text-gray-800 dark:text-white">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-200"
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
