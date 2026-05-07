import type { ReactNode } from "react";

export const sectionCardClass =
  "rounded-2xl border border-opsh-grey bg-white shadow-opsh-sm hover:shadow-opsh-md transition-all-smooth";
export const buttonPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-opsh-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-primary-hover transition-colors-smooth disabled:cursor-not-allowed disabled:opacity-50";
export const buttonSecondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-opsh-secondary px-4 py-2.5 text-sm font-medium text-white hover:bg-opsh-secondary-hover transition-colors-smooth disabled:cursor-not-allowed disabled:opacity-50";
export const buttonOutlineClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-opsh-grey bg-white px-4 py-2.5 text-sm font-medium text-opsh-text-dark hover:bg-opsh-background-muted transition-colors-smooth disabled:cursor-not-allowed disabled:opacity-50";
export const inputClass =
  "w-full rounded-xl border border-opsh-grey bg-white px-4 py-2.5 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20 transition-all";
export const textareaClass = `${inputClass} resize-none`;

export const statusChipClass = (status?: string) => {
  const normalized = status?.toLowerCase();

  if (normalized === "active" || normalized === "1") {
    return "bg-opsh-success/10 text-opsh-success";
  }

  if (normalized === "inactive" || normalized === "0") {
    return "bg-opsh-danger/10 text-opsh-danger";
  }

  return "bg-opsh-info/10 text-opsh-info";
};

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-opsh-black">{label}</span>
      {children}
    </label>
  );
}
