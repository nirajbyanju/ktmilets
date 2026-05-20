"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

import { getMyExamBookings } from "@/apis/examBooking.api";
import { createExamInvoice } from "@/apis/invoice.api";
import { ktmBrand, ktmContact } from "@/data/ktm";
import useAuthStore from "@/stores/auth/AuthStore";
import type { ExamBookingEnrollment } from "@/types/examBooking";
import type { Invoice } from "@/types/invoice";

const formatMoney = (value: string | number | null | undefined) =>
  `NPR ${Number(value ?? 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-NP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

type UserShape = { name?: unknown; first_name?: unknown; last_name?: unknown; email?: unknown; phone?: unknown } | null | undefined;

const getUserName = (user: UserShape) => {
  const first = typeof user?.first_name === "string" ? user.first_name : "";
  const last = typeof user?.last_name === "string" ? user.last_name : "";
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full || (typeof user?.name === "string" ? user.name : "") || (typeof user?.email === "string" ? user.email : "") || "Student";
};

const getUserContact = (user: UserShape) => {
  if (typeof user?.phone === "string" && user.phone) return user.phone;
  return typeof user?.email === "string" ? user.email : "Not provided";
};

export default function ExamBookingCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = Number(searchParams.get("exam_booking_id") ?? 0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const [enrollment, setEnrollment] = useState<ExamBookingEnrollment | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void initializeAuth({ preloadMenu: false });
  }, [initializeAuth]);

  useEffect(() => {
    if (!enrollmentId) return;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    getMyExamBookings()
      .then((list) => {
        if (!isMounted) return;
        const found = list.find((e) => e.id === enrollmentId) ?? null;
        setEnrollment(found);
        if (!found) setError("Exam booking could not be found. Please contact admin.");
      })
      .catch(() => {
        if (isMounted) setError("Exam booking could not be loaded. Please try again or contact admin.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [enrollmentId]);

  if (!enrollmentId) return null;

  const plan = enrollment?.exam_booking ?? enrollment?.examBooking ?? null;
  const price = toNumber(plan?.price);
  const discount = toNumber(plan?.discount);
  const total = Math.max(0, price - discount);
  const isVariable = !plan || price <= 0;

  const invoiceDate = invoice?.invoice_date ?? new Date().toISOString().slice(0, 10);
  const dueDate = invoice?.due_date ?? addDays(new Date(), 7);
  const invoiceTitle = invoice ? `Invoice #${invoice.invoice_number}` : "Estimated Invoice";
  const statusLabel = invoice?.status ?? "not saved";

  const studentName = getUserName((invoice?.user ?? user) as UserShape);
  const studentContact = getUserContact((invoice?.user ?? user) as UserShape);

  const savedTotal = invoice ? toNumber(invoice.total_npr) : total;
  const savedDiscount = invoice ? toNumber(invoice.discount_npr) : discount;
  const balance = invoice?.status === "paid" ? 0 : savedTotal;

  const examLabel = plan
    ? [plan.exam_type, plan.exam_name].filter(Boolean).join(" — ")
    : "Exam Booking";

  const itemDescription = [
    examLabel,
    enrollment?.preferred_date ? `Date: ${enrollment.preferred_date}` : null,
    enrollment?.preferred_test_centre ?? enrollment?.test_location,
  ]
    .filter(Boolean)
    .join(" | ");

  const whatsappMessage = invoice
    ? `Hello KTM Test Prep, I have paid for invoice ${invoice.invoice_number}. Student: ${studentName}. Exam: ${examLabel}. Total: ${formatMoney(invoice.total_npr)}. I will send the payment screenshot here for verification.`
    : `Hello KTM Test Prep, I want to pay for my exam booking: ${examLabel}. Student: ${studentName}. Contact: ${studentContact}. Please help me verify payment.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(whatsappMessage)}`;

  const handleGenerateInvoice = async () => {
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/payment?exam_booking_id=${enrollmentId}`)}`);
      return;
    }

    if (isVariable) {
      setError("This booking uses contact pricing. Please confirm the amount with admin.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generated = await createExamInvoice(enrollmentId);
      setInvoice(generated);
      toast.success("Invoice generated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message ? err.message : "Failed to generate invoice.";
      setError(msg);
      toast.error("Failed to generate invoice.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-opsh-sm sm:p-5">
      {isLoading ? (
        <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
          Loading exam booking details...
        </div>
      ) : enrollment ? (
        <>
          <div className="overflow-hidden rounded border border-slate-200 bg-white">
            {/* Header */}
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
                  <p><span className="font-black text-slate-800">Invoice Date:</span> {formatDate(invoiceDate)}</p>
                  <p className="mt-1"><span className="font-black text-slate-800">Due Date:</span> {formatDate(dueDate)}</p>
                  <p className="mt-1">
                    <span className="font-black text-slate-800">Payment:</span>{" "}
                    {invoice?.payment_method === "bank_qr" ? "Siddhartha Bank QR / Bank Transfer" : "Manual payment"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill to / Pay to */}
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
                {plan?.exam_type && <p className="text-slate-600">{plan.exam_type}{plan.exam_name ? ` — ${plan.exam_name}` : ""}</p>}
                {enrollment.preferred_date && (
                  <p className="text-slate-600">Preferred date: {formatDate(enrollment.preferred_date)}</p>
                )}
                {(enrollment.preferred_test_centre ?? enrollment.test_location) && (
                  <p className="text-slate-600">{enrollment.preferred_test_centre ?? enrollment.test_location}</p>
                )}
              </div>
            </div>

            {/* Invoice items */}
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
                    {isVariable ? "Contact admin" : formatMoney(price)}
                  </span>
                </div>
                {savedDiscount > 0 && (
                  <div className="grid grid-cols-[1fr,120px] gap-4 border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                    <span>Discount</span>
                    <span className="text-right font-bold text-emerald-700">- {formatMoney(savedDiscount)}</span>
                  </div>
                )}
                <div className="grid grid-cols-[1fr,120px] gap-4 border-t border-slate-200 px-4 py-3 text-sm">
                  <span className="text-right font-black text-slate-800">Sub Total</span>
                  <span className="text-right font-bold">{isVariable ? "After quote" : formatMoney(price)}</span>
                </div>
                <div className="grid grid-cols-[1fr,120px] gap-4 bg-slate-200 px-4 py-4 text-sm">
                  <span className="text-right font-black text-slate-900">Total Due</span>
                  <span className="text-right font-black text-opsh-primary">
                    {isVariable ? "Quote required" : formatMoney(savedTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Transactions */}
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
                  <span className="text-right font-black">{isVariable ? "After quote" : formatMoney(balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice ? (
            <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-lg font-black text-emerald-900">Invoice saved in the system</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Pay by official Siddhartha Bank QR or bank transfer, then send your receipt to admin WhatsApp.
                Admin will verify payment and confirm the booking.
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
              onClick={() => void handleGenerateInvoice()}
              disabled={isGenerating}
              className="mt-4 w-full rounded bg-opsh-secondary px-4 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating invoice..." : token ? "Generate Invoice" : "Login and generate invoice"}
            </button>
          )}
        </>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error || "Exam booking is unavailable."}
        </div>
      )}

      {error && enrollment ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
