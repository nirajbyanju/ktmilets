// import ReactSelect, { SingleValue } from "react-select";
// import { useEffect, useState, forwardRef } from "react";
// import { getDropDown } from "@/apis/auth/menu.api";
// interface SelectFieldProps {
//   label?: string;
//   onChange: (e: { target: { id: string | null; label: string | null } }) => void;
//   onBlur?: () => void;
//   name?: string;
//   filters?: string; // API filter parameter
//   value?: string | number;
//   required?: boolean;
//   className?: string;
//   helpText?: string;
//   error?: string;
//   defaultOption?: string;
//   disabled?: boolean;
//   isClearable?: boolean;
//   placeholder?: string;
// }

// interface SelectOption {
//   id: string;
//   label: string;
// }

// const Select = forwardRef<any, SelectFieldProps>(
//   (
//     {
//       label,
//       name,
//       onChange,
//       onBlur,
//       value,
//       filters,
//       required = false,
//       className = "",
//       helpText = "",
//       error,
//       defaultOption = "Select an option",
//       disabled = false,
//       isClearable = true,
//       placeholder,
//     },
//     ref
//   ) => {
//     const [internalOptions, setInternalOptions] = useState<SelectOption[]>([]);
//     const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
//     const [loading, setLoading] = useState<boolean>(false);

//     const fetchDropDown = async (filters?: string) => {
//       try {
//         setLoading(true);
//         const response = await getDropDown(filters || "");
//         // Normalize response in case API returns different field names
//         const options: SelectOption[] = ((response as any).data || []).map((item: any) => ({
//           id: String(item.id),
//           label: item.label || item.name || String(item.id), // fallback if label missing
//         }));
//         setInternalOptions(options);
//       } catch (error) {
//         console.error("Dropdown fetch failed:", error);
//         setInternalOptions([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     useEffect(() => {
//       fetchDropDown(filters);
//     }, [filters]);

//     useEffect(() => {
//       const stringValue = value?.toString();
//       const option = internalOptions.find(opt => opt.id === stringValue);
//       setSelectedOption(option || null);
//     }, [value, internalOptions]);

//     const handleChange = (option: SingleValue<SelectOption>) => {
//       setSelectedOption(option || null);
//       onChange({
//         target: {
//           id: option?.id ?? null,
//           label: option?.label ?? null,
//         },
//       });
//     };

//     const noOptionsMessage = () => (loading ? "Loading..." : "No options available");

//     return (
//       <div className={className}>
//         {label && (
//           <div className="flex justify-between items-center mb-1">
//             <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//               {label} {required && <span className="text-red-500">*</span>}
//             </label>
//             {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
//           </div>
//         )}

//         <ReactSelect
//           ref={ref}
//           name={name}
//           options={internalOptions}
//           getOptionLabel={(opt) => opt.label}
//           getOptionValue={(opt) => opt.id}
//           onChange={handleChange}
//           onBlur={onBlur}
//           value={selectedOption}
//           isClearable={isClearable}
//           isDisabled={disabled || loading}
//           placeholder={placeholder || defaultOption}
//           noOptionsMessage={noOptionsMessage}
//           isLoading={loading}
//           aria-invalid={!!error}
//           aria-describedby={error ? `${name}-error` : undefined}
//           classNamePrefix="react-select"
//           className={`react-select-container ${error ? "border-red-500" : ""}`}
//           styles={{
//             control: (base) => ({
//               ...base,
//               borderColor: error ? "#ef4444" : base.borderColor,
//               "&:hover": {
//                 borderColor: error ? "#ef4444" : base.borderColor,
//               },
//               minHeight: "38px",
//             }),
//           }}
//         />

//         {error && (
//           <p className="mt-1 text-xs text-red-600" id={`${name}-error`}>
//             {error}
//           </p>
//         )}
//       </div>
//     );
//   }
// );

// Select.displayName = "Select";

// export { Select };
