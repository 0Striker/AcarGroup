"use client";

import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

// Clears the unified acargroup_* credentials before returning to /admin/login.

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push("/admin/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded hover:bg-slate-800 transition-colors text-red-300 hover:text-red-200"
        >
            Çıkış Yap
        </button>
    );
}
