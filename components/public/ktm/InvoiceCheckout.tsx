"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

import { createInvoice, type Invoice } from "@/apis/courseCatalog.api";
import { ktmBrand, ktmContact } from "@/data/ktm";
import { getPublicCourseCatalog } from "@/helper/public/courseCatalog";
import useAuthStore from "@/stores/auth/AuthStore";
import type { Batch } from "@/types/courseCatalog";

const formatMoney = (value: string | number | null | undefined) =>
  `NPR ${Number(value ?? 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-NP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate.toISOString().slice(0, 10);
};

const formatBatchSize = (batch: Batch) => {
  if (batch.min_size && batch.max_size) {
    return batch.min_size === batch.max_size ? String(batch.min_size) : `${batch.min_size}-${batch.max_size}`;
  }

  return "Variable";
};

const activeDiscountAmount = (batch: Batch) => {
  const subtotal = toNumber(batch.price_npr);
  const discountValue = toNumber(batch.discount_value);

  if (!batch.offer_label || !batch.discount_type || subtotal <= 0 || discountValue <= 0) {
    return 0;
  }

  const today = new Date().toISOString().slice(0, 10);

  if (batch.offer_starts_at && batch.offer_starts_at > today) {
    return 0;
  }

  if (batch.offer_ends_at && batch.offer_ends_at < today) {
    return 0;
  }

  return batch.discount_type === "percent"
    ? Math.min(subtotal, (subtotal * Math.min(discountValue, 100)) / 100)
    : Math.min(subtotal, discountValue);
};

type InvoiceUser = {
  email?: unknown;
  first_name?: unknown;
  last_name?: unknown;
  name?: unknown;
  phone?: unknown;
};

const getUserName = (user: InvoiceUser | null | undefined) => {
  const firstName = typeof user?.first_name === "string" ? user.first_name : "";
  const lastName = typeof user?.last_name === "string" ? user.last_name : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return (
    fullName ||
    (typeof user?.name === "string" ? user.name : "") ||
    (typeof user?.email === "string" ? user.email : "") ||
    "Student"
  );
};

const getUserContact = (user: InvoiceUser | null | undefined) => {
  if (typeof user?.phone === "string" && user.phone) {
    return user.phone;
  }

  return typeof user?.email === "string" ? user.email : "Not provided";
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export default function InvoiceCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = Number(searchParams.get("batch_id") ?? 0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void initializeAuth({ preloadMenu: false });
  }, [initializeAuth]);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    let isMounted = true;
    setIsBatchLoading(true);
    setError("");

    getPublicCourseCatalog()
      .then((catalog) => {
        const selectedBatch = catalog?.batches.find((item) => item.id === batchId) ?? null;

        if (isMounted) {
          setBatch(selectedBatch);
          if (!selectedBatch) {
            setError("Selected batch could not be found. Please choose a plan again.");
          }
        }
      })
      .catch((loadError) => {
        console.error("Failed to load selected batch:", loadError);
        if (isMounted) {
          setError("Selected batch could not be loaded. Please try again or contact admin.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsBatchLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [batchId]);

  const estimate = useMemo(() => {
    if (!batch) {
      return null;
    }

    const subtotal = toNumber(batch.price_npr);
    const discount = activeDiscountAmount(batch);
    const tax = 0;
    const total = Math.max(0, subtotal - discount + tax);

    return {
      subtotal,
      discount,
      tax,
      total,
      balance: total,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: addDays(new Date(), 3),
      isVariable: batch.is_price_variable || batch.price_npr === null || batch.price_npr === undefined,
    };
  }, [batch]);

  if (!batchId) {
    return null;
  }

  const studentName = getUserName(invoice?.user ?? user);
  const studentContact = getUserContact(invoice?.user ?? user);
  const selectedCourse = invoice?.batch?.course?.name ?? batch?.course?.name ?? "Selected course";
  const selectedPlan = invoice?.batch?.batch_type ?? batch?.batch_type ?? "Selected plan";
  const savedSubtotal = invoice ? toNumber(invoice.subtotal_npr) : estimate?.subtotal ?? 0;
  const savedDiscount = invoice ? toNumber(invoice.discount_npr) : estimate?.discount ?? 0;
  const savedTax = invoice ? toNumber(invoice.tax_npr) : estimate?.tax ?? 0;
  const savedTotal = invoice ? toNumber(invoice.total_npr) : estimate?.total ?? 0;
  const balance = invoice?.status === "paid" ? 0 : savedTotal;
  const invoiceDate = invoice?.invoice_date ?? estimate?.invoiceDate;
  const dueDate = invoice?.due_date ?? estimate?.dueDate;
  const invoiceTitle = invoice ? `Invoice #${invoice.invoice_number}` : "Estimated Invoice";
  const statusLabel = invoice?.status ?? "not saved";
  const canCreateInvoice = Boolean(batch && estimate && !estimate.isVariable && estimate.total > 0);
  const itemDescription = [
    selectedCourse,
    selectedPlan,
    batch ? `Batch size: ${formatBatchSize(batch)}` : null,
    batch?.schedule_notes,
  ]
    .filter(Boolean)
    .join(" | ");
  const whatsappMessage = invoice
    ? `Hello KTM Test Prep, I have paid for invoice ${invoice.invoice_number}. Student: ${studentName}. Plan: ${selectedPlan}. Total: ${formatMoney(invoice.total_npr)}. I will send the payment screenshot here for verification.`
    : `Hello KTM Test Prep, I want to enroll in ${selectedCourse} - ${selectedPlan}. Student: ${studentName}. Contact: ${studentContact}. Please help me verify payment.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleEnrollmentClick = async () => {
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/payment?batch_id=${batchId}`)}`);
      return;
    }

    if (!canCreateInvoice) {
      setError("This batch uses contact pricing. Please confirm the amount with admin before enrollment.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generatedInvoice = await createInvoice(batchId);
      setInvoice(generatedInvoice);
      toast.success("Invoice saved successfully.");
    } catch (generateError) {
      console.error("Failed to generate invoice:", generateError);
      setError(getErrorMessage(generateError, "Failed to generate invoice."));
      toast.error("Failed to generate invoice.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-opsh-sm sm:p-5">
      {isBatchLoading ? (
        <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
          Loading selected batch...
        </div>
      ) : batch && estimate ? (
        <>
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-opsh-secondary">{ktmBrand.officialName}</p>
                  <h2 className="mt-3 text-2xl font-black text-opsh-primary">{invoiceTitle}</h2>
                  <span className="mt-2 inline-flex rounded bg-opsh-secondary px-2 py-1 text-xs font-black uppercase text-white">
                    {statusLabel}
                  </span>
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p>
                    <span className="font-black text-slate-800">Invoice Date:</span> {formatDate(invoiceDate)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-slate-800">Due Date:</span> {formatDate(dueDate)}
                  </p>
                  <p className="mt-1">
                    <span className="font-black text-slate-800">Payment:</span>{" "}
                    {invoice?.payment_method === "bank_qr" ? "Siddhartha Bank QR / Bank Transfer" : "Manual payment"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-slate-200 px-5 py-6 text-sm sm:grid-cols-2">
              <div>
                <p className="font-black text-opsh-primary underline">Pay To:</p>
                <p className="mt-3 font-bold text-slate-900">{ktmBrand.officialName}</p>
                <p className="text-slate-600">{ktmContact.address}</p>
                <p className="text-slate-600">Phone: {ktmContact.phone}</p>
                <p className="text-slate-600">WhatsApp: {ktmContact.whatsapp}</p>
                <p className="text-slate-600">Email: {ktmContact.email}</p>
              </div>
              <div>
                <p className="font-black text-opsh-primary underline">Invoiced To:</p>
                <p className="mt-3 font-bold text-slate-900">{token ? studentName : "Login required"}</p>
                <p className="text-slate-600">{token ? studentContact : "Your account details will appear here."}</p>
                <p className="text-slate-600">{selectedCourse}</p>
                <p className="text-slate-600">{selectedPlan}</p>
              </div>
            </div>

            <div className="px-5 py-6">
              <p className="font-black text-opsh-primary underline">Invoice Items</p>
              <div className="mt-4 overflow-hidden rounded border border-slate-200">
                <div className="grid grid-cols-[1fr,120px] bg-slate-100 px-4 py-3 text-xs font-black uppercase text-slate-700">
                  <span>Description</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="grid grid-cols-[1fr,120px] gap-4 px-4 py-4 text-sm text-slate-700">
                  <span>{itemDescription}</span>
                  <span className="text-right font-bold">
                    {estimate.isVariable ? "Contact admin" : formatMoney(savedSubtotal)}
                  </span>
                </div>
                {savedDiscount > 0 ? (
                  <div className="grid grid-cols-[1fr,120px] gap-4 border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <span>Offer Discount {batch.offer_label ? `- ${batch.offer_label}` : ""}</span>
                    <span className="text-right font-bold text-emerald-700">- {formatMoney(savedDiscount)}</span>
                  </div>
                ) : null}
                <div className="grid grid-cols-[1fr,120px] gap-4 border-t border-slate-200 px-4 py-3 text-sm">
                  <span className="text-right font-black text-slate-800">Sub Total</span>
                  <span className="text-right font-bold">{estimate.isVariable ? "After quote" : formatMoney(savedSubtotal)}</span>
                </div>
                <div className="grid grid-cols-[1fr,120px] gap-4 border-t border-slate-200 px-4 py-3 text-sm">
                  <span className="text-right font-black text-slate-800">Tax</span>
                  <span className="text-right font-bold">{estimate.isVariable ? "After quote" : formatMoney(savedTax)}</span>
                </div>
                <div className="grid grid-cols-[1fr,120px] gap-4 bg-slate-200 px-4 py-4 text-sm">
                  <span className="text-right font-black text-slate-900">Total Due</span>
                  <span className="text-right font-black text-opsh-primary">
                    {estimate.isVariable ? "Quote required" : formatMoney(savedTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-6">
              <p className="font-black text-opsh-primary underline">Transactions</p>
              <div className="mt-4 overflow-hidden rounded border border-slate-200">
                <div className="grid grid-cols-[1fr,1fr,120px] bg-slate-100 px-4 py-3 text-xs font-black uppercase text-slate-700">
                  <span>Transaction Date</span>
                  <span>Gateway</span>
                  <span className="text-right">Amount</span>
                </div>
                {invoice?.status === "paid" ? (
                  <div className="grid grid-cols-[1fr,1fr,120px] gap-4 px-4 py-3 text-sm text-slate-700">
                    <span>{formatDate(invoice.invoice_date)}</span>
                    <span>Manual bank verification</span>
                    <span className="text-right font-bold">{formatMoney(savedTotal)}</span>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm font-semibold text-slate-500">
                    No verified transaction yet. Send the receipt on WhatsApp after payment.
                  </div>
                )}
                <div className="grid grid-cols-[1fr,120px] gap-4 bg-slate-200 px-4 py-3 text-sm">
                  <span className="text-right font-black text-slate-900">Balance</span>
                  <span className="text-right font-black">{estimate.isVariable ? "After quote" : formatMoney(balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice ? (
            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-lg font-black text-emerald-900">Invoice saved in the system</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Pay by official Siddhartha Bank QR or bank transfer, then send your receipt to admin WhatsApp. Admin will
                verify manually and activate enrollment from the CRM.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                <FaWhatsapp />
                Send receipt on WhatsApp
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleEnrollmentClick()}
              disabled={isGenerating}
              className="mt-4 w-full rounded bg-opsh-secondary px-4 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Saving invoice..." : token ? "Enrollment" : "Login and enroll"}
            </button>
          )}
        </>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error || "Selected batch is unavailable."}
        </div>
      )}

      {error && batch ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
