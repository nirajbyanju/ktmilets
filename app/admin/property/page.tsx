// app/(dashboard)/property/page.tsx or components/PropertyList.tsx
"use client";

import { IoSearch, RiUserAddLine, LuEye, LuFilter, RiDeleteBinLine, MdOutlineEdit } from "@/assets/icons/Icons";
import { useState } from "react";
import { toast } from "react-toastify";

import { deleteProperty, getPropertyListPage, updateStatusProperty } from "@/apis/property/property.api";
import { useAdminListPage } from "@/hooks/useAdminListPage";
import { Properties } from "@/types/property/property";
import type { PropertyListFilters } from "@/types/admin/listFilters";
import AdvanceSearch from "./AdvanceSearch";
import PaginationControls from "@/components/PaginationControls";
import StatusToggle from "@/components/StatusToggle";
import EmptyState from "@/components/loader/EmptyState";
import DeleteModal from "@/components/deleteModel/deleteModel";
import AddPropertyComponent from "./AddPropertyComponent";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import SearchingData from "@/components/loader/SearchingData";

const defaultPropertyFilters: PropertyListFilters = {
  title: "",
  isStatus: "",
  limit: "",
  categoryId: "",
  location: "",
  phoneNumber: "",
  publishedDate: "",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Helper function to safely get display value from various data structures
const getDisplayValue = (value: unknown): string => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  if (isRecord(value)) {
    const labelCandidate = value.label ?? value.name ?? value.title;
    if (typeof labelCandidate === "string") {
      return labelCandidate;
    }

    return JSON.stringify(value);
  }
  return String(value);
};

