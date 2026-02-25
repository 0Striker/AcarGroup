"use client";

import { useState, ChangeEvent } from "react";
import { getToken } from "@/lib/auth";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5203";

interface VideoUploadProps {
    currentVideoUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    label?: string;
    endpoint: string;
    disabled?: boolean;
}

export default function VideoUpload({
    currentVideoUrl,
    onUploadSuccess,
    label = "Video",
    endpoint,
    disabled = false
}: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentVideoUrl || null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log("File selected:", file);
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("video/")) {
            console.error("Invalid file type:", file.type);
            toast.error("Sadece video dosyaları yüklenebilir!");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            console.error("File too large:", file.size);
            toast.error("Video boyutu maksimum 50MB olabilir!");
            return;
        }

        console.log("File validation passed, creating preview...");

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            console.log("Preview created");
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        console.log("Starting upload...");
        setUploading(true);
        try {
            const token = getToken();
            console.log("Token obtained:", token ? "Yes" : "No");
            const formData = new FormData();
            formData.append("video", file);

            console.log("Sending request to:", `${API_BASE_URL}${endpoint}`);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            console.log("Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Response data:", data);
                const videoUrl = data.videoUrl || data.url;

                if (videoUrl) {
                    console.log("Video URL received:", videoUrl);
                    onUploadSuccess(videoUrl);
                    toast.success("Video yüklendi!");
                } else {
                    console.error("No video URL in response");
                    toast.error("Video URL'si alınamadı.");
                }
            } else {
                const error = await response.text();
                console.error("Upload failed:", error);
                toast.error(`Yükleme başarısız: ${error}`);
                setPreview(currentVideoUrl || null);
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Bir hata oluştu.");
            setPreview(currentVideoUrl || null);
        } finally {
            console.log("Upload process completed");
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400">{label}</label>

            {preview && (
                <div className="relative w-full max-w-md border-2 border-slate-700 rounded-lg overflow-hidden">
                    <video
                        src={preview}
                        controls
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}

            <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        disabled={disabled || uploading}
                        className="hidden"
                    />
                    <div className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}>
                        {uploading ? "Yükleniyor..." : "Video Seç"}
                    </div>
                </label>
                {uploading && (
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
            </div>
            <p className="text-xs text-slate-500">Maksimum 50MB, MP4/WebM/MOV/AVI</p>
        </div>
    );
}
