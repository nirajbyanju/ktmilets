'use client';

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FiPlusSquare,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { FaInfoCircle } from "react-icons/fa";

import LogoGreen from "@/public/LogoGreen.png";
import { footerMobileMenuItems } from "@/components/layout/footer/footer.data";
import { MOBILE_FEED_SEARCH_EVENT } from "@/helper/home/mobileFeed";
import useAuthStore from "@/stores/auth/AuthStore";

const LoginModal = dynamic(() => import("@/components/loginComponent"), { ssr: false });

const isProfilePath = (pathname: string) =>
  pathname.startsWith("/admin/settings/profile") || pathname.startsWith("/admin/dashboard");

export default function MobileFooter() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const activeStates = useMemo(
    () => ({
      home: pathname === "/",
      "sell-property": pathname === "/request-post",
      search: false,
      "about-us": pathname === "/about-us",
      profile: isProfilePath(pathname),
    }),
    [pathname]
  );

  const handleHomeClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const hasSameOriginReferrer =
      Boolean(document.referrer) &&
      new URL(document.referrer).origin === window.location.origin;

    if (window.history.length > 1 && hasSameOriginReferrer) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleSearchClick = () => {
    if (pathname === "/") {
      window.dispatchEvent(new Event(MOBILE_FEED_SEARCH_EVENT));
      return;
    }

    router.push("/?mobileFeedSearch=1#mobile-feed");
  };

  const handleProfileClick = () => {
    if (isAuthLoading) {
      return;
    }

    if (isAuthenticated) {
      router.push("/admin/settings/profile");
      return;
    }

    setIsLoginModalOpen(true);
  };

  return (
    <>
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-sm rounded-[30px] border border-opsh-grey bg-white/95 px-2 py-3 shadow-[0_-12px_34px_rgba(3,51,49,0.12)] backdrop-blur-md">
          <div className="grid grid-cols-5 items-end gap-1">
            {footerMobileMenuItems.map((item) => {
              const isActive = activeStates[item.id];

              if (item.id === "home") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleHomeClick}
                    aria-label="Go back"
                    className={`flex min-w-0 flex-col items-center rounded-2xl px-2 py-2.5 transition-all ${
                      isActive
                        ? "text-opsh-primary"
                        : "text-opsh-muted"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-opsh-background">
                      <Image
                        src={LogoGreen}
                        alt="Samriddhi Real Estate"
                        className="h-5 w-auto"
                      />
                    </span>
                    
                  </button>
                );
              }

              if (item.id === "sell-property") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push("/request-post")}
                    aria-label="Open add request post page"
                    className={`flex min-w-0 flex-col items-center rounded-2xl px-2 py-2.5 transition-all ${
                      isActive ? "text-opsh-primary" : "text-opsh-muted"
                    }`}
                  >
                    <FiPlusSquare className="text-[21px]" />
                  
                  </button>
                );
              }

              if (item.id === "search") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleSearchClick}
                    aria-label="Open mobile property search"
                    className="relative -mt-8 flex h-16 w-16 min-w-0 flex-col items-center justify-center justify-self-center rounded-full bg-opsh-primary px-2 py-2.5 text-opsh-text shadow-[0_18px_32px_rgba(4,72,69,0.3)] transition-all"
                  >
                    <FiSearch className="text-xl" />
                   
                  </button>
                );
              }

              if (item.id === "about-us") {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push("/about-us")}
                    aria-label="Go to about us"
                    className={`flex min-w-0 flex-col items-center rounded-2xl px-2 py-2.5 transition-all ${
                      isActive
                        ? "text-opsh-primary"
                        : "text-opsh-muted"
                    }`}
                  >
                    <FaInfoCircle className="text-[20px]" />
                    
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={handleProfileClick}
                  aria-label={isAuthenticated ? "Open profile" : "Open login"}
                  disabled={isAuthLoading}
                  className={`flex min-w-0 flex-col items-center rounded-2xl px-2 py-2.5 transition-all ${
                    isActive
                      ? "text-opsh-primary"
                      : "text-opsh-muted"
                  } ${isAuthLoading ? "cursor-wait opacity-60" : ""}`}
                >
                  <FiUser className="text-[20px]" />
                 
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {isLoginModalOpen ? (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          redirectOnSuccess="/admin/settings/profile"
        />
      ) : null}
    </>
  );
}
