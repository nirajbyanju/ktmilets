"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaSpinner, FaSyncAlt, FaTimes, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  createCourseCatalogResource,
  deleteCourseCatalogResource,
  getCourseCatalogResource,
  updateCourseCatalogResource,
} from "@/apis/courseCatalog.api";
import { getTeachers } from "@/apis/teacher.api";
import type {
  Batch,
  Course,
  CourseCatalogInput,
  CourseCatalogResourceItem,
  CourseCatalogResourceKey,
} from "@/types/courseCatalog";
import type { Teacher } from "@/types/teacher";

type FieldType = "text" | "number" | "textarea" | "checkbox" | "date" | "time" | "select";
type ValueType = "string" | "number" | "boolean";
type ResourceCollections = Record<CourseCatalogResourceKey, CourseCatalogResourceItem[]>;

type SelectOption = {
  label: string;
  value: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  valueType?: ValueType;
  defaultValue?: string | boolean;
  placeholder?: string;
  wide?: boolean;
  options?: (resources: ResourceCollections) => SelectOption[];
};

type ColumnConfig = {
  label: string;
  render: (item: CourseCatalogResourceItem, resources: ResourceCollections) => ReactNode;
};

type ResourceConfig = {
  key: CourseCatalogResourceKey;
  label: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  fields: FieldConfig[];
  columns: ColumnConfig[];
};

type FormState = Record<string, string | boolean>;

const createEmptyResources = (): ResourceCollections => ({
  courses: [],
  batches: [],
  "support-channels": [],
  "skills-modules": [],
  "additional-services": [],
  enrollments: [],
});

const asRecord = (item: CourseCatalogResourceItem): Record<string, unknown> =>
  item as unknown as Record<string, unknown>;

const asCourse = (item: CourseCatalogResourceItem): Course => item as Course;
const asBatch = (item: CourseCatalogResourceItem): Batch => item as Batch;

const courseOptions = (resources: ResourceCollections): SelectOption[] =>
  resources.courses.map((item) => {
    const course = asCourse(item);
    return { label: course.name, value: String(course.id) };
  });

const getCourseName = (resources: ResourceCollections, courseId?: number | null): string => {
  const course = resources.courses.map(asCourse).find((item) => item.id === Number(courseId));
  return course?.name ?? "Unassigned course";
};


const formatMoney = (value: unknown, variable = false): string => {
  if (variable || value === null || value === undefined || value === "") {
    return "Contact";
  }

  return `NPR ${Number(value).toLocaleString("en-NP", {
    maximumFractionDigits: 2,
  })}`;
};

const formatBoolean = (value: unknown): string => (value ? "Yes" : "No");

const formatDate = (value: unknown): string => {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 10);
};

