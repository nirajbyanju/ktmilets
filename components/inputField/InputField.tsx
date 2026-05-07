import React, { ChangeEvent, FocusEvent, useMemo } from 'react';
import CkEditors from "@/components/ckEditors/CKEditorSmall";
import ReactSelect, { SingleValue, type SelectInstance } from "react-select";
import { forwardRef } from "react";

type FormFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  helpText?: string;
  disabled?: boolean;
};

type InputFieldProps = FormFieldProps & {
  type?: 'text' | 'number' | 'email' | 'password' | 'url' | 'date' | 'time';
  placeholder?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  pattern?: string;
  maxLength?: number;
  wordCount?: boolean;
  data?: unknown;

};

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      required = false,
      placeholder = '',
      className = '',
      helpText = '',
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={` ${className}`}>
        <div className="flex justify-between items-center">
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
        </div>
        <input
          ref={ref}
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={`${name}-help`}
          className={`w-full bg-white px-4 py-[0.335rem] border rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${error
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          {...props}
        />
        {error && (
          <span className="block h-3 text-xs text-red-600">
            <p
              className="text-xs text-red-600"
              id={`${name}-error`}
            >
              {error}
            </p>
          </span>
        )}

      </div>
    );
  }
);

InputField.displayName = 'InputField';

type TextareaFieldProps = FormFieldProps & {
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
};

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      name,
      required = false,
      placeholder = '',
      rows = 3,
      className = '',
      helpText = '',
      value,
      onChange,
      onBlur,
      error,
      maxLength,
      showCharacterCount = true,
      disabled = false,
    },
    ref
  ) => {
    const characterCount = value?.length || 0;

    return (
      <div className={`${className}`}>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {maxLength && showCharacterCount && (
            <span
              className={`text-xs ${characterCount > maxLength ? 'text-red-500' : 'text-gray-500'
                }`}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={`${name}-help`}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${error
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />
        {helpText && (
          <p className="mt-1 text-xs text-gray-500" id={`${name}-help`}>
            {helpText}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

type CheckboxFieldProps = Omit<FormFieldProps, 'label'> & {
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  label: React.ReactNode;
  indeterminate?: boolean;
};

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      label,
      name,
      className = '',
      helpText = '',
      checked = false,
      onChange,
      onBlur,
      error,
      disabled = false,
      indeterminate = false,
      required = false,
    },
    ref
  ) => {
    return (
      <div className={`${className}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={(el) => {
                if (el && ref) {
                  if (typeof ref === 'function') {
                    ref(el);
                  } else {
                    ref.current = el;
                  }
                }
                if (el) {
                  el.indeterminate = indeterminate;
                }
              }}
              type="checkbox"
              id={name}
              name={name}
              checked={checked}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={`${name}-help`}
              className={`h-4 w-4 rounded ${error
                ? 'text-red-600 border-red-300 focus:ring-red-200'
                : 'text-blue-600 border-gray-300 focus:ring-blue-200'
                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor={name}
              className={`font-medium ${error ? 'text-red-600' : 'text-gray-700'
                } ${disabled ? 'text-gray-400' : ''}`}
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {helpText && (
              <p
                className={`text-xs h-4 ${error ? 'text-red-500' : 'text-gray-500'}`}
                id={`${name}-help`}
              >
                {helpText}
              </p>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-1 h-4 text-xs text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  className?: string;
  onStepClick?: (step: number) => void;
  clickableSteps?: boolean;
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  className = '',
  onStepClick,
  clickableSteps = false,
}) => {
  const handleStepClick = (step: number) => {
    if (clickableSteps && onStepClick && step < currentStep) {
      onStepClick(step);
    }
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          ></div>
        </div>

        {stepLabels.map((label, i) => {
          const stepNumber = i + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isClickable = clickableSteps && stepNumber < currentStep;

          return (
            <div
              key={i}
              className="flex flex-col items-center"
              onClick={() => handleStepClick(stepNumber)}
            >
              <button
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                  ? 'bg-green-500 text-white shadow-md'
                  : isActive
                    ? 'bg-blue-600 text-white border-4 border-blue-300 shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                  } ${isClickable ? 'cursor-pointer hover:bg-blue-500' : 'cursor-default'}`}
                aria-label={`Step ${stepNumber}: ${label}`}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </button>
              <span
                className={`text-xs font-medium text-center transition-colors duration-200 ${isActive
                  ? 'text-blue-600 font-bold'
                  : isCompleted
                    ? 'text-gray-600'
                    : 'text-gray-400'
                  }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export const CkEditorsField = React.forwardRef<HTMLDivElement, InputFieldProps>(
  (
    {
      label,
      name,
      required = false,
      placeholder = '',
      className = '',
      helpText = '',
      value = '',
      onChange,
      onBlur,
      error,
      disabled = false,
      maxLength,
      wordCount
    },
    ref
  ) => {
    const handleChange = (content: string) => {
      onChange?.({
        target: {
          name,
          value: content,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleBlur = (fieldName: string, fieldValue: string) => {
      onBlur?.({
        target: {
          name: fieldName,
          value: fieldValue,
        },
      } as React.FocusEvent<HTMLInputElement>);
    };

    return (
      <div className={`${className}`} ref={ref}>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
        </div>
        {error && (
          <p className="mt-1 text-xs h-4 text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

CkEditorsField.displayName = 'CkEditorsField';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  onChange: (e: { target: { name: string; value: string | null } }) => void;
  onBlur?: () => void;
  selected?: string | number;
  name?: string;
  options: Array<{
    id?: string | number;
    value?: string;
    label: string;
  }>;
  value?: string;
  required?: boolean;
  className?: string;
  helpText?: string;
  error?: string;
  defaultOption?: string;
  disabled?: boolean;
  isClearable?: boolean;
  placeholder?: string;
}

const SelectField = forwardRef<SelectInstance<SelectOption, false>, SelectFieldProps>(
  (
    {
      label,
      name,
      onChange,
      onBlur,
      selected,
      options: propOptions,
      value,
      required = false,
      className = '',
      helpText = '',
      error,
      defaultOption = 'Select an option',
      disabled = false,
      isClearable = true,
      placeholder,
    },
    ref
  ) => {
    const internalOptions = useMemo(
      () =>
        propOptions.map((item) => ({
        value: item.id?.toString() || item.value || '',
        label: item.label,
      })),
      [propOptions]
    );
    const selectedValue = value ?? selected?.toString();
    const selectedOption = useMemo(() => {
      if (!selectedValue) {
        return null;
      }

      return (
        internalOptions.find((option) => option.value === selectedValue) ?? null
      );
    }, [internalOptions, selectedValue]);
    const menuPortalTarget = typeof document !== 'undefined' ? document.body : undefined;

    const handleChange = (option: SingleValue<SelectOption>) => {
      const newValue = option?.value ?? null;
      onChange({
        target: {
          name: name || '',
          value: newValue,
        },
      });

    };

    const noOptionsMessage = () => "No options available";
    const loadingMessage = () => "Loading...";

    return (
      <div className={`${className}`}>
        {label && (
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
          </div>
        )}

        <ReactSelect
          ref={ref}
          name={name}
          options={internalOptions}
          onChange={handleChange}
          onBlur={onBlur}
          value={selectedOption}
          isClearable={isClearable}
          isDisabled={disabled || internalOptions.length === 0}
          placeholder={placeholder || defaultOption}
          noOptionsMessage={noOptionsMessage}
          loadingMessage={loadingMessage}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          classNamePrefix="react-select"
          className={`react-select-container ${error ? 'border-red-500' : ''}`}
          menuPortalTarget={menuPortalTarget ?? undefined}
          menuPosition="fixed"
          menuPlacement="auto"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              borderColor: error ? '#ef4444' : base.borderColor,
              '&:hover': {
                borderColor: error ? '#ef4444' : base.borderColor,
              },
              minHeight: '38px',
            }),
            valueContainer: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              zIndex: 99999,
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? '#f4f5f7'
                : state.isSelected
                  ? '#e8f1f0'
                  : '#ffffff',
              color: '#424242',
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 99999,
            }),
          }}
        />

        {error && (
          <p className="mt-1 text-xs text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

export { SelectField };
export default CkEditorsField;
