"use client";

import { useEffect, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import { getCourseCatalogResource } from "@/apis/courseCatalog.api";
import type { Enrollment } from "@/types/courseCatalog";

const formatMoney = (value: string | number | null | undefined) =>
  `NPR ${Number(value ?? 0).toLocaleString("en-NP", { maximumFractionDigits: 2 })}`;

const formatDate = (value: string | null | undefined) => (value ? String(value).slice(0, 10) : "-");

export default function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEnrollments = async () => {
    setIsLoading(true);

    try {
      const response = await getCourseCatalogResource("enrollments", { limit: 100 });
      setEnrollments(response.data);
    } catch (error) {
      console.error("Failed to load enrollments:", error);
      toast.error("Failed to load enrolled courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEnrollments();
  }, []);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Student portal</p>
          <h1 className="mt-1 text-2xl font-black text-opsh-primary">My Enrolled Courses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            View only the courses and batches confirmed under your account after admin payment verification.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEnrollments()}
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
                {["Course", "Batch", "Enrollment Date", "Amount Paid", "Invoice", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    Loading enrolled courses...
                  </td>
                </tr>
              ) : enrollments.length > 0 ? (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-bold text-opsh-primary">
                      {enrollment.batch?.course?.name ?? "Course"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{enrollment.batch?.batch_type ?? "Batch"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(enrollment.enrollment_date)}</td>
                    <td className="px-4 py-3 text-sm font-black text-opsh-secondary">
                      {formatMoney(enrollment.amount_paid)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="font-bold">{enrollment.invoice?.invoice_number ?? "-"}</p>
                      <p className="text-xs text-slate-500">{enrollment.invoice?.status ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                        {enrollment.status ?? "active"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    No enrolled courses found.
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
