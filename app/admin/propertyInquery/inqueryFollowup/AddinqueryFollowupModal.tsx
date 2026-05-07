import React, { useEffect, useMemo, useState } from "react";
import PopupModal from "@/components/modal/PopupModal";
import useInquestFollowupStore from "@/stores/InqueryFollowupStore";
import toast from "react-hot-toast";
import {
    InputField,
    SelectField,
} from '@/components/inputField/InputField';

interface InquestFollowupFormData {
    inquiry_id?: number | null;
    admin_id?: number | null;
    contact_method_id?: number | null;
    followup_status_id?: number | null;
    message: string;
    next_followup_date: string;
    status?: string;
}

const buildInitialFormData = (inquiryId?: number | null): InquestFollowupFormData => ({
    inquiry_id: inquiryId || null,
    admin_id: null,
    contact_method_id: null,
    followup_status_id: null,
    message: '',
    next_followup_date: '',
    status: 'pending'
});

interface AddinqueryFollowupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    id?: string | number | null;
    inquiryId?: number | null;
    inquiryName?: string | null;
    type?: 'create' | 'update' | 'view';
}

const AddinqueryFollowupModal: React.FC<AddinqueryFollowupModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    id,
    inquiryId,
    inquiryName,
    type = 'create'
}) => {
    const initialFormData = useMemo(() => buildInitialFormData(inquiryId), [inquiryId]);

    const { getInquestFollow, createInquestFollow, updateInquestFollow } = useInquestFollowupStore();
    
    const [isOpenModel, setIsOpenModel] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<InquestFollowupFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isViewMode = type === 'view';
    const isUpdateMode = type === 'update';

    // Update formData when inquiryId changes
    useEffect(() => {
        if (inquiryId) {
            setFormData(prev => ({ ...prev, inquiry_id: inquiryId }));
        }
    }, [inquiryId]);

    // Load data when editing/viewing
    useEffect(() => {
        const loadPostData = async () => {
            if (isOpenModel && id && (isUpdateMode || isViewMode)) {
                setIsLoading(true);
                try {
                    // ✅ FIXED: Only pass id, not inqueryId
                    if (!inquiryId) {
                        throw new Error('Inquiry ID is required');
                    }

                    const response = await getInquestFollow(inquiryId, Number(id));

                    if (response) {
                        const apiData = response;

                        setFormData({
                            inquiry_id: inquiryId || apiData.inquiry_id || null,
                            admin_id: apiData.admin_id || null,
                            contact_method_id: apiData.contact_method_id || null,
                            followup_status_id: apiData.followup_status_id || null,
                            message: apiData.message || '',
                            next_followup_date: apiData.next_followup_date || '',
                            status: apiData.status || 'pending'
                        });
                    }
                } catch (error) {
                    console.error('Fetch error:', error);
                    toast.error("Failed to fetch request post");
                } finally {
                    setIsLoading(false);
                }
            } else if (isOpenModel && !id) {
                // For new records, set the inquiry_id from props
                setFormData({
                    ...initialFormData,
                    inquiry_id: inquiryId || null
                });
                setIsLoading(false);
            }
        };

        loadPostData();
    }, [isOpenModel, id, isUpdateMode, isViewMode, getInquestFollow, inquiryId, initialFormData]);

    useEffect(() => {
        setIsOpenModel(isOpen);
    }, [isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        let finalValue: string | number | null = value;

        // Handle number conversions
        if (name === 'inquiry_id' || name === 'admin_id' || name === 'contact_method_id' || name === 'followup_status_id') {
            finalValue = value === '' ? null : Number(value);
        }

        if (name === 'next_followup_date') {
            finalValue = value;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (e: { target: { name: string; value: string | null } }) => {
        const { name, value } = e.target;

        let finalValue: string | number | null = value;
        if (
            name === 'inquiry_id' ||
            name === 'admin_id' ||
            name === 'contact_method_id' ||
            name === 'followup_status_id'
        ) {
            finalValue = value === null || value === '' ? null : Number(value);
        }

        setFormData((prev) => ({ ...prev, [name]: finalValue }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.inquiry_id) newErrors.inquiry_id = 'Inquiry ID is required';
        if (!formData.message) newErrors.message = 'Message is required';
        if (!formData.next_followup_date) newErrors.next_followup_date = 'Next Followup Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isViewMode) return;
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();

            // Add inquiry_id to form data
            if (formData.inquiry_id) {
                submitData.append('inquiry_id', formData.inquiry_id.toString());
            } else if (inquiryId) {
                submitData.append('inquiry_id', inquiryId.toString());
            }

            if (formData.admin_id) submitData.append('admin_id', String(formData.admin_id));
            if (formData.contact_method_id) submitData.append('contact_method_id', String(formData.contact_method_id));
            if (formData.followup_status_id) submitData.append('followup_status_id', String(formData.followup_status_id));
            
            submitData.append('message', formData.message);
            submitData.append('next_followup_date', formData.next_followup_date);
            
            if (formData.status) {
                submitData.append('status', formData.status);
            }

            if (isUpdateMode && id) {
                // ✅ FIXED: Pass id and formData
                if (!inquiryId) {
                    throw new Error('Inquiry ID is required');
                }

                await updateInquestFollow(inquiryId, Number(id), submitData);
                toast.success('Request post updated successfully!');
            } else {
                // ✅ FIXED: Only pass formData, not inquiryId separately
                if (!inquiryId) {
                    throw new Error('Inquiry ID is required');
                }

                await createInquestFollow(inquiryId, submitData);
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
            inquiry_id: inquiryId || null
        });
        setErrors({});
        onClose();
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
    ];

    const contactMethodOptions = [
        { value: '1', label: 'Phone Call' },
        { value: '2', label: 'Email' },
        { value: '3', label: 'SMS' },
        { value: '4', label: 'WhatsApp' },
        { value: '5', label: 'In Person' }
    ];

    const followupStatusOptions = [
        { value: '1', label: 'Pending' },
        { value: '2', label: 'Completed' },
        { value: '3', label: 'Scheduled' },
        { value: '4', label: 'Cancelled' },
        { value: '5', label: 'Rescheduled' }
    ];

    return (
        <PopupModal
            isOpen={isOpenModel}
            onClose={handleClose}
            title={
                isViewMode 
                    ? `View Followup${inquiryName ? ` for ${inquiryName}` : ''}` 
                    : (isUpdateMode 
                        ? `Update Followup${inquiryName ? ` for ${inquiryName}` : ''}` 
                        : `Add Followup${inquiryName ? ` for ${inquiryName}` : ''}`)
            }
            size="esm"
        >
            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {inquiryName && (
                            <div className="bg-blue-50 p-3 rounded-md mb-4">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Inquiry:</span> {inquiryName}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Admin ID"
                                name="admin_id"
                                type="number"
                                value={formData.admin_id?.toString() || ''}
                                onChange={handleChange}
                                error={errors.admin_id}
                                disabled={isViewMode}
                            />

                            <SelectField
                                label="Contact Method"
                                name="contact_method_id"
                                value={formData.contact_method_id?.toString() || ''}
                                onChange={handleSelectChange}
                                options={contactMethodOptions}
                                error={errors.contact_method_id}
                                disabled={isViewMode}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Followup Status"
                                name="followup_status_id"
                                value={formData.followup_status_id?.toString() || ''}
                                onChange={handleSelectChange}
                                options={followupStatusOptions}
                                error={errors.followup_status_id}
                                disabled={isViewMode}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opsh-primary ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isViewMode}
                                placeholder="Enter your message or inquiry details..."
                                required
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Next Followup Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="next_followup_date"
                                value={formData.next_followup_date}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opsh-primary ${
                                    errors.next_followup_date ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isViewMode}
                                required
                            />
                            {errors.next_followup_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.next_followup_date}</p>
                            )}
                        </div>

                        {isUpdateMode && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Status"
                                    name="status"
                                    value={formData.status || 'pending'}
                                    onChange={handleSelectChange}
                                    options={statusOptions}
                                    disabled={isViewMode}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        {!isViewMode && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-opsh-primary rounded-md hover:bg-opsh-primary-hover disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <span>Saving...</span>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        </>
                                    ) : (
                                        isUpdateMode ? 'Update Request' : 'Submit Request'
                                    )}
                                </button>
                            </>
                        )}

                        {isViewMode && (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-white bg-opsh-primary rounded-md hover:bg-opsh-primary-hover"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </form>
            )}
        </PopupModal>
    );
};

export default AddinqueryFollowupModal;
