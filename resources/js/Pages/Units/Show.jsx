import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, DollarSign, Edit, MapPin } from 'lucide-react';

const statusStyles = {
    vacant: 'bg-green-50 text-green-700 ring-1 ring-green-600/10',
    occupied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
    maintenance: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
};

export default function UnitShow({ property, unit }) {
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
