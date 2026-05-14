import Link from "next/link";

export default function NotFoundContent() {
  return (
    <main className="flex-grow bg-opsh-background-light">
      <section className="px-6 py-24 pt-40 text-center md:px-12">
        <div className="container mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-2xl">
            <span className="font-brand mb-4 block text-8xl font-bold leading-none text-opsh-secondary/25 md:text-9xl">
              404
            </span>

            <h1 className="font-brand mb-6 text-4xl text-opsh-primary md:text-5xl">
              Page Not Found
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-opsh-darkgrey">
              The page or property you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-opsh-primary px-6 py-3 text-sm font-semibold text-opsh-text transition-colors hover:bg-opsh-primary-hover"
              >
                Return Home
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-opsh-primary px-6 py-3 text-sm font-semibold text-opsh-primary transition-colors hover:bg-opsh-primary hover:text-opsh-text"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
