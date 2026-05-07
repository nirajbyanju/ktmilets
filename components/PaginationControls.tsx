import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  lastPage,
  onPageChange,
  onNext,
  onPrev,
}) => {
  const getVisiblePages = () => {
    const pageNumbers = [];
    const delta = 2;
    
    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 || 
        i === lastPage || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center mt-2 space-x-2">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Previous page"
      >
        <IoChevronBack className="w-5 h-5 text-gray-600" />
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-opsh-primary text-white"
              : typeof page === 'number'
                ? "text-gray-700 hover:bg-gray-100"
                : "cursor-default"
          }`}
          disabled={page === "..." || page === currentPage}
        >
          {page}
        </button>
      ))}

      <button
        onClick={onNext}
        disabled={currentPage === lastPage}
        className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        aria-label="Next page"
      >
        <IoChevronForward className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default PaginationControls;