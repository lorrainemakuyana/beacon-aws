"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Mail,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useAuth } from "@/context/auth";

const AUTH_PATHS = new Set(["/login", "/register"]);

const navLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/events", label: "Events" },
  { href: "/app/volunteers", label: "Volunteers" },
  { href: "/app/incidents", label: "Incidents" },
];

const profileMenuItems = [
  { label: "Edit Profile", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Privacy & Security", icon: Shield },
  { label: "Help Center", icon: HelpCircle },
  { label: "Contact Us", icon: Mail },
];

function getInitials(displayName?: string | null, email?: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return displayName.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [popupOpen, setPopupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const isAuthPage = AUTH_PATHS.has(pathname);
  const logoHref = user ? "/app" : "/";

  function isActive(href: string): boolean {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href={logoHref} className="flex items-center gap-2">
          <img src="/logo.png" alt="Beacon" className="w-9 h-9 object-contain" />
          <span className="text-gray-900 font-semibold text-xl tracking-tight">
            Beacon
          </span>
        </Link>

        {/* Auth pages: logo + name only, no extra controls */}
        {!isAuthPage && (
          <>
            {user ? (
              <>
                {/* Nav links — hidden on mobile */}
                <div className="hidden sm:flex items-center gap-1">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive(href)
                          ? "text-primary underline underline-offset-4"
                          : "text-gray-500 hover:text-gray-900",
                      ].join(" ")}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  {/* Profile avatar — sm+ only */}
                  <div className="hidden sm:block relative" ref={popupRef}>
                    <button
                      onClick={() => setPopupOpen((v) => !v)}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold focus:outline-none"
                    >
                      {getInitials(user?.displayName, user?.email)}
                    </button>

                    <AnimatePresence>
                      {popupOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-full top-0 mr-3 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-64"
                        >
                          <div className="flex items-center gap-3 px-4 py-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {getInitials(user?.displayName, user?.email)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {user?.displayName ?? "User"}
                              </span>
                              <span className="text-xs text-gray-400 truncate">
                                {user?.email}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100" />

                          <div className="py-1">
                            {profileMenuItems.map(({ label, icon: Icon }) => (
                              <button
                                key={label}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                  {label}
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-100" />

                          <div className="py-1">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-xl"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Hamburger — mobile only */}
                  <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="sm:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              /* Unauthenticated — landing page: Sign in + Get started */
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile dropdown — authenticated only */}
      {!isAuthPage && user && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="sm:hidden border-t border-gray-200 bg-white w-full"
            >
              <div className="flex flex-col py-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "px-4 py-3 text-sm font-medium transition-colors",
                      isActive(href)
                        ? "text-primary bg-primary/5"
                        : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100" />
              <div className="py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
}
