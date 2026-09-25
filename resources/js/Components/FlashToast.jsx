import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const variants = {
    success: {
        container: 'bg-emerald-50 border-emerald-200 text-emerald-800 ring-emerald-500/10',
        iconBg: 'bg-emerald-100 text-emerald-600',
        icon: CheckCircle2,
    },
    error: {
        container: 'bg-red-50 border-red-200 text-red-800 ring-red-500/10',
        iconBg: 'bg-red-100 text-red-600',
        icon: XCircle,
    },
    warning: {
        container: 'bg-amber-50 border-amber-200 text-amber-800 ring-amber-500/10',
        iconBg: 'bg-amber-100 text-amber-600',
        icon: AlertTriangle,
    },
    info: {
        container: 'bg-sky-50 border-sky-200 text-sky-800 ring-sky-500/10',
        iconBg: 'bg-sky-100 text-sky-600',
        icon: Info,
    },
};

export default function FlashToast({ message, type = 'success', onClose, duration = 6000 }) {
    const [visible, setVisible] = useState(true);
    const variant = variants[type] || variants.info;
    const Icon = variant.icon;

    useEffect(() => {
        if (!duration) return;
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onClose && onClose(), 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible || !message) return null;

    return (
        <div
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-lg shadow-black/5 ring-1 backdrop-blur transition-all duration-300 ${variant.container}`}
            role="alert"
        >
            <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${variant.iconBg}`}>
                <Icon size={20} strokeWidth={2.25} />
            </div>
            <div className="flex-1 pt-0.5 text-sm font-medium leading-5 break-words">
                {message}
            </div>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onClose && onClose(), 200); }}
                className="flex-none rounded-lg p-1 opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </div>
    );
}
