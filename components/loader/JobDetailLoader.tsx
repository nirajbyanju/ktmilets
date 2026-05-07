// components/Loader/JobDetailLoader.tsx
import React from 'react';

const JobDetailLoader: React.FC = () => (
  <div className="auto-container bg-white px-4 sm:px-6">
    <div className="grid lg:grid-cols-12 my-6 gap-3">
      {/* Left Section - Main Content Loader */}
      <div className="lg:col-span-8 xl:col-span-9 relative">
        {/* Job Header Loader */}
        <div className="relative rounded-lg animate-pulse">
          <div className="h-48 sm:h-56 md:h-64 bg-gray-300"></div>
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center p-4 sm:p-6">
            <div className="text-white">
              <div className="h-8 bg-gray-400 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-400 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-400 rounded w-24"></div>
            </div>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg border-2 border-white absolute -bottom-10 left-4 sm:left-6 shadow-lg bg-gray-300"></div>
        </div>
        
        {/* Job Description Loader */}
        <div className="mt-6 sm:mt-10 vacancy-announcement mx-auto p-6 bg-white shadow-lg rounded-lg animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-7 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-28"></div>
              ))}
            </div>
          </div>
          <div className="border-t-[1px] mt-3 border-gray-300"></div>
          <div className="mt-4 space-y-2">
            <div className="h-6 bg-gray-300 rounded w-40"></div>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Sidebar Loader */}
      <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-5">
        {/* Action Card Loader */}
        <div className="p-4 bg-white shadow-lg rounded-xl border border-gray-200 w-full animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="h-12 bg-gray-300 rounded-lg mb-4"></div>
        </div>

        {/* Similar Jobs Loader */}
        <div className="border bg-card text-card-foreground shadow-sm rounded-xl animate-pulse">
          <div className="p-4">
            <div className="h-6 bg-gray-300 rounded w-40"></div>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="p-6 pt-0 mt-3 pb-0 px-4">
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex gap-2 w-full h-20">
                  <div className="w-16 h-14 bg-gray-300 rounded-md"></div>
                  <div className="w-4/5 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Profile Loader */}
        <div className="relative bg-white mt-6 shadow-lg rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex justify-center -mt-12 mb-4">
            <div className="w-20 h-20 rounded-lg bg-gray-300 border-4 border-white shadow-md"></div>
          </div>
          <div className="text-center mt-1 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-32 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-full ml-7"></div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="h-10 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default JobDetailLoader;