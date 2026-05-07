"use client";

import {
    IoSearch,
    RiUserAddLine,
    LuEye,
    RiDeleteBinLine,
    MdOutlineEdit,
} from "@/assets/icons/Icons";
import { useState } from "react";
import { toast } from "react-toastify";

import { deleteInFieldVisit, getGlobalFieldVisitListPage } from "@/apis/fieldvisit.api";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/loader/EmptyState";
import DeleteModal from "@/components/deleteModel/deleteModel";
import AddFieldVisitComponent from "@/components/AddInqueryComponent";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import SearchingData from "@/components/loader/SearchingData";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useAdminListPage } from "@/hooks/useAdminListPage";
import type { FieldVisitListFilters } from "@/types/admin/listFilters";
import type { FieldVisit } from "@/types/fieldVisit";

const defaultFieldVisitFilters: FieldVisitListFilters = {
    search: "",
    status: "",
    date_from: "",
    date_to: "",
    limit: "10",
};

// Status badge component
const StatusBadge = ({ status }: { status?: string }) => {
    const getStatusColor = () => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status || "pending"}
        </span>
    );
};

const FieldVisitList: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [visitToDelete, setVisitToDelete] = useState<FieldVisit | null>(null);

    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
    const [selectedVisitType, setSelectedVisitType] = useState<"create" | "view" | "update" | null>(null);

    const {
        items: visits,
        filters,
        pagination,
        page,
        setPage,
        updateFilter,
        submitSearch,
        refresh,
        isLoading,
        isFetching,
    } = useAdminListPage<FieldVisit, FieldVisitListFilters>({
        defaultFilters: defaultFieldVisitFilters,
        queryKeyBase: ["admin-field-visits"],
        searchKeys: ["search"],
        fetchPage: ({ page: currentPage, filters: currentFilters, signal }) =>
            getGlobalFieldVisitListPage(currentPage, currentFilters, signal),
    });

    const isTableLoading = isLoading || isFetching;

    const handleDelete = async () => {
        if (!visitToDelete?.id || !visitToDelete.property_id) {
            toast.error("Property context is required to delete this field visit.");
            return;
        }

        try {
            await deleteInFieldVisit(visitToDelete.property_id, visitToDelete.id);
            toast.success("Field visit deleted successfully!");
            await refresh();
        } catch {
        } finally {
            setIsDeleteModalOpen(false);
            setVisitToDelete(null);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitSearch();
    };

    const handlePageChange = (nextPage: number) => setPage(nextPage);
    const handleNext = () => page < pagination.last_page && handlePageChange(page + 1);
    const handlePrev = () => page > 1 && handlePageChange(page - 1);

    const handleAddNew = () => {
        setSelectedVisitId(null);
        setSelectedVisitType("create");
        setIsAddModalOpen(true);
    };

    const handleView = (visitId: number) => {
        setSelectedVisitId(visitId);
        setSelectedVisitType("view");
        setIsAddModalOpen(true);
    };

    const handleEdit = (visitId: number) => {
        setSelectedVisitId(visitId);
        setSelectedVisitType("update");
        setIsAddModalOpen(true);
    };

    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedVisitId(null);
            setSelectedVisitType(null);
        }, 300);
    };

    const formatDate = (dateString: string) =>
        dateString
            ? new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "N/A";

    const formatTime = (timeString: string) => {
        if (!timeString) return "N/A";
        try {
            return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return timeString;
        }
    };

    return (
        <div className="px-3 py-1">
            <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
                <h5 className="hidden text-sm text-gray-600 md:block">Field Visits Dashboard</h5>
                <hr className="flex-grow w-full mt-2 border-gray-300 border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
                <h5 className="hidden text-sm md:block">Manage Field Visits</h5>
            </div>

            {/* Search & Filter */}
            <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
                <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relatiave md:gap-4">
                    <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap text-center">
                        Field Visits
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
                                placeholder="Search by name, email, phone..."
                                value={filters.search}
                                onChange={(event) => updateFilter("search", event.target.value)}
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
                        <select
                            value={filters.status}
                            onChange={(event) => updateFilter("status", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover-10 focus:outline-none"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Date Range Filters */}
                        <input
                            type="date"
                            placeholder="From Date"
                            value={filters.date_from}
                            onChange={(event) => updateFilter("date_from", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary focus:outline-none"
                        />
                        <input
                            type="date"
                            placeholder="To Date"
                            value={filters.date_to}
                            onChange={(event) => updateFilter("date_to", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary focus:outline-none"
                        />

                        {/* Page Size */}
                        <select
                            value={filters.limit}
                            onChange={(event) => updateFilter("limit", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover/10 focus:outline-none"
                        >
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="50">50 per page</option>
                        </select>

                        <button
                            onClick={handleAddNew}
                            className="flex cursor-pointer items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90"
                        >
                            <span className="hidden xl:block">Add Field Visit</span>
                            <RiUserAddLine className="block xl:hidden" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded border h-[calc(100vh-250px)]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-opsh-primary text-white">
                        <tr>
                            <th className="px-3 py-2 text-left">Name/Contact</th>
                            <th className="px-3 py-2 text-left hidden md:table-cell">Date & Time</th>
                            <th className="px-3 py-2 text-left hidden lg:table-cell">Message</th>
                            <th className="px-3 py-2 text-left hidden xl:table-cell">Property</th>
                            <th className="px-3 py-2 text-center">Status</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isTableLoading ? (

                            <SearchingData
                                rows={8}
                                columns={5}
                            />

                        ) : visits.length > 0 ? (
                            visits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-opsh-primary/5">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <ProfileAvatar firstName={visit.name || ""} lastName="" size="sm" className="h-8 w-8" />
                                            <div>
                                                <div className="text-sm font-medium">{visit.name}</div>
                                                <div className="text-xs text-gray-500">{visit.email}</div>
                                                <div className="text-xs text-gray-500 md:hidden">{visit.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 hidden md:table-cell">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-xs">
                                                <FaCalendarAlt className="w-3 h-3 text-gray-500" />
                                                <span>{formatDate(visit.date ?? "")}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <FaClock className="w-3 h-3 text-gray-500" />
                                                <span>{formatTime(visit.time ?? "")}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 hidden lg:table-cell">
                                        <div className="max-w-xs truncate" title={visit.message}>
                                            {visit.message || "-"}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 hidden xl:table-cell">
                                        {visit.property_id || "-"}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <StatusBadge status={visit.status} />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleView(visit.id)}
                                                className="p-1 hover:text-yellow-600 transition-colors"
                                                title="View"
                                            >
                                                <LuEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(visit.id)}
                                                className="p-1 hover:text-green-600 transition-colors"
                                                title="Edit"
                                            >
                                                <MdOutlineEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setVisitToDelete(visit);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-1 hover:text-red-600 transition-colors"
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
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <EmptyState />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {visits.length > 0 && !isTableLoading && (
                <PaginationControls
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    onPageChange={handlePageChange}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}

            {/* Delete Modal */}
            <DeleteModal
                profileId={visitToDelete?.id ?? null}
                onDelete={() => void handleDelete()}
                onClose={() => setIsDeleteModalOpen(false)}
                isModalDeleteOpen={isDeleteModalOpen}
            />

            {/* Add/Edit/View Modal */}
            <AddFieldVisitComponent
                key={`field-visit-modal-${selectedVisitType}-${selectedVisitId || "new"}`}
                onSuccess={() => void refresh()}
                onClose={handleModalClose}
                onOpen={isAddModalOpen}
                type={selectedVisitType}
                id={selectedVisitId}
                from="admin"
            />
        </div>
    );
};

export default FieldVisitList;
