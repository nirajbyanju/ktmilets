
const BlogDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 animate-pulse">
      <div className="auto-container bg-white px-4 sm:px-6 lg:px-8 py-8 rounded-3xl shadow-xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-8">
          <div className="flex space-x-2">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-3">
            {/* Featured Image Skeleton */}
            <div className="mb-8 rounded-2xl overflow-hidden">
              <div className="w-full h-96 bg-gray-200 rounded-2xl"></div>
            </div>

            {/* Article Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg ml-auto"></div>
              </div>

              {/* Blog Stats Skeleton */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Info Skeleton */}
            <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Article Content Skeleton */}
            <div className="mb-8 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  {i % 3 === 0 && (
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  )}
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>

            {/* Tags Section Skeleton */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Table of Contents Skeleton */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts Skeleton */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Skeleton */}
            <div className="bg-gray-200 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <div className="h-5 w-40 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-3 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-300 rounded-lg"></div>
                <div className="h-12 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailSkeleton;