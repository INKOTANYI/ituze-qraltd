import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, Plus, DoorOpen, Edit, Trash2, ArrowLeft, DollarSign, Home } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const statusStyles = {
    vacant: 'bg-green-50 text-green-700 ring-1 ring-green-600/10',
    occupied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
    maintenance: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
};

export default function UnitsIndex({ property, units, unitTypes, filters, tenants = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [unitToAssign, setUnitToAssign] = useState(null);
    const [showTenantForm, setShowTenantForm] = useState(false);
    const assignmentForm = useForm({ tenant_id: '', start_date: '', end_date: '', monthly_rent: '', deposit_amount: '', notes: '' });
    const tenantForm = useForm({ type: 'individual', name: '', registration_number: '', contact_person: '', national_id: '', email: '', phone: '', address: '' });
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('properties.units.index', property), { search, status }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, status]);

    const confirmDelete = () => {
        if (!unitToDelete) return;
        router.delete(route('properties.units.destroy', [property, unitToDelete]), {
            onSuccess: () => setUnitToDelete(null),
        });
    };

    const openAssignment = (unit) => {
        setUnitToAssign(unit);
        assignmentForm.setData('monthly_rent', unit.rent_amount || '');
    };

    const assignTenant = (e) => {
        e.preventDefault();
        assignmentForm.post(route('properties.units.tenancy.store', [property, unitToAssign]), {
            onSuccess: () => { setUnitToAssign(null); assignmentForm.reset(); },
        });
    };

    const createTenant = (e) => {
        e.preventDefault();
        tenantForm.post(route('properties.tenants.store', property), {
            preserveScroll: true,
            onSuccess: () => { setShowTenantForm(false); tenantForm.reset(); },
        });
    };

    return (
        <AuthenticatedLayout header={`${property.name} - Units`}>
            <Head title={`${property.name} - Units`} />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('properties.show', property)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-[#0E3B2E]"
                    >
                        <ArrowLeft size={16} />
                        Back to Property
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTenantForm(true)}
                        className="rounded-xl border border-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-[#0E3B2E] transition-colors hover:bg-[#0E3B2E]/5"
                    >
                        New Tenant
                    </button>
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search units..."
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-sm text-gray-600 transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                    >
                        <option value="">All Status</option>
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                    </select>

                    <Link
                        href={route('properties.units.create', property)}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                    >
                        <Plus size={15} />
                        Add Unit
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {units.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <DoorOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">No units found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search || status ? 'Try adjusting your search filters' : 'Get started by adding your first unit to this property'}
                        </p>
                        {!search && !status && (
                            <Link
                                href={route('properties.units.create', property)}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                            >
                                <Plus size={15} />
                                Add Unit
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs uppercase tracking-wide text-gray-400">
                                        <th className="px-5 py-3 font-semibold">Unit</th>
                                        <th className="px-5 py-3 font-semibold">Type</th>
                                        <th className="px-5 py-3 font-semibold">Rent</th>
                                        <th className="px-5 py-3 font-semibold">Size</th>
                                        <th className="px-5 py-3 font-semibold">Status</th>
                                        <th className="px-5 py-3 font-semibold">Tenant</th>
                                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.data.map((unit) => (
                                        <tr
                                            key={unit.id}
                                            className="border-b border-gray-50 transition-colors last:border-0 hover:bg-[#0E3B2E]/[0.02]"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E3B2E]/10 text-xs font-semibold text-[#0E3B2E]">
                                                        <Home size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {unit.unit_number}
                                                        </p>
                                                        {unit.description && (
                                                            <p className="text-xs text-gray-400">
                                                                {unit.description.substring(0, 30)}...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {unit.unit_type?.name || '—'}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={14} className="text-gray-400" />
                                                    <span className="font-medium">
                                                        {Number(unit.rent_amount).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-gray-400">/month</span>
                                                    {unit.size_sqm != null && unit.size_sqm !== '' && (
                                                        <span className="text-xs text-gray-400">
                                                            {' '}· {Number(unit.size_sqm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {unit.size_sqm != null && unit.size_sqm !== '' ? (
                                                    <span>
                                                        {Number(unit.size_sqm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[unit.status]}`}>
                                                    {unit.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600">
                                                {unit.active_tenancy?.tenant?.name || <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {unit.status === 'vacant' && (
                                                        <button onClick={() => openAssignment(unit)} className="rounded-lg bg-[#0E3B2E]/10 px-2.5 py-1.5 text-xs font-medium text-[#0E3B2E] hover:bg-[#0E3B2E]/20">
                                                            Assign tenant
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={route('properties.units.edit', [property, unit])}
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                                    >
                                                        <Edit size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setUnitToDelete(unit)}
                                                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {unitToAssign && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                                        <form onSubmit={assignTenant} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                                                            <h3 className="text-lg font-semibold text-gray-900">Assign tenant to {unitToAssign.unit_number}</h3>
                                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                                <label className="sm:col-span-2 text-sm font-medium text-gray-700">Tenant
                                                                    <select value={assignmentForm.data.tenant_id} onChange={e => assignmentForm.setData('tenant_id', e.target.value)} required className="mt-1 w-full rounded-xl border-gray-200">
                                                                        <option value="">Select tenant</option>
                                                                        {tenants.map(tenant => <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.type})</option>)}
                                                                    </select>
                                                                </label>
                                                                <label className="text-sm font-medium text-gray-700">Start date<input type="date" required value={assignmentForm.data.start_date} onChange={e => assignmentForm.setData('start_date', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                <label className="text-sm font-medium text-gray-700">End date<input type="date" value={assignmentForm.data.end_date} onChange={e => assignmentForm.setData('end_date', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                <label className="text-sm font-medium text-gray-700">Monthly rent<input type="number" min="0" step="0.01" required value={assignmentForm.data.monthly_rent} onChange={e => assignmentForm.setData('monthly_rent', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                <label className="text-sm font-medium text-gray-700">Deposit<input type="number" min="0" step="0.01" value={assignmentForm.data.deposit_amount} onChange={e => assignmentForm.setData('deposit_amount', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                            </div>
                                                            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setUnitToAssign(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button><button disabled={assignmentForm.processing} className="rounded-xl bg-[#0E3B2E] px-4 py-2 text-sm font-medium text-white">Assign tenant</button></div>
                                                        </form>
                                                    </div>
                                                )}

                                                {showTenantForm && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                                        <form onSubmit={createTenant} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                                                            <h3 className="text-lg font-semibold text-gray-900">Create tenant</h3>
                                                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                                <label className="text-sm font-medium text-gray-700">Type<select value={tenantForm.data.type} onChange={e => tenantForm.setData('type', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200"><option value="individual">Individual</option><option value="company">Company</option></select></label>
                                                                <label className="text-sm font-medium text-gray-700">Name<input required value={tenantForm.data.name} onChange={e => tenantForm.setData('name', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                <label className="text-sm font-medium text-gray-700">Email<input type="email" value={tenantForm.data.email} onChange={e => tenantForm.setData('email', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                <label className="text-sm font-medium text-gray-700">Phone<input value={tenantForm.data.phone} onChange={e => tenantForm.setData('phone', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label>
                                                                {tenantForm.data.type === 'individual' ? <label className="text-sm font-medium text-gray-700">National ID<input required value={tenantForm.data.national_id} onChange={e => tenantForm.setData('national_id', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label> : <><label className="text-sm font-medium text-gray-700">Registration number<input required value={tenantForm.data.registration_number} onChange={e => tenantForm.setData('registration_number', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label><label className="text-sm font-medium text-gray-700">Contact person<input required value={tenantForm.data.contact_person} onChange={e => tenantForm.setData('contact_person', e.target.value)} className="mt-1 w-full rounded-xl border-gray-200" /></label></>}
                                                            </div>
                                                            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowTenantForm(false)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button><button disabled={tenantForm.processing} className="rounded-xl bg-[#0E3B2E] px-4 py-2 text-sm font-medium text-white">Create tenant</button></div>
                                                        </form>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {units.links && units.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/30 p-4">
                                <p className="text-xs text-gray-400">
                                    Showing {units.from} to {units.to} of {units.total} units
                                </p>
                                <div className="flex gap-1">
                                    {units.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-[#0E3B2E] text-white'
                                                    : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'cursor-not-allowed text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {unitToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Delete Unit</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete unit "{unitToDelete.unit_number}"? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setUnitToDelete(null)}
                                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}