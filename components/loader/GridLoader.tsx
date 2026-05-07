import { FC } from 'react';

interface GridLoaderProps {
  count?: number;
  columns?: number;
  showImage?: boolean;
  showCompanyName?: boolean;
  showCategory?: boolean;
  showDeadline?: boolean;
  showLocation?: boolean;
  showFooter?: boolean;
  className?: string;
}

const GridLoader: FC<GridLoaderProps> = ({
  count = 6,
  columns = 3,
  showImage = true,
  showCompanyName = true,
  showCategory = true,
  showDeadline = true,
  showLocation = true,
  showFooter = true,
  className = '',
}) => {
  const widthClass =
    columns === 0 || columns === 1
      ? 'w-full'
      : columns === 2
      ? 'w-full md:w-1/2'
      : columns === 3
      ? 'w-full lg:w-1/3'
      : 'w-full lg:w-1/3 xl:w-1/4';

  const content = (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${widthClass} mb-4 p-2`}>
          <div className="shadow-sm rounded-lg overflow-hidden bg-white animate-pulse border border-gray-100">
            {/* Card Header */}
            <div className="flex justify-center p-4 relative">
              <div className="flex gap-4 items-center rounded-lg p-3 w-4/5 bg-gray-50 relative">
                {showImage && (
                  <div
                    className="absolute rounded-full border-2 border-gray-100 bg-gray-100"
                    style={{ width: 70, height: 70, left: '-11%' }}
                  />
                )}
                <div className="pl-7">
                  <div className="h-6 bg-gray-100 rounded w-40" />
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-6 py-4">
              {showCategory && (
                <div className="mb-3">
                  <div className="h-3.5 bg-gray-100 rounded w-16" />
                </div>
              )}

              {showCompanyName && (
                <div className="mb-4">
                  <div className="h-5 bg-gray-100 rounded w-48" />
                </div>
              )}

              {showDeadline && (
                <div className="flex justify-between mb-4">
                  <div className="h-3.5 bg-gray-50 rounded w-20" />
                  <div className="h-3.5 bg-gray-50 rounded w-16" />
                </div>
              )}

              {showLocation && (
                <div className="h-3.5 bg-gray-100 rounded w-32" />
              )}
            </div>

            {/* Footer */}
            {showFooter && (
              <div className="flex justify-between p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="h-3.5 bg-gray-100 rounded w-12" />
                  <div className="h-3.5 bg-gray-50 rounded w-20" />
                </div>
                <div className="h-8 bg-gray-100 rounded-lg w-20" />
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );

  // ✅ Wrap only if className exists
  return className ? (
    <div className={`flex flex-wrap ${className}`}>
      {content}
    </div>
  ) : (
    content
  );
};

export default GridLoader;
