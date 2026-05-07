import { FC, useMemo } from "react";
import ReactSelect, { MultiValue, type StylesConfig } from "react-select";

interface SelectProps {
    onChange: (selectedIds: string) => void; // String for formatted output
    selected?: string; // String of selected values like "1,2"
    name?: string;
    data?: Array<{
        id?: string | number;
        value?: string | number;
        label: string;
    }>; // Optional data
}

interface Option {
    value: string;
    label: string;
}

const selectStyles: StylesConfig<Option, true> = {
    control: (base) => ({
        ...base,
        backgroundColor: "#ffffff",
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: "#ffffff",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#f4f5f7" : "#ffffff",
        color: "#424242",
    }),
};

const MultipleSelectWithReorder: FC<SelectProps> = ({
    onChange,
    selected = "",
    name,
    data = [],
}) => {
    const options = useMemo(
        () =>
            data
                .map((item) => ({
            value: item.value?.toString() || item.id?.toString() || "",
            label: item.label || "Unknown", // Fallback label if missing
                }))
                .filter((item) => item.value !== ""),
        [data]
    );

    const selectedOptions = useMemo(() => {
        if (selected && options.length > 0) {
            const selectedIds = selected.split(",").map((id) => id.trim()); // Parse selected string into an array
            return options.filter((option) =>
                selectedIds.includes(option.value)
            );
        }

        return [];
    }, [selected, options]);

    const handleChange = (options: MultiValue<Option>) => {
        const selectedValues = options.map((option) => option.value);
        onChange(selectedValues.join(",")); // Join values into a stable formatted string
    };

    return (
        <div>
            <ReactSelect
                name={name}
                options={options}
                onChange={handleChange}
                value={selectedOptions} // Set value to selectedOptions for display
                isClearable
                isMulti
                placeholder="Select options..."
                noOptionsMessage={() => "No options available"}
                styles={selectStyles}
            />
        </div>
    );
};

export default MultipleSelectWithReorder;
