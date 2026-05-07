import type { ReactNode } from "react";

type PublicPageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
}: PublicPageHeroProps) {
  return (
    <section className="relative overflow-hidden py-24 lg:py-28 hidden md:block">
      <div className="absolute inset-0 bg-opsh-primary" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-opsh-secondary">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="font-brand mx-auto mt-4 max-w-4xl text-4xl font-bold leading-tight text-opsh-text md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <div className="mx-auto mt-4 h-1 w-20 rounded bg-opsh-secondary" />

        <p className="mx-auto mt-6 max-w-5xl text-base leading-8 text-opsh-text/85 md:text-lg">
          {description}
        </p>

        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
