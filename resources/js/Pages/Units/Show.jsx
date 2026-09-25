import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Home, DollarSign, Edit, MapPin, Upload, Download, Trash2, FileText } from 'lucide-react';

const statusStyles = {
    vacant: 'bg-green-50 text-green-700 ring-1 ring-green-600/10',
    occupied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
    maintenance: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
};

export default function UnitShow({ property, unit }) {
    const tenancy = unit.active_tenancy;
    const leaseForm = useForm({ lease: null, notes: '' });

    const submitLease = (event) => {
        event.preventDefault();
        leaseForm.post(route('properties.units.tenancy.leases.store', [property, unit, tenancy.id]), {
            forceFormData: true,
            onSuccess: () => leaseForm.reset(),
        });
    };

    const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

    return (
        <AuthenticatedLayout header={`${unit.unit_number} - Details`}>
            <Head title={`Unit ${unit.unit_number}`} />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href={route('properties.units.index', property)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-[#0E3B2E]"
                >
                    <ArrowLeft size={16} />
                    Back to Units
                </Link>

                <Link
                    href={route('properties.units.edit', [property, unit])}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                >
                    <Edit size={15} />
                    Edit Unit
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E3B2E]/10">
                                        <Home size={24} className="text-[#0E3B2E]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {unit.unit_number}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {unit.unit_type?.name || 'Unit'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`self-start rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[unit.status]}`}>
                                    {unit.status}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                Unit Details
                            </h3>
                            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Property</dt>
                                    <dd className="mt-1 text-sm font-medium text-gray-900">{property.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Unit Type</dt>
                                    <dd className="mt-1 text-sm font-medium text-gray-900">{unit.unit_type?.name || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Monthly Rent</dt>
                                    <dd className="mt-1 flex items-center gap-1">
                                        <DollarSign size={14} className="text-gray-400" />
                                        <span className="text-sm font-semibold text-gray-900">
                                            {Number(unit.rent_amount).toLocaleString()} RWF
                                        </span>
                                        {unit.size_sqm != null && unit.size_sqm !== '' && (
                                            <span className="text-sm font-medium text-gray-500">
                                                {' '}· {Number(unit.size_sqm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                                            </span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Size (m²)</dt>
                                    <dd className="mt-1 text-sm font-medium text-gray-900">
                                        {unit.size_sqm != null && unit.size_sqm !== ''
                                            ? `${Number(unit.size_sqm).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[unit.status]}`}>
                                            {unit.status}
                                        </span>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {unit.description && (
                            <div className="border-t border-gray-100 p-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Description
                                </h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {unit.description}
                                </p>
                            </div>
                        )}
                    </div>
                                {tenancy && (
                                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                                        <div className="border-b border-gray-100 p-6">
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tenancy & leases</h3>
                                            <p className="mt-1 text-sm text-gray-700">{tenancy.tenant?.name} · Started {tenancy.start_date}</p>
                                        </div>
                                        <form onSubmit={submitLease} className="space-y-3 border-b border-gray-100 p-6">
                                            <label className="block text-sm font-medium text-gray-700">Upload lease</label>
                                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => leaseForm.setData('lease', e.target.files[0])} className="block w-full text-sm text-gray-600" required />
                                            <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG or PNG. Maximum 10 MB.</p>
                                            <input type="text" value={leaseForm.data.notes} onChange={(e) => leaseForm.setData('notes', e.target.value)} placeholder="Optional note" className="w-full rounded-lg border-gray-300 text-sm" />
                                            {leaseForm.errors.lease && <p className="text-sm text-red-600">{leaseForm.errors.lease}</p>}
                                            <button disabled={leaseForm.processing} className="inline-flex items-center gap-2 rounded-xl bg-[#0E3B2E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                                                <Upload size={15} /> {leaseForm.processing ? 'Uploading…' : 'Upload lease'}
                                            </button>
                                        </form>
                                        <div className="divide-y divide-gray-100">
                                            {tenancy.leases?.length ? tenancy.leases.map((lease) => (
                                                <div key={lease.id} className="flex items-center justify-between gap-3 p-4">
                                                    <div className="flex min-w-0 items-center gap-3"><FileText size={18} className="shrink-0 text-gray-400" /><div className="min-w-0"><p className="truncate text-sm font-medium text-gray-900">{lease.original_name}</p><p className="text-xs text-gray-500">{formatSize(lease.size)}</p></div></div>
                                                    <div className="flex shrink-0 items-center gap-2"><a href={route('properties.units.tenancy.leases.download', [property, unit, tenancy.id, lease.id])} className="rounded-lg p-2 text-[#0E3B2E] hover:bg-gray-100" aria-label={`Download ${lease.original_name}`}><Download size={16} /></a><Link as="button" method="delete" href={route('properties.units.tenancy.leases.destroy', [property, unit, tenancy.id, lease.id])} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${lease.original_name}`}><Trash2 size={16} /></Link></div>
                                                </div>
                                            )) : <p className="p-6 text-sm text-gray-500">No leases uploaded yet.</p>}
                                        </div>
                                    </div>
                                )}
                </div>

                <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin size={16} className="text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    Property Location
                                </h3>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{property.name}</p>
                            <p className="mt-1 text-sm text-gray-500">{property.address}</p>
                            {property.cell?.sector?.district?.province && (
                                <div className="mt-3 space-y-1 text-xs text-gray-500">
                                    <p>{property.cell.sector.district.province.name} Province</p>
                                    <p>{property.cell.sector.district.name} District</p>
                                    <p>{property.cell.sector.name} Sector</p>
                                    <p>{property.cell.name} Cell</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-[#0E3B2E] to-[#0a2e23] shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-[#D9A441] uppercase tracking-wide mb-2">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href={route('properties.units.edit', [property, unit])}
                                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20"
                            >
                                <Edit size={15} />
                                Edit this Unit
                            </Link>
                            <Link
                                href={route('properties.units.index', property)}
                                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20"
                            >
                                <ArrowLeft size={15} />
                                View All Units
                            </Link>
                            <Link
                                href={route('properties.show', property)}
                                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20"
                            >
                                <Home size={15} />
                                Go to Property
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
