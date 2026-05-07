type PublicSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "between";
};

export default function PublicSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: PublicSectionHeadingProps) {
  if (align === "between") {
    return (
      <div className="mb-12 flex flex-col gap-4 md:justify-between">
        <div className="">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-opsh-secondary">
            {eyebrow}
          </p>
          <h2 className="font-brand mt-3 text-3xl text-opsh-primary md:text-4xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="text-sm leading-7 text-opsh-darkgrey">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-opsh-secondary">
        {eyebrow}
      </p>
      <h2 className="font-brand text-3xl leading-tight text-opsh-primary md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-opsh-darkgrey">{description}</p>
      ) : null}
    </div>
  );
}
