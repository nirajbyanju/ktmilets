import React from "react";
import loader from "@/assets/empty.gif"; // ✅ adjust path if needed

interface EmptyStateProps { }

const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Loader Image */}
      <img src={loader} alt="loader" className="w-[210px]" />

      <div className="text-center">
        <div className="text-opacity-80 text-lg font-medium text-opsh-primary">No data!</div>
        <div className="text-opacity-80 text-lg font-medium text-opsh-primary">Looks like there is no data.</div>
      </div>
    </div>
  );
};

export default EmptyState;
