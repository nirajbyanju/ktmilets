import React from "react";
import loader from "@/assets/empty.gif"; // ✅ adjust path if needed
import NextImage from 'next/image'


const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Loader Image */}
      <NextImage src={loader} alt="No data" width={150} height={150} className="mb-4" />


      <div className="text-center">
        <div className="text-opacity-80 text-lg font-medium text-opsh-primary">No data!</div>
        <div className="text-opacity-80 text-lg font-medium text-opsh-primary">Looks like there is no data.</div>
      </div>
    </div>
  );
};

export default EmptyState;
