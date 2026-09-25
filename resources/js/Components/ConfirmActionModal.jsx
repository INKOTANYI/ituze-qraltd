import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ConfirmActionModal({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    tone = 'default',
    processing = false,
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    const isDanger = tone === 'danger';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                        isDanger ? 'bg-red-50' : 'bg-[#0E3B2E]/10'
                    }`}
                >
                    {isDanger ? (
                        <AlertTriangle size={26} className="text-red-500" />
                    ) : (
                        <CheckCircle2 size={26} className="text-[#0E3B2E]" />
                    )}
                </div>

                <h3 className="mt-4 font-[Sora] text-lg font-bold text-gray-800">
                    {title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500">{message}</p>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={processing}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                            isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-[#0E3B2E] hover:bg-[#0a2e23]'
                        }`}
                    >
                        {processing ? 'Please wait...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
