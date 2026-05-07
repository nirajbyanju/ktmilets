import { FC, useMemo } from "react";
import ReactSelect, { SingleValue, type StylesConfig } from "react-select";

interface SelectProps {
    onChange: (selectedId: string | null) => void;
    selected?: string | number | null;
    name?: string;
    data: Array<{
        id?: string | number;
        label: string;
    }>;
    value?: { id: string | number | null; label: string };
}

interface Option {
    value: string;
    label: string;
}

const selectStyles: StylesConfig<Option, false> = {
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

const Select: FC<SelectProps> = ({ onChange, selected, name, data, value }) => {
    const options = useMemo(
        () =>
            data.map((item) => ({
            value: item.id?.toString() || "",
            label: item.label,
        })),
        [data]
    );

    const selectedOption = useMemo(() => {
        const selectedValue = selected ?? value?.id;

        if (selectedValue === undefined || selectedValue === null || selectedValue === "") {
            return null;
        }

        return options.find((option) => option.value === selectedValue.toString()) ?? null;
    }, [options, selected, value]);

    const handleChange = (option: SingleValue<Option>) => {
        onChange(option?.value ?? null);
    };

    const noOptionsMessage = "No matching options available.";

    return (
        <div>
            {options.length === 0 ? (
                <p>{noOptionsMessage}</p>
            ) : (
                <ReactSelect
                    name={name}
                    options={options}
                    onChange={handleChange}
                    value={selectedOption}
                    isClearable
                    styles={selectStyles}
                />
            )}
        </div>
    );
};

export default Select;
