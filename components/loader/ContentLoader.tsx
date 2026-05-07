import type { FC, ReactNode } from 'react';

type ContentLoaderVariant = 'card' | 'list' | 'grid' | 'details' | 'profile' | 'dashboard';

interface ContentLoaderProps {
  variant?: ContentLoaderVariant;
  count?: number;
  className?: string;
  showHeader?: boolean;
  showImage?: boolean;
  showText?: boolean;
  showActions?: boolean;
  columns?: number;
}

const skeletonBar = (className: string) => (
  <div className={`animate-pulse rounded-full bg-opsh-grey ${className}`}></div>
);

const cardShellClass =
  'rounded-opsh-lg border border-opsh-grey bg-white/90 shadow-opsh-sm backdrop-blur-sm';

const ContentLoader: FC<ContentLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
  showHeader = true,
  showImage = true,
  showText = true,
  showActions = true,
  columns = 3,
}) => {
  const renderCardLoader = () => (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${cardShellClass} p-4 sm:p-5`}>
          {showImage ? (
            <div className="mb-4 h-40 rounded-opsh-md bg-opsh-background-muted sm:h-48" />
          ) : null}
          {showHeader ? skeletonBar('mb-3 h-5 w-2/3') : null}
          {showText ? (
            <div className="space-y-2">
              {skeletonBar('h-3.5 w-full')}
              {skeletonBar('h-3.5 w-5/6')}
              {skeletonBar('h-3.5 w-2/3')}
            </div>
          ) : null}
          {showActions ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="h-9 w-24 rounded-opsh-md bg-opsh-background" />
              <div className="h-9 w-20 rounded-opsh-md bg-opsh-background" />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  const renderListLoader = () => (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${cardShellClass} p-4`}>
          <div className="flex items-start gap-4">
            {showImage ? (
              <div className="h-12 w-12 shrink-0 rounded-full bg-opsh-background-muted sm:h-14 sm:w-14" />
            ) : null}
            <div className="min-w-0 flex-1 space-y-2.5">
              {skeletonBar('h-4 w-40')}
              {showText ? (
                <>
                  {skeletonBar('h-3.5 w-full')}
                  {skeletonBar('h-3.5 w-4/5')}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridLoader = () => {
    const gridClass =
      columns === 1
        ? 'grid-cols-1'
        : columns === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : columns === 3
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';

    return (
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`${cardShellClass} p-4`}>
            {showImage ? (
              <div className="mb-4 h-32 rounded-opsh-md bg-opsh-background-muted sm:h-36" />
            ) : null}
            {skeletonBar('mb-3 h-4 w-2/3')}
            {showText ? (
              <div className="space-y-2">
                {skeletonBar('h-3.5 w-full')}
                {skeletonBar('h-3.5 w-5/6')}
              </div>
            ) : null}
            {showActions ? <div className="mt-4 h-9 rounded-opsh-md bg-opsh-background" /> : null}
          </div>
        ))}
      </div>
    );
  };

  const renderDetailsLoader = () => (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8 xl:col-span-9">
        <div className={`${cardShellClass} h-52 p-5 sm:h-64`} />
        <div className={`${cardShellClass} p-5`}>
          {skeletonBar('mb-4 h-5 w-52')}
          <div className="space-y-3">
            {skeletonBar('h-3.5 w-full')}
            {skeletonBar('h-3.5 w-11/12')}
            {skeletonBar('h-3.5 w-4/5')}
          </div>
        </div>
        <div className={`${cardShellClass} p-5`}>
          {skeletonBar('mb-4 h-5 w-40')}
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-opsh-md bg-opsh-background p-4">
                {skeletonBar('mb-2 h-3.5 w-24')}
                {skeletonBar('h-4 w-20')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:col-span-4 xl:col-span-3">
        <div className={`${cardShellClass} h-44 p-5`} />
        <div className={`${cardShellClass} h-56 p-5`} />
        <div className={`${cardShellClass} h-64 p-5`} />
      </div>
    </div>
  );

  const renderProfileLoader = () => (
    <div className="grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
      <div className={`${cardShellClass} p-5`}>
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-opsh-background-muted" />
          {skeletonBar('mt-4 h-4 w-32')}
          {skeletonBar('mt-2 h-3.5 w-24')}
          {skeletonBar('mt-4 h-3.5 w-full')}
        </div>
        <div className="mt-6 grid gap-3">
          <div className="h-11 rounded-opsh-md bg-opsh-background" />
          <div className="h-11 rounded-opsh-md bg-opsh-background" />
        </div>
      </div>

      <div className={`${cardShellClass} p-5`}>
        {skeletonBar('mb-5 h-5 w-40')}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="space-y-2">
              {skeletonBar('h-3.5 w-20')}
              <div className="h-11 rounded-opsh-md bg-opsh-background" />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {skeletonBar('h-3.5 w-16')}
          <div className="h-28 rounded-opsh-md bg-opsh-background" />
        </div>
      </div>
    </div>
  );

  const renderDashboardLoader = () => (
    <div className="space-y-6">
      <div className={`${cardShellClass} p-5 sm:p-6`}>
        {skeletonBar('h-4 w-28')}
        {skeletonBar('mt-4 h-9 w-2/3')}
        {skeletonBar('mt-3 h-4 w-5/6')}
        <div className="mt-5 flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-8 w-24 rounded-full bg-opsh-background" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`${cardShellClass} p-5`}>
            {skeletonBar('h-3.5 w-24')}
            {skeletonBar('mt-4 h-8 w-16')}
            {skeletonBar('mt-3 h-3.5 w-28')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <div className={`${cardShellClass} p-5`}>
          {skeletonBar('h-4 w-28')}
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-opsh-md bg-opsh-background p-4">
                {skeletonBar('h-3.5 w-20')}
                {skeletonBar('mt-3 h-3.5 w-full')}
                {skeletonBar('mt-2 h-3.5 w-3/4')}
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardShellClass} p-5`}>
          {skeletonBar('h-4 w-24')}
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-opsh-background-muted" />
                <div className="flex-1 space-y-2">
                  {skeletonBar('h-3.5 w-24')}
                  {skeletonBar('h-3.5 w-36')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const loaders: Record<ContentLoaderVariant, () => ReactNode> = {
    card: renderCardLoader,
    list: renderListLoader,
    grid: renderGridLoader,
    details: renderDetailsLoader,
    profile: renderProfileLoader,
    dashboard: renderDashboardLoader,
  };

  const LoaderComponent = loaders[variant];

  return <div className={className}><LoaderComponent /></div>;
};

export default ContentLoader;
