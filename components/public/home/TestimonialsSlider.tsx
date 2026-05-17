"use client";

import { useState } from "react";
import Image from "next/image";

type Testimonial = {
  name: string;
  course: string;
  text: string;
  img: string;
};

export default function TestimonialsSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setActive((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Mobile: single-item slider */}
      <div className="md:hidden mt-10">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-opsh-sm min-h-[220px]">
          {testimonials.map((t, i) => (
            <article
              key={t.name}
              className={`transition-opacity duration-300 ${i === active ? "block opacity-100" : "hidden opacity-0"}`}
            >
              <Image
                src={t.img}
                alt={`${t.name} — ${t.course} student`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
              <p className="mt-3 text-base text-yellow-400" aria-label="5 stars">★★★★★</p>
              <h3 className="mt-1 text-base font-black text-opsh-primary">{t.name}</h3>
              <p className="text-xs font-semibold text-opsh-secondary">{t.course}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t.text}</p>
            </article>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-opsh-primary hover:text-opsh-primary"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-opsh-primary" : "w-2.5 bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-opsh-primary hover:text-opsh-primary"
          >
            ›
          </button>
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid mt-10 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-opsh-sm"
          >
            <Image
              src={t.img}
              alt={`${t.name} — ${t.course} student`}
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
            <p className="mt-3 text-base text-yellow-400" aria-label="5 stars">★★★★★</p>
            <h3 className="mt-1 text-base font-black text-opsh-primary">{t.name}</h3>
            <p className="text-xs font-semibold text-opsh-secondary">{t.course}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
