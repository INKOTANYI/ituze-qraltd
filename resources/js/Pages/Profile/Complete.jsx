import InputError from '@/Components/InputError';
import InlineAlert from '@/Components/InlineAlert';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { IdCard, Camera, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Complete() {
    const { data, setData, post, processing, errors } = useForm({
        national_id: '',
        profile_photo: null,
        sector_id: '',
    });

    const [preview, setPreview] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [locError, setLocError] = useState('');

    const hasErrors = Object.keys(errors).length > 0;

    useEffect(() => {
        fetch('/api/provinces')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load provinces');
                return res.json();
            })
            .then(data => setProvinces(data))
            .catch(e => {
                console.error(e);
                setLocError('⚠️ Failed to load location data. Please refresh the page or check if the PHP/Laravel server is running on port 8000.');
            });
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`/api/districts/${selectedProvince}`)
                .then(res => { if (!res.ok) throw new Error('Bad response'); return res.json(); })
                .then(data => {
                    setDistricts(data);
                    setSectors([]);
                    setSelectedDistrict('');
                    setData('sector_id', '');
                })
                .catch(e => {
                    console.error(e);
                    setLocError('⚠️ Failed to load districts. Please try again.');
                });
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            fetch(`/api/sectors/${selectedDistrict}`)
                .then(res => { if (!res.ok) throw new Error('Bad response'); return res.json(); })
                .then(data => setSectors(data))
                .catch(e => {
                    console.error(e);
                    setLocError('⚠️ Failed to load sectors. Please try again.');
                });
        }
    }, [selectedDistrict]);

    const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB (matches Laravel max:2048)

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // --- CLIENT-SIDE SIZE VALIDATION (INSTANT! No server round-trip)
        if (file.size > MAX_PHOTO_SIZE_BYTES) {
            const sizeMB = (file.size / (1024*1024)).toFixed(2);
            setLocError(`📸 Photo is ${sizeMB} MB (${Math.round(file.size/1024)} KB) but the maximum allowed size is 2 MB. Please choose a smaller image or compress it first.`);
            e.target.value = ''; // clear the input
            setPreview(null);
            setData('profile_photo', null);
            return;
        }

        // Check file type (extra safety: must be image)
        if (!file.type.startsWith('image/')) {
            setLocError('⚠️ Please select an image file (JPG, PNG, etc.) - other types are not allowed.');
            e.target.value = '';
            setPreview(null);
            setData('profile_photo', null);
            return;
        }

        setLocError('');
        setData('profile_photo', file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Final client-side pre-flight sanity check BEFORE sending to server
        const missing = [];
        if (!data.profile_photo) missing.push('Profile Photo');
        if (!data.national_id || data.national_id.trim() === '') missing.push('National ID Number');
        if (!data.sector_id) missing.push('Location (Sector)');

        if (missing.length > 0) {
            setLocError('⚠️ Please fill in all required fields before submitting: ' + missing.join(', '));
            return;
        }
        if (data.profile_photo && data.profile_photo.size > MAX_PHOTO_SIZE_BYTES) {
            setLocError('📸 Profile photo is too large. Please select an image smaller than 2MB.');
            return;
        }

        post(route('profile.complete.store'), {
            forceFormData: true,
            onError: (err) => {
                console.log('SERVER ERRORS:', err);
                if (err && typeof err === 'object' && Object.keys(err).length > 0) {
                    setLocError('❌ Server rejected the form. Please check the errors below each field.');
                }
            },
        });
    };

    const inputBase =
        'w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-3 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15';

    const selectBase =
        'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-800 transition-all focus:border-[#0E3B2E] focus:bg-white focus:ring-2 focus:ring-[#0E3B2E]/15 disabled:opacity-50';

    return (
        <GuestLayout>
            <Head title="Complete Your Profile" />

            <div className="pt-5 text-center">
                <h2 className="font-[Sora] text-2xl font-bold text-gray-800">
                    Complete Your Profile
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                    Just one more step before you can start using Ituze QR
                    Ltd
                </p>
            </div>

            {locError && (
                <div className="mt-7 mb-0">
                    <InlineAlert type="warning" message={locError} />
                </div>
            )}

            {hasErrors && (
                <div className="mt-7 mb-0">
                    <InlineAlert
                        type="error"
                        message={
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="flex-none mt-0.5" />
                                <div>
                                    <div className="font-semibold mb-1">Please fix the following errors and try again:</div>
                                    <ul className="list-disc pl-5 space-y-0.5 text-xs">
                                        {errors.national_id && <li>National ID: {errors.national_id}</li>}
                                        {errors.profile_photo && <li>Profile Photo: {errors.profile_photo}</li>}
                                        {errors.sector_id && <li>Location (Sector): {errors.sector_id}</li>}
                                    </ul>
                                </div>
                            </div>
                        }
                    />
                </div>
            )}

            <form onSubmit={submit} className="mt-7 space-y-5">
                <div className="flex flex-col items-center">
                    <label
                        htmlFor="profile_photo"
                        className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-[#0E3B2E]"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Camera
                                size={24}
                                className="text-gray-400 group-hover:text-[#0E3B2E]"
                            />
                        )}
                        <input
                            id="profile_photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </label>
                    <p className="mt-2 text-xs text-gray-400">
                        Click to upload a profile photo
                        <span className="text-amber-600 font-medium ml-1">(Max 2 MB · JPG or PNG)</span>
                    </p>
                    <InputError
                        message={errors.profile_photo}
                        className="mt-1"
                    />
                </div>

                <div>
                    <label
                        htmlFor="national_id"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        National ID Number
                    </label>
                    <div className="group relative">
                        <IdCard
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0E3B2E]"
                        />
                        <input
                            id="national_id"
                            name="national_id"
                            value={data.national_id}
                            placeholder="1 1234 5678901 2 34"
                            onChange={(e) =>
                                setData('national_id', e.target.value)
                            }
                            className={inputBase}
                            required
                        />
                    </div>
                    <InputError
                        message={errors.national_id}
                        className="mt-1"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Location
                    </label>
                    <div className="group relative mb-1">
                        <MapPin
                            size={18}
                            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <select
                            value={selectedProvince}
                            onChange={(e) => {
                                setSelectedProvince(e.target.value);
                                setData('sector_id', '');
                            }}
                            className={selectBase}
                        >
                            <option value="">Select Province</option>
                            {provinces.map(province => (
                                <option key={province.id} value={province.id}>{province.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setData('sector_id', '');
                            }}
                            disabled={!selectedProvince}
                            className={selectBase}
                        >
                            <option value="">Select District</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>{district.name}</option>
                            ))}
                        </select>
                        <select
                            value={data.sector_id}
                            onChange={(e) => setData('sector_id', e.target.value)}
                            disabled={!selectedDistrict}
                            className={selectBase}
                        >
                            <option value="">Select Sector</option>
                            {sectors.map(sector => (
                                <option key={sector.id} value={sector.id}>{sector.name}</option>
                            ))}
                        </select>
                        <InputError
                            message={errors.sector_id}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#D9A441] py-3.5 text-sm font-semibold tracking-wide text-[#0E3B2E] shadow-sm transition-all hover:bg-[#c9962f] hover:shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {processing && <Loader2 size={18} className="animate-spin" />}
                    {processing ? 'SAVING...' : 'COMPLETE PROFILE'}
                </button>
            </form>
        </GuestLayout>
    );
}