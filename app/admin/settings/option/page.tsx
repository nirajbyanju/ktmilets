'use client';

import { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { RiUserAddLine, RiDeleteBinLine } from 'react-icons/ri';
import { LuEye } from 'react-icons/lu';
import { MdOutlineEdit } from 'react-icons/md';
import { formatDate } from "@/helper/formateDate/formatDate";
import { HiOutlineCog } from 'react-icons/hi';
import { useForm } from "react-hook-form";
import StatusToggle from "@/components/StatusToggle";
import EmptyState from "@/components/loader/EmptyState";
import SearchingData from "@/components/loader/SearchingData";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import PaginationControls from "@/components/PaginationControls";
import { toast } from "react-toastify";
import useOptionsManagerStore from "@/stores/setting/optioonsManager/optionsManager";
import { OptionsManagers } from "@/types/setting/optionsManager/OptionsManager";
import { useCallback } from "react";
import AddOptionsManage from "./AddOptionsManage";
import { BsChevronRight, BsChevronDown } from 'react-icons/bs';
import type { QueryParamsRecord } from "@/apis/queryParams";

const OptionsManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [optionsManagers, setOptionsManagers] = useState<OptionsManagers[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [optionsMenu, setOptionsMenu] = useState<OptionsManagers[]>([]);
  const [selectedOptionType, setSelectedOptionType] = useState<'view' | 'update' | 'create'>('create');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const {
    getAllOptionsManagers,
    updateStatusOptionsManager,
    deleteOptionsManager,
    getOptionsMenu,
    current_page,
    last_page
  } = useOptionsManagerStore();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      title: "",
      isStatus: "",
      limit: "",
      categoryId: "",
    },
  });

  const isStatus = watch("isStatus");
  const limit = watch("limit");

  useEffect(() => {
    if (!activeTab) return;

    const filters = {
      isStatus,
      limit
    };

    fetchOptionsManagers(1, filters);
  }, [isStatus, limit, activeTab]);

  const fetchOptionsManagers = async (id: number, filters: QueryParamsRecord = {}) => {
    const updatedFilters = {
      ...filters,
      dropdownfor: activeTab
    };

    setIsLoading(true);
    try {
      const response = await getAllOptionsManagers(id, updatedFilters);
      setOptionsManagers(response?.data || []);
      // Reset expanded rows when data changes
      setExpandedRows(new Set());
    } catch (error) {
      console.error("Failed to fetch options managers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOptionsMenu = async () => {
    try {
      const menu = await getOptionsMenu();
      setOptionsMenu(menu);

      // Set the first option as active tab once menu is loaded
      if (menu.length > 0 && !activeTab) {
        setActiveTab(menu[0].name);
      }
    } catch (error) {
      console.error("Failed to fetch options menu:", error);
    }
  };

  const fetchOptionsManagersMemoized = useCallback(fetchOptionsManagers, [activeTab]);

  // Fetch menu only once on component mount
  useEffect(() => {
    fetchOptionsMenu();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchOptionsManagersMemoized(1);
    }
  }, [fetchOptionsManagersMemoized, activeTab]);

  const fetchData = useCallback((dropdownfor: string) => {
    setActiveTab(dropdownfor);
  }, []);

  const handleStatusChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked ? 1 : 0;
    const formData = new FormData();
    formData.append("isStatus", newStatus.toString());
    formData.append("dropdownfor", activeTab);
    try {
      await updateStatusOptionsManager(id, formData);
      toast.success(`Option status updated successfully!`);

      // Update status in the optionsManagers array, including children
      setOptionsManagers(prev => {
        const updateItemAndChildren = (items: OptionsManagers[]): OptionsManagers[] => {
          return items.map(item => {
            const updatedItem = { ...item };
            if (updatedItem.id === id) {
              updatedItem.isStatus = newStatus;
            }
            // Update children if they exist
            if (updatedItem.children) {
              updatedItem.children = updateItemAndChildren(updatedItem.children);
            }
            return updatedItem;
          });
        };

        return updateItemAndChildren(prev);
      });
    } catch (error) {
      toast.error("Failed to update option status!");
    }
  };

  const handleDeleteOption = async () => {
    if (!selectedOptionId) return;

    try {
      await deleteOptionsManager(selectedOptionId, activeTab);
      
      // Remove the item and its children from the state
      setOptionsManagers(prev => {
        const removeItemAndChildren = (items: OptionsManagers[]): OptionsManagers[] => {
          return items.filter(item => {
            if (item.id === selectedOptionId) {
              return false;
            }
            // If this item has children, filter them too
            if (item.children) {
              item.children = removeItemAndChildren(item.children);
            }
            return true;
          });
        };

        return removeItemAndChildren(prev);
      });
      
      setIsDeleteModalOpen(false);
      setSelectedOptionId(null);
      toast.success("Option deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete option!");
      console.error("Failed to delete option:", error);
    }
  };

  const handleSearchSubmit = (data: QueryParamsRecord) => {
    fetchOptionsManagers(1, data);
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Recursive function to render rows with children
  const renderOptionsRows = (items: OptionsManagers[], level = 0): React.JSX.Element[] => {
    return items.flatMap((option): (React.JSX.Element | React.JSX.Element[]) => {
      const hasChildren = option.children && option.children.length > 0;
      const isExpanded = expandedRows.has(option.id);
      
      const row = (
        <tr key={option.id} className="hover:bg-opsh-primary/5 transition-colors duration-150">
          {/* Label with image and indentation */}
          <td className="px-3 py-1 whitespace-nowrap">
            <div className="flex items-center space-x-4">
              <div 
                style={{ paddingLeft: `${level * 24}px` }}
                className="flex items-center"
              >
                {hasChildren && (
                  <button
                    onClick={() => toggleRowExpansion(option.id)}
                    className="mr-2 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <BsChevronDown className="w-4 h-4" />
                    ) : (
                      <BsChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                {!hasChildren && level > 0 && (
                  <div className="mr-6" /> // Empty space for alignment
                )}
                <div className="flex-shrink-0">
                  {option.photo ? (
                    <img
                      className="h-8 w-8 rounded-full border border-opsh-primary/30 object-cover"
                      src={option.photo}
                      alt="Logo"
                    />
                  ) : (
                    <ProfileAvatar
                      firstName={option.label || ""}
                      lastName={option.slug || ""}
                      size="sm"
                      className="h-8 w-8"
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                  {level > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Child of {findParentLabel(option.parentId, optionsManagers)})
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 md:hidden mt-1 overflow-hidden max-w-[200px]">
                  {option.slug}
                </div>
              </div>
            </div>
          </td>

          {/* Slug (hidden on mobile) */}
          <td className="px-1 py-1 whitespace-nowrap hidden md:table-cell">
            <div className="text-sm text-gray-900 overflow-hidden max-w-[200px]">
              {option.slug}
            </div>
          </td>

          {/* Created by (hidden on mobile) */}
          <td className="px-1 py-1 whitespace-nowrap hidden sm:table-cell">
            <div className="text-sm text-gray-900">
              {option?.creator?.first_name + " " + option?.creator?.last_name}
            </div>
          </td>

          {/* Created at (hidden on mobile) */}
          <td className="px-1 py-1 whitespace-nowrap hidden sm:table-cell">
            <div className="text-sm text-gray-900">
              {formatDate(option.updatedAt ?? option.createdAt)}
            </div>
          </td>

          {/* Status */}
          <td className="px-1 py-1 whitespace-nowrap text-center">
            <StatusToggle
              checked={option.isStatus === 1}
              onChange={(e) => handleStatusChange(option.id, e)}
            />
          </td>

          {/* Actions */}
          <td className="px-1 py-1 whitespace-nowrap text-center">
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => {
                  setSelectedOptionId(option.id);
                  setSelectedOptionType('view');
                  setIsAddModalOpen(true);
                }}
                className="text-gray-500 hover:text-opsh-warning p-1 rounded-full hover:bg-gray-100"
                title="View"
              >
                <LuEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedOptionId(option.id);
                  setSelectedOptionType('update');
                  setIsAddModalOpen(true);
                }}
                className="text-gray-500 hover:text-opsh-success p-1 rounded-full hover:bg-gray-100"
                title="Edit"
              >
                <MdOutlineEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedOptionId(option.id);
                  setIsDeleteModalOpen(true);
                }}
                className="text-gray-500 hover:text-opsh-danger p-1 rounded-full hover:bg-gray-100"
                title="Delete"
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );

      // Render children if expanded
      const childrenRows = isExpanded && hasChildren 
        ? renderOptionsRows(option.children || [], level + 1)
        : [];

      return [row, ...childrenRows];
    });
  };

  // Helper function to find parent label
  const findParentLabel = (parentId: number | null, items: OptionsManagers[]): string => {
    if (!parentId) return 'Root';
    
    const findInItems = (items: OptionsManagers[]): string | null => {
      for (const item of items) {
        if (item.id === parentId) {
          return item.label;
        }
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(items) || 'Unknown';
  };

  // Filter top-level items (items without parent or with parentId = null)
  const topLevelItems = optionsManagers.filter(item => !item.parentId);

  const paginationProps = {
    currentPage: current_page,
    lastPage: last_page,
    onPageChange: (page: number) => handleSubmit((data) => fetchOptionsManagers(page, data))(),
    onNext: () => current_page < last_page && handleSubmit((data) => fetchOptionsManagers(current_page + 1, data))(),
    onPrev: () => current_page > 1 && handleSubmit((data) => fetchOptionsManagers(current_page - 1, data))(),
  };

  const handleupdate = () => {
    fetchOptionsManagers(current_page);
  };

  // Determine if we're in Category mode
  const isCategoryMode = activeTab === 'Category';

  return (
    <div className="px-3 py-1">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
        <h5 className="hidden text-sm text-opsh-secondary md:block">Working Dashboard</h5>
        <hr className="flex-grow w-full mt-2 border-gray-300 border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
        <h5 className="hidden text-sm md:block">Data Overview</h5>
        <h5 className="hidden text-sm text-opsh-grey md:block">Statistics Dashboard</h5>
      </div>

      <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
        <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relatiave md:gap-4">
          <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap">
            Option Manager {isCategoryMode && '(Hierarchical View)'}
          </div>
          <form
            className="flex items-center w-full col-span-12 mt-2 lg:col-span-9 sm:mt-0"
            onSubmit={handleSubmit(handleSearchSubmit)}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IoSearch className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search label..."
                {...register("title")}
              />
            </div>
            <button
              type="submit"
              className="p-2 ml-2 text-sm font-medium text-white bg-blue-700 border border-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              <IoSearch className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex flex-wrap justify-between col-span-12 gap-2 lg:col-span-7 md:flex-nowrap lg:justify-end md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap sm:gap-4">
            {/* Status Filter */}
            <form className="flex items-center space-x-2 sm:space-x-4" onSubmit={handleSubmit(handleSearchSubmit)}>
              <select
                {...register("isStatus")}
                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-light-blue focus:outline-none focus:ring-opsh-primary"
              >
                <option value="">All</option>
                <option value="1">Active</option>
                <option value="0">Offline</option>
              </select>
            </form>

            {/* Page Size Selector */}
            <select
              {...register("limit")}
              className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-light-blue focus:outline-none focus:ring-2 focus:ring-opsh-primary"
            >
              <option value="">Page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="30">30 per page</option>
            </select>

            {/* Add Option Button */}
            <button
              className="flex cursor-pointer items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-opsh-primary whitespace-nowrap"
              onClick={() => {
                setSelectedOptionType('create');
                setIsAddModalOpen(true);
              }}
            >
              <RiUserAddLine className="mr-2" />
              Add New Option
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto py-2">
        {/* Sidebar and Content */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className='max-h-[calc(100vh-170px)] overflow-y-auto'>
              {optionsMenu.map((option) => (
                <button
                  key={option.id}
                  onClick={() => fetchData(option.name)}
                  className={`w-full flex items-center px-3 py-3 rounded-md ${activeTab === option.name ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <HiOutlineCog className="mr-3" />
                  {option.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Panel */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="overflow-x-auto rounded-md border border-gray-200 max-h-[calc(100vh-170px)] min-h-[calc(100vh-170px)] flex flex-col justify-between">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-opsh-primary text-white">
                    <tr>
                      <th className="py-2 pl-3 text-left font-medium text-sm uppercase tracking-wider">Label</th>
                      <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Slug</th>
                      <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Created by</th>
                      <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell">Created at</th>
                      <th className="py-2 text-center font-medium text-sm uppercase tracking-wider">Status</th>
                      <th className="py-2 text-center font-medium text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <SearchingData rows={8} columns={6} />
                    ) : topLevelItems.length > 0 ? (
                      renderOptionsRows(topLevelItems)
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <EmptyState />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                {!isLoading && topLevelItems.length > 0 && (
                  <PaginationControls {...paginationProps} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <AddOptionsManage
          key={selectedOptionId || 'create'}
          onSuccess={() => handleupdate()}
          onClose={() => setIsAddModalOpen(false)}
          onOpen={isAddModalOpen}
          type={selectedOptionType}
          model={activeTab}
          id={selectedOptionId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this option? 
              {isCategoryMode && " This will also delete all child categories."} 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOption}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsManager;
