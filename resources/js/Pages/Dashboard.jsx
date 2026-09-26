import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CompleteProfileModal from '@/Components/CompleteProfileModal';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity, ArrowUpRight, Building2, CalendarX, CheckCircle2,
    DoorOpen, Home, Plus, Settings2, Users,
} from 'lucide-react';
import { useState } from 'react';

const cards = [
    { key: 'properties', label: 'Properties', icon: Building2, color: 'bg-emerald-50 text-emerald-700' },
    { key: 'units', label: 'Total units', icon: DoorOpen, color: 'bg-blue-50 text-blue-700' },
    { key: 'occupiedUnits', label: 'Occupied units', icon: Users, color: 'bg-violet-50 text-violet-700' },
    { key: 'vacantUnits', label: 'Available units', icon: Home, color: 'bg-amber-50 text-amber-700' },
];

export default function Dashboard({ summary, recentProperties = [], recentTenancies = [] }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [modalDismissed, setModalDismissed] = useState(false);
    const isAdmin = user.role === 'admin';
    const isExpired = !isAdmin && user.expires_at && new Date(user.expires_at) < new Date();

    if (isExpired) {
        return <AuthenticatedLayout header="Dashboard"><Head title="Dashboard" /><div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50"><CalendarX size={30} className="text-red-500" /></div><h2 className="mt-4 font-[Sora] text-xl font-bold text-gray-800">Your account has expired</h2><p className="mt-2 text-sm text-gray-500">Your subscription ended on {new Date(user.expires_at).toLocaleDateString()}. Please contact support to renew access.</p></div></AuthenticatedLayout>;
    }
    if (!user.profile_completed && !modalDismissed) {
        return <AuthenticatedLayout header="Dashboard"><Head title="Dashboard" /><CompleteProfileModal onDone={() => setModalDismissed(true)} /></AuthenticatedLayout>;
    }

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-sm font-medium text-[#D9A441]">Overview</p><h1 className="mt-1 font-[Sora] text-2xl font-bold text-gray-900">Good to see you, {user.name?.split(' ')[0]}</h1><p className="mt-1 text-sm text-gray-500">Here’s what’s happening across your portfolio.</p></div>
                <Link href={route('properties.create')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0a2e23]"><Plus size={16} /> Add property</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ key, label, icon: Icon, color }) => <div key={key} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></div>{key === 'properties' && <Link href={route('properties.index')}><ArrowUpRight size={17} className="text-gray-400 hover:text-[#0E3B2E]" /></Link>}</div><p className="mt-4 font-[Sora] text-2xl font-bold text-gray-900">{summary?.[key] ?? 0}</p><p className="mt-1 text-sm text-gray-500">{label}</p></div>)}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <div className="rounded-2xl bg-[#0E3B2E] p-6 text-white shadow-sm lg:col-span-1">
                    <div className="flex items-center gap-2 text-white/70"><Activity size={17} /><span className="text-sm">Portfolio occupancy</span></div>
                    <div className="mt-5 flex items-end gap-2"><span className="font-[Sora] text-4xl font-bold">{summary?.occupancyRate ?? 0}%</span><span className="mb-1 text-sm text-white/60">occupied</span></div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#D9A441]" style={{ width: `${summary?.occupancyRate ?? 0}%` }} /></div>
                    <p className="mt-3 text-xs text-white/60">{summary?.vacantUnits ?? 0} available · {summary?.maintenanceUnits ?? 0} under maintenance</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between"><h2 className="font-[Sora] font-semibold text-gray-900">Recent properties</h2><Link href={route('properties.index')} className="text-sm font-medium text-[#0E3B2E] hover:underline">View all</Link></div>
                    {recentProperties.length ? <div className="grid gap-3 sm:grid-cols-2">{recentProperties.map(property => <Link key={property.id} href={route('properties.show', property.id)} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 hover:border-[#D9A441]"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0E3B2E]/5"><Building2 size={17} className="text-[#0E3B2E]" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-800">{property.name}</p><p className="text-xs text-gray-500">{property.units_count ?? 0} units · {property.occupied_units_count ?? 0} occupied</p></div></div><ArrowUpRight size={15} className="text-gray-400" /></Link>)}</div> : <div className="rounded-xl bg-gray-50 p-6 text-center"><p className="text-sm text-gray-500">No properties yet.</p><Link href={route('properties.create')} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0E3B2E]"><Plus size={14} /> Add your first property</Link></div>}
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-[Sora] font-semibold text-gray-900">Recent occupancy</h2><Link href={route('tenants.index')} className="text-sm font-medium text-[#0E3B2E] hover:underline">View tenants</Link></div>{recentTenancies.length ? <div className="divide-y divide-gray-100">{recentTenancies.map(tenancy => <div key={tenancy.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50"><CheckCircle2 size={17} className="text-emerald-600" /></div><div><p className="text-sm font-semibold text-gray-800">{tenancy.tenant?.name}</p><p className="text-xs text-gray-500">{tenancy.unit?.property?.name} · Unit {tenancy.unit?.unit_number}</p></div></div><p className="text-xs text-gray-500">Started {new Date(tenancy.start_date).toLocaleDateString()}</p></div>)}</div> : <p className="py-4 text-sm text-gray-500">No active tenants yet. Assign tenants from a property’s units.</p>}</div>
        </AuthenticatedLayout>
    );
}
