'use client';
import { IoSearch, RiUserAddLine, LuEye, LuFilter, RiDeleteBinLine, MdOutlineEdit } from "@/assets/icons/Icons";
import { useState } from "react";
import { toast } from "react-toastify";
import { Blogs } from "@/types/blog";
import AdvanceSearch from "./AdvanceSearch";
import PaginationControls from "@/components/PaginationControls";
import StatusToggle from "@/components/StatusToggle";
import EmptyState from "@/components/loader/EmptyState";
import DeleteModal from "@/components/deleteModel/deleteModel";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import AddBlogModal from "./AddBlogModal";
import SearchingData from "@/components/loader/SearchingData";
import { formatDate } from "@/helper/formateDate/formatDate";
import { deleteBlog, getBlogListPage, updateStatusBlog } from "@/apis/blog.api";
import { useAdminListPage } from "@/hooks/useAdminListPage";
import type { BlogListFilters } from "@/types/admin/listFilters";

const defaultBlogFilters: BlogListFilters = {
    searchTerm: "",
    isStatus: "",
    limit: "10",
    categoryId: "",
    createdAt: "",
};

const ListBlog: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
    const [isAdvanceSearchModalOpen, setIsAdvanceSearchModalOpen] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
    const [selectedBlogType, setSelectedBlogType] = useState<"create" | "view" | "update" | null>(null);

    const {
        items: blogs,
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
    } = useAdminListPage<Blogs, BlogListFilters>({
        defaultFilters: defaultBlogFilters,
        queryKeyBase: ["admin-blogs"],
        searchKeys: ["searchTerm"],
        fetchPage: ({ page: currentPage, filters: currentFilters, signal }) =>
            getBlogListPage(currentPage, currentFilters, signal),
    });

    const isTableLoading = isLoading || isFetching;

    const onCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setBlogToDelete(null);
    };

    // Handlers
    const handleDelete = async (id: number) => {
        try {
            await deleteBlog(id);
            toast.success("Blog deleted successfully!");
            await refresh();
        } catch {
        } finally {
            setIsDeleteModalOpen(false);
            setBlogToDelete(null);
        }
    };

    const handleStatusChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = e.target.checked ? 1 : 0;
        const formData = new FormData();
        formData.append("isStatus", newStatus.toString());

        try {
            await updateStatusBlog(id, formData);
            toast.success(`Blog status updated successfully!`);
            await refresh();
        } catch {
        }
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitSearch();
    };

    const handleAdvanceSearch = (newFilters: Partial<BlogListFilters>) => {
        patchFilters(newFilters, { submitSearch: true });
        setIsAdvanceSearchModalOpen(false);
    };

    const handleUpdate = () => {
        void refresh();
    };

    // Pagination controls
    const paginationProps = {
        currentPage: pagination.current_page,
        lastPage: pagination.last_page,
        onPageChange: (nextPage: number) => setPage(nextPage),
        onNext: () => page < pagination.last_page && setPage(page + 1),
        onPrev: () => page > 1 && setPage(page - 1),
    };

    return (
        <div className="px-3 py-1">
            {/* Header Section */}
            <div className="flex flex-col items-center gap-1 mb-1 md:gap-4 sm:flex-row">
                <h5 className="hidden text-sm text-opsh-secondary md:block">Working Dashboard</h5>
                <hr className="flex-grow w-full mt-2 border-gray-300 border-t-1 sm:ml-4 sm:mt-0 sm:w-auto" />
                <h5 className="hidden text-sm md:block">Data Overview</h5>
                <h5 className="hidden text-sm text-opsh-grey md:block">Statistics Dashboard</h5>
            </div>

            {/* Search and Filter Controls */}
            <div className="grid items-center grid-cols-12 mb-2 sm:flex-col">
                <div className="flex flex-wrap col-span-12 lg:col-span-5 md:flex-nowrap relative md:gap-4">
                    <div className="hidden col-span-3 text-xl font-medium text-opsh-primary md:block whitespace-nowrap">
                        Blog List
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
                                placeholder="Search blog title..."
                                value={filters.searchTerm}
                                onChange={(event) => updateFilter("searchTerm", event.target.value)}
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
                        <form className="flex items-center space-x-2 sm:space-x-4" onSubmit={handleSearchSubmit}>
                            <select
                                value={filters.isStatus}
                                onChange={(event) => updateFilter("isStatus", event.target.value)}
                                className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-light-blue focus:outline-none focus:ring-opsh-primary"
                            >
                                <option value="">All</option>
                                <option value="1">Active</option>
                                <option value="0">Offline</option>
                            </select>
                        </form>

                        {/* Advanced Search Button */}
                        <button
                            onClick={() => setIsAdvanceSearchModalOpen(true)}
                            className="flex items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-opsh-primary whitespace-nowrap"
                        >
                            <span className="hidden xl:block">Advance Filters</span>
                            <LuFilter className="block xl:hidden" />
                        </button>

                        {/* Page Size Selector */}
                        <select
                            value={filters.limit}
                            onChange={(event) => updateFilter("limit", event.target.value)}
                            className="px-3 py-1 text-sm border-2 rounded-md border-opsh-primary text-opsh-primary hover:bg-opsh-light-blue focus:outline-none focus:ring-2 focus:ring-opsh-primary"
                        >
                            <option value="">Page</option>
                            <option value="10">10 per page</option>
                            <option value="20">20 per page</option>
                            <option value="30">30 per page</option>
                        </select>

                        {/* Add Blog Button */}
                        <button
                            onClick={() => {
                                setSelectedBlogId(null);
                                setSelectedBlogType('create');
                                setIsAddModalOpen(true);
                            }}
                            className="flex cursor-pointer items-center justify-center px-4 py-1 text-sm text-white transition-all border-2 rounded-md bg-opsh-primary border-opsh-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-opsh-primary whitespace-nowrap"
                        >
                            <span className="hidden xl:block">Add Blog</span>
                            <RiUserAddLine className="block xl:hidden" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Blog Table */}
            <div className="gap-2">
                <div className="mt-1">
                    <div className="overflow-x-auto rounded-md border border-gray-200 h-[calc(100vh-245px)]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-opsh-primary text-white">
                                <tr>
                                    <th className="py-2 pl-3 text-left font-medium text-sm uppercase tracking-wider">Title</th>
                                    <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell text-center">Category</th>
                                    <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell text-center">Publish Date</th>
                                    <th className="py-2 text-left font-medium text-sm uppercase tracking-wider hidden sm:table-cell text-center">Create By</th>
                                    <th className="py-2 text-centre font-medium text-sm uppercase tracking-wider text-center">Status</th>
                                    <th className="py-2 text-centre font-medium text-sm uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {isTableLoading ? (

                                    <SearchingData />
                                ) : blogs.length > 0 ? (
                                    blogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-opsh-primary/5 transition-colors duration-150">
                                            {/* Title with image */}
                                            <td className="px-3 py-1 whitespace-nowrap">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        {blog.thumbnail ? (
                                                            <img
                                                                className="h-8 w-8 rounded-full border border-opsh-primary/30 object-cover"
                                                                src={blog.thumbnail}
                                                                alt="Blog thumbnail"
                                                            />
                                                        ) : (
                                                            <ProfileAvatar
                                                                firstName={blog?.title.slice(0, 12) || ""}
                                                                lastName={blog?.title.slice(0, 12) || ""}
                                                                size="sm"
                                                                className="h-8 w-8"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {blog.title.slice(0, 25)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category (hidden on mobile) */}
                                            <td className="px-1 py-1 whitespace-nowrap hidden md:table-cell text-center">
                                                <div className="text-sm text-gray-900 overflow-hidden max-w-[200px]">
                                                    {blog.category?.label || 'N/A'}
                                                </div>
                                            </td>

                                            {/* Publish Date (hidden on mobile) */}
                                            <td className="px-1 py-1 whitespace-nowrap hidden lg:table-cell text-center">
                                                <div className="text-sm text-gray-900 overflow-hidden max-w-[200px]">
                                                    {formatDate(blog.publish_date)}
                                                </div>
                                            </td>

                                            {/* Author (hidden on mobile) */}
                                            <td className="px-1 py-1 whitespace-nowrap hidden sm:table-cell text-center">
                                                {blog.user?.username || 'N/A'}
                                            </td>

                                            {/* Status */}
                                            <td className="px-1 py-1 whitespace-nowrap text-center">
                                                <StatusToggle
                                                    checked={blog.isStatus === 1}
                                                    onChange={(e) => handleStatusChange(blog.id, e)}
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-1 py-1 whitespace-nowrap text-center">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBlogId(blog.id);
                                                            setSelectedBlogType('view');
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="text-gray-500 hover:text-opsh-warning p-1 rounded-full hover:bg-gray-100"
                                                        title="View"
                                                    >
                                                        <LuEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBlogId(blog.id);
                                                            setSelectedBlogType('update');
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="text-gray-500 hover:text-opsh-success p-1 rounded-full hover:bg-gray-100"
                                                        title="Edit"
                                                    >
                                                        <MdOutlineEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setBlogToDelete(blog.id);
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

                    {/* Pagination Controls */}
                    {!isTableLoading && blogs.length > 0 && (
                        <PaginationControls {...paginationProps} />
                    )}
                </div>
            </div>

            <AdvanceSearch
                isOpen={isAdvanceSearchModalOpen}
                onClose={() => setIsAdvanceSearchModalOpen(false)}
                onSubmit={handleAdvanceSearch}
            />

            <DeleteModal
                profileId={blogToDelete}
                onDelete={handleDelete}
                onClose={onCloseDeleteModal}
                isModalDeleteOpen={isDeleteModalOpen}
            />

            {isAddModalOpen && (
                <AddBlogModal
                    key={selectedBlogId || 'create'}
                    onSuccess={handleUpdate}
                    onClose={() => setIsAddModalOpen(false)}
                    type={selectedBlogType}
                    onOpen={isAddModalOpen}
                    id={selectedBlogId}
                />
            )}
        </div>
    );
};

export default ListBlog;
