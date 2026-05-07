import React, { useState, useEffect, useCallback } from 'react';
import {
    InputField,
} from '@/components/inputField/InputField';
import CkEditorSmall from '@/components/ckEditors/CKEditorSmall';

import UploadImageField from "@/components/inputField/Upload";
import { toast } from "react-toastify";
import useBlogStore from "@/stores/blogStore";
import { Blogs } from "@/types/blog";
import PopupModal from "@/components/modal/PopupModal";

import { SelectField } from '@/components/inputField/InputField';
import TagsInput from '@/components/Tags/Tags';

interface Status {
    id: number;
    label: string;
}
const status: Status[] = [
    { id: 1, label: "In Progress" },
    { id: 2, label: "Pending" },
    { id: 3, label: "Published" },
    { id: 4, label: "Rejected" },
];

const category: Status[] = [
    { id: 1, label: "Property" },
    { id: 2, label: "Property Inquiry" },
    { id: 3, label: "Blog" },
];

interface AddBlogModalProps {
    onSuccess: () => void;
    onClose: () => void;
    onOpen?: boolean;
    type?: any;
    id?: number | null;
    for?: string;
}

// Create a separate interface for form data
interface BlogFormData {
    id: number;
    thumbnail: File | null;
    title: string;
    categoryId: string;
    status: string;
    isStatus?: number;
    content: string;
    tags: string;
}

const initialFormData = (): BlogFormData => ({
    id: 0,
    thumbnail: null,
    title: '',
    categoryId: '',
    tags: '',
    status: '',
    content: '',
    isStatus: 0,
});

