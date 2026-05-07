'use client';

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Optional (recommended if self-hosting)
// import 'tinymce/tinymce';
// import 'tinymce/icons/default';
// import 'tinymce/themes/silver';

interface CkEditorsProps {
    label?: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    wordCount?: boolean;
    height?: string;
    className?: string;
}

const CkEditors: React.FC<CkEditorsProps> = ({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    placeholder = 'Write something...',
    maxLength,
    wordCount = false,
    height = '500px',
    className = '',
}) => {
    const editorRef = useRef<any>(null);

    // If using Tiny Cloud keep API key, otherwise remove apiKey prop
    const TINY_MCE_API_KEY = 'zxiho56iizyia8gpewa2tdqwu9g3sfmhlavfq71sk2yh075w';

    const handleChange = (content: string) => {
        onChange(content);
    };

    const handleInit = (_evt: any, editor: any) => {
        editorRef.current = editor;
    };

    // Word count (remove HTML)
    const getWordCount = (html: string) => {
        const text = html.replace(/<[^>]*>/g, '').trim();
        return text ? text.split(/\s+/).length : 0;
    };

    const getCharCount = (html: string) => {
        return html.replace(/<[^>]*>/g, '').length;
    };

    return (
        <div className={`tinymce-field ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={`border rounded ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Editor
                    apiKey={TINY_MCE_API_KEY}
                    onInit={handleInit}
                    value={value}
                    onEditorChange={handleChange}
                    disabled={disabled}
                    init={{
                        height: height,
                        menubar: true,
                        branding: false,
                        promotion: false, // ✅ removes Explore Trial
                        placeholder: placeholder,

                        plugins: [
                            'advlist',
                            'autolink',
                            'lists',
                            'link',
                            'image',
                            'charmap',
                            'preview',
                            'searchreplace',
                            'visualblocks',
                            'code',
                            'fullscreen',
                            'insertdatetime',
                            'media',
                            'table',
                            'help',
                            'wordcount',
                            'emoticons',
                            'codesample',
                            'hr',
                            'pagebreak',
                            'nonbreaking',
                            'directionality',
                            'visualchars',
                            'paste',
                            'textpattern',
                            'autoresize',
                        ],

                        toolbar:
                            'undo redo | blocks | bold italic underline forecolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | removeformat | ' +
                            'image media link | table | emoticons | hr | ' +
                            'code preview fullscreen',

                        content_style:
                            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',

                        resize: true,
                        statusbar: true,
                        elementpath: false,

                        image_advtab: true,

                        setup: (editor: any) => {
                            editor.on('keydown', (e: any) => {
                                if (maxLength) {
                                    const content = editor.getContent({ format: 'text' });

                                    if (
                                        content.length >= maxLength &&
                                        e.key !== 'Backspace' &&
                                        e.key !== 'Delete' &&
                                        !e.ctrlKey &&
                                        !e.metaKey
                                    ) {
                                        e.preventDefault();
                                    }
                                }
                            });
                        },
                    }}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {wordCount && (
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>Characters: {getCharCount(value)}</span>
                    <span>Words: {getWordCount(value)}</span>
                    {maxLength && <span>Max: {maxLength}</span>}
                </div>
            )}
        </div>
    );
};

export default CkEditors;