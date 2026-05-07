import React, { forwardRef, useRef, useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/material_green.css';

// Update the FlatpickrInstance type to match the actual structure
type FlatpickrInstance = {
  flatpickr: any; // The actual flatpickr instance
  input: HTMLInputElement; // The input element
  selectedDates: Date[];
  setDate: (date: Date | Date[] | string, triggerChange?: boolean, format?: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  destroy: () => void;
  formatDate: (date: Date, format: string) => string;
  jumpToDate: (date: Date) => void;
  redraw: () => void;
  set: (options: any, triggerChange?: boolean) => void;
  toggle: () => void;
  config: any;
  [key: string]: any;
};

interface DatepickerProps {
  name?: string;
  label?: string;
  value?: string;
  selectedDate?: string;
  onChange: (date: Date | string | null) => void;
  placeholder?: string;
  placeholderText?: string;
  className?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  dateFormat?: string;
  enableTime?: boolean;
  minDate?: Date | string;
  maxDate?: Date | string;
  required?: boolean;
  // Spread the rest of the props directly to Flatpickr
  [key: string]: any;
}

const Datepicker = forwardRef<HTMLInputElement, DatepickerProps>((props, ref) => {
  const {
    name,
    label,
    value,
    selectedDate,
    onChange,
    placeholder,
    placeholderText,
    className = "",
    helpText,
    error,
    disabled = false,
    id,
    dateFormat = "Y-m-d",
    enableTime = false,
    minDate,
    maxDate,
    required = false,
    ...rest // This will include any flatpickr options passed as props
  } = props;

  const initialValue = value !== undefined ? value : selectedDate;
  const fp = useRef<any>(null); // Use any type for the flatpickr ref
  const [internalDate, setInternalDate] = useState<string>(initialValue || "");
  const inputId = id || name || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (initialValue !== undefined) {
      setInternalDate(initialValue);
    }
  }, [initialValue]);

  // Build options from props instead of using an options object
  const flatpickrOptions = {
    dateFormat,
    enableTime,
    minDate: minDate || undefined,
    maxDate: maxDate || undefined,
    disableMobile: true,
    allowInput: true,
    altInput: true,
    altFormat: enableTime ? "F j, Y at h:i K" : "F j, Y",
  };

  const handleDateChange = (selectedDates: Date[]) => {
    if (selectedDates.length > 0) {
      const dateStr = enableTime 
        ? selectedDates[0].toISOString() 
        : selectedDates[0].toISOString().split('T')[0];
      
      setInternalDate(dateStr);
      onChange(selectedDates[0]);
    } else {
      setInternalDate("");
      onChange(null);
    }
  };

  const handleClear = () => {
    setInternalDate("");
    onChange(null);
    if (fp.current) {
      fp.current.clear();
    }
  };

  const actualPlaceholder = placeholder || placeholderText || "Select date";

  return (
    <div className="datepicker-wrapper">
      {label && (
        <label htmlFor={inputId} className="datepicker-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      
      <div className="datepicker-input-wrapper">
        <Flatpickr
          {...rest} // Spread any additional props directly to Flatpickr
          value={internalDate}
          options={flatpickrOptions}
          onChange={handleDateChange}
          placeholder={actualPlaceholder}
          disabled={disabled}
          name={name}
          id={inputId}
          className={`datepicker-input ${className} ${error ? 'error' : ''}`}
          render={({ defaultValue, value, ...props }, ref) => {
            return <input {...props} ref={ref} />;
          }}
        />
        
        {internalDate && !disabled && (
          <button
            type="button"
            className="datepicker-clear"
            onClick={handleClear}
            aria-label="Clear date"
          >
            ×
          </button>
        )}
      </div>
      
      {helpText && !error && (
        <div className="datepicker-helptext">{helpText}</div>
      )}
      
      {error && (
        <div className="datepicker-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

Datepicker.displayName = 'Datepicker';

export default Datepicker;