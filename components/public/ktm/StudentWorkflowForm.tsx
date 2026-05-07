"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  courseTypeOptions,
  paymentMethodOptions,
  pricePlanOptions,
  pricingPlans,
} from "@/data/ktm";

type FieldType = "text" | "email" | "tel" | "date" | "select" | "textarea" | "file";

type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type WorkflowKind = "registration" | "payment" | "exam" | "mock" | "contact";

type StudentWorkflowFormProps = {
  kind: WorkflowKind;
  defaultCourse?: string;
  defaultPackage?: string;
  submitLabel?: string;
};

const instructionOptions = ["English", "Nepanglish"];
const classTimeOptions = [
  "Morning",
  "Day Time",
  "Evening",
  "Weekend",
  "Global Flex",
  "Need admin suggestion",
];
const examOptions = ["IELTS Academic", "IELTS General Training", "PTE Academic"];
const mockOptions = ["Alfa IELTS Mock", "Alfa PTE Mock"];
const mockPackages = [
  "Single Mock Test",
  "Weekly Mock Package",
  "Monthly Practice Package",
  "Full Preparation Package",
];
const currencyOptions = ["NPR", "USD"];

const commonContactFields: FieldConfig[] = [
  { name: "fullName", label: "Full name", type: "text", required: true },
  { name: "email", label: "Email address", type: "email", required: true },
  { name: "whatsapp", label: "WhatsApp number", type: "tel", required: true },
];

const fieldGroups: Record<WorkflowKind, FieldConfig[]> = {
  registration: [
    ...commonContactFields,
    { name: "passportCountry", label: "Country of passport", type: "text", required: true },
    { name: "currentLocation", label: "Current location / country", type: "text", required: true },
    {
      name: "preferredClassTime",
      label: "Preferred class time",
      type: "select",
      required: true,
      options: classTimeOptions,
    },
    {
      name: "courseType",
      label: "Course type",
      type: "select",
      required: true,
      options: courseTypeOptions,
    },
    {
      name: "pricePlan",
      label: "Price plan",
      type: "select",
      required: true,
      options: pricePlanOptions,
    },
    {
      name: "instructionType",
      label: "Instruction type",
      type: "select",
      required: true,
      options: instructionOptions,
    },
    { name: "targetScore", label: "Target score / band", type: "text", required: true },
    {
      name: "paymentMethod",
      label: "Payment method",
      type: "select",
      required: true,
      options: paymentMethodOptions,
    },
    {
      name: "message",
      label: "Message / questions",
      type: "textarea",
      placeholder: "Share your preferred start date, timezone, or questions.",
    },
  ],
  payment: [
    ...commonContactFields,
    {
      name: "coursePackage",
      label: "Selected course / package",
      type: "select",
      required: true,
      options: [
        ...courseTypeOptions,
        ...pricingPlans.map((plan) => `${plan.name} - ${plan.price}`),
        ...mockPackages,
      ],
    },
    { name: "amount", label: "Fee amount", type: "text", required: true },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      required: true,
      options: currencyOptions,
    },
    {
      name: "paymentMethod",
      label: "Payment method",
      type: "select",
      required: true,
      options: paymentMethodOptions,
    },
    {
      name: "message",
      label: "Payment note",
      type: "textarea",
      placeholder: "Mention transaction reference, country, or preferred gateway.",
    },
  ],
  exam: [
    {
      name: "testType",
      label: "Test type",
      type: "select",
      required: true,
      options: examOptions,
    },
    { name: "preferredTestDate", label: "Preferred test date", type: "date", required: true },
    {
      name: "preferredTestLocation",
      label: "Preferred test location / test centre",
      type: "text",
      required: true,
    },
    { name: "passportName", label: "Passport name", type: "text", required: true },
    { name: "passportNumber", label: "Passport number", type: "text", required: true },
    { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
    { name: "contactNumber", label: "Contact number", type: "tel", required: true },
    { name: "email", label: "Email address", type: "email", required: true },
    { name: "passportCopy", label: "Passport copy upload", type: "file", required: true },
    {
      name: "message",
      label: "Special message or request",
      type: "textarea",
      placeholder: "Share date flexibility, test centre preference, or urgent needs.",
    },
  ],
  mock: [
    ...commonContactFields,
    {
      name: "mockType",
      label: "Mock test type",
      type: "select",
      required: true,
      options: mockOptions,
    },
    {
      name: "mockPackage",
      label: "Package option",
      type: "select",
      required: true,
      options: mockPackages,
    },
    {
      name: "paymentMethod",
      label: "Payment method",
      type: "select",
      required: true,
      options: paymentMethodOptions,
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Tell us when you want to start practice.",
    },
  ],
  contact: [
    ...commonContactFields,
    { name: "subject", label: "Subject", type: "text", required: true },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      placeholder: "Write your question here.",
    },
  ],
};

