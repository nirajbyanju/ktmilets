// components/TagsInput.tsx
'use client';

import { useState, KeyboardEvent } from 'react';

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export default function TagsInput({
  tags,
  setTags,
  placeholder = 'Add a tag...',
  maxTags = 10,
  disabled = false
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue === '' || tags.length >= maxTags) return;
    
    // Prevent duplicate tags
    if (!tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
    }
    
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div className={`
        flex flex-wrap items-center gap-2 p-2 border rounded-lg
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
        transition-all duration-200
      `}>
        {/* Tags list */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </span>
        ))}
        
        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length >= maxTags ? 'Max tags reached' : placeholder}
          disabled={disabled || tags.length >= maxTags}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm disabled:cursor-not-allowed disabled:text-gray-500"
        />
      </div>
      
      {/* Optional: Tag count indicator */}
      {maxTags && (
        <p className="text-xs text-gray-500 mt-1">
          {tags.length}/{maxTags} tags • Press Enter or comma to add
        </p>
      )}
    </div>
  );
}