"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links = user
    ? [
        { href: "/", label: "Browse", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
        { href: "/tools/new", label: "Add", icon: "M12 4.5v15m7.5-7.5h-15" },
        { href: "/my-tools", label: "My Tools", icon: "M11.42 15.17l-5.1-3.39M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" },
        { href: "/requests", label: "Requests", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
      ]
    : [];

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-lg text-gray-900">ToolShed</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              {user.name}
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700"
            >
              Join
            </Link>
          </div>
        )}
      </header>

      {/* Bottom tab bar (mobile) */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
