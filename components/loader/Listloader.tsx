// components/Loader/ListLoader.tsx
import  { FC } from 'react';

interface ListLoaderProps {
  count?: number;
  showImage?: boolean;
  showActions?: boolean;
  showMeta?: boolean;
  className?: string;
}

const ListLoader: FC<ListLoaderProps> = ({
  count = 3,
  showImage = true,
  showActions = true,
  showMeta = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="flex items-start gap-4">
            {showImage && (
              <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
            )}
            <div className="flex-1">
              <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              
              {showMeta && (
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              )}
              
              {showActions && (
                <div className="flex gap-2 mt-4">
                  <div className="h-8 bg-gray-300 rounded w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-24"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListLoader;