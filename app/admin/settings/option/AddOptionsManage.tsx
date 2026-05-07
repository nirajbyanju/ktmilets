'use client';

import {
    InputField,
    SelectField,
} from '@/components/inputField/InputField';
import { toast } from "react-toastify";
import PopupModal from '@/components/modal/PopupModal';
import { OptionsManagers } from '@/types/setting/optionsManager/OptionsManager';
import DataLoader from '@/components/loader/DataLoader';
import useOptionsManagerStore from "@/stores/setting/optioonsManager/optionsManager";
import { useState, useEffect, useCallback } from 'react';

interface FormData {
    label: string;
    slug: string;
    isStatus: any;
    dropdownfor: string;
    parentId: string;
}

const isStatus = [
    { id: 1, label: " Active" },
    { id: 0, label: "InActive" },
];

interface FormErrors {
    [key: string]: string;
}

interface AddVacancyProps {
    onSuccess: () => void;
    onClose: () => void;
    onOpen?: boolean;
    type?: string | null;
    id?: number | null;
    model?: string | null;
}

interface BasicInfoStepProps {
    formData: FormData;
    errors: FormErrors;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSelectChange: (name: string, value: number | string | null) => void;
    readOnly?: boolean;
    model?: string | null;
    category?: any;
}

const initialFormData: FormData = {
    label: '',
    slug: '',
    isStatus: 0,
    dropdownfor: '',
    parentId: '',
};

const validateFormData = (formData: FormData, step: number): FormErrors => {
    const errors: FormErrors = {};

    if (step === 1) {
        if (!formData.label.trim()) errors.label = 'Label is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        if (formData.isStatus === null) errors.isStatus = 'Status is required';
    }
    return errors;
};

