'use client';

import React, {useId, useRef, useState} from 'react';
import {HiOutlineUpload, HiOutlineX} from 'react-icons/hi';
import {cn} from '@/lib/utils';

interface FileDropzoneProps {
    label: string;
    hint?: string;
    /** e.g. "image/*" or "video/*" */
    accept: string;
    file: File | null;
    onFile: (file: File | null) => void;
    /** Rejects the drop/selection with a message when it returns a string. */
    validate?: (file: File) => string | null;
    /** Data URL preview rendered in place of the prompt. */
    previewUrl?: string | null;
    required?: boolean;
    className?: string;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileDropzone: React.FC<FileDropzoneProps> = ({
    label,
    hint,
    accept,
    file,
    onFile,
    validate,
    previewUrl,
    required,
    className,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputId = useId();

    const accepts = (candidate: File) => {
        const type = accept.replace('/*', '');
        return candidate.type.startsWith(type);
    };

    const commit = (candidate: File | null) => {
        setError(null);

        if (!candidate) {
            onFile(null);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        if (!accepts(candidate)) {
            setError(`That is not a valid ${accept.replace('/*', '')} file.`);
            return;
        }

        const validationError = validate?.(candidate);
        if (validationError) {
            setError(validationError);
            if (inputRef.current) inputRef.current.value = '';
            return;
        }

        onFile(candidate);
    };

    return (
        <div className={className}>
            <label htmlFor={inputId} className="field-label">
                {label}
                {required && <span className="ml-0.5 text-danger">*</span>}
            </label>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    commit(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                    'relative rounded-xl border-2 border-dashed transition',
                    isDragging ? 'border-brand-500 bg-brand-50' : 'border-ink-300 bg-ink-25 hover:border-ink-400',
                    error && 'border-danger bg-danger-soft'
                )}
            >
                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept={accept}
                    onChange={(e) => commit(e.target.files?.[0] ?? null)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-describedby={hint ? `${inputId}-hint` : undefined}
                />

                {previewUrl ? (
                    <div className="relative">
                        {/* Preview comes from FileReader, so next/image cannot optimise it */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Selected preview"
                            className="aspect-video w-full rounded-[0.625rem] object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => commit(null)}
                            aria-label="Remove file"
                            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-ink-900/80 text-white transition hover:bg-ink-900"
                        >
                            <HiOutlineX className="h-4 w-4"/>
                        </button>
                    </div>
                ) : file ? (
                    <div className="flex items-center gap-3 px-4 py-5">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                            <HiOutlineUpload className="h-5 w-5"/>
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-sm font-medium text-ink-900">{file.name}</span>
                            <span className="block text-xs text-ink-500">{formatSize(file.size)}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => commit(null)}
                            aria-label="Remove file"
                            className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-ink-200 hover:text-ink-800"
                        >
                            <HiOutlineX className="h-4 w-4"/>
                        </button>
                    </div>
                ) : (
                    <div className="px-4 py-8 text-center">
                        <HiOutlineUpload className="mx-auto h-7 w-7 text-ink-400" aria-hidden="true"/>
                        <p className="mt-2 text-sm font-medium text-ink-800">
                            Drop a file here, or <span className="text-brand-700">browse</span>
                        </p>
                        {hint && <p id={`${inputId}-hint`} className="mt-1 text-xs text-ink-500">{hint}</p>}
                    </div>
                )}
            </div>

            {error && <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
        </div>
    );
};

export default FileDropzone;
