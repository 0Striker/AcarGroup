"use client";

import { useEffect, useState } from "react";

type ExchangeRates = {
    USD: number;
    EUR: number;
};

export default function CurrencyTicker() {
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Using frankfurter.app as a free, no-key API
                // We fetch USD and EUR rates against TRY
                const res = await fetch("https://api.frankfurter.app/latest?base=USD&symbols=TRY");
                if (!res.ok) throw new Error("Failed to fetch rates");

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _initialData = await res.json();
                // Fetch with base USD and EUR to get TRY rates
                // But since we can't ask for multiple bases in one go easily with frankfurter for this specific output format,
                // let's do two requests or use a different endpoint.
                // Actually frankfurter supports ?from=USD,EUR but the output is relative to the base.
                // Let's try fetching with base TRY and inverting, or just 2 requests.
                // Easier: Fetch base USD, get TRY. Fetch base EUR, get TRY.

                const [usdRes, eurRes] = await Promise.all([
                    fetch("https://api.frankfurter.app/latest?from=USD&to=TRY"),
                    fetch("https://api.frankfurter.app/latest?from=EUR&to=TRY")
                ]);

                const usdData = await usdRes.json();
                const eurData = await eurRes.json();

                setRates({
                    USD: usdData.rates.TRY,
                    EUR: eurData.rates.TRY
                });
            } catch (error) {
                console.error("Error fetching currency rates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();

        // Refresh every 5 minutes
        const interval = setInterval(fetchRates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !rates) return null;

    return (
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-medium text-slate-500 bg-slate-50/50 px-3 py-1 rounded-full border border-slate-100">
            <div className="flex items-center gap-1">
                <span className="text-emerald-600 font-bold">$</span>
                <span>{rates.USD.toFixed(2)} ₺</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">€</span>
                <span>{rates.EUR.toFixed(2)} ₺</span>
            </div>
        </div>
    );
}