const AddBlogModal: React.FC<AddBlogModalProps> = ({
    onSuccess,
    onClose,
    onOpen = false,
    type,
    id = null
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const { createBlog, updateBlog, getBlog } = useBlogStore();
    const [formData, setFormData] = useState<BlogFormData>(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);

    const isViewMode = type === 'view';
    const isUpdateMode = type === 'update';
    const isCreateMode = type === 'create' || !type;

    // Debug logging
    useEffect(() => {
        console.log('Modal Props:', {
            onOpen,
            type,
            id,
            isViewMode,
            isUpdateMode,
            isCreateMode
        });
    }, [onOpen, type, id, isViewMode, isUpdateMode, isCreateMode]);

    useEffect(() => {
        console.log('Current formData:', formData);
    }, [formData]);

    // Fetch blog data when in view/update mode
    const fetchBlogData = useCallback(async () => {
        try {
            if (!id || isCreateMode) {
                console.log('Skipping fetch - no ID or create mode');
                return;
            }

            console.log('Fetching blog data for ID:', id);
            setIsDataLoading(true);
            const numericId = Number(id);
            const response: Blogs | any = await getBlog(numericId);

            if (response) {
                const blogData = {
                    id: response.id ? Number(response.id) : 0,
                    thumbnail: response.thumbnail || null,
                    title: response.title || '',
                    categoryId: response.categoryId?.toString() || '',
                    status: response.status ? String(response.status) : '',
                    content: response.content || '',
                    tags: response.tags || '',
                };

                console.log('Mapped form data:', blogData);
                setFormData(blogData);
            } else {
                console.log('No response data received');
                toast.error("No blog data found");
            }
        } catch (error: any) {
            console.error('Detailed error fetching blog:', {
                error,
                id,
                type,
                isCreateMode
            });
            toast.error(`Failed to fetch blog data: ${error.message}`);
        } finally {
            setIsDataLoading(false);
        }
    }, [id, isCreateMode, getBlog]);

    // Reset form when modal closes or type changes
    useEffect(() => {
        if (!onOpen) {
            resetForm();
        } else if (onOpen && (isViewMode || isUpdateMode) && id) {
            fetchBlogData();
        }
    }, [onOpen, type, id, fetchBlogData, isViewMode, isUpdateMode]);

    const resetForm = () => {
        setFormData(initialFormData);
        setCurrentStep(1);
        setErrors({});
    };

    const handleTagsChange = (newTags: string[]) => {
        if (isViewMode) return;
        const tagsString = newTags.join(',');
        if (formData.tags !== tagsString) {
            setFormData(prev => ({
                ...prev,
                tags: tagsString
            }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        if (isViewMode) return;

        const { name, type, value } = e.target;
        let finalValue: any = value;

        if (type === 'number') {
            finalValue = value === '' ? null : Number(value);
        } else if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (name: string, value: number | string | null) => {
        if (isViewMode) return;

        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleNext = () => {
        console.log('Current step:', currentStep);
        console.log('Current form data:', {
            title: formData.title,
            categoryId: formData.categoryId,
            tags: formData.tags,
            content: formData.content
        });

        let requiredFields: string[] = [];

        if (currentStep === 1) {
            requiredFields = [
                'title',
                'categoryId',
                'tags'  // Added tags validation since it has required indicator
            ];
        } else if (currentStep === 2) {
            requiredFields = ['content'];
        }

        const newErrors: { [key: string]: string } = {};
        requiredFields.forEach(field => {
            const value = formData[field as keyof BlogFormData];
            console.log(`Checking field ${field}:`, value);

            if (!value || (typeof value === 'string' && value.trim() === '')) {
                newErrors[field] = 'This field is required';
            }
        });

        console.log('Validation errors:', newErrors);

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fill in all required fields');
            return;
        }

        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isViewMode) {
            onClose();
            return;
        }

        setIsLoading(true);

        try {
            const payload: any = {
                ...formData,
                isStatus: 1,
            };

            console.log('Submitting payload:', payload);

            if (isUpdateMode && id) {
                await updateBlog(Number(id), payload);
                toast.success('Blog updated successfully!');
            } else {
                await createBlog(payload);
                toast.success('Blog created successfully!');
            }

            resetForm();
            onClose();
            onSuccess();
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(isUpdateMode ? `Failed to update blog: ${error.message}` : `Failed to create blog: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (name: keyof BlogFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewMode) return;

        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            [name]: file
        }));
    };

    const handleModalClose = () => {
        resetForm();
        onClose();
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (formData.content !== value) {
            setFormData(prev => ({ ...prev, content: value }));
        }

        if (errors.content) {
            setErrors(prev => ({ ...prev, content: '' }));
        }
    };

    // Determine modal title based on mode
    const getModalTitle = () => {
        if (isViewMode) return 'View Blog';
        if (isUpdateMode) return 'Update Blog';
        return 'Add Blog';
    };

    // Determine if fields should be disabled
    const isFieldDisabled = isViewMode || isDataLoading;

    if (isDataLoading) {
        return (
            <PopupModal
                isOpen={onOpen}
                onClose={handleModalClose}
                title={getModalTitle()}
                size="elg"
            >
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-opsh-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-gray-600">Loading blog data for ID: {id}...</p>
                    </div>
                </div>
            </PopupModal>
        );
    }

    return (
        <PopupModal
            isOpen={onOpen}
            onClose={handleModalClose}
            title={getModalTitle()}
            size="elg"
        >
            <form onSubmit={handleSubmit}>
                <h3 className="text-md font-medium border-b pb-1 text-opsh-primary">
                    {['Basic Information', 'Content'][currentStep - 1]}
                </h3>
                <div className="min-h-[400px] grid mt-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                    {currentStep === 1 && (
                        <>
                            <div className="col-span-full">
                                <UploadImageField
                                    label="Thumbnail"
                                    name="thumbnail"
                                    value={formData.thumbnail}
                                    onChange={handleImageChange('thumbnail')}
                                    error={errors.thumbnail}
                                    sizeType="thumbnail"
                                    maxSize={5 * 1024 * 1024}
                                    required={!isViewMode}
                                    disabled={isFieldDisabled}
                                />
                            </div>
                            <div className="col-span-full">
                                <label className="block text-gray-700 text-sm font-medium mb-1">
                                    Tags
                                    <span className="text-opsh-danger text-sm">*</span>
                                </label>
                                <TagsInput
                                    tags={formData.tags ? formData.tags.split(',').filter(tag => tag.trim() !== '') : []}
                                    setTags={handleTagsChange}
                                />
                                {errors.tags && <p className="text-opsh-danger text-xs mt-1">{errors.tags}</p>}
                            </div>
                            <InputField
                                label="Blog Title"
                                name="title"
                                value={formData.title}
                                required={!isViewMode}
                                onChange={handleChange}
                                placeholder="Enter Blog Title"
                                error={errors.title}
                                data={formData.title}
                                disabled={isFieldDisabled}
                            />
                            <SelectField
                                label="Category"
                                name="categoryId"
                                options={category}
                                onChange={(e) => !isViewMode && handleSelectChange('categoryId', Number(e.target.value))}
                                value={formData.categoryId?.toString() || ''}
                                error={errors.categoryId}
                                disabled={isFieldDisabled}
                                required={!isViewMode}
                            />
                            <SelectField
                                label="Status"
                                name="status"
                                options={status}
                                onChange={(e) => !isViewMode && handleSelectChange('status', Number(e.target.value))}
                                value={formData.status?.toString() || ''}
                                error={errors.status}
                                disabled={isFieldDisabled}
                            />
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="col-span-full">
                                <CkEditorSmall
                                    label=""
                                    name="content"
                                    value={formData.content}
                                    onChange={(data: any) => {
                                        if (data && data.target) {
                                            handleDescriptionChange(data as React.ChangeEvent<HTMLInputElement>);
                                        } else if (typeof data === 'string') {
                                            if (formData.content !== data) {
                                                setFormData(prev => ({ ...prev, content: data }));
                                            }
                                            if (errors.content) {
                                                setErrors(prev => ({ ...prev, content: '' }));
                                            }
                                        }
                                    }}
                                    error={errors.content}
                                    required
                                    placeholder="Enter detailed property description..."
                                    wordCount
                                    maxLength={8000}
                                    disabled={isViewMode}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-between mt-6">
                    {currentStep > 1 && (
                        <a type="button" onClick={handleBack} className="w-32 py-2 text-white bg-opsh-muted cursor-pointer flex items-center justify-center rounded hover:bg-opsh-darkgrey">Back</a>
                    )}
                    {currentStep < 2 ? (
                        <a type="button" onClick={handleNext} className="w-32 py-2 text-white bg-opsh-primary cursor-pointer flex items-center justify-center rounded hover:bg-opsh-fourth ml-auto">Next</a>
                    ) : (
                        (!isViewMode && (
                            <button
                                type="submit"
                                className="w-32 py-2 text-white bg-opsh-success rounded hover:bg-green-700 ml-auto flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        Submiting
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </>
                                ) : 'Submit'}
                            </button>
                        ))
                    )}
                </div>
            </form>
        </PopupModal>
    );
};

export default AddBlogModal;