"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";

// Ensures admin routes only load when acargroup_* auth keys contain an Admin role.

type Props = {
    children: React.ReactNode;
};

export default function AdminGuard({ children }: Props) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const parseRoleFromToken = (token: string | null): string | null => {
            if (!token) return null;
            try {
                const [, payload] = token.split(".");
                if (!payload) return null;
                const normalized = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
                const decoded = JSON.parse(atob(normalized));
                return (
                    decoded.role ||
                    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                    null
                );
            } catch {
                return null;
            }
        };

        const checkAuth = () => {
            const { token, customer } = getAuth();
            const roleFromToken = parseRoleFromToken(token);
            const isAdmin = Boolean(customer?.isAdmin || roleFromToken === "Admin");

            if (!token || !isAdmin) {
                router.push("/admin/login");
            } else {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="p-4 text-sm text-slate-500">
                    Yönlendiriliyor...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
