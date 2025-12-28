"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to avoid SSR issues with React Quill
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-slate-900/50 animate-pulse rounded-lg" />,
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link"],
                ["clean"],
            ],
        }),
        []
    );

    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-slate-400">{label}</label>}
            <div className="bg-white rounded-lg overflow-hidden text-slate-900">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    placeholder={placeholder}
                    className="h-64 mb-12" // mb-12 for toolbar space
                />
            </div>
            <style jsx global>{`
        .ql-toolbar.ql-snow {
          border-color: #e2e8f0;
          background-color: #f8fafc;
        }
        .ql-container.ql-snow {
          border-color: #e2e8f0;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 160px;
        }
      `}</style>
        </div>
    );
}
