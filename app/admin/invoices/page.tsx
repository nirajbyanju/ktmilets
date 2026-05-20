"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaSearch, FaSpinner, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import { getInvoices, markInvoicePaid } from "@/apis/invoice.api";
import { isAdminUser, isPrivilegedUser } from "@/data/adminMenu";
import useAuthStore from "@/stores/auth/AuthStore";
import type { Invoice } from "@/types/invoice";
import { invoiceTypeBadge, invoiceTypeLabel } from "@/types/invoice";

const formatMoney = (value: string | number | null | undefined) =>
  `NPR ${Number(value ?? 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;

const studentName = (invoice: Invoice) => {
  const fullName = [invoice.user?.first_name, invoice.user?.last_name].filter(Boolean).join(" ");
  return fullName || invoice.user?.name || invoice.user?.email || "Student";
};

const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "course", label: "Course" },
  { value: "mock_test", label: "Mock Test" },
  { value: "exam", label: "Exam Booking" },
] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number]["value"];

export default function AdminInvoicesPage() {
  const roles            = useAuthStore((state) => state.roles);
  const permissions      = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const canManageSystem  = isPrivilegedUser({ roles, permissions, directPermissions });
  const canManageInvoices = isAdminUser({ roles, permissions, directPermissions });

  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredInvoices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" ? invoice.status === "paid" : invoice.status !== "paid");
      const matchesType = typeFilter === "all" || invoice.type === typeFilter;
      if (!matchesStatus || !matchesType) return false;
      if (!term) return true;
      const name   = studentName(invoice).toLowerCase();
      const label  = invoiceTypeLabel(invoice).toLowerCase();
      const number = invoice.invoice_number.toLowerCase();
      return name.includes(term) || label.includes(term) || number.includes(term);
    });
  }, [invoices, search, statusFilter, typeFilter]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await getInvoices({ limit: 100 });
      setInvoices(response.data);
    } catch {
      toast.error("Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadInvoices(); }, []);

  const handleMarkPaid = async (invoice: Invoice) => {
    if (!canManageInvoices) return;
    if (!window.confirm(`Mark ${invoice.invoice_number} as paid?`)) return;
    setVerifyingId(invoice.id);
    try {
      await markInvoicePaid(invoice.id, "Payment verified manually by admin.");
      toast.success("Invoice verified and enrollment activated.");
      await loadInvoices();
    } catch {
      toast.error("Failed to verify invoice.");
    } finally {
      setVerifyingId(null);
    }
  };

  const colCount = canManageSystem
    ? canManageInvoices ? 9 : 8
    : canManageInvoices ? 7 : 6;

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
            {canManageSystem ? "Payment verification" : "Student portal"}
          </p>
          <h1 className="mt-1 text-2xl font-black text-opsh-primary">
            {canManageSystem ? "Invoices" : "My Invoices"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {canManageSystem
              ? "Track invoices for course enrollments, mock test subscriptions, and exam bookings."
              : "View your invoice IDs, due dates, totals, and payment status."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadInvoices()}
          className="inline-flex items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-opsh-primary-hover"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, student, or service..."
            className="w-full rounded border border-slate-300 py-2 pl-8 pr-3 text-sm outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "pending")}
          className="rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15 sm:w-36"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15 sm:w-40"
        >
          {TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <p className="shrink-0 self-center text-sm text-slate-500">
          {filteredInvoices.length} of {invoices.length}
        </p>
      </div>

      <section className="rounded border border-slate-200 bg-white shadow-opsh-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {[
                  "Invoice",
                  "Type",
                  ...(canManageSystem ? ["Student"] : []),
                  "Service",
                  "Dates",
                  "Discount",
                  "Total",
                  "Status",
                  ...(canManageInvoices ? ["Actions"] : []),
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-16 text-center">
                    <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-black text-opsh-primary whitespace-nowrap">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${invoiceTypeBadge(invoice.type)}`}>
                        {invoice.type === 'mock_test' ? 'Mock Test' : invoice.type}
                      </span>
                    </td>
                    {canManageSystem ? (
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <p className="font-bold">{studentName(invoice)}</p>
                        <p className="text-xs text-slate-500">{invoice.user?.phone || invoice.user?.email}</p>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="font-bold">{invoiceTypeLabel(invoice)}</p>
                      {invoice.type === 'course' && invoice.batch?.batch_type ? (
                        <p className="text-xs text-slate-500">{invoice.batch.batch_type}</p>
                      ) : null}
                      {invoice.type === 'mock_test' && invoice.mock_test_subscription?.package ? (
                        <p className="text-xs text-slate-500">{invoice.mock_test_subscription.package}</p>
                      ) : null}
                      {invoice.type === 'exam' && invoice.exam_booking_enrollment?.preferred_date ? (
                        <p className="text-xs text-slate-500">{invoice.exam_booking_enrollment.preferred_date}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                      <p>Invoice: {invoice.invoice_date}</p>
                      <p>Due: {invoice.due_date}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatMoney(invoice.discount_npr)}</td>
                    <td className="px-4 py-3 text-sm font-black text-opsh-secondary">{formatMoney(invoice.total_npr)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    {canManageInvoices ? (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={invoice.status === "paid" || verifyingId === invoice.id}
                          onClick={() => void handleMarkPaid(invoice)}
                          className="inline-flex items-center gap-2 rounded bg-opsh-secondary px-3 py-2 text-xs font-black text-white transition hover:bg-opsh-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaCheckCircle />
                          {verifyingId === invoice.id ? "Verifying…" : "Mark Paid"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={colCount} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    {search || statusFilter !== "all" || typeFilter !== "all"
                      ? "No invoices match your filters."
                      : "No invoices found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
