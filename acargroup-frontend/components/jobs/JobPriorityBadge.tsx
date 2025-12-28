const PRIORITY_CONFIG = {
    1: { label: "Düşük", className: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: "✓" },
    2: { label: "Normal", className: "bg-blue-100 text-blue-700 border-blue-300", icon: "—" },
    3: { label: "Yüksek", className: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "⚠" },
    4: { label: "Acil", className: "bg-red-100 text-red-700 border-red-300", icon: "🔴" },
};

interface JobPriorityBadgeProps {
    priority?: 1 | 2 | 3 | 4;
    showIcon?: boolean;
}

export default function JobPriorityBadge({ priority, showIcon = true }: JobPriorityBadgeProps) {
    // Default to Normal (2) if priority is undefined or invalid
    const safePriority = (priority && PRIORITY_CONFIG[priority]) ? priority : 2;
    const config = PRIORITY_CONFIG[safePriority];

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {showIcon && <span className="text-xs">{config.icon}</span>}
            {config.label}
        </span>
    );
}
