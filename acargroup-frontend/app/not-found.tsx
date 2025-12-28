import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 max-w-md w-full shadow-2xl backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <ShieldCheck size={40} className="text-emerald-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    Bu kısım yakında hizmetinizde
                </h1>

                <p className="text-slate-400 mb-8 leading-relaxed">
                    Acar Group ile güvende ve teknolojiyle kalın.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors w-full"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