const renderValue = (value: unknown): ReactNode => {
  if (typeof value === "boolean") {
    return formatBoolean(value);
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const buildResourceConfigs = (teacherOptions: SelectOption[]): ResourceConfig[] => [
  {
    key: "courses",
    label: "Courses",
    title: "Course",
    description: "Main course offerings such as IELTS Preparation Course.",
    searchPlaceholder: "Search courses...",
    fields: [
      { name: "name", label: "Course name", type: "text", required: true, placeholder: "IELTS Preparation Course" },
      { name: "duration_weeks", label: "Duration weeks", type: "number", valueType: "number", required: true },
      { name: "total_hours", label: "Total hours", type: "number", valueType: "number", required: true },
      { name: "delivery_mode", label: "Delivery mode", type: "text", required: true, placeholder: "Live online Zoom classes" },
      { name: "instruction_lang", label: "Instruction language", type: "text", required: true, placeholder: "English or Nepanglish" },
      { name: "skills", label: "Skills", type: "textarea", wide: true, placeholder: "Reading, Writing, Listening, Speaking" },
    ],
    columns: [
      { label: "Name", render: (item) => asCourse(item).name },
      { label: "Duration", render: (item) => `${asCourse(item).duration_weeks} weeks` },
      { label: "Hours", render: (item) => asCourse(item).total_hours },
      { label: "Delivery", render: (item) => asCourse(item).delivery_mode },
      { label: "Instruction", render: (item) => asCourse(item).instruction_lang },
    ],
  },
  {
    key: "batches",
    label: "Batches",
    title: "Batch",
    description: "Batch sizes, prices, schedules, and allocation details.",
    searchPlaceholder: "Search batches...",
    fields: [
      { name: "course_id", label: "Course", type: "select", valueType: "number", required: true, options: courseOptions },
      { name: "batch_type", label: "Batch type", type: "text", required: true, placeholder: "Smart Batch" },
      { name: "min_size", label: "Minimum size", type: "number", valueType: "number" },
      { name: "max_size", label: "Maximum size", type: "number", valueType: "number" },
      { name: "price_npr", label: "Price NPR", type: "number", valueType: "number" },
      { name: "offer_label", label: "Offer label", type: "text", placeholder: "Early bird offer" },
      {
        name: "discount_type",
        label: "Discount type",
        type: "select",
        options: () => [
          { label: "No discount", value: "" },
          { label: "Percent", value: "percent" },
          { label: "Fixed NPR", value: "fixed" },
        ],
      },
      { name: "discount_value", label: "Discount value", type: "number", valueType: "number" },
      { name: "offer_starts_at", label: "Offer starts", type: "date" },
      { name: "offer_ends_at", label: "Offer ends", type: "date" },
      { name: "is_price_variable", label: "Variable price", type: "checkbox", valueType: "boolean", defaultValue: false },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "class_time", label: "Class time", type: "time" },
      { name: "class_link", label: "Class link", type: "text", placeholder: "https://..." },
      { name: "is_active", label: "Active batch", type: "checkbox", valueType: "boolean", defaultValue: true },
      { name: "schedule_notes", label: "Schedule notes", type: "textarea", wide: true },
      {
        name: "teacher_id",
        label: "Assigned Teacher",
        type: "select",
        valueType: "number",
        options: () => [{ label: "No teacher assigned", value: "" }, ...teacherOptions],
      },
    ],
    columns: [
      { label: "Batch", render: (item) => asBatch(item).batch_type },
      { label: "Course", render: (item, resources) => getCourseName(resources, asBatch(item).course_id) },
      {
        label: "Size",
        render: (item) => {
          const batch = asBatch(item);
          return batch.min_size && batch.max_size ? `${batch.min_size}-${batch.max_size}` : "Variable";
        },
      },
      { label: "Price", render: (item) => formatMoney(asBatch(item).price_npr, asBatch(item).is_price_variable) },
      { label: "Offer", render: (item) => renderValue(asRecord(item).offer_label) },
      { label: "Time", render: (item) => asBatch(item).class_time?.slice(0, 5) ?? "-" },
    ],
  },
  {
    key: "support-channels",
    label: "Support",
    title: "Support Channel",
    description: "WhatsApp, email, admin, and teacher follow-up contacts.",
    searchPlaceholder: "Search support channels...",
    fields: [
      { name: "channel_type", label: "Channel type", type: "text", required: true, placeholder: "WhatsApp" },
      { name: "contact_value", label: "Contact value", type: "text", required: true, placeholder: "+977 9747469800" },
    ],
    columns: [
      { label: "Channel", render: (item) => renderValue(asRecord(item).channel_type) },
      { label: "Contact", render: (item) => renderValue(asRecord(item).contact_value) },
    ],
  },
  {
    key: "skills-modules",
    label: "Skills",
    title: "Skill Module",
    description: "IELTS Reading, Writing, Listening, and Speaking coverage.",
    searchPlaceholder: "Search skills...",
    fields: [
      { name: "skill_name", label: "Skill name", type: "text", required: true, placeholder: "Reading" },
      { name: "topics_covered", label: "Topics covered", type: "textarea", wide: true },
      { name: "feedback_included", label: "Feedback included", type: "checkbox", valueType: "boolean", defaultValue: false },
    ],
    columns: [
      { label: "Skill", render: (item) => renderValue(asRecord(item).skill_name) },
      { label: "Topics", render: (item) => renderValue(asRecord(item).topics_covered) },
      { label: "Feedback", render: (item) => formatBoolean(asRecord(item).feedback_included) },
    ],
  },
  {
    key: "additional-services",
    label: "Services",
    title: "Additional Service",
    description: "Mock support, exam booking help, and add-on services.",
    searchPlaceholder: "Search services...",
    fields: [
      { name: "service_name", label: "Service name", type: "text", required: true, placeholder: "Mock Support" },
      { name: "price_npr", label: "Price NPR", type: "number", valueType: "number" },
      { name: "is_add_on", label: "Add-on service", type: "checkbox", valueType: "boolean", defaultValue: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
    ],
    columns: [
      { label: "Service", render: (item) => renderValue(asRecord(item).service_name) },
      { label: "Price", render: (item) => formatMoney(asRecord(item).price_npr) },
      { label: "Add-on", render: (item) => formatBoolean(asRecord(item).is_add_on) },
      { label: "Description", render: (item) => renderValue(asRecord(item).description) },
    ],
  },
];

const buildInitialForm = (config: ResourceConfig): FormState =>
  config.fields.reduce<FormState>((values, field) => {
    values[field.name] = field.defaultValue ?? "";
    return values;
  }, {});

const getItemId = (item: CourseCatalogResourceItem): number => Number(asRecord(item).id);

const staticResourceKeys: CourseCatalogResourceKey[] = [
  "courses", "batches", "support-channels", "skills-modules", "additional-services",
];

export default function CourseCatalogAdminPage() {
  const [activeKey, setActiveKey] = useState<CourseCatalogResourceKey>("courses");
  const [resources, setResources] = useState<ResourceCollections>(() => createEmptyResources());
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formValues, setFormValues] = useState<FormState>(() =>
    buildInitialForm(buildResourceConfigs([])[0])
  );
  const [editingItem, setEditingItem] = useState<CourseCatalogResourceItem | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const resourceConfigs = useMemo(
    () => buildResourceConfigs(teachers.map((t) => ({ label: t.name, value: String(t.id) }))),
    [teachers]
  );

  const activeConfig = useMemo(
    () => resourceConfigs.find((config) => config.key === activeKey) ?? resourceConfigs[0],
    [activeKey, resourceConfigs]
  );

  const activeItems = resources[activeKey];

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return activeItems;
    }

    return activeItems.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }, [activeItems, search]);

  const resetForm = (config = activeConfig) => {
    setEditingItem(null);
    setFormValues(buildInitialForm(config));
  };

  const loadResources = async () => {
    setIsLoading(true);

    try {
      const [teacherResponse, ...entries] = await Promise.all([
        getTeachers({ limit: 100 }),
        ...staticResourceKeys.map(async (key) => {
          const response = await getCourseCatalogResource(key, { limit: 100 });
          return [key, response.data] as const;
        }),
      ]);

      setTeachers(teacherResponse.data);

      const nextResources = createEmptyResources();
      (entries as [CourseCatalogResourceKey, CourseCatalogResourceItem[]][]).forEach(([key, value]) => {
        nextResources[key] = value;
      });
      setResources(nextResources);
    } catch (error) {
      console.error("Failed to load course catalog resources:", error);
      toast.error("Failed to load course catalog data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadResources();
  }, []);

  const handleTabChange = (key: CourseCatalogResourceKey) => {
    const nextConfig = resourceConfigs.find((config) => config.key === key) ?? resourceConfigs[0];
    setActiveKey(key);
    setSearch("");
    resetForm(nextConfig);
  };

  const handleEdit = (item: CourseCatalogResourceItem) => {
    const record = asRecord(item);
    const nextValues = activeConfig.fields.reduce<FormState>((values, field) => {
      const value = record[field.name];

      if (field.type === "checkbox") {
        values[field.name] = Boolean(value);
      } else if (field.type === "time" && value) {
        values[field.name] = String(value).slice(0, 5);
      } else if (field.type === "date" && value) {
        values[field.name] = String(value).slice(0, 10);
      } else {
        values[field.name] = value === null || value === undefined ? "" : String(value);
      }

      return values;
    }, {});

    setEditingItem(item);
    setFormValues(nextValues);
  };

  const buildPayload = (): CourseCatalogInput =>
    activeConfig.fields.reduce<CourseCatalogInput>((payload, field) => {
      const value = formValues[field.name];

      if (field.type === "checkbox") {
        payload[field.name] = Boolean(value);
        return payload;
      }

      if (field.valueType === "number") {
        payload[field.name] = value === "" ? null : Number(value);
        return payload;
      }

      payload[field.name] = value === "" && !field.required ? null : String(value ?? "");
      return payload;
    }, {});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = buildPayload();

      if (editingItem) {
        await updateCourseCatalogResource(activeKey, getItemId(editingItem), payload);
        toast.success(`${activeConfig.title} updated successfully.`);
      } else {
        await createCourseCatalogResource(activeKey, payload);
        toast.success(`${activeConfig.title} created successfully.`);
      }

      resetForm();
      await loadResources();
    } catch (error) {
      console.error("Failed to save course catalog resource:", error);
      toast.error(`Failed to save ${activeConfig.title.toLowerCase()}.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: CourseCatalogResourceItem) => {
    const confirmed = window.confirm(`Delete this ${activeConfig.title.toLowerCase()}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteCourseCatalogResource(activeKey, getItemId(item));
      toast.success(`${activeConfig.title} deleted successfully.`);
      await loadResources();
    } catch (error) {
      console.error("Failed to delete course catalog resource:", error);
      toast.error(`Failed to delete ${activeConfig.title.toLowerCase()}.`);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">
            KTM Test Prep
          </p>
          <h1 className="mt-1 text-2xl font-black text-opsh-primary">Course Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage IELTS course records, batch pricing, support contacts, skill modules, and add-on services.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadResources()}
          className="inline-flex items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-opsh-primary-hover"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {resourceConfigs.map((config) => (
          <button
            key={config.key}
            type="button"
            onClick={() => handleTabChange(config.key)}
            className={`whitespace-nowrap rounded px-4 py-2 text-sm font-bold transition ${
              activeKey === config.key
                ? "bg-opsh-primary text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[390px,1fr]">
        <form onSubmit={handleSubmit} className="rounded border border-slate-200 bg-white p-4 shadow-opsh-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-opsh-primary">
                {editingItem ? `Edit ${activeConfig.title}` : `Add ${activeConfig.title}`}
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">{activeConfig.description}</p>
            </div>
            {editingItem ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-opsh-primary"
                title="Cancel edit"
              >
                <FaTimes />
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {activeConfig.fields.map((field) => {
              const fieldId = `${activeKey}-${field.name}`;
              const baseClass =
                "mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15";
              const wrapperClass = field.wide ? "sm:col-span-2 xl:col-span-1" : "";

              if (field.type === "checkbox") {
                return (
                  <label key={field.name} htmlFor={fieldId} className={`${wrapperClass} flex items-center gap-3 rounded border border-slate-200 px-3 py-3 text-sm font-bold text-slate-800`}>
                    <input
                      id={fieldId}
                      type="checkbox"
                      checked={Boolean(formValues[field.name])}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [field.name]: event.target.checked }))
                      }
                      className="h-4 w-4 accent-opsh-primary"
                    />
                    {field.label}
                  </label>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.name} className={wrapperClass}>
                    <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                      {field.label}
                      {field.required ? <span className="text-opsh-secondary"> *</span> : null}
                    </label>
                    <textarea
                      id={fieldId}
                      required={field.required}
                      value={String(formValues[field.name] ?? "")}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      rows={4}
                      className={`${baseClass} resize-y`}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                const options = field.options?.(resources) ?? [];

                return (
                  <div key={field.name} className={wrapperClass}>
                    <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                      {field.label}
                      {field.required ? <span className="text-opsh-secondary"> *</span> : null}
                    </label>
                    <select
                      id={fieldId}
                      required={field.required}
                      value={String(formValues[field.name] ?? "")}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [field.name]: event.target.value }))
                      }
                      className={baseClass}
                    >
                      <option value="">Select an option</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={field.name} className={wrapperClass}>
                  <label htmlFor={fieldId} className="text-sm font-bold text-slate-800">
                    {field.label}
                    {field.required ? <span className="text-opsh-secondary"> *</span> : null}
                  </label>
                  <input
                    id={fieldId}
                    type={field.type}
                    required={field.required}
                    value={String(formValues[field.name] ?? "")}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                    placeholder={field.placeholder}
                    min={field.type === "number" ? 0 : undefined}
                    className={baseClass}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-opsh-secondary px-4 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingItem ? <FaSave /> : <FaPlus />}
            {isSaving ? "Saving..." : editingItem ? `Update ${activeConfig.title}` : `Create ${activeConfig.title}`}
          </button>
        </form>

        <section className="rounded border border-slate-200 bg-white shadow-opsh-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-opsh-primary">{activeConfig.label}</h2>
              <p className="text-sm text-slate-500">
                {filteredItems.length} of {activeItems.length} records
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={activeConfig.searchPlaceholder}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15 md:max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-opsh-primary text-white">
                <tr>
                  {activeConfig.columns.map((column) => (
                    <th key={column.label} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeConfig.columns.length + 1} className="px-4 py-16 text-center">
                      <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={getItemId(item)} className="transition hover:bg-slate-50">
                      {activeConfig.columns.map((column) => (
                        <td key={column.label} className="max-w-xs px-4 py-3 text-sm text-slate-700">
                          <div className="line-clamp-3">{column.render(item, resources)}</div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-opsh-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(item)}
                            className="rounded p-2 text-slate-500 transition hover:bg-red-50 hover:text-opsh-danger"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeConfig.columns.length + 1} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
