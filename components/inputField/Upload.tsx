import React, {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  useEffect,
  useId,
  useState,
} from 'react';

type FormFieldProps = {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  helpText?: string;
  disabled?: boolean;
};

// Props for single image upload
type SingleImageFieldProps = FormFieldProps & {
  value: string | File | null | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  sizeType?: 'cover' | 'thumbnail';
  maxSize?: number;
  multiple?: false; // Can't be true for this type
};

// Props for multiple image upload
type MultipleImageFieldProps = FormFieldProps & {
  value: (string | File)[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  sizeType?: 'cover' | 'thumbnail';
  maxSize?: number;
  multiple: true; // Must be true for this type
};

// Union type for both possibilities
type InputFieldProps = SingleImageFieldProps | MultipleImageFieldProps;

interface UploadPhotoProps {
  onUpload: (file: File | null) => void;
  preview?: string | null;
  sizeType?: 'cover' | 'thumbnail';
  maxSize?: number;
}

interface MultipleUploadPhotoProps {
  onUpload: (files: File[]) => void;
  previews: string[];
  onRemove: (index: number) => void;
  sizeType?: 'cover' | 'thumbnail';
  maxSize?: number;
  multiple: true;
}

// Single photo upload component
const UploadPhoto: React.FC<UploadPhotoProps> = ({ 
  onUpload, 
  preview,
  sizeType = 'cover',
  maxSize = 5 * 1024 * 1024,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(preview ?? null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const uniqueId = useId();

  const getDimensions = () => {
    switch (sizeType) {
      case 'thumbnail':
        return { 
          container: 'w-[150px] h-[150px]', 
          text: '(MAX. 400x200px)'
        };
      case 'cover':
      default:
        return { 
          container: 'w-[800px] h-[200px]',
          text: '(MAX. 800x400px)'
        };
    }
  };

  const { container, text } = getDimensions();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    
    setSizeError(null);
    
    if (file && file.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
      setSizeError(`File size exceeds ${sizeInMB}MB limit`);
      event.target.value = '';
      return;
    }

    onUpload(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSizeError(null);
    onUpload(null);
  };

  useEffect(() => {
    setImagePreview(preview ?? null);
  }, [preview]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex w-full">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Uploaded Preview"
              className={`${container} object-cover rounded-lg border-2 border-gray-300 border-dashed`}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute text-xs top-1 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <label
            htmlFor={`dropzone-file-${uniqueId}`}
            className={`flex flex-col items-center justify-center ${container} border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
          >
            <div className="flex flex-col items-center justify-center pt-1 pb-2 px-4">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-xs text-gray-500 text-center">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 text-center">
                SVG, PNG, JPG or GIF
                <span className="block">{text}</span>
              </p>
            </div>
            <input
              id={`dropzone-file-${uniqueId}`}
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/svg+xml, image/png, image/jpeg, image/gif"
            />
          </label>
        )}
      </div>
      
      {sizeError && (
        <p className="mt-1 text-xs text-red-600">
          {sizeError}
        </p>
      )}
    </div>
  );
};

// Multiple photo upload component
const MultipleUploadPhoto: React.FC<MultipleUploadPhotoProps> = ({ 
  onUpload, 
  previews,
  onRemove,
  sizeType = 'cover',
  maxSize = 5 * 1024 * 1024,
}) => {
  const [sizeError, setSizeError] = useState<string | null>(null);
  const uniqueId = useId();

  const getDimensions = () => {
    switch (sizeType) {
      case 'thumbnail':
        return { 
          container: 'w-[150px] h-[150px]', 
          text: '(MAX. 400x200px)'
        };
      case 'cover':
      default:
        return { 
          container: 'w-[200px] h-[150px]',
          text: '(MAX. 800x400px)'
        };
    }
  };

  const { container, text } = getDimensions();

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    setSizeError(null);
    
    if (files) {
      const fileArray = Array.from(files);
      
      // Check file sizes
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
        setSizeError(`${oversizedFiles.length} file(s) exceed ${sizeInMB}MB limit`);
        event.target.value = '';
        return;
      }

      onUpload(fileArray);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap gap-4 w-full">
        {/* Preview existing images */}
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Uploaded Preview ${index + 1}`}
              className={`${container} object-cover rounded-lg border-2 border-gray-300`}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute text-xs top-1 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}

        {/* Upload button */}
        <label
          htmlFor={`dropzone-file-${uniqueId}`}
          className={`flex flex-col items-center justify-center ${container} border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
        >
          <div className="flex flex-col items-center justify-center pt-1 pb-2 px-4">
            <svg
              className="w-6 h-6 mb-2 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="text-xs text-gray-500 text-center">
              <span className="font-semibold">Add Images</span>
            </p>
            <p className="text-xxs text-gray-500 text-center">
              {text}
            </p>
          </div>
          <input
            id={`dropzone-file-${uniqueId}`}
            type="file"
            className="hidden"
            onChange={handleImageUpload}
            accept="image/svg+xml, image/png, image/jpeg, image/gif"
            multiple
          />
        </label>
      </div>
      
      {sizeError && (
        <p className="mt-1 text-xs text-red-600">
          {sizeError}
        </p>
      )}
    </div>
  );
};

// Main component with conditional rendering based on multiple prop
export const UploadImageField = forwardRef<HTMLDivElement, InputFieldProps>(
  (props, ref) => {
    // Type guard to check if it's multiple
    const isMultiple = props.multiple === true;
    
    if (isMultiple) {
      // Handle multiple uploads
      const {
        label,
        name,
        required = false,
        className = '',
        helpText = '',
        value,
        onChange,
        onBlur,
        error,
        sizeType = 'cover',
        maxSize = 5 * 1024 * 1024,
        multiple,
        disabled = false,
      } = props as MultipleImageFieldProps;

      const [previewUrls, setPreviewUrls] = useState<string[]>([]);

      const handleUpload = (files: File[]) => {
        // Create synthetic event
        const syntheticEvent = {
          target: {
            name,
            value: [...(value || []), ...files],
            files: files,
          },
          currentTarget: {
            name,
            value: [...(value || []), ...files],
            files: files,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      };

      const handleRemove = (indexToRemove: number) => {
        const newValue = value.filter((_, index) => index !== indexToRemove);
        
        const syntheticEvent = {
          target: {
            name,
            value: newValue,
            files: [],
          },
          currentTarget: {
            name,
            value: newValue,
            files: [],
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      };

      // Generate preview URLs
      useEffect(() => {
        const urls = value.map(item => {
          if (item instanceof File) {
            return URL.createObjectURL(item);
          }
          return item as string;
        });
        
        setPreviewUrls(urls);

        // Cleanup
        return () => {
          urls.forEach(url => {
            if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
        };
      }, [value]);

      return (
        <div className={`mb-4 ${className}`} ref={ref}>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {value.length} image{value.length !== 1 ? 's' : ''}
              </span>
            </label>
            {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
          </div>

          <MultipleUploadPhoto
            onUpload={handleUpload}
            previews={previewUrls}
            onRemove={handleRemove}
            sizeType={sizeType}
            maxSize={maxSize}
            multiple={true}
          />

          {error && (
            <p className="mt-1 text-xs text-red-600" id={`${name}-error`}>
              {error}
            </p>
          )}
          
          {onBlur && (
            <input
              type="hidden"
              name={name}
              onBlur={onBlur}
            />
          )}
        </div>
      );
    } else {
      // Handle single upload
      const {
        label,
        name,
        required = false,
        className = '',
        helpText = '',
        value,
        onChange,
        onBlur,
        error,
        sizeType = 'cover',
        maxSize = 5 * 1024 * 1024,
        disabled = false,
      } = props as SingleImageFieldProps;

      const [previewUrl, setPreviewUrl] = useState<string | null>(null);

      const handleUpload = (file: File | null) => {
        const syntheticEvent = {
          target: {
            name,
            value: file,
            files: file ? [file] : [],
          },
          currentTarget: {
            name,
            value: file,
            files: file ? [file] : [],
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      };

      useEffect(() => {
        if (value instanceof File) {
          const url = URL.createObjectURL(value);
          setPreviewUrl(url);
          
          return () => {
            URL.revokeObjectURL(url);
          };
        } else if (typeof value === 'string' && value) {
          setPreviewUrl(value);
        } else {
          setPreviewUrl(null);
        }
      }, [value]);

      return (
        <div className={`mb-4 ${className}`} ref={ref}>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {helpText && <span className="text-xs text-gray-500">{helpText}</span>}
          </div>

          <UploadPhoto
            onUpload={handleUpload}
            preview={previewUrl}
            sizeType={sizeType}
            maxSize={maxSize}
          />

          {error && (
            <p className="mt-1 text-xs text-red-600" id={`${name}-error`}>
              {error}
            </p>
          )}
          
          {onBlur && (
            <input
              type="hidden"
              name={name}
              onBlur={onBlur}
            />
          )}
        </div>
      );
    }
  }
);

UploadImageField.displayName = 'UploadImageField';

export default UploadImageField;