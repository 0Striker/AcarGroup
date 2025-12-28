// Auth helpers centralize LoginResponseDto persistence under acargroup_* keys.

export interface Customer {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    tc?: string;
    vkn?: string;
    createdAt: string;
    isActive: boolean;
    isAdmin?: boolean;
    defaultAddress?: string;
}

const TOKEN_KEY = "acargroup_token";
const CUSTOMER_KEY = "acargroup_customer";
const PERSONNEL_KEY = "acargroup_personnel";
const LEGACY_KEYS = ["acar_token", "acar_admin_token", "acar_customer", "acargroup_admin_logged_in", "acargroup_admin_last_user"];

export interface Personnel {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    isActive: boolean;
}

export interface CustomerDevice {
    id: number;
    customerId: number;
    customerPurchasedProductId?: number;
    productName?: string;
    deviceUsername?: string;
    devicePassword?: string;
    localIpAddress?: string;
    macAddress?: string;
    modemInfo?: string;
    hasInternetMonitoring: boolean;
    serialNumber?: string;
    qrCodeUrl?: string;
    createdAt: string;
}

const isBrowser = () => typeof window !== "undefined";

const cleanupLegacyKeys = () => {
    if (!isBrowser()) return;
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
};

export function getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getCustomer(): Customer | null {
    if (!isBrowser()) return null;
    const customerStr = localStorage.getItem(CUSTOMER_KEY);
    if (!customerStr) return null;
    try {
        return JSON.parse(customerStr) as Customer;
    } catch {
        return null;
    }
}

export function getPersonnel(): Personnel | null {
    if (!isBrowser()) return null;
    const personnelStr = localStorage.getItem(PERSONNEL_KEY);
    if (!personnelStr) return null;
    try {
        return JSON.parse(personnelStr) as Personnel;
    } catch {
        return null;
    }
}

export function getAuth(): { token: string | null; customer: Customer | null; personnel: Personnel | null } {
    return { token: getToken(), customer: getCustomer(), personnel: getPersonnel() };
}

export function setAuth(token: string, customer: Customer): void {
    if (!isBrowser()) return;
    cleanupLegacyKeys();
    // Clear personnel if logging in as customer to avoid confusion
    localStorage.removeItem(PERSONNEL_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function setPersonnelAuth(token: string, personnel: Personnel): void {
    if (!isBrowser()) return;
    cleanupLegacyKeys();
    // Clear customer if logging in as personnel
    localStorage.removeItem(CUSTOMER_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PERSONNEL_KEY, JSON.stringify(personnel));
}

export function clearAuth(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    localStorage.removeItem(PERSONNEL_KEY);
    cleanupLegacyKeys();
}
