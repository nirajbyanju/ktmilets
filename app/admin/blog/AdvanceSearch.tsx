import { IoSearch } from "react-icons/io5";
import { useForm } from "react-hook-form"

import { useEffect } from "react";
import type { BlogListFilters } from "@/types/admin/listFilters";

type BlogAdvanceSearchValues = Pick<BlogListFilters, "searchTerm" | "createdAt">;

interface AdvanceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BlogListFilters>) => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: {  } 
  } = useForm<BlogAdvanceSearchValues>();

  const handleSearch = (data: BlogAdvanceSearchValues) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-6 rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-medium text-opsh-primary">
            Advance Filters
          </h4>
          <button
            onClick={handleClose}
            className="bg-opsh-danger font-medium text-white text-sm py-1 px-3 rounded-md border-2 border-white hover:bg-white hover:text-opsh-danger hover:border-opsh-danger transition-colors"
            aria-label="Close advanced search"
          >
            Close (x)
          </button>
        </div>

        <form onSubmit={handleSubmit(handleSearch)}>
          <div className="grid gap-4 mt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="col-span-1 md:col-span-1">
                <label htmlFor="searchTerm" className="block text-sm mb-1 font-medium">
                 Title
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  className="w-full border-opsh-grey rounded px-3 py-2 border text-sm"
                  {...register("searchTerm")}
                />
              </div>

              <div>
                <label htmlFor="createdAt" className="block text-sm mb-1 font-medium">
                  created At
                </label>
                <input
                  type="date"
                  id="createdAt"
                  className="w-full border-opsh-grey rounded px-3 py-2 border text-sm"
                  {...register("createdAt")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-opsh-success text-white py-2 px-6 rounded-md hover:bg-opsh-primary flex items-center gap-2 transition-colors"
                aria-label="Search with filters"
              >
                <IoSearch />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceSearch;
