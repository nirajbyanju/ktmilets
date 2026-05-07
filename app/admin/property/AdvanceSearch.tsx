import { IoSearch } from "@/assets/icons/Icons";
import { useForm } from "react-hook-form";
import React from "react";
import {
  InputField,
} from '@/components/inputField/InputField';
import DatePicker from "@/components/inputField/Datepicker";
import type { PropertyListFilters } from "@/types/admin/listFilters";

interface AdvanceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PropertyListFilters>) => void;
}

type PropertyAdvanceSearchValues = Pick<
  PropertyListFilters,
  "title" | "location" | "phoneNumber" | "publishedDate"
>;

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ isOpen, onClose, onSubmit }) => {
  const { handleSubmit, setValue, formState: { errors } } = useForm<PropertyAdvanceSearchValues>();

  const [formData, setFormData] = React.useState({
    title: "",
    location: "",
    phoneNumber: "",
    publishedDate: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValue(name as keyof PropertyAdvanceSearchValues, value);
  };

  const handleSearch = (data: PropertyAdvanceSearchValues) => {
    onSubmit(data);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-6 rounded-lg max-h-[90vh] overflow-y-auto overflow-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xl font-medium text-opsh-secondary">
            Advance Filters
          </h4>
          <button
            onClick={onClose}
            className="bg-opsh-danger font-medium text-white text-sm py-1 px-3 rounded-md border-2 border-white hover:bg-white hover:text-opsh-danger hover:border-opsh-danger"
          >
            Close (x)
          </button>
        </div>

        <form onSubmit={handleSubmit(handleSearch)}>
          <div className="grid gap-y-2 mt-2">
            <div className="grid grid-cols-1 gap-y-2 gap-x-3 sm:grid-cols-1 md:grid-cols-3">
              <InputField
                label="Vacancy Title"
                name="title"
                value={formData.title}
                required
                onChange={handleChange}
                placeholder="Enter Title"
                error={errors.title?.message as string | undefined}
                data={formData.title}
              />

              

              <InputField
                label="Location"
                name="location"
                value={formData.location}
                required
                onChange={handleChange}
                placeholder="Enter Location"
                error={errors.location?.message as string | undefined}
                data={formData.location}
              />

              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter Phone Number"
                error={errors.phoneNumber?.message as string | undefined}
                data={formData.phoneNumber}
              />

              <DatePicker
                name="publishedDate"
                label="Publish Date"
                selectedDate={formData.publishedDate}
                onChange={(date: Date | string | null) => {
                  const dateString = date instanceof Date ? date.toISOString() : date || "";
                  setFormData(prev => ({ ...prev, publishedDate: dateString }));
                  setValue("publishedDate", dateString);
                }}
                placeholderText="Select date"
                className="w-full"
                helpText="When to published"
                error={errors.publishedDate?.message as string | undefined}
              />
            </div>

            <div className="flex justify-end mb-2">
              <button
                type="submit"
                className="bg-opsh-success text-white py-1 px-6 mt-1 rounded-md border-2 border-white hover:bg-opsh-primary flex items-center gap-1"
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
