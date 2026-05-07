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

import { deleteInqueryProperty, getPropertyInquiryListPage } from "@/apis/InqueryProperty.api";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/loader/EmptyState";
import DeleteModal from "@/components/deleteModel/deleteModel";
import AddRequestPostComponent from "@/components/AddInqueryComponent";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import SearchingData from "@/components/loader/SearchingData";
import ListinquerytFollowupModal from "./inqueryFollowup/ListinquerytFollowupModal";
import { SlUserFollow } from "react-icons/sl";
import { useAdminListPage } from "@/hooks/useAdminListPage";
import type { PropertyInquiryListFilters } from "@/types/admin/listFilters";
import type { Inquiry } from "@/types/inquery";

const defaultInquiryFilters: PropertyInquiryListFilters = {
    search: "",
    status: "",
    request_type: "",
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

// Request type badge
const RequestTypeBadge = ({ type }: { type?: string }) => {
    const getTypeColor = () => {
        switch (type?.toLowerCase()) {
            case "sell":
                return "bg-blue-100 text-blue-800";
            case "rent":
                return "bg-purple-100 text-purple-800";
            case "buy":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
            {type || "N/A"}
        </span>
    );
};

const RequestPostList: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);
    const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
    
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedPostType, setSelectedPostType] = useState<"create" | "view" | "update" | "followup" | null>(null);
    const [selectedPost, setSelectedPost] = useState<Inquiry | null>(null);

    const {
        items: posts,
        filters,
        pagination,
        page,
        setPage,
        updateFilter,
        submitSearch,
        refresh,
        isLoading,
        isFetching,
    } = useAdminListPage<Inquiry, PropertyInquiryListFilters>({
        defaultFilters: defaultInquiryFilters,
        queryKeyBase: ["admin-property-inquiries"],
        searchKeys: ["search"],
        fetchPage: ({ page: currentPage, filters: currentFilters, signal }) =>
            getPropertyInquiryListPage(currentPage, currentFilters, signal),
    });

    const isTableLoading = isLoading || isFetching;

    const handleFollowupModalClose = () => {
        setIsFollowupModalOpen(false);
        setTimeout(() => {
            setSelectedPostId(null);
            setSelectedPostType(null);
            setSelectedPost(null);
        }, 300);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteInqueryProperty(id);
            toast.success("Request post deleted successfully!");
            await refresh();
        } catch {
        } finally {
            setIsDeleteModalOpen(false);
            setPostToDelete(null);
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
        setSelectedPostId(null);
        setSelectedPostType("create");
        setIsAddModalOpen(true);
    };

    const handleView = (postId: number) => {
        setSelectedPostId(postId);
        setSelectedPostType("view");
        setIsAddModalOpen(true);
    };

    const handleFollowInquery = (postId: number) => {
        const post = posts.find((item) => item.id === postId) ?? null;
        setSelectedPost(post);
        setSelectedPostId(postId);
        setSelectedPostType("followup");
        setIsFollowupModalOpen(true);
    };

    const handleEdit = (postId: number) => {
        setSelectedPostId(postId);
        setSelectedPostType("update");
        setIsAddModalOpen(true);
    };

    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setTimeout(() => {
            setSelectedPostId(null);
            setSelectedPostType(null);
        }, 300);
    };

    return (
        <div className="px-3 py-1">
            <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
                <h5 className="hidden text-sm text-gray-600 md:block">Request Posts Dashboard</h5>
                <hr className="flex-grow w-full mt-2 border-gray-300 border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
                <h5 className="hidden text-sm md:block">Manage Requests</h5>
            </div>
            {/* Search & Filter */}
            <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
                <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relatiave md:gap-4">
                    <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap text-center">
                        Request Posts
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

                        {/* Request Type Filter */}
                        <select
                            value={filters.request_type}
                            onChange={(event) => updateFilter("request_type", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-primary-hover-10 focus:outline-none"
                        >
                            <option value="">All Types</option>
                            <option value="sell">Sell</option>
                            <option value="rent">Rent</option>
                            <option value="buy">Buy</option>
                        </select>

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
                            <span className="hidden xl:block">Add Request</span>
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
                            <th className="px-3 py-2 text-left hidden md:table-cell">Request Type</th>
                            <th className="px-3 py-2 text-left hidden lg:table-cell">Location</th>
                            <th className="px-3 py-2 text-left hidden sm:table-cell">Budget</th>
                            <th className="px-3 py-2 text-center hidden xl:table-cell">Property code</th>
                            <th className="px-3 py-2 text-center">Title</th>
                            <th className="px-3 py-2 text-center">Status</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isTableLoading ? (
                            <SearchingData rows={8} columns={8} />
                        ) : posts.length > 0 ? (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-opsh-primary/5">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <ProfileAvatar firstName={post.name || ""} lastName="" size="sm" className="h-8 w-8" />
                                            <div>
                                                <div className="text-sm font-medium">{post.name}</div>
                                                <div className="text-xs text-gray-500">{post.email}</div>
                                                <div className="text-xs text-gray-500 md:hidden">{post.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 hidden md:table-cell">
                                        <RequestTypeBadge type={post.request_type} />
                                    </td>
                                    <td className="px-2 py-2 hidden lg:table-cell">{post.location || "-"}</td>
                                    <td className="px-2 py-2 hidden sm:table-cell">{post.budget ? `NPR ${post.budget.toLocaleString()}` : "-"}</td>
                                    <td className="px-2 py-2 hidden xl:table-cell">{post.property?.property_code || "-"}</td>
                                    <td className="px-2 py-2 hidden xl:table-cell">{post.property?.title || "-"}</td>
                                    <td className="px-2 py-2 text-center"><StatusBadge status={post.status} /></td>
                                    <td className="px-2 py-2 text-center flex justify-center gap-1">
                                        <button onClick={() => handleFollowInquery(post.id)} className="p-1 hover:text-yellow-600 transition-colors"><SlUserFollow className="w-4 h-4" /></button>
                                        <button onClick={() => handleView(post.id)} className="p-1 hover:text-yellow-600"><LuEye className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(post.id)} className="p-1 hover:text-green-600"><MdOutlineEdit className="w-4 h-4" /></button>
                                        <button onClick={() => { setPostToDelete(post.id); setIsDeleteModalOpen(true); }} className="p-1 hover:text-red-600"><RiDeleteBinLine className="w-4 h-4" /></button>
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

            {/* Pagination */}
            {posts.length > 0 && !isTableLoading && (
                <PaginationControls currentPage={pagination.current_page} lastPage={pagination.last_page} onPageChange={handlePageChange} onNext={handleNext} onPrev={handlePrev} />
            )}

            {/* Delete Modal */}
            <DeleteModal profileId={postToDelete} onDelete={handleDelete} onClose={() => setIsDeleteModalOpen(false)} isModalDeleteOpen={isDeleteModalOpen} />

            {/* Add/Edit/View Modal */}
            <AddRequestPostComponent
                key={`request-post-modal-${selectedPostType}-${selectedPostId || "new"}`}
                onSuccess={() => void refresh()}
                onClose={handleModalClose}
                onOpen={isAddModalOpen}
                type={selectedPostType}
                id={selectedPostId}
                from="admin"
            />

            {/* Follow-up Modal with all inquiry data */}
            <ListinquerytFollowupModal
                isOpen={isFollowupModalOpen}
                onClose={handleFollowupModalClose}
                inquiryId={selectedPostId}
                inquiryName={selectedPost?.name || ""}
            />
        </div>
    );
};

export default RequestPostList;
