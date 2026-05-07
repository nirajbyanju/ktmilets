"use client";

import {
    IoSearch,
    RiUserAddLine,
    LuEye,
    RiDeleteBinLine,
    MdOutlineEdit,
} from "@/assets/icons/Icons";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import PopupModal from "@/components/modal/PopupModal";
import useInquestFollowupStore from "@/stores/InqueryFollowupStore";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/loader/EmptyState";
import DeleteModal from "@/components/deleteModel/deleteModel";
import AddinqueryFollowupModal from "./AddinqueryFollowupModal";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import SearchingData from "@/components/loader/SearchingData";
import { useSearchParams } from "next/navigation";
import type { InquiryFollowup } from "@/types/inqueryFollow";

// Types
interface FollowupFilters {
    search: string;
    followup_status: string;
    contact_method: string;
    limit: string;
}

type Followup = InquiryFollowup;

// Status badge component
const FollowupStatusBadge = ({ status }: { status?: string }) => {
    const getStatusColor = useCallback((currentStatus?: string) => {
        switch (currentStatus?.toLowerCase()) {
            case "interested":
                return "bg-green-100 text-green-800";
            case "not_interested":
                return "bg-red-100 text-red-800";
            case "call_later":
                return "bg-yellow-100 text-yellow-800";
            case "visit_scheduled":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }, []);

    const formatStatus = useCallback((currentStatus?: string) => {
        return currentStatus?.replace(/_/g, ' ') || 'pending';
    }, []);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {formatStatus(status)}
        </span>
    );
};