const StepIndicator = ({
    currentStep,
    stepTitles,
    onStepClick,
    visitedSteps
}: {
    currentStep: number;
    stepTitles: string[];
    onStepClick: (step: number) => void;
    visitedSteps: number[];
}) => (
    <div className="flex mb-4">
        {stepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isCompleted = visitedSteps.includes(stepNumber) && stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isAccessible = visitedSteps.includes(stepNumber) || stepNumber === currentStep + 1;

            return (
                <button
                    key={index}
                    type="button"
                    className={`flex-1 text-center py-2 border-b-2 transition-colors ${isCurrent
                        ? 'border-opsh-primary text-opsh-primary font-medium'
                        : isCompleted
                            ? 'border-green-500 text-green-600 cursor-pointer'
                            : 'border-gray-200 text-gray-500'
                        } ${isAccessible ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'}`}
                    onClick={() => isAccessible && onStepClick(stepNumber)}
                    disabled={!isAccessible}
                >
                    <div className="flex items-center justify-center">
                        {isCompleted ? (
                            <svg className="w-5 h-5 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold mr-1 ${isCurrent ? 'bg-opsh-primary text-white' : 'bg-gray-200'
                                }`}>
                                {stepNumber}
                            </span>
                        )}
                        {title}
                    </div>
                </button>
            );
        })}
    </div>
);

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, errors, handleChange, handleSelectChange, readOnly, model, category }) => (
    <>
        <InputField
            label="Data Label"
            name="label"
            value={formData.label}
            required
            onChange={handleChange}
            placeholder="Enter Label"
            error={errors.label}
            disabled={readOnly}
        />
        <InputField
            label="Data Slug"
            name="slug"
            value={formData.slug}
            required
            onChange={handleChange}
            placeholder="Enter Slug"
            error={errors.slug}
            disabled={readOnly}
        />
        <SelectField
            label="Status"
            name="isStatus"
            options={isStatus}
            onChange={(e) => !readOnly && handleSelectChange('isStatus', Number(e.target.value))}
            value={formData.isStatus?.toString() || ''}
            error={errors.isStatus}
            disabled={readOnly}
        />
        {model == 'Category' && (
            <SelectField
                label="Category"
                name="parentId"
                options={category}
                onChange={(e) => !readOnly && handleSelectChange('parentId', e.target.value)}
                value={formData.parentId || ''}
                error={errors.parentId}
                disabled={readOnly}
            />
        )}
    </>
);

const AddOptionsManage: React.FC<AddVacancyProps> = ({ onSuccess, onClose, onOpen = false, type = null, id = null, model = null }) => {
    const [isOpenModel, setIsOpenModel] = useState(onOpen);
    const [currentStep, setCurrentStep] = useState(1);
    const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const { createOptionsManager, getOptionsManager, updateOptionsManager } = useOptionsManagerStore();
    const [responseData, setResponseData] = useState<OptionsManagers | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(false);
    
    const isViewMode = type === 'view';
    const isUpdateMode = type === 'update';

    useEffect(() => {
        setIsOpenModel(onOpen);
    }, [onOpen]);

    const fetchVacancy = useCallback(async () => {
        try {
            if (!id) return;
            setIsDataLoading(true);
            const numericId = Number(id);
            const payload = {
                dropdownfor: model,
            };
            const response = await getOptionsManager(numericId, payload);
            setResponseData((response as any).data);
        } catch (error) {
            toast.error("Failed to fetch vacancy");
        } finally {
            setIsDataLoading(false);
        }
    }, [id, model, getOptionsManager]);

    useEffect(() => {
        if (!id || !type) return;

        setFormData(initialFormData);
        setErrors({});
        setCurrentStep(1);
        setVisitedSteps([1]);
        setResponseData(null);

        if (type === "update" || type === "view") {
            fetchVacancy();
        }
    }, [id, type, fetchVacancy]);

    useEffect(() => {
        if (responseData) {
            setFormData({
                label: responseData.label ?? '',
                slug: responseData.slug ?? '',
                isStatus: responseData.isStatus ?? null,
                dropdownfor: formData.dropdownfor ?? '',
                parentId: formData.parentId ?? '',
            });
            setErrors({});
            setVisitedSteps([1, 2, 3]);
            setCurrentStep(1);
        }
    }, [responseData, formData.dropdownfor]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, type, value } = e.target;
        let finalValue: any = value;

        if (type === 'number') {
            finalValue = value === '' ? null : Number(value);
        } else if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name: string, value: number | string | null) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleStepClick = (step: number) => {
        const maxAccessibleStep = Math.max(...visitedSteps);

        if (step <= maxAccessibleStep + 1) {
            if (step > currentStep) {
                const currentStepErrors = validateFormData(formData, currentStep);
                if (Object.keys(currentStepErrors).length > 0) {
                    setErrors(currentStepErrors);
                    const firstErrorField = Object.keys(currentStepErrors)[0];
                    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                    errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
            }

            if (!visitedSteps.includes(step) && step <= currentStep + 1) {
                setVisitedSteps(prev => [...prev, step]);
            }

            setCurrentStep(step);
            setErrors({});
        }
    };

    const handleNext = () => {
        const stepErrors = validateFormData(formData, currentStep);

        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            const firstErrorField = Object.keys(stepErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (!visitedSteps.includes(currentStep + 1)) {
            setVisitedSteps(prev => [...prev, currentStep + 1]);
        }

        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isViewMode) return;

        const finalErrors = validateFormData(formData, 1);
        if (Object.keys(finalErrors).length > 0) {
            setErrors(finalErrors);
            toast.error("Please fix the errors before submitting");
            return;
        }

        setIsLoading(true);
        try {
            console.log('data', formData);
            const payload = {
                ...formData,
                isStatus: formData.isStatus,
                dropdownfor: model,
            };

            if (isUpdateMode && id) {
                await updateOptionsManager(Number(id), payload as any);
                toast.success('Vacancy updated successfully!');
            } else {
                await createOptionsManager(payload as any);
                toast.success('Vacancy created successfully!');
            }

            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || (isUpdateMode ? 'Failed to update vacancy' : 'Failed to create vacancy');
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpenModel(false);
        setFormData(initialFormData);
        setErrors({});
        setCurrentStep(1);
        setVisitedSteps([1]);
        onClose();
    };

    const stepTitles = ['Basic Information'];

    return (
        <PopupModal
            isOpen={isOpenModel}
            onClose={handleClose}
            title={isViewMode ? "View Vacancy" : (isUpdateMode ? "Update Vacancy" : "Add Option")}
            size="emd"
        >
            {isDataLoading ? (
                <div className="flex items-center justify-center">
                    <DataLoader />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="vacancy-form" noValidate>
                    <StepIndicator
                        currentStep={currentStep}
                        stepTitles={stepTitles}
                        onStepClick={handleStepClick}
                        visitedSteps={visitedSteps}
                    />
                    
                    <div className="overflow-y-auto max-h-[60vh] mt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                        {currentStep === 1 && (
                            <BasicInfoStep
                                formData={formData}
                                errors={errors}
                                handleChange={handleChange}
                                handleSelectChange={handleSelectChange}
                                readOnly={isViewMode}
                                model={model}
                            />
                        )}
                    </div>

                    <div className="flex justify-between mt-6">
                        {currentStep > 1 && (
                            <button 
                                type="button" 
                                onClick={handleBack} 
                                className="w-32 py-2 text-white bg-opsh-muted cursor-pointer flex items-center justify-center rounded hover:bg-opsh-darkgrey"
                            >
                                Back
                            </button>
                        )}
                        
                        {currentStep < 1 ? (
                            <button 
                                type="button" 
                                onClick={handleNext} 
                                className="w-32 py-2 text-white bg-opsh-primary cursor-pointer flex items-center justify-center rounded hover:bg-opsh-fourth ml-auto"
                            >
                                Next
                            </button>
                        ) : (
                            !isViewMode && (
                                <button
                                    type="submit"
                                    className="w-32 py-2 text-white bg-opsh-success rounded hover:bg-green-700 ml-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            )
                        )}
                    </div>
                </form>
            )}
        </PopupModal>
    );
};

export default AddOptionsManage;