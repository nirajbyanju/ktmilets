'use client';

// app/(dashboard)/request-posts/AddInqueryComponent.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    InputField,
    SelectField,
} from '@/components/inputField/InputField';
import CkEditorSmall from '@/components/ckEditors/CKEditorSmall';
import UploadImageField from "@/components/inputField/Upload";
import { toast } from "react-toastify";
import PopupModal from "@/components/modal/PopupModal";
import usePropertyInqueryStore from "@/stores/InqueryPropertyStore";
import useOptionStore from '@/stores/common/OptionStore';

interface AddInqueryComponentProps {
    onSuccess?: () => void;
    onClose: () => void;
    onOpen?: boolean;
    type?: string | null;
    id?: number | null;
    from?: string | null;
    variant?: 'modal' | 'page';
}

interface RequestPostFormData {
    from: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    inquiry_type_id: string | number | null;
    location: string;
    budget: number | null;
    description: string;
    status: string;
    images: (File | string)[];
    existing_images?: string[];
}

const initialFormData: RequestPostFormData = {
    from: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiry_type_id: '1', // Changed to string to match select field
    location: '',
    budget: null,
    description: '',
    status: 'pending',
    images: [],
    existing_images: []
};

const AddInqueryComponent: React.FC<AddInqueryComponentProps> = ({
    onSuccess = () => {},
    onClose,
    onOpen = false,
    type = null,
    id = null,
    from = null,
    variant = 'modal'
}) => {
    const [isOpenModel, setIsOpenModel] = useState(onOpen);
    const [formData, setFormData] = useState<RequestPostFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);

    const { getPropertyInquiry, createPropertyInquiry, updatePropertyInquiry } = usePropertyInqueryStore();
    const optionStore = useOptionStore();
    const { getOptions } = optionStore;

    const isViewMode = type === 'view';
    const isUpdateMode = type === 'update';
    
    // Fixed: Properly check if it's a sell request (assuming ID 1 is sell)
    const isSellRequest = useMemo(() => {
        const inquiryId = formData.inquiry_type_id?.toString();
        return inquiryId === '2';
    }, [formData.inquiry_type_id]);

    const totalSteps = isSellRequest ? 3 : 1;

    // Reset step when modal opens/closes
    useEffect(() => {
        if (isOpenModel) {
            setCurrentStep(1);
            setVisitedSteps([1]);
        }
    }, [isOpenModel]);

    // Update visited steps when current step changes
    useEffect(() => {
        if (!visitedSteps.includes(currentStep)) {
            setVisitedSteps(prev => [...prev, currentStep]);
        }
    }, [currentStep, visitedSteps]);

    // Load data when editing/viewing
    useEffect(() => {
        const loadPostData = async () => {
            if (isOpenModel && id && (isUpdateMode || isViewMode)) {
                setIsLoading(true);
                try {
                    const response = await getPropertyInquiry(Number(id));

                    if (response) {
                        // Parse images if needed
                        let parsedImages = response.images || [];
                        if (typeof response.images === 'string') {
                            try {
                                parsedImages = JSON.parse(response.images);
                            } catch {
                                parsedImages = [];
                            }
                        }

                        setFormData({
                            from: response.from || from || '',
                            name: response.name || '',
                            email: response.email || '',
                            phone: response.phone || '',
                            message: response.message || '',
                            inquiry_type_id: response.inquiry_type_id?.toString() || '1',
                            location: response.location || '',
                            budget: response.budget ? Number(response.budget) : null,
                            description: response.description || '',
                            status: response.status || 'pending',
                            images: parsedImages,
                            existing_images: parsedImages
                        });
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    toast.error("Failed to fetch request post");
                } finally {
                    setIsLoading(false);
                }
            } else if (isOpenModel && !id) {
                // Reset form for new entry
                setFormData({
                    ...initialFormData,
                    from: from || ''
                });
            }
        };

        loadPostData();
    }, [isOpenModel, id, isUpdateMode, isViewMode, getPropertyInquiry, from]);

    useEffect(() => {
        setIsOpenModel(onOpen);
    }, [onOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        let finalValue: string | number | null = value;

        if (name === 'budget') {
            finalValue = value === '' ? null : Number(value);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        // Clear description and images when switching from sell to other types
        if (name === 'inquiry_type_id') {
            const newValue = value.toString();
            const isNewValueSell = newValue === '1' || newValue === 'sell';
            
            // If switching from sell to non-sell, clear sell-specific fields
            if (!isNewValueSell && isSellRequest) {
                setFormData(prev => ({
                    ...prev,
                    inquiry_type_id: value,
                    description: '',
                    images: []
                }));
            } else {
                setFormData(prev => ({ ...prev, [name]: finalValue }));
            }
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDescriptionChange = (data: string | { target?: { value?: string } }) => {
        const value = typeof data === 'string' ? data : data.target?.value || '';
        setFormData(prev => ({ ...prev, description: value }));

        if (errors.description) {
            setErrors(prev => ({ ...prev, description: '' }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewMode) return;

        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }));
        }
    };

    // Validate current step
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.phone) newErrors.phone = 'Phone is required';
            if (!formData.inquiry_type_id) newErrors.inquiry_type_id = 'Request type is required';
        } else if (step === 2 && isSellRequest) {
            if (!formData.description) newErrors.description = 'Description is required for sell requests';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validate entire form for submission
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.inquiry_type_id) newErrors.inquiry_type_id = 'Request type is required';

        if (isSellRequest && !formData.description) {
            newErrors.description = 'Description is required for sell requests';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStepClick = (stepNum: number) => {
        if (visitedSteps.includes(stepNum)) {
            setCurrentStep(stepNum);
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isViewMode) return;
        if (!validateForm()) {
            if (errors.description && isSellRequest) setCurrentStep(2);
            return;
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();
            const inquiryTypeId = formData.inquiry_type_id?.toString();

            if (!inquiryTypeId) {
                throw new Error('Request type is required');
            }

            submitData.append('from', formData.from || from || '');
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            submitData.append('message', formData.message);
            submitData.append('inquiry_type_id', inquiryTypeId);
            submitData.append('location', formData.location);
            submitData.append('status', formData.status);
            
            if (formData.budget) {
                submitData.append('budget', String(formData.budget));
            }

            if (isSellRequest) {
                submitData.append('description', formData.description);
                
                const newImages = formData.images.filter(img => img instanceof File);
                const existingImages = formData.images.filter(img => typeof img === 'string');

                if (existingImages.length > 0) {
                    submitData.append('existing_images', JSON.stringify(existingImages));
                }

                newImages.forEach((image, index) => {
                    if (image instanceof File) {
                        submitData.append(`images[${index}]`, image);
                    }
                });
            }

            if (isUpdateMode && id) {
                await updatePropertyInquiry(Number(id), submitData);
                toast.success('Request post updated successfully!');
            } else {
                await createPropertyInquiry(submitData);
                toast.success('Request post created successfully!');
            }

            onSuccess();
            handleClose();
        } catch (error: unknown) {
            const apiError = error as {
                response?: {
                    data?: {
                        errors?: Record<string, string>;
                        message?: string;
                    };
                };
            };

            console.error('Submit error:', error);

            if (apiError.response?.data?.errors) {
                setErrors(apiError.response.data.errors);
            }

            toast.error(apiError.response?.data?.message || 'Failed to save request post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpenModel(false);
        setFormData({
            ...initialFormData,
            from: from || ''
        });
        setErrors({});
        setCurrentStep(1);
        setVisitedSteps([1]);
        onClose();
    };

    // Fixed: Proper options mapping
    const requestTypeOptions = useMemo(() => {
        const requestType = getOptions('request_type') || [];
        
        if (requestType.length === 0) {
            // Fallback options if API doesn't return data
            return [
                { value: '1', label: 'Sell' },
                { value: '2', label: 'Rent' },
                { value: '3', label: 'Buy' }
            ];
        }
        
        return requestType.map(item => ({
            value: item.id?.toString() || '',
            label: item.label || item.name || ''
        })).filter(option => option.value && option.label);
    }, [getOptions]);

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
    ];

    // Fixed: handleSelectChange implementation
    const handleSelectChange = (e: { target: { name: string; value: string | null } }) => {
        const { name, value } = e.target;
        
        let processedValue: string | number | null = value;
        
        if (value === '' || value === null) {
            processedValue = null;
        } else {
            // Check if this field expects a number ID
            const idFields = [
                'inquiry_type_id', 'property_type_id', 'listing_type_id', 'property_status_id',
                'property_face_id', 'property_category_id', 'land_unit_id',
                'measure_unit_id', 'road_type_id', 'road_condition_id',
                'water_source_id', 'sewage_type_id', 'furnishing_id',
                'house_type_id', 'built_area_unit_id', 'roof_type_id',
                'building_face_id', 'parking_area_unit_id'
            ];
            
            if (idFields.includes(name)) {
                const parsed = parseInt(value, 10);
                processedValue = !isNaN(parsed) ? parsed : value;
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: processedValue }));
        
        // Special handling for inquiry_type_id
        if (name === 'inquiry_type_id') {
            const isSell = processedValue?.toString() === '1' || processedValue?.toString() === 'sell';
            if (!isSell) {
                setFormData(prev => ({
                    ...prev,
                    [name]: processedValue,
                    description: '',
                    images: []
                }));
            }
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Step indicators component
    const StepIndicator = () => {
        const visibleSteps = isSellRequest ? [1, 2, 3] : [1];
        
        const stepTitles: Record<number, string> = {
            1: 'Basic Information',
            2: 'Description',
            3: 'Images'
        };
        
        return (
            <div className="flex mb-6 border-b sticky top-0 bg-white z-10 overflow-x-auto scrollbar-hide">
                {visibleSteps.map((stepNum, idx) => {
                    const title = stepTitles[stepNum];
                    const isVisited = visitedSteps.includes(stepNum);
                    const isCurrent = currentStep === stepNum;
                    
                    return (
                        <button
                            key={stepNum}
                            type="button"
                            onClick={() => isVisited && handleStepClick(stepNum)}
                            disabled={!isVisited}
                            className={`
                                flex-1 py-2.5 px-4 text-center transition-all duration-200 
                                text-sm font-medium whitespace-nowrap min-w-fit
                                ${isCurrent
                                    ? 'bg-opsh-primary text-white border-b-2 border-opsh-primary'
                                    : isVisited
                                        ? 'text-opsh-primary hover:bg-opsh-primary/5 border-b-2 border-transparent hover:border-opsh-primary/30 cursor-pointer'
                                        : 'text-gray-400 cursor-not-allowed border-b-2 border-transparent'
                                }
                                ${idx === 0 ? 'rounded-tl-md' : ''}
                                ${idx === visibleSteps.length - 1 ? 'rounded-tr-md' : ''}
                            `}
                        >
                            <span className="inline-flex items-center gap-2">
                                <span>{title}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const formContent = isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
            </div>
        </div>
    ) : (
        <form onSubmit={handleSubmit} className="space-y-6 min-h-[500px] flex flex-col justify-between">
            <div>
                {!isViewMode && <StepIndicator />}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                error={errors.name}
                                disabled={isViewMode}
                            />

                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                error={errors.email}
                                disabled={isViewMode}
                            />
                            
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    error={errors.phone}
                                    disabled={isViewMode}
                                />

                                <SelectField
                                    label="Request Type"
                                    name="inquiry_type_id"
                                    value={formData.inquiry_type_id?.toString() || ''}
                                    onChange={handleSelectChange}
                                    options={requestTypeOptions}
                                    required
                                    error={errors.inquiry_type_id}
                                    disabled={isViewMode}
                                />

                                <InputField
                                    label="Budget (NPR)"
                                    name="budget"
                                    type="number"
                                    value={formData.budget?.toString() || ''}
                                    onChange={handleChange}
                                    error={errors.budget}
                                    disabled={isViewMode}
                                />
                            </div>

                            <InputField
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                error={errors.location}
                                disabled={isViewMode}
                            />
                            
                            {isUpdateMode && (
                                <SelectField
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleSelectChange}
                                    options={statusOptions}
                                    disabled={isViewMode}
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opsh-primary"
                                disabled={isViewMode}
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Detailed Description - Only for sell requests */}
                {currentStep === 2 && isSellRequest && (
                    <div className="space-y-4">
                        <CkEditorSmall
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleDescriptionChange}
                            error={errors.description}
                            disabled={isViewMode}
                            placeholder="Enter detailed description for property sale..."
                        />
                    </div>
                )}

                {/* Step 3: Images - Only for sell requests */}
                {currentStep === 3 && isSellRequest && (
                    <div className="space-y-4">
                        {!isViewMode && (
                            <UploadImageField
                                name="images"
                                label="Upload Images"
                                onChange={handleImageChange}
                                value={formData.images.filter(img => img instanceof File)}
                                multiple={true}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Form Actions */}
            {!isViewMode && totalSteps > 1 && (
                <div className="flex justify-between mt-6">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="w-32 py-2 text-white bg-opsh-muted cursor-pointer flex items-center justify-center rounded hover:bg-opsh-darkgrey"
                        >
                            Back
                        </button>
                    )}
                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-32 py-2 text-white bg-opsh-primary cursor-pointer flex items-center justify-center rounded hover:bg-opsh-primary-hover ml-auto"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="w-32 py-2 text-white bg-opsh-success rounded hover:bg-opsh-success-hover ml-auto flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    Submitting
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </>
                            ) : 'Submit'}
                        </button>
                    )}
                </div>
            )}
            
            {/* Single step form (non-sell) */}
            {!isViewMode && totalSteps === 1 && (
                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        className="w-32 py-2 text-white bg-opsh-success rounded hover:bg-opsh-success-hover flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                Submitting
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </>
                        ) : 'Submit'}
                    </button>
                </div>
            )}
        </form>
    );

    const title = isViewMode ? "View Request Post" : (isUpdateMode ? "Update Request Post" : "Add Request Post");

    if (variant === 'page') {
        return (
            <section className="min-h-screen bg-opsh-background px-4 py-6 lg:px-0">
                <div className="mx-auto max-w-3xl rounded border border-opsh-grey bg-white shadow-opsh-sm">
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded border-b border-opsh-grey bg-white/95 px-5 py-4 backdrop-blur-sm">
                        <div>
                            <h1 className="mt-1 text-2xl font-semibold text-opsh-primary">{title}</h1>
                        </div>

                    </div>

                    <div className="px-4 py-5 md:px-6">{formContent}</div>
                </div>
            </section>
        );
    }

    return (
        <PopupModal
            isOpen={isOpenModel}
            onClose={handleClose}
            title={title}
            size="emd"
        >
            {formContent}
        </PopupModal>
    );
};

export default AddInqueryComponent;
