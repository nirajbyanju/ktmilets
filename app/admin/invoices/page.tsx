"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import { getInvoices, markInvoicePaid, type Invoice } from "@/apis/courseCatalog.api";
import { isAdminUser, isPrivilegedUser } from "@/data/adminMenu";
import useAuthStore from "@/stores/auth/AuthStore";

const formatMoney = (value: string | number | null | undefined) =>
  `NPR ${Number(value ?? 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;

const studentName = (invoice: Invoice) => {
  const fullName = [invoice.user?.first_name, invoice.user?.last_name].filter(Boolean).join(" ");
  return fullName || invoice.user?.name || invoice.user?.email || "Student";
};

export default function AdminInvoicesPage() {
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const directPermissions = useAuthStore((state) => state.directPermissions);
  const canManageSystem = isPrivilegedUser({ roles, permissions, directPermissions });
  const canManageInvoices = isAdminUser({ roles, permissions, directPermissions });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const loadInvoices = async () => {
    setIsLoading(true);

    try {
      const response = await getInvoices({ limit: 100 });
      setInvoices(response.data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInvoices();
  }, []);

  const handleMarkPaid = async (invoice: Invoice) => {
    if (!canManageInvoices) {
      return;
    }

    const confirmed = window.confirm(`Mark ${invoice.invoice_number} as paid and activate enrollment?`);

    if (!confirmed) {
      return;
    }

    setVerifyingId(invoice.id);

    try {
      await markInvoicePaid(invoice.id, "Payment verified manually by admin.");
      toast.success("Invoice verified and enrollment activated.");
      await loadInvoices();
    } catch (error) {
      console.error("Failed to verify invoice:", error);
      toast.error("Failed to verify invoice.");
    } finally {
      setVerifyingId(null);
    }
  };

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
              ? "Track invoice ID, dates, totals, discounts, status, and manually confirm WhatsApp receipt payments."
              : "View your own invoice IDs, due dates, totals, payment status, and enrollment verification state."}
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

      <section className="rounded border border-slate-200 bg-white shadow-opsh-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-opsh-primary text-white">
              <tr>
                {[
                  "Invoice",
                  ...(canManageSystem ? ["Student"] : []),
                  "Course / Batch",
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
                  <td colSpan={canManageSystem ? (canManageInvoices ? 8 : 7) : 6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-black text-opsh-primary">{invoice.invoice_number}</td>
                    {canManageSystem ? (
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <p className="font-bold">{studentName(invoice)}</p>
                        <p className="text-xs text-slate-500">{invoice.user?.phone || invoice.user?.email}</p>
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="font-bold">{invoice.batch?.course?.name ?? "Course"}</p>
                      <p className="text-xs text-slate-500">{invoice.batch?.batch_type ?? "Batch"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
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
                          {verifyingId === invoice.id ? "Verifying" : "Mark Paid"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageSystem ? (canManageInvoices ? 8 : 7) : 6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    No invoices found.
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
