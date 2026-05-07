import { useOptions } from '@/hooks/useOptions';

interface OptionSelectProps {
    type: string;
    value?: string | number;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function OptionSelect({ 
    type, 
    value, 
    onChange, 
    label,
    placeholder = 'Select...',
    required = false,
    error = ''
}: OptionSelectProps) {

    const { data: options, loading } = useOptions(type);

    if (loading) {
        return (
            <div className="space-y-2">
                {label && <label className="block text-sm font-medium">{label}</label>}
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{placeholder}</option>

                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label || option.name}
                    </option>
                ))}
            </select>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}