import { ReactNode } from "react";

type JobStatus = 0 | 1 | 2 | 3 | 4;

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string; icon: ReactNode }> = {
    0: {
        label: "Bekliyor",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        icon: "⏳",
    },
    1: {
        label: "Planlandı",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: "📅",
    },
    2: {
        label: "Devam Ediyor",
        className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        icon: "🔄",
    },
    3: {
        label: "Tamamlandı",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        icon: "✅",
    },
    4: {
        label: "İptal Edildi",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: "❌",
    },
};

interface JobStatusBadgeProps {
    status: JobStatus;
    showIcon?: boolean;
}

export default function JobStatusBadge({ status, showIcon = true }: JobStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.className}`}>
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}
