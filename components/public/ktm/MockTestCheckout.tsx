"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";

import { publicApi } from "@/apis/https.api";
import { createMockTestInvoice } from "@/apis/invoice.api";
import { ktmBrand, ktmContact } from "@/data/ktm";
import useAuthStore from "@/stores/auth/AuthStore";
import type { Invoice } from "@/types/invoice";
import type { MockTestSubscription } from "@/types/mock-test-subscription";

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

export default function MockTestCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockTestId = Number(searchParams.get("mock_test_id") ?? 0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const [plan, setPlan] = useState<MockTestSubscription | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void initializeAuth({ preloadMenu: false });
  }, [initializeAuth]);

  useEffect(() => {
    if (!mockTestId) return;

    let isMounted = true;
    setIsPlanLoading(true);
    setError("");

    publicApi
      .get<{ success: boolean; data: MockTestSubscription }>(`/public/mock-test-subscriptions/${mockTestId}`)
      .then((res) => {
        if (isMounted) {
          setPlan(res.data.data ?? null);
          if (!res.data.data) setError("Mock test plan could not be found. Please choose a plan again.");
        }
      })
      .catch(() => {
        if (isMounted) setError("Mock test plan could not be loaded. Please try again or contact admin.");
      })
      .finally(() => {
        if (isMounted) setIsPlanLoading(false);
      });

    return () => { isMounted = false; };
  }, [mockTestId]);

  if (!mockTestId) return null;

  const price = toNumber(plan?.price);
  const discountValue = toNumber(plan?.discount);
  const total = Math.max(0, price - discountValue);
  const isVariable = !plan || plan.price === null || plan.price === undefined || price <= 0;

  const invoiceDate = invoice?.invoice_date ?? new Date().toISOString().slice(0, 10);
  const dueDate = invoice?.due_date ?? addDays(new Date(), 3);
  const invoiceTitle = invoice ? `Invoice #${invoice.invoice_number}` : "Estimated Invoice";
  const statusLabel = invoice?.status ?? "not saved";

  const studentName = getUserName((invoice?.user ?? user) as UserShape);
  const studentContact = getUserContact((invoice?.user ?? user) as UserShape);

  const savedTotal = invoice ? toNumber(invoice.total_npr) : total;
  const savedDiscount = invoice ? toNumber(invoice.discount_npr) : discountValue;
  const balance = invoice?.status === "paid" ? 0 : savedTotal;

  const planLabel = plan
    ? `${plan.subscriptions_name} — ${plan.subscriptions_type} / ${plan.subscriptions_category}`
    : "Mock Test Plan";

  const whatsappMessage = invoice
    ? `Hello KTM Test Prep, I have paid for invoice ${invoice.invoice_number}. Student: ${studentName}. Plan: ${plan?.subscriptions_name ?? "Mock Test"}. Total: ${formatMoney(invoice.total_npr)}. I will send the payment screenshot here for verification.`
    : `Hello KTM Test Prep, I want to buy the mock test plan: ${plan?.subscriptions_name ?? "Mock Test"}. Student: ${studentName}. Contact: ${studentContact}. Please help me verify payment.`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${ktmContact.whatsappDigits}&text=${encodeURIComponent(whatsappMessage)}`;

  const handleEnrollmentClick = async () => {
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/payment?mock_test_id=${mockTestId}`)}`);
      return;
    }

    if (isVariable) {
      setError("This plan uses contact pricing. Please confirm the amount with admin before payment.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generated = await createMockTestInvoice(mockTestId);
      setInvoice(generated);
      toast.success("Invoice saved successfully.");
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
      {isPlanLoading ? (
        <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
          Loading mock test plan...
        </div>
      ) : plan ? (
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
                  <p className="mt-1"><span className="font-black text-slate-800">Payment:</span>{" "}
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
                <p className="text-slate-600">{plan.company_name}</p>
                <p className="text-slate-600">{plan.subscriptions_type} — {plan.subscriptions_category}</p>
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
                  <span>{planLabel} | {plan.duration} {plan.duration_type} | {plan.country}</span>
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
                Admin will verify manually and activate your mock test access.
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
              {isGenerating ? "Saving invoice..." : token ? "Generate Invoice" : "Login and generate invoice"}
            </button>
          )}
        </>
      ) : (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error || "Mock test plan is unavailable."}
        </div>
      )}

      {error && plan ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
