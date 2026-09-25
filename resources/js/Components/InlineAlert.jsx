import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

const variants = {
    success: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        iconBg: 'bg-emerald-100 text-emerald-600',
        icon: CheckCircle2,
    },
    error: {
        container: 'bg-red-50 border-red-200 text-red-800',
        iconBg: 'bg-red-100 text-red-600',
        icon: XCircle,
    },
    warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-800',
        iconBg: 'bg-amber-100 text-amber-600',
        icon: AlertTriangle,
    },
    info: {
        container: 'bg-sky-50 border-sky-200 text-sky-800',
        iconBg: 'bg-sky-100 text-sky-600',
        icon: Info,
    },
};

export default function InlineAlert({ message, type = 'success', className = '' }) {
    if (!message) return null;
    const variant = variants[type] || variants.info;
    const Icon = variant.icon;

    return (
        <div className={`flex items-start gap-3 rounded-xl border p-4 ${variant.container} ${className}`} role="alert">
            <div className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg ${variant.iconBg}`}>
                <Icon size={16} strokeWidth={2.25} />
            </div>
            <div className="flex-1 text-sm font-medium leading-5 break-words pt-0.5">
                {message}
            </div>
        </div>
    );
}
