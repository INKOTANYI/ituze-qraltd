import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InlineAlert from '@/Components/InlineAlert';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, X, Trash2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const ALL_AMENITIES = [
    { key: 'wifi', label: 'WiFi' },
    { key: 'parking', label: 'Parking' },
    { key: 'gym', label: 'Gym' },
    { key: 'swimming_pool', label: 'Swimming Pool' },
    { key: 'restaurant', label: 'Restaurant' },
    { key: 'bar', label: 'Bar' },
    { key: 'security', label: 'Security' },
    { key: 'generator', label: 'Generator' },
    { key: 'water_tank', label: 'Water Tank' },
    { key: 'elevator', label: 'Elevator' },
    { key: 'cleaning_service', label: 'Cleaners' },
];

const BASIC_AMENITY_KEYS = ['parking', 'security', 'generator', 'water_tank', 'elevator', 'cleaning_service'];

const PROXIMITY = [
    { key: 'near_tarmac', label: 'Near Tarmac Road' },
    { key: 'near_school', label: 'Near School' },
    { key: 'near_hospital', label: 'Near Hospital' },
    { key: 'near_market', label: 'Near Market' },
    { key: 'near_public_transport', label: 'Near Public Transport' },
];

const getAmenitiesForType = (propertyTypeId, propertyTypes, fallbackTypeName) => {
    const selected = propertyTypes.find(p => String(p.id) === String(propertyTypeId));
    const typeName = selected?.name || fallbackTypeName || '';
    const isApartment = typeName.toLowerCase() === 'apartment';
    if (isApartment) return ALL_AMENITIES;
    return ALL_AMENITIES.filter(a => BASIC_AMENITY_KEYS.includes(a.key));
};

const getCsrfToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (meta) return meta;
    const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : '';
};

const buildInitialBooleans = (source, keys, def = false) => {
    const out = Object.fromEntries(keys.map(k => [k, def]));
    if (!source) return out;
    if (Array.isArray(source)) {
        source.forEach(k => { if (k in out) out[k] = true; });
    } else if (typeof source === 'object') {
        Object.keys(out).forEach(k => {
            if (source[k] === true || source[k] === '1' || source[k] === 1) out[k] = true;
        });
    }
    return out;
};

