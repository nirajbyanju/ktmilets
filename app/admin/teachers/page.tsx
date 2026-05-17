'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaPlus, FaSave, FaSpinner, FaSyncAlt, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { createTeacher, deleteTeacher, getTeachers, updateTeacher } from '@/apis/teacher.api';
import type { Teacher, TeacherInput } from '@/types/teacher';

type FormState = Record<string, string | boolean>;

const STATUS_OPTIONS = ['Active', 'Backup', 'Inactive'];
const TIME_OPTIONS = ['Morning', 'Evening', 'Morning/Evening', 'Afternoon', 'As required', 'Flexible'];
const COURSE_OPTIONS = ['IELTS', 'PTE', 'IELTS/PTE', 'IELTS & PTE', 'Other'];

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Backup: 'bg-amber-100 text-amber-800',
  Inactive: 'bg-slate-100 text-slate-600',
};

const INITIAL_FORM: FormState = {
  teacher_id: '',
  name: '',
  course: '',
  phone: '',
  email: '',
  available_time: '',
  status: 'Active',
  notes: '',
};

const toTeacherInput = (form: FormState): TeacherInput => ({
  teacher_id: form.teacher_id || null,
  name: String(form.name),
  course: String(form.course),
  phone: form.phone ? String(form.phone) : null,
  email: form.email ? String(form.email) : null,
  available_time: String(form.available_time),
  status: String(form.status),
  notes: form.notes ? String(form.notes) : null,
});

const fromTeacher = (teacher: Teacher): FormState => ({
  teacher_id: teacher.teacher_id ?? '',
  name: teacher.name ?? '',
  course: teacher.course ?? '',
  phone: teacher.phone ?? '',
  email: teacher.email ?? '',
  available_time: teacher.available_time ?? '',
  status: teacher.status ?? 'Active',
  notes: teacher.notes ?? '',
});

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formValues, setFormValues] = useState<FormState>(INITIAL_FORM);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((t) => JSON.stringify(t).toLowerCase().includes(term));
  }, [teachers, search]);

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await getTeachers({ limit: 100 });
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      toast.error('Failed to load teachers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers();
  }, []);

  const resetForm = () => {
    setEditingItem(null);
    setFormValues(INITIAL_FORM);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleEdit = (teacher: Teacher) => {
    setEditingItem(teacher);
    setFormValues(fromTeacher(teacher));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = toTeacherInput(formValues);
      if (editingItem) {
        await updateTeacher(editingItem.id, payload);
        toast.success('Teacher updated successfully.');
      } else {
        await createTeacher(payload);
        toast.success('Teacher created successfully.');
      }
      resetForm();
      await loadTeachers();
    } catch (error) {
      console.error('Failed to save teacher:', error);
      toast.error('Failed to save teacher.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!window.confirm(`Delete teacher "${teacher.name}"?`)) return;
    try {
      await deleteTeacher(teacher.id);
      toast.success('Teacher deleted.');
      await loadTeachers();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      toast.error('Failed to delete teacher.');
    }
  };

  const inputClass =
    'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15';
  const labelClass = 'text-sm font-bold text-slate-800';

  return (
    <div className="min-h-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">KTM Test Prep</p>
          <h1 className="mt-1 text-2xl font-black text-opsh-primary">Teachers</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage teacher profiles, course assignments, availability, and contact details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadTeachers()}
          className="inline-flex items-center justify-center gap-2 rounded bg-opsh-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-opsh-primary-hover"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[390px,1fr]">
        {/* ── Form Panel ── */}
        <form
          onSubmit={handleSubmit}
          className="rounded border border-slate-200 bg-white p-4 shadow-opsh-sm"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-opsh-primary">
                {editingItem ? 'Edit Teacher' : 'Add Teacher'}
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Fill in teacher profile and course assignment details.
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-opsh-primary"
                title="Cancel edit"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {/* Teacher ID */}
            <div>
              <label className={labelClass}>
                Teacher ID <span className="text-opsh-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={String(formValues.teacher_id)}
                onChange={set('teacher_id')}
                placeholder="T-001"
                className={inputClass}
              />
            </div>

            {/* Name */}
            <div>
              <label className={labelClass}>
                Teacher Name <span className="text-opsh-secondary">*</span>
              </label>
              <input
                type="text"
                required
                value={String(formValues.name)}
                onChange={set('name')}
                placeholder="Full name"
                className={inputClass}
              />
            </div>

            {/* Course */}
            <div>
              <label className={labelClass}>
                Course <span className="text-opsh-secondary">*</span>
              </label>
              <select
                required
                value={String(formValues.course)}
                onChange={set('course')}
                className={inputClass}
              >
                <option value="">Select course</option>
                {COURSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Available Time */}
            <div>
              <label className={labelClass}>
                Available Time <span className="text-opsh-secondary">*</span>
              </label>
              <select
                required
                value={String(formValues.available_time)}
                onChange={set('available_time')}
                className={inputClass}
              >
                <option value="">Select availability</option>
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone / WhatsApp</label>
              <input
                type="text"
                value={String(formValues.phone)}
                onChange={set('phone')}
                placeholder="+977 98XXXXXXXX"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={String(formValues.email)}
                onChange={set('email')}
                placeholder="teacher@example.com"
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>
                Status <span className="text-opsh-secondary">*</span>
              </label>
              <select
                required
                value={String(formValues.status)}
                onChange={set('status')}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 xl:col-span-1">
              <label className={labelClass}>Notes</label>
              <textarea
                value={String(formValues.notes)}
                onChange={set('notes')}
                placeholder="Replace with real teacher info, backup details, etc."
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded bg-opsh-secondary px-4 py-3 text-sm font-black text-white transition hover:bg-opsh-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editingItem ? <FaSave /> : <FaPlus />}
            {isSaving ? 'Saving...' : editingItem ? 'Update Teacher' : 'Create Teacher'}
          </button>
        </form>

        {/* ── Table Panel ── */}
        <section className="rounded border border-slate-200 bg-white shadow-opsh-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-opsh-primary">All Teachers</h2>
              <p className="text-sm text-slate-500">
                {filteredTeachers.length} of {teachers.length} records
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teachers..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-opsh-primary focus:ring-2 focus:ring-opsh-primary/15 md:max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-opsh-primary text-white">
                <tr>
                  {['Teacher ID', 'Name', 'Course', 'Phone / WhatsApp', 'Email', 'Available Time', 'Status', 'Notes', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-wide last:text-right"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <FaSpinner className="mx-auto animate-spin text-2xl text-opsh-primary" />
                    </td>
                  </tr>
                ) : filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-bold text-opsh-primary whitespace-nowrap">
                        {teacher.teacher_id || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">
                        {teacher.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {teacher.course || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {teacher.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {teacher.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {teacher.available_time || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[teacher.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-sm text-slate-500">
                        <div className="line-clamp-2">{teacher.notes || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(teacher)}
                            className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-opsh-primary"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(teacher)}
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
                    <td colSpan={9} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      No teachers found.
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
