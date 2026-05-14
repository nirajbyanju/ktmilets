"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import useAuthStore from "@/stores/auth/AuthStore";

type PlanPurchaseButtonProps = {
  batchId: number;
  label?: string;
};

export default function PlanPurchaseButton({
  batchId,
  label = "Buy this plan",
}: PlanPurchaseButtonProps) {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const [isChecking, setIsChecking] = useState(false);

  const paymentPath = `/payment?batch_id=${batchId}`;

  const handleClick = async () => {
    setIsChecking(true);

    try {
      await initializeAuth({ preloadMenu: false });
      const state = useAuthStore.getState();

      if (!state.isAuthenticated || !state.token) {
        router.push(`/login?redirect=${encodeURIComponent(paymentPath)}`);
        return;
      }

      router.push(paymentPath);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isChecking}
      className="mt-4 inline-flex w-full justify-center rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover disabled:cursor-wait disabled:opacity-70"
    >
      {isChecking ? "Checking login..." : label}
    </button>
  );
}
