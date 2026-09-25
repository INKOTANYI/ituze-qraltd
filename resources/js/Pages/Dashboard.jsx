import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CompleteProfileModal from '@/Components/CompleteProfileModal';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    DoorOpen,
    CreditCard,
    AlertCircle,
    ArrowUpRight,
    CalendarX,
} from 'lucide-react';
import { useState } from 'react';

const compactStats = [
    { name: 'Occupied Units', value: '0', icon: DoorOpen },
    { name: 'Pending Payments', value: '0', icon: CreditCard },
    { name: 'Overdue Rent', value: '0', icon: AlertCircle },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [modalDismissed, setModalDismissed] = useState(false);

    const isAdmin = user.role === 'admin';
    const isExpired =
        !isAdmin && user.expires_at && new Date(user.expires_at) < new Date();
    const needsProfile = !user.profile_completed && !modalDismissed;

    if (!isAdmin && isExpired) {
        return (
            <AuthenticatedLayout header="Dashboard">
                <Head title="Dashboard" />
                <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <CalendarX size={30} className="text-red-500" />
                    </div>
                    <h2 className="mt-4 font-[Sora] text-xl font-bold text-gray-800">
                        Your account has expired
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Your 1-year subscription ended on{' '}
                        {new Date(user.expires_at).toLocaleDateString()}.
                        Please contact support to renew and regain access to
                        your dashboard.
                    </p>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (needsProfile) {
        return (
            <AuthenticatedLayout header="Dashboard">
                <Head title="Dashboard" />
                <CompleteProfileModal
                    onDone={() => setModalDismissed(true)}
                />
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="lg:col-span-1 rounded-2xl bg-[#0E3B2E] p-6 text-white shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                        <Building2 size={22} className="text-[#D9A441]" />
                    </div>
                    <p className="mt-5 font-[Sora] text-4xl font-bold">0</p>
                    <p className="mt-1 text-sm text-white/60">
                        Total Properties
                    </p>
                    <Link
                        href={route('properties.create')}
                        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#D9A441] hover:text-[#e8b95c]"
                    >
                        Add your first property
                        <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2">
                    {compactStats.map((stat) => (
                        <div
                            key={stat.name}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E3B2E]/5">
                                <stat.icon size={20} className="text-[#0E3B2E]" />
                            </div>
                            <p className="mt-4 font-[Sora] text-2xl font-bold text-gray-800">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-500">
                                {stat.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="font-[Sora] text-base font-semibold text-gray-800">
                    Get started
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Add your first property to start tracking units, tenants,
                    and payments in one place.
                </p>
                <Link
                    href={route('properties.create')}
                    className="mt-4 inline-block rounded-lg bg-[#0E3B2E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                >
                    Add your first property
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}