export default function PropertyEdit({ property, canEdit }) {
    if (!canEdit) {
        return (
            <AuthenticatedLayout header="Access Denied">
                <Head title="Access Denied" />
                <div className="p-12 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
                    <p className="mt-1 text-sm text-gray-500">You do not have permission to edit this property.</p>
                    <Link
                        href={route('properties.show', property)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23]"
                    >
                        Back to Property
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    const { data, setData, errors, processing, put } = useForm({
        name: property.name || '',
        address: property.address || '',
        description: property.description || '',
        cell_id: property.cell_id || '',
        property_type_id: property.property_type_id || '',
        status: property.status || 'active',
        total_floors: property.total_floors !== null && property.total_floors !== undefined ? String(property.total_floors) : '',
        bedrooms: property.bedrooms !== null && property.bedrooms !== undefined ? String(property.bedrooms) : '',
        bathrooms: property.bathrooms !== null && property.bathrooms !== undefined ? String(property.bathrooms) : '',
        amenities: buildInitialBooleans(property.amenities, ALL_AMENITIES.map(a => a.key), false),
        proximity: buildInitialBooleans(property.proximity, PROXIMITY.map(p => p.key), false),
        images: [],
        delete_images: [],
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [cells, setCells] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [bannerMsg, setBannerMsg] = useState(null);
    const [bannerType, setBannerType] = useState('info');
    const [generatingDescription, setGeneratingDescription] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/provinces')
            .then(res => res.json())
            .then(data => setProvinces(data));

        fetch('/api/property-types')
            .then(res => res.json())
            .then(data => setPropertyTypes(data));

        if (property.cell) {
            setSelectedProvince(property.cell.sector?.district?.province_id || '');
            setSelectedDistrict(property.cell.sector?.district_id || '');
            setSelectedSector(property.cell.sector_id || '');
        }
    }, [property]);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`/api/districts/${selectedProvince}`)
                .then(res => res.json())
                .then(data => {
                    setDistricts(data);
                    setSectors([]);
                    setCells([]);
                });
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`/api/sectors/${selectedDistrict}`)
                .then(res => res.json())
                .then(data => {
                    setSectors(data);
                    setCells([]);
                });
        }
    }, [selectedDistrict]);

    useEffect(() => {
        if (selectedSector) {
            fetch(`/api/cells/${selectedSector}`)
                .then(res => res.json())
                .then(data => setCells(data));
        }
    }, [selectedSector]);

    const getLocationNames = () => {
        const prov = provinces.find(p => String(p.id) === String(selectedProvince));
        const dist = districts.find(d => String(d.id) === String(selectedDistrict));
        const sec = sectors.find(s => String(s.id) === String(selectedSector));
        const cel = cells.find(c => String(c.id) === String(data.cell_id));
        return {
            province_name: prov?.name || property.cell?.sector?.district?.province?.name || '',
            district_name: dist?.name || property.cell?.sector?.district?.name || '',
            sector_name: sec?.name || property.cell?.sector?.name || '',
            cell_name: cel?.name || property.cell?.name || '',
        };
    };

    const getPropertyTypeName = () => {
        const pt = propertyTypes.find(p => String(p.id) === String(data.property_type_id));
        return pt?.name || property.property_type?.name || '';
    };

    const handleGenerateDescription = async () => {
        if (!data.name || !String(data.name).trim()) {
            setBannerMsg('⚠️ Please enter a property name first, then click Generate — this helps the AI craft personalised copy.');
            setBannerType('warning');
            return;
        }
        setGeneratingDescription(true);
        setBannerMsg(null);

        try {
            const locationNames = getLocationNames();
            const body = {
                name: data.name,
                address: data.address,
                property_type_id: data.property_type_id || null,
                property_type_name: getPropertyTypeName(),
                cell_id: data.cell_id || null,
                ...locationNames,
                total_floors: data.total_floors ? Number(data.total_floors) : null,
                amenities: data.amenities,
                proximity: data.proximity,
            };

            const csrfToken = getCsrfToken();
            const res = await fetch('/api/ai/generate-property-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify(body),
                credentials: 'same-origin',
            });

            if (!res.ok) {
                let msg = `Server returned status ${res.status}`;
                try {
                    const errJson = await res.json();
                    if (errJson && errJson.errors) {
                        const bullets = Object.entries(errJson.errors)
                            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(v) ? v.join('; ') : v}`)
                            .slice(0, 4)
                            .join(' · ');
                        msg = '⚠️ Server validation issues: ' + bullets;
                    } else if (errJson && errJson.message) {
                        msg = errJson.message;
                    }
                } catch (_) { /* ignore */ }
                throw new Error(msg);
            }

            const json = await res.json();
            if (json && json.description) {
                setData('description', json.description);
                let info = '✨ Description generated successfully.';
                if (json.source === 'template') {
                    info += ' (Using local template — configure an LLM key for richer copy.)';
                } else if (json.source === 'fallback') {
                    info += ' ⚠️ AI endpoint hit a snag; using local template copy.';
                }
                setBannerMsg(info);
                setBannerType('info');
            } else {
                throw new Error('Empty response from generator');
            }
        } catch (err) {
            console.error('AI generate error:', err);
            setBannerMsg(err?.message || '⚠️ Could not generate description right now — the AI service is unreachable. You can still write a great manual description below!');
            setBannerType('warning');
        } finally {
            setGeneratingDescription(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024
        );

        if (validFiles.length !== files.length) {
            setBannerMsg('📸 Some files were rejected. Only images under 2MB are allowed.');
            setBannerType('warning');
        }

        setData('images', [...data.images, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const markImageForDeletion = (imageId) => {
        if (imagesToDelete.includes(imageId)) {
            setImagesToDelete(imagesToDelete.filter(id => id !== imageId));
        } else {
            setImagesToDelete([...imagesToDelete, imageId]);
        }
    };

    const toggleAmenity = (key) => {
        setData('amenities', { ...data.amenities, [key]: !data.amenities[key] });
    };

    const toggleProximity = (key) => {
        setData('proximity', { ...data.proximity, [key]: !data.proximity[key] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.total_floors !== '' && data.total_floors !== null && Number(data.total_floors) < 1) {
            setBannerMsg('⚠️ Total Floors must be at least 1 (ground floor counts as 1).');
            setBannerType('warning');
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'put');
        formData.append('name', data.name);
        formData.append('address', data.address);
        formData.append('description', data.description || '');
        formData.append('cell_id', data.cell_id);
        if (data.property_type_id) {
            formData.append('property_type_id', data.property_type_id);
        }
        formData.append('status', data.status);
        if (data.total_floors !== '' && data.total_floors !== null && data.total_floors !== undefined) {
            formData.append('total_floors', data.total_floors);
        }
        if (isApartment && data.bedrooms !== '' && data.bedrooms !== null && data.bedrooms !== undefined) {
            formData.append('bedrooms', data.bedrooms);
        }
        if (isApartment && data.bathrooms !== '' && data.bathrooms !== null && data.bathrooms !== undefined) {
            formData.append('bathrooms', data.bathrooms);
        }

        getAmenitiesForType(data.property_type_id, propertyTypes, property.property_type?.name).forEach(a => {
            formData.append(`amenities[${a.key}]`, data.amenities[a.key] ? '1' : '0');
        });
        PROXIMITY.forEach(p => {
            formData.append(`proximity[${p.key}]`, data.proximity[p.key] ? '1' : '0');
        });

        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        imagesToDelete.forEach((imageId, index) => {
            formData.append(`delete_images[${index}]`, imageId);
        });

        setIsSubmitting(true);
        router.post(route('properties.update', property.id), formData, {
            onFinish: () => setIsSubmitting(false),
            onError: (errs) => {
                if (errs && Object.keys(errs).length > 0) {
                    const firstErr = Object.values(errs)[0];
                    setBannerMsg(`⚠️ ${firstErr}`);
                    setBannerType('warning');
                }
            },
        });
    };

    const isApartment = (propertyTypes.find(p => String(p.id) === String(data.property_type_id))?.name
        || property.property_type?.name || '').toLowerCase() === 'apartment';

    return (
        <AuthenticatedLayout header="Edit Property">
            <Head title="Edit Property" />

            <div className="mb-6">
                <Link
                    href={route('properties.show', property)}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-[#0E3B2E]"
                >
                    <ArrowLeft size={16} />
                    Back to Property
                </Link>
            </div>

            <div className="max-w-2xl">
                {bannerMsg && (
                    <div className="mb-4">
                        <InlineAlert message={bannerMsg} type={bannerType} />
                    </div>
                )}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-4">
                        <InlineAlert
                            type="error"
                            message={
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={16} className="flex-none mt-0.5" />
                                    <div>
                                        <div className="font-semibold mb-1">Please fix these errors before submitting:</div>
                                        <ul className="list-disc pl-5 space-y-0.5 text-xs">
                                            {Object.entries(errors).slice(0, 8).map(([field, msg]) => (
                                                <li key={field}><span className="capitalize">{field.replace(/_/g, ' ')}:</span> {msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Property Name *</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                        placeholder="e.g., Kigali Heights Apartments"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                                    <select
                                        value={data.property_type_id}
                                        onChange={(e) => setData('property_type_id', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                    >
                                        <option value="">Select Property Type</option>
                                        {propertyTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                    {errors.property_type_id && <p className="mt-1 text-sm text-red-500">{errors.property_type_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address *</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                        placeholder="e.g., KG 123 St, Kigali"
                                    />
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                                </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Total Floors
                                            <span className="ml-1 text-xs text-gray-400">(incl. ground)</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.total_floors}
                                            onChange={(e) => setData('total_floors', e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                            placeholder="e.g., 4 (ground = 1)"
                                        />
                                        {errors.total_floors && <p className="mt-1 text-sm text-red-500">{errors.total_floors}</p>}
                                    </div>

                                {isApartment && (
                                    <div className="rounded-2xl border border-[#0E3B2E]/10 bg-[#0E3B2E]/[0.03] p-4">
                                        <p className="text-sm font-semibold text-[#0E3B2E]">Apartment details</p>
                                        <p className="mt-1 text-xs text-gray-500">Add the room details renters use to compare apartments.</p>
                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Number of Bedrooms</label>
                                                <input type="number" min="0" value={data.bedrooms} onChange={(e) => setData('bedrooms', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0E3B2E] focus:ring-2 focus:ring-[#0E3B2E]/15" placeholder="e.g., 3" />
                                                {errors.bedrooms && <p className="mt-1 text-sm text-red-500">{errors.bedrooms}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Number of Bathrooms</label>
                                                <input type="number" min="0" value={data.bathrooms} onChange={(e) => setData('bathrooms', e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-[#0E3B2E] focus:ring-2 focus:ring-[#0E3B2E]/15" placeholder="e.g., 2" />
                                                {errors.bathrooms && <p className="mt-1 text-sm text-red-500">{errors.bathrooms}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={generatingDescription}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#0E3B2E]/30 bg-[#0E3B2E]/5 px-3 py-1.5 text-xs font-medium text-[#0E3B2E] transition-all hover:bg-[#0E3B2E]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generatingDescription ? (
                                                <><Loader2 size={13} className="animate-spin" /> Generating...</>
                                            ) : (
                                                <><Sparkles size={13} /> Generate Description with AI</>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={6}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                        placeholder="Describe your property... or click Generate above!"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                                    <div className="mt-2 grid grid-cols-2 gap-3">
                                        <div>
                                            <select
                                                value={selectedProvince}
                                                onChange={(e) => {
                                                    setSelectedProvince(e.target.value);
                                                    setSelectedDistrict('');
                                                    setSelectedSector('');
                                                    setData('cell_id', '');
                                                }}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                            >
                                                <option value="">Select Province</option>
                                                {provinces.map(province => (
                                                    <option key={province.id} value={province.id}>{province.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={selectedDistrict}
                                                onChange={(e) => {
                                                    setSelectedDistrict(e.target.value);
                                                    setSelectedSector('');
                                                    setData('cell_id', '');
                                                }}
                                                disabled={!selectedProvince}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15 disabled:opacity-50"
                                            >
                                                <option value="">Select District</option>
                                                {districts.map(district => (
                                                    <option key={district.id} value={district.id}>{district.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={selectedSector}
                                                onChange={(e) => {
                                                    setSelectedSector(e.target.value);
                                                    setData('cell_id', '');
                                                }}
                                                disabled={!selectedDistrict}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15 disabled:opacity-50"
                                            >
                                                <option value="">Select Sector</option>
                                                {sectors.map(sector => (
                                                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                value={data.cell_id}
                                                onChange={(e) => setData('cell_id', e.target.value)}
                                                disabled={!selectedSector}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15 disabled:opacity-50"
                                            >
                                                <option value="">Select Cell</option>
                                                {cells.map(cell => (
                                                    <option key={cell.id} value={cell.id}>{cell.name}</option>
                                                ))}
                                            </select>
                                            {errors.cell_id && <p className="mt-1 text-sm text-red-500">{errors.cell_id}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {(() => {
                                    const pt = propertyTypes.find(p => String(p.id) === String(data.property_type_id));
                                    const typeName = pt?.name || property.property_type?.name || '';
                                    return typeName === 'Apartment'
                                        ? 'All amenities available — select any that apply to this Apartment'
                                        : 'Select any amenities that apply';
                                })()}
                            </p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {getAmenitiesForType(data.property_type_id, propertyTypes, property.property_type?.name).map(a => (
                                    <label
                                        key={a.key}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                                            data.amenities[a.key]
                                                ? 'border-[#0E3B2E] bg-[#0E3B2E]/5 ring-2 ring-[#0E3B2E]/10'
                                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-[#0E3B2E] focus:ring-[#0E3B2E]"
                                            checked={!!data.amenities[a.key]}
                                            onChange={() => toggleAmenity(a.key)}
                                        />
                                        <span className="text-sm text-gray-700">{a.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Nearby Infrastructure</h3>
                            <p className="mt-1 text-sm text-gray-500">Select landmarks located close to the property</p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PROXIMITY.map(p => (
                                    <label
                                        key={p.key}
                                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer transition-all ${
                                            data.proximity[p.key]
                                                ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-600/10'
                                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                            checked={!!data.proximity[p.key]}
                                            onChange={() => toggleProximity(p.key)}
                                        />
                                        <span className="text-sm text-gray-700">{p.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
                            <p className="mt-1 text-sm text-gray-500">Manage your property photos (max 2MB per image)</p>

                            {property.images && property.images.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Current Images</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {property.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className={`relative group overflow-hidden rounded-lg border-2 transition-all ${
                                                    imagesToDelete.includes(image.id)
                                                        ? 'border-red-500 opacity-50'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <img
                                                    src={`/storage/${image.image_path}`}
                                                    alt={property.name}
                                                    className="h-24 w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => markImageForDeletion(image.id)}
                                                    className={`absolute top-1 right-1 rounded-full p-1.5 transition-opacity ${
                                                        imagesToDelete.includes(image.id)
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-red-500 text-white opacity-0 group-hover:opacity-100'
                                                    }`}
                                                >
                                                    {imagesToDelete.includes(image.id) ? (
                                                        <X size={12} />
                                                    ) : (
                                                        <Trash2 size={12} />
                                                    )}
                                                </button>
                                                {imagesToDelete.includes(image.id) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <span className="text-xs font-medium text-white">Will be deleted</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={property.images && property.images.length > 0 ? 'mt-6' : 'mt-4'}>
                                <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 transition-all hover:border-[#0E3B2E]/30 hover:bg-[#0E3B2E]/5 cursor-pointer">
                                    <Upload size={32} className="text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-600">Click to upload new images</span>
                                    <span className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                </label>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">New Images to Add</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="h-24 w-full rounded-lg object-cover border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('properties.show', property)}
                            className="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || isSubmitting || generatingDescription}
                            className="rounded-xl bg-[#0E3B2E] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0a2e23] disabled:opacity-50"
                        >
                            {(processing || isSubmitting) && <Loader2 size={16} className="animate-spin inline mr-2" />}
                            {(processing || isSubmitting) ? 'Updating...' : 'Update Property'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
