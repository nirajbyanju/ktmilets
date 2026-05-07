'use client';

import { useRouter } from "next/navigation";

import AddInqueryComponent from "@/components/AddInqueryComponent";

const hasSameOriginReferrer = () => {
  if (typeof window === "undefined" || !document.referrer) {
    return false;
  }

  try {
    return new URL(document.referrer).origin === window.location.origin;
  } catch {
    return false;
  }
};

export default function RequestPostPage() {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1 && hasSameOriginReferrer()) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <AddInqueryComponent
      onOpen
      onClose={handleClose}
      type="create"
      from="request"
      id={null}
      variant="page"
    />
  );
}
