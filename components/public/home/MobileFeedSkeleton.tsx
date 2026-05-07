export default function MobileFeedSkeleton() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f5f7f8_0%,#eef3f6_100%)] px-3 py-3 pb-28 md:hidden">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="rounded-[28px] border border-black/5 bg-white/90 p-4 shadow-[0_18px_45px_rgba(4,72,69,0.08)]">
          <div className="h-11 animate-pulse rounded-2xl bg-opsh-grey-light" />
          <div className="mt-3 flex gap-2">
            {[0, 1, 2].map((chip) => (
              <div key={chip} className="h-9 w-24 animate-pulse rounded-full bg-opsh-grey-light" />
            ))}
          </div>
        </div>

        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_18px_45px_rgba(4,72,69,0.08)]"
          >
            <div className="aspect-[4/5] animate-pulse bg-opsh-grey-light" />
            <div className="space-y-3 px-4 py-4">
              <div className="h-5 w-3/4 animate-pulse rounded-full bg-opsh-grey-light" />
              <div className="h-4 w-full animate-pulse rounded-full bg-opsh-grey-light" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-opsh-grey-light" />
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded-full bg-opsh-grey-light" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-opsh-grey-light" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