// Contact method badge
const ContactMethodBadge = ({ method }: { method?: string }) => {
    const getMethodColor = useCallback((currentMethod?: string) => {
        switch (currentMethod?.toLowerCase()) {
            case "phone":
                return "bg-purple-100 text-purple-800";
            case "email":
                return "bg-blue-100 text-blue-800";
            case "whatsapp":
                return "bg-green-100 text-green-800";
            case "website":
                return "bg-indigo-100 text-indigo-800";
            case "office_visit":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }, []);

    const formatMethod = useCallback((currentMethod?: string) => {
        return currentMethod?.replace(/_/g, ' ') || 'N/A';
    }, []);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(method)}`}>
            {formatMethod(method)}
        </span>
    );
};

interface ListinquerytFollowupModalProps {
    isOpen: boolean;
    onClose: () => void;
    inquiryId?: number | null;
    inquiryName?: string;
}

const ListinquerytFollowupModal: React.FC<ListinquerytFollowupModalProps> = ({
    isOpen,
    onClose,
    inquiryId,
    inquiryName
}) => {
    const searchParams = useSearchParams();

    const {
        InquestFollowups: followups,
        getAllInquestFollow: fetchFollowupsFromStore,
        deleteInquestFollow: deleteFollowup,
        current_page,
        last_page,
        isLoading,
    } = useInquestFollowupStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [followupToDelete, setFollowupToDelete] = useState<number | null>(null);
    const [selectedFollowupId, setSelectedFollowupId] = useState<number | null>(null);
    const [selectedFollowupType, setSelectedFollowupType] = useState<"create" | "view" | "update" | null>(null);

    const hasInitializedFilters = useRef(false);
    const statusFirstRun = useRef(true);
    const pageSizeFirstRun = useRef(true);

    const { register, handleSubmit, watch, reset } = useForm<FollowupFilters>({
        defaultValues: {
            search: searchParams.get("search") || "",
            followup_status: searchParams.get("followup_status") || "",
            contact_method: searchParams.get("contact_method") || "",
            limit: searchParams.get("limit") || "10",
        },
    });

    const searchValue = watch("search");
    const selectedFollowupStatus = watch("followup_status");
    const selectedContactMethod = watch("contact_method");
    const selectedLimit = watch("limit");

    const getUrlFilters = useCallback(() => {
        const params = new URLSearchParams(window.location.search);

        return {
            search: params.get("search") || "",
            followup_status: params.get("followup_status") || "",
            contact_method: params.get("contact_method") || "",
            limit: params.get("limit") || "10",
        };
    }, []);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            hasInitializedFilters.current = false;
            statusFirstRun.current = true;
            pageSizeFirstRun.current = true;
            reset();
        }
    }, [isOpen, reset]);

    // Update URL params
    const updateUrlParams = useCallback(
        (page: number, filters: FollowupFilters) => {
            const params = new URLSearchParams();
            if (page > 1) params.set("page", page.toString());
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });
            
            const queryString = params.toString();
            const currentUrl = `${window.location.pathname}${window.location.search}`;
            const newUrl = queryString
                ? `${window.location.pathname}?${queryString}`
                : window.location.pathname;
            if (currentUrl !== newUrl) {
                window.history.replaceState(window.history.state, "", newUrl);
            }
        },
        []
    );

    const fetchFollowups = useCallback(async (page: number = 1, filters?: Partial<FollowupFilters>) => {
        if (!isOpen || !inquiryId) {
            if (!inquiryId) {
                toast.error("Inquiry ID is required");
                return;
            }
            return;
        }
        
        try {
            const urlFilters = getUrlFilters();
            const currentFilters = {
                search: filters?.search ?? urlFilters.search,
                followup_status: filters?.followup_status ?? urlFilters.followup_status,
                contact_method: filters?.contact_method ?? urlFilters.contact_method,
                limit: filters?.limit ?? urlFilters.limit,
            };

            await fetchFollowupsFromStore(inquiryId, page, currentFilters);
            if (filters) {
                updateUrlParams(page, currentFilters as FollowupFilters);
            }
        } catch {
            toast.error("Failed to fetch followups");
        }
    }, [fetchFollowupsFromStore, getUrlFilters, updateUrlParams, isOpen, inquiryId]);

    // Initial load
    useEffect(() => {
        if (isOpen && inquiryId) {
            const params = new URLSearchParams(window.location.search);
            const page = parseInt(params.get("page") || "1");
            const filters = getUrlFilters();
            void fetchFollowups(page, filters).finally(() => {
                hasInitializedFilters.current = true;
            });
        }
    }, [isOpen, fetchFollowups, getUrlFilters, inquiryId]);

    // Debounced search
    useEffect(() => {
        if (!hasInitializedFilters.current || !isOpen || !inquiryId) return;
        const timeout = setTimeout(() => {
            handleSubmit((data) => fetchFollowups(1, data))();
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchValue, handleSubmit, fetchFollowups, isOpen, inquiryId]);

    // Filter changes
    useEffect(() => {
        if (statusFirstRun.current || !isOpen || !inquiryId) {
            statusFirstRun.current = false;
            return;
        }
        handleSubmit((data) => fetchFollowups(1, data))();
    }, [selectedFollowupStatus, selectedContactMethod, handleSubmit, fetchFollowups, isOpen, inquiryId]);

    useEffect(() => {
        if (pageSizeFirstRun.current || !isOpen || !inquiryId) {
            pageSizeFirstRun.current = false;
            return;
        }
        handleSubmit((data) => fetchFollowups(1, data))();
    }, [selectedLimit, handleSubmit, fetchFollowups, isOpen, inquiryId]);

    const handleDelete = async (id: number) => {
        if (!inquiryId) {
            toast.error("Inquiry ID is required");
            return;
        }

        try {
            await deleteFollowup(inquiryId, id);
            toast.success("Followup deleted successfully!");
            await fetchFollowups(current_page);
        } catch {
            toast.error("Failed to delete followup!");
        } finally {
            setIsDeleteModalOpen(false);
            setFollowupToDelete(null);
        }
    };

    const handlePageChange = useCallback((page: number) => {
        if (!inquiryId) return;
        handleSubmit((data) => fetchFollowups(page, data))();
    }, [handleSubmit, fetchFollowups, inquiryId]);

    const handleNext = useCallback(() => {
        if (current_page < last_page && inquiryId) {
            handlePageChange(current_page + 1);
        }
    }, [current_page, last_page, handlePageChange, inquiryId]);

    const handlePrev = useCallback(() => {
        if (current_page > 1 && inquiryId) {
            handlePageChange(current_page - 1);
        }
    }, [current_page, handlePageChange, inquiryId]);

    const handleAddNew = useCallback(() => {
        if (!inquiryId) {
            toast.error("Inquiry ID is required to add a followup");
            return;
        }
        setSelectedFollowupId(null);
        setSelectedFollowupType("create");
        setIsAddModalOpen(true);
    }, [inquiryId]);

    const handleView = useCallback((followupId: number) => {
        if (!inquiryId) {
            toast.error("Inquiry ID is required");
            return;
        }
        setSelectedFollowupId(followupId);
        setSelectedFollowupType("view");
        setIsAddModalOpen(true);
    }, [inquiryId]);

    const handleEdit = useCallback((followupId: number) => {
        if (!inquiryId) {
            toast.error("Inquiry ID is required");
            return;
        }
        setSelectedFollowupId(followupId);
        setSelectedFollowupType("update");
        setIsAddModalOpen(true);
    }, [inquiryId]);

    const handleModalClose = useCallback(() => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedFollowupId(null);
            setSelectedFollowupType(null);
        }, 300);
    }, []);

    const handleDeleteClick = useCallback((followupId: number) => {
        if (!inquiryId) {
            toast.error("Inquiry ID is required");
            return;
        }
        setFollowupToDelete(followupId);
        setIsDeleteModalOpen(true);
    }, [inquiryId]);

    const formatDate = useCallback((dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const getClientName = useCallback((followup: Followup) => {
        return followup.inquiry?.name || followup.name || "N/A";
    }, []);

    const getClientEmail = useCallback((followup: Followup) => {
        return followup.inquiry?.email || followup.email || "";
    }, []);

    const getClientPhone = useCallback((followup: Followup) => {
        return followup.inquiry?.phone || followup.phone || "";
    }, []);

    const modalTitle = useMemo(() => {
        if (inquiryName) {
            return `Followups for ${inquiryName}`;
        }
        return "Followups";
    }, [inquiryName]);

    // Don't render if no inquiryId
    if (!inquiryId && isOpen) {
        return (
            <PopupModal isOpen={isOpen} onClose={onClose} title="Error" size="md">
                <div className="p-6 text-center">
                    <p className="text-red-600">Inquiry ID is required to view followups.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-opsh-primary text-white rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </PopupModal>
        );
    }

    return (
        <PopupModal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="exlg"
        >
            <div className="px-3 py-1">
                {/* Header with filters */}
                <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
                    <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relative md:gap-4">
                        <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap text-center">
                            {inquiryName ? `Followups: ${inquiryName}` : "Followups"}
                        </div>
                        <form
                            className="flex items-center w-full col-span-12 mt-2 lg:col-span-9 sm:mt-0"
                            onSubmit={handleSubmit((data) => fetchFollowups(1, data))}
                        >
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <IoSearch className="w-4 h-4 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full p-2 pl-10 text-xs text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by client name, email, phone..."
                                    {...register("search")}
                                />
                            </div>
                            <button
                                type="submit"
                                className="p-2 ml-2 text-sm font-medium text-white bg-opsh-primary border border-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                                aria-label="Search"
                            >
                                <IoSearch className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-wrap justify-between col-span-12 gap-2 lg:col-span-7 md:flex-nowrap lg:justify-end md:gap-4">
                        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap sm:gap-4">
                            {/* Followup Status Filter */}
                            <select
                                {...register("followup_status")}
                                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover-10 focus:outline-none"
                                aria-label="Filter by status"
                            >
                                <option value="">All Status</option>
                                <option value="interested">Interested</option>
                                <option value="not_interested">Not Interested</option>
                                <option value="call_later">Call Later</option>
                                <option value="visit_scheduled">Visit Scheduled</option>
                            </select>

                            {/* Contact Method Filter */}
                            <select
                                {...register("contact_method")}
                                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover-10 focus:outline-none"
                                aria-label="Filter by contact method"
                            >
                                <option value="">All Methods</option>
                                <option value="phone">Phone</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="website">Website</option>
                                <option value="office_visit">Office Visit</option>
                            </select>

                            {/* Page Size */}
                            <select
                                {...register("limit")}
                                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover/10 focus:outline-none"
                                aria-label="Items per page"
                            >
                                <option value="10">10 per page</option>
                                <option value="20">20 per page</option>
                                <option value="50">50 per page</option>
                            </select>

                            <button
                                onClick={handleAddNew}
                                className="flex cursor-pointer items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90"
                                aria-label="Add new followup"
                            >
                                <span className="hidden xl:block">Add Followup</span>
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
                                <th className="px-3 py-2 text-left">Client Details</th>
                                <th className="px-3 py-2 text-left hidden md:table-cell">Contact Method</th>
                                <th className="px-3 py-2 text-left hidden lg:table-cell">Message</th>
                                <th className="px-3 py-2 text-left hidden sm:table-cell">Next Followup</th>
                                <th className="px-3 py-2 text-center hidden xl:table-cell">Admin</th>
                                <th className="px-3 py-2 text-center">Status</th>
                                <th className="px-3 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <SearchingData rows={8} columns={7} />
                            ) : followups.length > 0 ? (
                                followups.map((followup) => (
                                    <tr key={followup.id} className="hover:bg-opsh-primary/5">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <ProfileAvatar
                                                    firstName={getClientName(followup)}
                                                    lastName=""
                                                    size="sm"
                                                    className="h-8 w-8"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium">
                                                        {getClientName(followup)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getClientEmail(followup)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 md:hidden">
                                                        {getClientPhone(followup)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 hidden md:table-cell">
                                            <ContactMethodBadge method={followup.contact_method} />
                                        </td>
                                        <td className="px-2 py-2 hidden lg:table-cell max-w-xs truncate">
                                            {followup.message || "-"}
                                        </td>
                                        <td className="px-2 py-2 hidden sm:table-cell">
                                            {followup.next_followup_date ? formatDate(followup.next_followup_date) : "-"}
                                        </td>
                                        <td className="px-2 py-2 hidden xl:table-cell">
                                            {followup.admin?.name || "-"}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <FollowupStatusBadge status={followup.followup_status} />
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleView(followup.id)}
                                                    className="p-1 hover:text-yellow-600 transition-colors"
                                                    title="View"
                                                    aria-label="View followup"
                                                >
                                                    <LuEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(followup.id)}
                                                    className="p-1 hover:text-green-600 transition-colors"
                                                    title="Edit"
                                                    aria-label="Edit followup"
                                                >
                                                    <MdOutlineEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(followup.id,)}
                                                    className="p-1 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                    aria-label="Delete followup"
                                                >
                                                    <RiDeleteBinLine className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <EmptyState />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {followups.length > 0 && !isLoading && (
                    <PaginationControls
                        currentPage={current_page}
                        lastPage={last_page}
                        onPageChange={handlePageChange}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                )}

                {/* Delete Modal */}
                <DeleteModal
                    profileId={followupToDelete}
                    onDelete={handleDelete}
                    onClose={() => setIsDeleteModalOpen(false)}
                    isModalDeleteOpen={isDeleteModalOpen}
                />

                {/* Add/Edit/View Modal */}
                <AddinqueryFollowupModal
                    key={`followup-modal-${selectedFollowupType}-${selectedFollowupId || "new"}`}
                    onSuccess={() => fetchFollowups(current_page)}
                    onClose={handleModalClose}
                    isOpen={isAddModalOpen}
                    type={selectedFollowupType ?? undefined}
                    id={selectedFollowupId}
                    inquiryId={inquiryId}
                    inquiryName={inquiryName}
                />
            </div>
        </PopupModal>
    );
};

export default ListinquerytFollowupModal;