const PropertyList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const [isAdvanceSearchModalOpen, setIsAdvanceSearchModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<"create" | "view" | "update" | null>(null);

  const {
    items: properties,
    filters,
    pagination,
    page,
    setPage,
    updateFilter,
    patchFilters,
    submitSearch,
    refresh,
    isLoading,
    isFetching,
  } = useAdminListPage<Properties, PropertyListFilters>({
    defaultFilters: defaultPropertyFilters,
    queryKeyBase: ["admin-properties"],
    searchKeys: ["title"],
    fetchPage: ({ page: currentPage, filters: currentFilters, signal }) =>
      getPropertyListPage(currentPage, currentFilters, signal),
  });

  const isTableLoading = isLoading || isFetching;

  const onClose = () => {
    setIsDeleteModalOpen(false);
  };

  // Handlers
  const handleDelete = async (id: number) => {
    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully!");
      await refresh();
    } catch {
    } finally {
      setIsDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleStatusChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked ? 1 : 0;
    const formData = new FormData();
    formData.append("isStatus", newStatus.toString());

    try {
      await updateStatusProperty(id, formData);
      toast.success(`Property status updated successfully!`);
      await refresh();
    } catch {
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const handleAdvanceSearch = (newFilters: Partial<PropertyListFilters>) => {
    patchFilters(newFilters, { submitSearch: true });
    setIsAdvanceSearchModalOpen(false);
  };

  // Pagination controls
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleNext = () => {
    if (page < pagination.last_page) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleUpdate = () => {
    void refresh();
  };

  // Handlers for opening modal with different modes
  const handleAddNew = () => {
    setSelectedPropertyId(null);
    setSelectedPropertyType('create');
    setIsAddModalOpen(true);
  };

  const handleView = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setSelectedPropertyType('view');
    setIsAddModalOpen(true);
  };

  const handleEdit = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setSelectedPropertyType('update');
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    // Clear selected IDs after modal closes
    setTimeout(() => {
      setSelectedPropertyId(null);
      setSelectedPropertyType(null);
    }, 300); // Small delay to avoid issues during unmount
  };

  return (
    <div className="px-3 py-1">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
        <h5 className="hidden text-sm text-gray-600 md:block">Working Dashboard</h5>
        <hr className="flex-grow w-full mt-2 border-gray-300 border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
        <h5 className="hidden text-sm md:block">Data Overview</h5>
        <h5 className="hidden text-sm text-opsh-primary md:block">Statistics Dashboard</h5>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
        <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relatiave md:gap-4">
          <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap text-center">
            Properties List
          </div>
          <form
            className="flex items-center w-full col-span-12 mt-2 lg:col-span-9 sm:mt-0"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IoSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search Title..."
                value={filters.title}
                onChange={(event) => updateFilter("title", event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="p-2 ml-2 text-sm font-medium text-white bg-opsh-primary border border-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              <IoSearch className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex flex-wrap justify-between col-span-12 gap-2 lg:col-span-7 md:flex-nowrap lg:justify-end md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap sm:gap-4">
            {/* Status Filter */}
            <form className="flex items-center space-x-2 sm:space-x-4" onSubmit={handleSearchSubmit}>
              <select
                value={filters.isStatus}
                onChange={(event) => updateFilter("isStatus", event.target.value)}
                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover-10 focus:outline-none focus:ring-blue-600"
              >
                <option value="">All</option>
                <option value="1">Active</option>
                <option value="0">Offline</option>
              </select>
            </form>

            {/* Advanced Search Button */}
            <button
              onClick={() => setIsAdvanceSearchModalOpen(true)}
              className="flex items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600 whitespace-nowrap"
            >
              <span className="hidden xl:block">Advance Filters</span>
              <LuFilter className="block xl:hidden" />
            </button>

            {/* Page Size Selector */}
            <select
              value={filters.limit}
              onChange={(event) => updateFilter("limit", event.target.value)}
              className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="30">30 per page</option>
            </select>

            <button
              onClick={handleAddNew}
              className="flex cursor-pointer items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600 whitespace-nowrap"
            >
              <span className="hidden xl:block">Add Property</span>
              <RiUserAddLine className="block xl:hidden" />
            </button>
          </div>
        </div>
      </div>

      {/* Property Table */}
      <div className="gap-2">
        <div className="mt-1">
          <div className="overflow-x-auto rounded-md border border-gray-200 h-[calc(100vh-185px)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-opsh-primary text-white">
                <tr>
                  <th className="py-2 pl-3 text-left font-medium text-sm uppercase tracking-wider">Property Title</th>
                  <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Listing</th>
                  <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Price</th>
                  <th className="py-2 text-center font-medium text-sm uppercase tracking-wider hidden xl:table-cell">Property Code</th>
                  <th className="py-2 text-center font-medium text-sm uppercase tracking-wider">Property Status</th>
                  <th className="py-2 text-center font-medium text-sm uppercase tracking-wider">Status</th>
                  <th className="py-2 text-center font-medium text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {isTableLoading ? (


                  <SearchingData
                    rows={8}
                    columns={8}
                  />


                ) : properties.length > 0 ? (
                  properties.map((property) => (
                    <tr key={property.id} className="hover:bg-opsh-primary/5 transition-colors duration-150 cursor-pointer">
                      {/* Title with image */}
                      <td className="px-3 py-1 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <ProfileAvatar
                              firstName={property?.title || ""}
                              lastName={property?.title || ""}
                              size="sm"
                              className="h-8 w-8"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden mt-1 overflow-hidden max-w-[200px]">
                              {property.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-1 py-1 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900 overflow-hidden max-w-[200px]">
                          {getDisplayValue(property?.property_type)}
                        </div>
                      </td>

                      {/* Listing */}
                      <td className="px-1 py-1 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-sm text-gray-900 overflow-hidden max-w-[200px]">
                          {getDisplayValue(property?.listing_type)}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-1 py-1 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {property?.advertise_price} {property.currency}
                        </div>
                      </td>

                      {/* Property Code */}
                      <td className="px-1 py-1 whitespace-nowrap hidden xl:table-cell text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {property.property_code}
                        </div>
                      </td>

                      {/* Published Date */}
                      <td className="px-1 py-1 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {property.property_status?.label ?? "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-1 py-1 whitespace-nowrap text-center">
                        <StatusToggle
                          checked={property.is_status == 1}
                          onChange={(e) => handleStatusChange(property.id, e)}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-1 py-1 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handleView(property.id)}
                            className="text-gray-500 hover:text-yellow-600 p-1 rounded-full hover:bg-gray-100"
                            title="View"
                          >
                            <LuEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(property.id)}
                            className="text-gray-500 hover:text-green-600 p-1 rounded-full hover:bg-gray-100"
                            title="Edit"
                          >
                            <MdOutlineEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPropertyToDelete(property.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                            title="Delete"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isTableLoading && properties.length > 0 && (
            <PaginationControls
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onPageChange={handlePageChange}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
        </div>
      </div>

      <AdvanceSearch
        isOpen={isAdvanceSearchModalOpen}
        onClose={() => setIsAdvanceSearchModalOpen(false)}
        onSubmit={handleAdvanceSearch}
      />

      <DeleteModal
        profileId={propertyToDelete}
        onDelete={handleDelete}
        onClose={onClose}
        isModalDeleteOpen={isDeleteModalOpen}
      />

      {/* Single AddPropertyComponent instance with key to force remount when needed */}
      <AddPropertyComponent
        key={`property-modal-${selectedPropertyType}-${selectedPropertyId || 'new'}`}
        onSuccess={handleUpdate}
        onClose={handleModalClose}
        onOpen={isAddModalOpen}
        type={selectedPropertyType}
        id={selectedPropertyId}
      />
    </div>
  );
};

export default PropertyList;
