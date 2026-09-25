import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Home, DollarSign, Grid3x3 } from 'lucide-react';

export default function UnitCreate({ property, unitTypes }) {
    const { data, setData, errors, processing, post } = useForm({
        unit_type_id: '',
        unit_number: '',
        rent_amount: '',
        size_sqm: '',
        description: '',
        status: 'vacant',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('properties.units.store', property));
    };

    return (
        <AuthenticatedLayout header={`Add Unit to ${property.name}`}>
            <Head title="Add Unit" />

            <div className="mb-6">
                <Link
                    href={route('properties.units.index', property)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-[#0E3B2E]"
                >
                    <ArrowLeft size={16} />
                    Back to Units
                </Link>
            </div>

            <div className="max-w-2xl">
                <div className="mb-4 rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Property:</span> {property.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        {property.address}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Unit Information</h3>
                            
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit Number *</label>
                                    <input
                                        type="text"
                                        value={data.unit_number}
                                        onChange={(e) => setData('unit_number', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                        placeholder="e.g., A-101, B-205"
                                    />
                                    {errors.unit_number && <p className="mt-1 text-sm text-red-500">{errors.unit_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit Type *</label>
                                    <select
                                        value={data.unit_type_id}
                                        onChange={(e) => setData('unit_type_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                    >
                                        <option value="">Select Unit Type</option>
                                        {unitTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    {errors.unit_type_id && <p className="mt-1 text-sm text-red-500">{errors.unit_type_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Rent (RWF) *</label>
                                    <div className="relative mt-1">
                                        <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={data.rent_amount}
                                            onChange={(e) => setData('rent_amount', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                            placeholder="e.g., 150000"
                                            min="0"
                                            step="100"
                                        />
                                    </div>
                                    {errors.rent_amount && <p className="mt-1 text-sm text-red-500">{errors.rent_amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unit Size (m²)</label>
                                    <div className="relative mt-1">
                                        <Grid3x3 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={data.size_sqm}
                                            onChange={(e) => setData('size_sqm', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                            placeholder="e.g., 60"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                        placeholder="Describe the unit features, amenities, etc."
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                    >
                                        <option value="vacant">Vacant</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="maintenance">Under Maintenance</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('properties.units.index', property)}
                            className="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#0E3B2E] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23] disabled:opacity-50"
                        >
                            {processing ? 'Creating...' : 'Create Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}