'use client';

import { useState } from 'react';
import Image from 'next/image';

import CoursePackageModal from './CoursePackageModal';
import MockTestPackageModal from './MockTestPackageModal';

const courses = [
  {
    title: 'IELTS Online Class',
    text: 'Computer-based IELTS preparation for Reading, Writing, Listening, and Speaking over 6 weeks.',
    img: '/student1.jpeg',
    alt: 'Students studying together for IELTS preparation',
    modal: { slug: 'ielts', title: 'IELTS Online Class' },
    cta: 'View IELTS Class',
  },
  {
    title: 'PTE Online Class',
    text: 'PTE Academic preparation with speaking, writing, reading, listening, and Alfa mock practice.',
    img: '/student2.jpeg',
    alt: 'Student with notes studying for PTE online class',
    modal: { slug: 'pte', title: 'PTE Online Class' },
    cta: 'View PTE Class',
  },
  {
    title: 'Alfa Mock Practice',
    text: 'Buy IELTS or PTE mock test packages and receive access instructions after payment.',
    img: '/student3.jpeg',
    alt: 'Student using computer for mock test practice',
    mockTest: true,
    cta: 'Buy Mock Tests',
  },
] as const;

export default function HomeCourseSection() {
  const [modal, setModal] = useState<{ slug: string; title: string } | null>(null);
  const [mockTestOpen, setMockTestOpen] = useState(false);

  return (
    <>
      <section className="bg-slate-50 py-9 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-wide text-opsh-secondary">Courses</p>
            <h2 className="mt-2 text-3xl font-black text-opsh-primary">
              Choose IELTS, PTE, or mock practice
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Computer-based preparation classes with live sessions, real test-style practice, and
              admin support throughout your journey.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {courses.map((c) => (
              <article
                key={c.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-opsh-sm transition hover:-translate-y-1 hover:shadow-opsh-md"
              >
                <div className="h-56 overflow-hidden bg-slate-100">
                  <Image
                    src={c.img}
                    alt={c.alt}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-black text-opsh-primary">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{c.text}</p>

                  {'mockTest' in c ? (
                    <button
                      type="button"
                      onClick={() => setMockTestOpen(true)}
                      className="mt-5 inline-block rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                    >
                      {c.cta}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModal(c.modal)}
                      className="mt-5 inline-block rounded bg-opsh-primary px-4 py-2 text-sm font-black text-white transition hover:bg-opsh-primary-hover"
                    >
                      {c.cta}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CoursePackageModal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        courseSlug={modal?.slug ?? ''}
        courseTitle={modal?.title ?? ''}
      />

      <MockTestPackageModal
        isOpen={mockTestOpen}
        onClose={() => setMockTestOpen(false)}
      />
    </>
  );
}