const getInitialValues = (
  kind: WorkflowKind,
  defaultCourse?: string,
  defaultPackage?: string
) => {
  const values: Record<string, string> = {};

  fieldGroups[kind].forEach((field) => {
    values[field.name] = "";
  });

  if (defaultCourse && "courseType" in values) {
    values.courseType = defaultCourse;
  }

  if (defaultCourse && "coursePackage" in values) {
    values.coursePackage = defaultCourse;
  }

  if (defaultPackage && "mockPackage" in values) {
    values.mockPackage = defaultPackage;
  }

  if ("currency" in values) {
    values.currency = "NPR";
  }

  return values;
};

const successCopy: Record<WorkflowKind, string> = {
  registration:
    "Thank you. Your registration details have been captured for admin follow-up and batch allocation.",
  payment:
    "Thank you. Your payment request has been captured so the admin team can verify gateway details and send joining instructions.",
  exam:
    "Thank you. Your exam booking support request has been captured for document and payment follow-up.",
  mock:
    "Thank you. Your mock-test purchase request has been captured for access instructions and follow-up.",
  contact: "Thank you. Your message has been captured and the team will contact you soon.",
};

export default function StudentWorkflowForm({
  kind,
  defaultCourse,
  defaultPackage,
  submitLabel,
}: StudentWorkflowFormProps) {
  const fields = fieldGroups[kind];
  const [values, setValues] = useState<Record<string, string>>(() =>
    getInitialValues(kind, defaultCourse, defaultPackage)
  );
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const fieldLayout = useMemo(
    () => (kind === "exam" || kind === "registration" || kind === "payment" ? "md:grid-cols-2" : "md:grid-cols-1"),
    [kind]
  );
  const wideTextareas = kind === "exam" || kind === "registration" || kind === "payment";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (honeypot) {
      return;
    }

    const submission = {
      kind,
      values,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = window.localStorage.getItem("ktm-test-prep-submissions");
      const parsed = existing ? JSON.parse(existing) : [];
      const nextSubmissions = Array.isArray(parsed) ? [...parsed, submission] : [submission];
      window.localStorage.setItem("ktm-test-prep-submissions", JSON.stringify(nextSubmissions));
    } catch {
      // The visible confirmation still helps the student if local storage is unavailable.
    }

    setSubmitted(true);
    setValues(getInitialValues(kind, defaultCourse, defaultPackage));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-opsh-sm">
      {submitted ? (
        <div className="mb-5 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {successCopy[kind]}
        </div>
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Company website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${fieldLayout}`}>
        {fields.map((field) => {
          const fieldId = `${kind}-${field.name}`;
          const fieldClass =
            "w-full rounded border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15";

          if (field.type === "textarea") {
            return (
              <div key={field.name} className={wideTextareas ? "md:col-span-2" : ""}>
                <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                  {field.label}
                  {field.required ? <span className="text-opsh-secondary"> *</span> : null}
                </label>
                <textarea
                  id={fieldId}
                  name={field.name}
                  required={field.required}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                  rows={4}
                  className={`${fieldClass} mt-1 resize-y`}
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name}>
                <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                  {field.label}
                  {field.required ? <span className="text-opsh-secondary"> *</span> : null}
                </label>
                <select
                  id={fieldId}
                  name={field.name}
                  required={field.required}
                  value={values[field.name] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  className={`${fieldClass} mt-1`}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                {field.label}
                {field.required ? <span className="text-opsh-secondary"> *</span> : null}
              </label>
              <input
                id={fieldId}
                name={field.name}
                type={field.type}
                required={field.required}
                value={field.type === "file" ? undefined : values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]:
                      field.type === "file"
                        ? event.target.files?.[0]?.name ?? ""
                        : event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                className={`${fieldClass} mt-1`}
              />
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded bg-opsh-secondary px-5 py-3 text-sm font-black text-white shadow-opsh-secondary transition hover:bg-opsh-secondary-hover"
      >
        {submitLabel ?? "Submit"}
      </button>
    </form>
  );
}
