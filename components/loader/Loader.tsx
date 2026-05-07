'use client';

interface AdminLoaderProps {
  title?: string;
  message?: string;
  hint?: string;
}

export default function AdminLoader({
  title = "Loading Admin Workspace",
  message = "Preparing your menu, permissions, and dashboard data.",
  hint = "The page will appear once the initial data is ready.",
}: AdminLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-white-pure to-opsh-grey-light">
      <div className="mx-auto flex min-h-screen max-w-opsh items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,360px),minmax(0,1fr)] lg:items-center">
          <section className="rounded-opsh-xl border border-opsh-grey bg-white/90 p-6 shadow-opsh-lg backdrop-blur-sm sm:p-8">
            <div className="inline-flex items-center rounded-full bg-opsh-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-opsh-primary">
              Admin Loader
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                <div className="absolute inset-0 rounded-full border-4 border-opsh-primary/15" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-opsh-primary border-r-transparent border-b-transparent" />
                <div className="absolute inset-3 flex items-center justify-center rounded-full bg-opsh-primary text-lg font-bold text-white shadow-opsh-primary sm:text-xl">
                  S
                </div>
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-opsh-black sm:text-2xl">
                  {title}
                </h1>
                <p className="mt-2 text-sm leading-6 text-opsh-text">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-opsh-grey">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-opsh-primary to-opsh-fourth" />
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-opsh-muted">
                {hint}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="rounded-opsh-lg border border-opsh-grey bg-opsh-background-muted/60 p-3"
                >
                  <div className="h-2 w-12 animate-pulse rounded bg-opsh-grey" />
                  <div className="mt-3 h-5 w-16 animate-pulse rounded bg-opsh-grey" />
                </div>
              ))}
            </div>
          </section>

          <section className="hidden rounded-opsh-xl border border-opsh-grey bg-white/80 p-5 shadow-opsh-md backdrop-blur-sm lg:block">
            <div className="animate-pulse space-y-5">
              <div className="rounded-opsh-xl bg-opsh-background p-5">
                <div className="h-4 w-32 rounded bg-opsh-grey" />
                <div className="mt-4 h-10 w-2/3 rounded bg-opsh-grey" />
                <div className="mt-3 h-4 w-5/6 rounded bg-opsh-grey" />
              </div>

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-opsh-lg border border-opsh-grey bg-opsh-background-muted/70 p-4">
                    <div className="h-3 w-20 rounded bg-opsh-grey" />
                    <div className="mt-4 h-7 w-14 rounded bg-opsh-grey" />
                    <div className="mt-3 h-3 w-24 rounded bg-opsh-grey" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr,0.9fr]">
                <div className="rounded-opsh-lg border border-opsh-grey bg-opsh-background-muted/70 p-4">
                  <div className="h-4 w-28 rounded bg-opsh-grey" />
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="rounded-opsh-md bg-white p-4">
                        <div className="h-3 w-24 rounded bg-opsh-grey" />
                        <div className="mt-3 h-3 w-full rounded bg-opsh-grey" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-opsh-grey" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-opsh-lg border border-opsh-grey bg-opsh-background-muted/70 p-4">
                  <div className="h-4 w-24 rounded bg-opsh-grey" />
                  <div className="mt-5 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-opsh-grey" />
                        <div className="flex-1">
                          <div className="h-3 w-24 rounded bg-opsh-grey" />
                          <div className="mt-2 h-3 w-36 rounded bg-opsh-grey" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
