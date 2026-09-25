import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, MapPin, Building2, Edit, Trash2, Image as ImageIcon, DollarSign, CheckCircle, Users, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const statusStyles = {
    active: 'bg-green-50 text-green-700 ring-1 ring-green-600/10',
    inactive: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10',
};

const propertyTypeStyles = {
    'Office': 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
    'Apartment': 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/10',
    'Warehouse': 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/10',
    'Commercial': 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/10',
};

export default function PropertiesIndex({ properties, filters, isAdmin, currentUserId }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('properties.index'), { search, status }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timeout);
    }, [search, status]);

    const confirmDelete = () => {
        if (!propertyToDelete) return;
        if (!isAdmin && propertyToDelete.owner_id !== currentUserId) return;
        
        router.delete(route('properties.destroy', propertyToDelete), {
            onSuccess: () => setPropertyToDelete(null),
        });
    };

    return (
        <AuthenticatedLayout header="My Properties">
            <Head title="My Properties" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search properties..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-sm text-gray-600 transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <Link
                        href={route('properties.create')}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                    >
                        <Plus size={15} />
                        Add Property
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                {properties.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {search || status ? 'Try adjusting your search filters' : 'Get started by adding your first property'}
                        </p>
                        {!search && !status && (
                            <Link
                                href={route('properties.create')}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                            >
                                <Plus size={15} />
                                Add Property
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                            {properties.data.map((property) => (
                                <div
                                    key={property.id}
                                    className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-md hover:border-[#0E3B2E]/20"
                                >
                                    {property.images && property.images.length > 0 ? (
                                        <div className="relative h-48 overflow-hidden bg-gray-100">
                                            <img
                                                src={`/storage/${property.images[0].image_path}`}
                                                alt={property.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[property.status]}`}>
                                                    {property.status}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <CheckCircle size={10} className="text-green-300" /> Vacant {property.units_vacant_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <Users size={10} className="text-blue-300" /> Occupied {property.units_occupied_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <Wrench size={10} className="text-amber-300" /> Maint {property.units_maintenance_count ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative h-48 flex items-center justify-center bg-gray-100">
                                            <ImageIcon size={48} className="text-gray-300" />
                                            <div className="absolute top-2 right-2">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[property.status]}`}>
                                                    {property.status}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-800/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <CheckCircle size={10} className="text-green-300" /> Vacant {property.units_vacant_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-800/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <Users size={10} className="text-blue-300" /> Occupied {property.units_occupied_count ?? 0}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-800/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]">
                                                    <Wrench size={10} className="text-amber-300" /> Maint {property.units_maintenance_count ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-semibold text-gray-900">{property.name}</h3>
                                            {property.property_type && (
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${propertyTypeStyles[property.property_type.name] || 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'}`}>
                                                    {property.property_type.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin size={14} />
                                            {property.address}
                                        </p>
                                        {property.cell && (
                                            <p className="mt-1 text-xs text-gray-400">
                                                {property.cell.name}, {property.cell.sector?.district?.name}
                                            </p>
                                        )}
                                        {(() => {
                                            const amenities = property.amenities;
                                            const rawKeys = amenities
                                                ? (Array.isArray(amenities)
                                                    ? amenities
                                                    : Object.keys(amenities).filter(k => amenities[k] === true || amenities[k] === 1 || amenities[k] === '1'))
                                                : [];
                                            const BASIC_AMENITY_KEYS = ['parking', 'security', 'generator', 'water_tank', 'elevator', 'cleaning_service'];
                                            const isApartment = property.property_type?.name === 'Apartment';
                                            const keys = isApartment ? rawKeys : rawKeys.filter(k => BASIC_AMENITY_KEYS.includes(k));
                                            const keyIcons = { wifi: 'WiFi', parking: 'Parking', security: 'Security', gym: 'Gym', swimming_pool: 'Pool', restaurant: 'Restaurant', bar: 'Bar' };
                                            const visible = keys.filter(k => Object.keys(keyIcons).includes(k)).slice(0, 3);
                                            if (visible.length === 0) return null;
                                            return (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {visible.map(k => (
                                                        <span key={k} className="rounded-md bg-[#0E3B2E]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0E3B2E]">
                                                            {keyIcons[k]}
                                                        </span>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                        <div className="mt-3 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs text-gray-400">
                                                        {(() => {
                                                        const plannedUnits = property.total_units !== null && property.total_units !== undefined && property.total_units !== '' ? Number(property.total_units) : null;
                                                        const actualUnits = property.units_count !== undefined ? Number(property.units_count) : null;
                                                        const displayUnits = plannedUnits ?? actualUnits ?? 0;
                                                        const label = `${displayUnits} unit${displayUnits === 1 ? '' : 's'}`;
                                                        if (property.total_floors !== null && property.total_floors !== undefined && property.total_floors !== '') {
                                                            const fl = Number(property.total_floors);
                                                            return `${label} · ${fl} floor${fl === 1 ? '' : 's'}`;
                                                        }
                                                        return label;
                                                    })()}
                                                    </span>
                                                    {(property.total_units !== null && property.total_units !== undefined && property.units_count !== undefined && Number(property.total_units) !== Number(property.units_count)) && (
                                                        <p className="text-[10px] text-amber-600 mt-0.5">
                                                            ⚠ Configured: {property.total_units} · Actual: {property.units_count ?? 0}
                                                        </p>
                                                    )}
                                                </div>
                                                {property.units_monthly_rent_sum && Number(property.units_monthly_rent_sum) > 0 ? (
                                                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#0E3B2E]">
                                                        <DollarSign size={11} />
                                                        {Number(property.units_monthly_rent_sum).toLocaleString()} RWF/mo
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('properties.show', property)}
                                                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#0E3B2E] transition-colors hover:bg-[#0E3B2E]/10"
                                                >
                                                    View
                                                </Link>
                                                {(isAdmin || property.owner_id === currentUserId) && (
                                                    <>
                                                        <Link
                                                            href={route('properties.edit', property)}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={() => setPropertyToDelete(property)}
                                                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {properties.links && properties.links.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/30 p-4">
                                <p className="text-xs text-gray-400">
                                    Showing {properties.from} to {properties.to} of {properties.total} properties
                                </p>
                                <div className="flex gap-1">
                                    {properties.links.map((link, i) => (
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
            {propertyToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900">Delete Property</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to delete "{propertyToDelete.name}"? This action cannot be undone and will also delete all associated units and images.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setPropertyToDelete(null)}
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