import React from "react";
import loader from "@/assets/empty.gif";

interface SearchingDataProps {}

const SearchingData: React.FC<SearchingDataProps> = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center py-8"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      {/* Loader Image centered */}
      <img
        src={loader}
        alt="Loading..."
        className="w-52 "
      />

      {/* Text content */}
      <div className="text-center space-y-1">
        <p className="text-lg font-medium text-opsh-primary text-opacity-80">
          Loading data...
        </p>
        <p className="text-lg font-medium text-opsh-primary text-opacity-80">
          Looks like there is no data.
        </p>
      </div>
    </section>
  );
};

export default SearchingData;
