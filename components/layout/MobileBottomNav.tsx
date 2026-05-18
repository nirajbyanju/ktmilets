"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiHome,
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineClipboardDocumentList,
  HiOutlinePencil,
  HiOutlineUser,
  HiXMark,
} from "react-icons/hi2";

const courseOptions = [
  { label: "IELTS Online Class", href: "/ielts" },
  { label: "PTE Online Class", href: "/pte" },
];

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: HiOutlineHome,
    activeIcon: HiHome,
  },
  {
    label: "Courses",
    href: null,
    icon: HiOutlineBookOpen,
    activeIcon: HiOutlineBookOpen,
  },
  {
    label: "Exam",
    href: "/exam-booking",
    icon: HiOutlineClipboardDocumentList,
    activeIcon: HiOutlineClipboardDocumentList,
  },
  {
    label: "Practice",
    href: "/mock-tests",
    icon: HiOutlinePencil,
    activeIcon: HiOutlinePencil,
  },
  {
    label: "Profile",
    href: "/admin/dashboard",
    icon: HiOutlineUser,
    activeIcon: HiOutlineUser,
  },
];

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [coursesOpen, setCoursesOpen] = useState(false);

  const isCourseActive = courseOptions.some((c) => isActivePath(pathname, c.href));

  return (
    <>
      {/* Courses popup */}
      {coursesOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setCoursesOpen(false)}
        >
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-56 rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-700">Select Course</span>
              <button
                onClick={() => setCoursesOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>
            {courseOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                onClick={() => setCoursesOpen(false)}
                className={`flex items-center px-4 py-3.5 text-sm font-semibold transition hover:bg-blue-50 hover:text-blue-600 ${
                  isActivePath(pathname, option.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-700"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 xl:hidden">
        <div className="flex items-center gap-1 rounded bg-opsh-primary px-2 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.12)] md:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === null
                ? isCourseActive
                : isActivePath(pathname, item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            if (item.href === null) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCoursesOpen((open) => !open)}
                  className="flex flex-col items-center gap-1 px-4 py-1"
                >
                  <Icon
                    className={`text-2xl transition-colors ${
                      isActive || coursesOpen ? "text-red-500" : "text-white"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold transition-colors ${
                      isActive || coursesOpen ? "text-red-500" : "text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCoursesOpen(false)}
                className="flex flex-col items-center gap-1 px-4 py-1"
              >
                <Icon
                  className={`text-2xl transition-colors ${
                    isActive ? "text-red-500" : "text-white"
                  }`}
                />
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isActive ? "text-red-500" : "text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
