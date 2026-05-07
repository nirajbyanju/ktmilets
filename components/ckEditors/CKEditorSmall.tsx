'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface CkEditorSmallProps {
    label?: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: (fieldName: string, fieldValue: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    maxLength?: number;
    wordCount?: boolean;
    showCharacterCount?: boolean;
    showWordCount?: boolean;
    height?: string | number;
    scrollableHeight?: number;
    className?: string;
    minimal?: boolean;
    'aria-describedby'?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    id?: string;
    data?: string | number;
}

interface TinyKeyboardEvent {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    preventDefault: () => void;
}

interface TinyEditorInstance {
    getContent: (options?: { format: 'text' }) => string;
    insertContent: (content: string) => void;
    on: (event: string, callback: (event: TinyKeyboardEvent) => void) => void;
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

const CkEditorSmall: React.FC<CkEditorSmallProps> = ({
    label,
    name,
    value,
    data,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    placeholder = 'Write something...',
    maxLength,
    wordCount = false,
    showCharacterCount,
    showWordCount,
    height = 320,
    scrollableHeight,
    className = '',
    minimal = false,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    id,
}) => {
    const editorRef = useRef<TinyEditorInstance | null>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);

    const editorValue = data !== undefined ? String(data) : value;
    const isDisabled = disabled || readOnly;
    const shouldShowWordCount = showWordCount !== undefined ? showWordCount : wordCount;
    const shouldShowCharacterCount =
        showCharacterCount !== undefined ? showCharacterCount : !!maxLength;

    const resolvedEditorHeight = useMemo(() => {
        if (scrollableHeight) {
            return scrollableHeight;
        }

        if (typeof height === 'number') {
            return height;
        }

        const numericHeight = Number.parseInt(height, 10);
        return Number.isNaN(numericHeight) ? 320 : numericHeight;
    }, [height, scrollableHeight]);

    const wordCountValue = useMemo(() => {
        const text = stripHtml(editorValue);
        return text ? text.split(/\s+/).length : 0;
    }, [editorValue]);

    const charCountValue = useMemo(() => stripHtml(editorValue).length, [editorValue]);

    const plugins = useMemo(
        () =>
            minimal
                ? ['lists', 'link', 'paste', 'autolink', 'wordcount']
                : [
                      'lists',
                      'link',
                      'paste',
                      'autolink',
                      'wordcount',
                      'advlist',
                      'emoticons',
                      'table',
                      'image',
                      'media',
                      'preview',
                      'code',
                      'fullscreen',
                  ],
        [minimal]
    );

    const toolbar = minimal
        ? 'blocks | bold italic underline | bullist numlist | link | removeformat'
        : 'undo redo | blocks | bold italic underline forecolor | bullist numlist outdent indent | alignleft aligncenter alignright | link image | table emoticons | removeformat | code preview fullscreen';

    const TINY_MCE_API_KEY = 'zxiho56iizyia8gpewa2tdqwu9g3sfmhlavfq71sk2yh075w';

    const handleBlur = () => {
        if (onBlur && editorRef.current) {
            onBlur(name, editorRef.current.getContent());
        }
    };

    const handleInit = (_event: unknown, editor: TinyEditorInstance) => {
        editorRef.current = editor;
        setIsEditorReady(true);
    };

    return (
        <div className={`tinymce-field ${className}`}>
            {label && (
                <label htmlFor={id || name} className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}

            <div
                className={`relative overflow-hidden rounded border ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                {!isEditorReady && (
                    <div
                        className="pointer-events-none absolute inset-0 z-10 bg-white"
                        style={{ minHeight: `${resolvedEditorHeight}px` }}
                    >
                        <div className="h-full animate-pulse p-4">
                            <div className="h-10 rounded bg-opsh-background" />
                            <div className="mt-4 h-4 w-3/4 rounded bg-opsh-background" />
                            <div className="mt-3 h-4 w-full rounded bg-opsh-background" />
                            <div className="mt-3 h-4 w-5/6 rounded bg-opsh-background" />
                            <div className="mt-3 h-4 w-2/3 rounded bg-opsh-background" />
                            <div className="mt-6 text-xs font-medium text-opsh-muted">
                                Loading editor...
                            </div>
                        </div>
                    </div>
                )}

                <Editor
                    apiKey={TINY_MCE_API_KEY}
                    onInit={handleInit}
                    value={editorValue}
                    onEditorChange={onChange}
                    onBlur={handleBlur}
                    disabled={isDisabled}
                    id={id || name}
                    aria-describedby={ariaDescribedBy}
                    aria-label={ariaLabel || label}
                    aria-labelledby={ariaLabelledBy}
                    scriptLoading={{ async: true, defer: true }}
                    init={{
                        height: resolvedEditorHeight,
                        menubar: false,
                        branding: false,
                        promotion: false,
                        placeholder,
                        resize: false,
                        statusbar: true,
                        elementpath: false,
                        toolbar_mode: 'sliding',
                        toolbar_sticky: true,
                        block_formats:
                            'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Blockquote=blockquote',
                        plugins,
                        toolbar,
                        quickbars_selection_toolbar: 'blocks | bold italic | quicklink blockquote',
                        quickbars_insert_toolbar: false,
                        contextmenu: 'link image table',
                        content_style: `
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                font-size: 15px;
                                line-height: 1.75;
                                margin: 0;
                                padding: 16px;
                            }
                            h1, h2, h3, h4 {
                                line-height: 1.3;
                                margin: 1.25em 0 0.6em;
                                font-weight: 700;
                            }
                            h1 { font-size: 2rem; }
                            h2 { font-size: 1.6rem; }
                            h3 { font-size: 1.3rem; }
                            h4 { font-size: 1.1rem; }
                            p { margin: 0 0 1em; }
                            ul, ol { margin: 0 0 1em 1.25em; }
                            blockquote {
                                border-left: 4px solid #044845;
                                margin: 1.25em 0;
                                padding: 0.75em 1em;
                                background: #f4f5f7;
                            }
                            img { max-width: 100%; height: auto; }
                            table { border-collapse: collapse; width: 100%; }
                            th, td { border: 1px solid #ddd; padding: 8px; }
                        `,
                        image_advtab: false,
                        image_caption: true,
                        image_title: false,
                        link_assume_external_targets: true,
                        link_context_toolbar: true,
                        paste_data_images: true,
                        paste_merge_formats: true,
                        paste_remove_styles: false,
                        paste_remove_styles_if_webkit: true,
                        wordcount_ignored_classes: 'mce-item-table',
                        setup: (editor: TinyEditorInstance) => {
                            editor.on('keydown', (event: TinyKeyboardEvent) => {
                                if (!maxLength) {
                                    return;
                                }

                                const content = editor.getContent({ format: 'text' });
                                const isDeletionKey =
                                    event.key === 'Backspace' || event.key === 'Delete';
                                const isModifierKey = Boolean(event.ctrlKey || event.metaKey);

                                if (content.length >= maxLength && !isDeletionKey && !isModifierKey) {
                                    event.preventDefault();
                                }
                            });
                        },
                    }}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-500" id={`${name}-error`}>
                    {error}
                </p>
            )}

            {(shouldShowWordCount || shouldShowCharacterCount) && (
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <div className="flex flex-wrap gap-4">
                        {shouldShowWordCount && <span>Words: {wordCountValue}</span>}
                        {shouldShowCharacterCount && <span>Characters: {charCountValue}</span>}
                    </div>
                    {maxLength && (
                        <span
                            className={charCountValue > maxLength ? 'text-red-500' : ''}
                            id={ariaDescribedBy}
                        >
                            Max: {maxLength}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export const CkEditorEssential: React.FC<Omit<CkEditorSmallProps, 'minimal'>> = (props) => (
    <CkEditorSmall {...props} minimal={false} />
);

export const CkEditorBasic: React.FC<Omit<CkEditorSmallProps, 'minimal'>> = (props) => (
    <CkEditorSmall {...props} minimal={true} />
);

export const CkEditorExamples: React.FC = () => {
    const [content1, setContent1] = React.useState('');
    const [content2, setContent2] = React.useState('');

    const handleEditorBlur = (fieldName: string, fieldValue: string) => {
        console.log(`Field ${fieldName} blurred with value:`, fieldValue);
    };

    return (
        <div className="space-y-8 p-4">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Complete Example</h3>
                <CkEditorSmall
                    name="complete_example"
                    value={content1}
                    data={content1}
                    onChange={setContent1}
                    onBlur={handleEditorBlur}
                    label="Complete Editor"
                    required
                    error={content1.length < 10 ? 'Minimum 10 characters required' : undefined}
                    placeholder="Type something..."
                    maxLength={500}
                    wordCount
                    showCharacterCount
                    showWordCount
                    disabled={false}
                    readOnly={false}
                    height={200}
                    minimal={false}
                    aria-describedby="editor-help"
                    aria-label="Content editor"
                    id="editor-1"
                    className="custom-editor"
                />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Minimal Editor</h3>
                <CkEditorSmall
                    label="Short Description"
                    name="short_description"
                    value={content2}
                    onChange={setContent2}
                    onBlur={handleEditorBlur}
                    required
                    wordCount
                    maxLength={500}
                    minimal
                    placeholder="Enter a short description..."
                    height={150}
                />
            </div>
        </div>
    );
};

export default CkEditorSmall;
