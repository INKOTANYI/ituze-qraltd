import { Head, Link, router, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Coffee,
    Home,
    Mail,
    Lock,
    Loader2,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    Search,
    Store,
    Warehouse,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const heroSlides = [
    {
        title: 'Premium offices in Kigali',
        subtitle: 'A better address for ambitious teams',
        price: 'From 21,750 RWF / m²',
        location: 'Kacyiru, Kigali',
        image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=88',
    },
    {
        title: 'Spaces made for business',
        subtitle: 'Move into a workspace that works for you',
        price: 'Flexible commercial spaces',
        location: 'Nyarutarama, Kigali',
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=88',
    },
    {
        title: 'Beautiful places to grow',
        subtitle: 'Discover offices, shops, cafés and more',
        price: 'Ready-to-rent properties',
        location: 'Kigali, Rwanda',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=88',
    },
];

const categories = [
    { slug: 'offices', name: 'Offices', icon: Building2, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=82' },
    { slug: 'apartments', name: 'Apartments', icon: Home, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=82' },
    { slug: 'coffee-shops', name: 'Coffee Shops', icon: Coffee, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=82' },
    { slug: 'commercial-buildings', name: 'Commercial Buildings', icon: Store, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=82' },
    { slug: 'warehouses', name: 'Warehouses', icon: Warehouse, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=82' },
];

const propertyLocation = (property) => [
    property.cell?.sector?.name,
    property.cell?.sector?.district?.name,
    property.cell?.sector?.district?.province?.name,
].filter(Boolean).join(', ') || property.address || 'Kigali, Rwanda';

const propertyImage = (property) => {
    const cover = property.images?.find((image) => image.is_cover) || property.images?.[0];
    if (!cover?.image_path) return null;
    return /^https?:\/\//i.test(cover.image_path) ? cover.image_path : `/storage/${cover.image_path}`;
};

const propertyStartingRent = (property) => {
    const units = property.units || [];
    const pricedUnit = units
        .filter((unit) => unit.rent_amount !== null && unit.rent_amount !== undefined)
        .sort((first, second) => Number(first.rent_amount) - Number(second.rent_amount))[0];

    if (!pricedUnit) return 'Price on request';

    const frequency = {
        daily: 'day',
        weekly: 'week',
        monthly: 'month',
        quarterly: 'quarter',
        yearly: 'year',
    }[pricedUnit.rent_frequency] || pricedUnit.rent_frequency;
    const rent = `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(Number(pricedUnit.rent_amount))} RWF`;

    return `${rent} / ${frequency}${pricedUnit.size_sqm ? ` · ${pricedUnit.size_sqm} m²` : ''}`;
};

function PropertyCard({ property }) {
    const image = propertyImage(property);
    const typeLabel = property.units?.[0]?.unit_type?.name || 'Rental space';

    return (
        <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link href={route('public.properties.show', property.id)} className="block">
                <div className="relative h-52 overflow-hidden bg-slate-100">
                    {image ? <img src={image} alt={property.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#064b78]/40"><Building2 size={56} /></div>}
                    <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Available</span>
                </div>
                <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0e3b2e]">{typeLabel}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 transition group-hover:text-[#078dcc]">{property.name}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {propertyLocation(property)}</p>
                    <p className="mt-4 text-base font-bold text-[#0798e6]">{propertyStartingRent(property)}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#0e3b2e]">View details <ArrowRight size={15} /></span>
                </div>
            </Link>
        </article>
    );
}

function InquiryPanel({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Free enquiry</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Find your next space</h2><p className="mt-2 text-sm leading-6 text-slate-500">Tell us what you are looking for and our property team will contact you.</p></div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button>
                </div>
                <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); onClose(); }}>
                    <div className="grid gap-4 sm:grid-cols-2"><input required placeholder="Your name" className="rounded-xl border-slate-200" /><input required placeholder="Phone / WhatsApp" className="rounded-xl border-slate-200" /></div>
                    <input type="email" placeholder="Email (optional)" className="w-full rounded-xl border-slate-200" />
                    <select className="w-full rounded-xl border-slate-200"><option>What type of space?</option><option>Office</option><option>Apartment</option><option>Coffee shop</option><option>Commercial building</option><option>Warehouse</option></select>
                    <textarea required rows="4" placeholder="Describe the space you need..." className="w-full rounded-xl border-slate-200" />
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e3b2e] px-5 py-3 font-bold text-white hover:bg-[#175640]">Send enquiry <MessageCircle size={16} /></button>
                </form>
            </div>
        </div>
    );
}

function LoginPanel({ onClose, canRegister }) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('login'), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-login-title">
            <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                <button type="button" onClick={onClose} aria-label="Close login" className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button>
                <div className="grid grid-cols-2 gap-2 p-3">
                    <div className="rounded-lg bg-[#0E3B2E] py-2.5 text-center text-sm font-semibold text-white shadow-sm">Login</div>
                    {canRegister ? <Link href={route('register')} className="rounded-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-500 transition hover:bg-gray-200">Register</Link> : <div className="rounded-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-400">Register</div>}
                </div>
                <div className="px-6 pb-8 pt-5 sm:px-10">
                    <div className="text-center">
                        <h2 id="welcome-login-title" className="font-[Sora] text-xl font-bold text-gray-800">Welcome back</h2>
                        <p className="mt-1 text-sm text-gray-500">Log in to continue</p>
                    </div>
                    <form onSubmit={submit} className="mt-7 space-y-4">
                        <div>
                            <label htmlFor="welcome-login-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="welcome-login-email" type="email" value={form.data.email} autoComplete="username" autoFocus disabled={form.processing} onChange={(event) => form.setData('email', event.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E] disabled:bg-gray-50" required />
                            </div>
                            <InputError message={form.errors.email} className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="welcome-login-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input id="welcome-login-password" type="password" value={form.data.password} autoComplete="current-password" disabled={form.processing} onChange={(event) => form.setData('password', event.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E] disabled:bg-gray-50" required />
                            </div>
                            <InputError message={form.errors.password} className="mt-1" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.data.remember} disabled={form.processing} onChange={(event) => form.setData('remember', event.target.checked)} className="rounded border-gray-300 text-[#0E3B2E] focus:ring-[#0E3B2E]" /> Remember me</label>
                            <Link href={route('password.request')} className="text-sm text-[#0E3B2E] hover:underline">Forgot password?</Link>
                        </div>
                        <button type="submit" disabled={form.processing} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0a2e23] disabled:cursor-not-allowed disabled:opacity-80">
                            {form.processing ? <><Loader2 size={18} className="animate-spin text-[#D9A441]" /> Signing you in...</> : <><span>LOG IN</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /></>}
                        </button>
                        <p className="text-center text-sm text-gray-500">Don't have an account? {canRegister ? <Link href={route('register')} className="font-medium text-[#0E3B2E] hover:underline">Register</Link> : 'Register'}</p>
                    </form>
                </div>
            </div>
        </div>
    );
}

function RegisterPanel({ onClose }) {
    const form = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('register'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    const fields = [
        ['first_name', 'First name', 'text', 'Jean'],
        ['last_name', 'Last name', 'text', 'Sibomana'],
        ['email', 'Email', 'email', 'you@example.com'],
        ['phone', 'Phone number', 'tel', '078XXXXXXX'],
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-register-title">
            <div className="relative my-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <button type="button" onClick={onClose} aria-label="Close registration" className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={19} /></button>
                <div className="grid grid-cols-2 gap-2 p-3">
                    <div className="rounded-lg bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-500">Login</div>
                    <div className="rounded-lg bg-[#0E3B2E] py-2.5 text-center text-sm font-semibold text-white shadow-sm">Register</div>
                </div>
                <div className="px-6 pb-8 pt-5 sm:px-10">
                    <div className="text-center">
                        <h2 id="welcome-register-title" className="font-[Sora] text-xl font-bold text-gray-800">Create your account</h2>
                        <p className="mt-1 text-sm text-gray-500">Join Ituze-Qra Ltd to manage your property listings.</p>
                    </div>
                    <form onSubmit={submit} className="mt-7 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {fields.map(([name, label, type, placeholder]) => (
                                <div key={name}>
                                    <label htmlFor={`welcome-register-${name}`} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                                    <input id={`welcome-register-${name}`} type={type} value={form.data[name]} placeholder={placeholder} autoComplete={name === 'email' ? 'username' : name === 'phone' ? 'tel' : name === 'first_name' ? 'given-name' : 'family-name'} onChange={(event) => form.setData(name, name === 'phone' ? event.target.value.replace(/\D/g, '') : event.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E]" required />
                                    <InputError message={form.errors[name]} className="mt-1" />
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="welcome-register-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                                <input id="welcome-register-password" type="password" value={form.data.password} autoComplete="new-password" onChange={(event) => form.setData('password', event.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E]" required />
                                <InputError message={form.errors.password} className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="welcome-register-password-confirmation" className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                                <input id="welcome-register-password-confirmation" type="password" value={form.data.password_confirmation} autoComplete="new-password" onChange={(event) => form.setData('password_confirmation', event.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E]" required />
                                <InputError message={form.errors.password_confirmation} className="mt-1" />
                            </div>
                        </div>
                        <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] py-3 text-sm font-semibold text-white transition hover:bg-[#0a2e23] disabled:cursor-not-allowed disabled:opacity-70">{form.processing ? 'Creating account...' : 'Create account'} <ArrowRight size={16} /></button>
                        <p className="text-center text-xs text-gray-500">Your account will be reviewed before property management access is enabled.</p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Welcome({ auth, canLogin, canRegister, properties = [], propertyCategories = [], locations = {}, searchFilters = {} }) {
    const [slide, setSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [inquiryOpen, setInquiryOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [partnerContactSent, setPartnerContactSent] = useState(false);
    const [searchForm, setSearchForm] = useState({
        search: searchFilters.search || '',
        category: searchFilters.category || '',
        province_id: searchFilters.province_id || '',
        district_id: searchFilters.district_id || '',
        sector_id: searchFilters.sector_id || '',
        price_range: searchFilters.price_range || 'any',
    });
    const current = heroSlides[slide];
    const companyPhone = '+250789265436';
    const companyAddress = 'KG 14 Ave, Kigali-Gisozi-Musezero: ULK-Kagugu Road, Source Oil Building';
    const companyMapUrl = 'https://www.google.com/maps/search/?api=1&query=KG%2014%20Ave%2C%20Kigali-Gisozi-Musezero%3A%20ULK-Kagugu%20Road%2C%20Source%20Oil%20Building';

    useEffect(() => {
        const timer = window.setInterval(() => setSlide((value) => (value + 1) % heroSlides.length), 6500);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setSearchForm({
            search: searchFilters.search || '',
            category: searchFilters.category || '',
            province_id: searchFilters.province_id || '',
            district_id: searchFilters.district_id || '',
            sector_id: searchFilters.sector_id || '',
            price_range: searchFilters.price_range || 'any',
        });
    }, [searchFilters.search, searchFilters.category, searchFilters.province_id, searchFilters.district_id, searchFilters.sector_id, searchFilters.price_range]);

    const applySearch = (filters) => {
        router.get('/', filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
        });
    };

    const submitSearch = (event) => {
        event.preventDefault();
        applySearch(searchForm);
    };

    const clearSearch = () => {
        const emptyFilters = { search: '', category: '', province_id: '', district_id: '', sector_id: '', price_range: 'any' };
        setSearchForm(emptyFilters);
        router.get('/', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const availableDistricts = (locations.districts || []).filter((district) => !searchForm.province_id || String(district.province_id) === String(searchForm.province_id));
    const availableSectors = (locations.sectors || []).filter((sector) => !searchForm.district_id || String(sector.district_id) === String(searchForm.district_id));

    return (
        <>
            <Head title="Find your perfect space to rent | Ituze-Qra Ltd" />
            <div className="min-h-screen bg-[#f6f8fa] text-slate-900">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                    <div className="bg-[#063f67] text-white">
                        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3.5 text-xs font-medium sm:flex-row sm:items-center sm:justify-between lg:px-8">
                            <a href={companyMapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/85 transition hover:text-white">
                                <MapPin size={16} className="shrink-0 text-[#f0a052]" />
                                <span>{companyAddress}</span>
                            </a>
                            <div className="flex items-center gap-4">
                                <a href={`tel:${companyPhone}`} className="flex items-center gap-1.5 text-white/90 transition hover:text-white">
                                    <Phone size={16} className="text-[#f0a052]" />
                                    <span>{companyPhone}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tight text-[#064b78]">
                            <img src="/images/logo.png" alt="Ituze-Qra Ltd Logo" className="h-10 w-10 rounded-full object-contain bg-white p-0.5 shadow-sm" />
                            <span>Ituze-Qra Ltd</span>
                        </Link>
                        <nav className="hidden items-center gap-8 text-xs font-bold uppercase text-slate-700 md:flex"><a href="#featured" className="hover:text-[#078dcc]">Home</a><a href="#featured" className="hover:text-[#078dcc]">Properties</a><a href="#categories" className="hover:text-[#078dcc]">Property types</a><a href="#enquiry" className="hover:text-[#078dcc]">Enquiry</a></nav>
                        <div className="flex items-center gap-2">{auth?.user ? <Link href={route('dashboard')} className="rounded bg-[#08a8ec] px-4 py-2 text-xs font-bold uppercase text-white">Dashboard</Link> : <>{canLogin && <button type="button" onClick={() => setLoginOpen(true)} className="hidden px-3 py-2 text-xs font-bold uppercase text-slate-600 sm:block">Log in</button>}<button type="button" onClick={() => setInquiryOpen(true)} className="rounded bg-[#08a8ec] px-4 py-2 text-xs font-bold uppercase text-white">Inquiry</button></>}<button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
                    </div>
                    {menuOpen && <div className="border-t border-slate-100 px-6 py-3 text-sm md:hidden"><a className="block py-2" href="#featured">Properties</a><a className="block py-2" href="#categories">Property types</a><a className="block py-2" href="#enquiry">Enquiry</a>{!auth?.user && canLogin && <button type="button" onClick={() => { setLoginOpen(true); setMenuOpen(false); }} className="block py-2 font-semibold text-slate-700">Log in</button>}{!auth?.user && <button type="button" onClick={() => { setInquiryOpen(true); setMenuOpen(false); }} className="block py-2 font-semibold text-[#078dcc]">Inquiry</button>}</div>}
                </header>

                <main>
                    <section className="relative h-[31rem] overflow-hidden bg-[#0e3b2e]">
                        {heroSlides.map((item, index) => <img key={item.image} src={item.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === slide ? 'opacity-60' : 'opacity-0'}`} />)}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-transparent" />
                        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8"><div className="max-w-2xl text-white"><p className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-orange-400" /> {current.location}</p><h1 className="mt-5 text-5xl font-light leading-tight sm:text-7xl">{current.title}</h1><p className="mt-4 text-lg font-medium text-white/85">{current.subtitle}</p><p className="mt-6 text-2xl font-bold">{current.price}</p><button type="button" onClick={() => setInquiryOpen(true)} className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-7 py-3.5 text-sm font-bold text-white hover:bg-orange-600">Make an enquiry <ArrowRight size={16} /></button></div></div>
                    </section>

                    <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-6 lg:px-8">
                        <form onSubmit={submitSearch} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg md:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(140px,.8fr))_auto]">
                            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 px-4 text-sm text-slate-500">
                                <Search size={18} className="shrink-0" />
                                <input value={searchForm.search} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, search: event.target.value }))} placeholder="Location or property name" aria-label="Search by location or property name" className="w-full border-0 p-0 outline-none ring-0 focus:ring-0" />
                            </label>
                            <select value={searchForm.category} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, category: event.target.value }))} aria-label="Property category" className="min-h-12 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                                <option value="">All categories</option>
                                {propertyCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                            </select>
                            <select value={searchForm.province_id} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, province_id: event.target.value, district_id: '', sector_id: '' }))} aria-label="Province" className="min-h-12 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                                <option value="">All provinces</option>
                                {(locations.provinces || []).map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
                            </select>
                            <select value={searchForm.district_id} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, district_id: event.target.value, sector_id: '' }))} aria-label="District" className="min-h-12 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                                <option value="">All districts</option>
                                {availableDistricts.map((district) => <option key={district.id} value={district.id}>{district.name}</option>)}
                            </select>
                            <select value={searchForm.sector_id} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, sector_id: event.target.value }))} aria-label="Sector" className="min-h-12 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                                <option value="">All sectors</option>
                                {availableSectors.map((sector) => <option key={sector.id} value={sector.id}>{sector.name}</option>)}
                            </select>
                            <select value={searchForm.price_range} onChange={(event) => setSearchForm((currentForm) => ({ ...currentForm, price_range: event.target.value }))} aria-label="Rent range" className="min-h-12 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
                                <option value="any">Any price</option>
                                <option value="under-500000">Under 500,000 RWF</option>
                                <option value="500000-1500000">500,000 - 1,500,000 RWF</option>
                                <option value="1500000-5000000">1,500,000 - 5,000,000 RWF</option>
                                <option value="5000000-plus">Over 5,000,000 RWF</option>
                            </select>
                            <button type="submit" className="min-h-12 bg-orange-500 px-8 text-sm font-bold text-white transition hover:bg-orange-600">
                                <Search size={16} className="mr-2 inline" /> Search
                            </button>
                        </form>
                    </section>

                    {searchFilters.active && (
                        <section id="search-results" className="mx-auto max-w-7xl scroll-mt-32 px-6 pt-10 lg:px-8">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">Search results</p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{properties.length} available {properties.length === 1 ? 'property' : 'properties'} found</h2>
                                </div>
                                <button type="button" onClick={clearSearch} className="text-sm font-semibold text-[#064b78] transition hover:text-orange-600">Clear filters</button>
                            </div>
                            {properties.length ? (
                                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
                                </div>
                            ) : (
                                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                                    <Search className="mx-auto text-slate-400" size={30} />
                                    <p className="mt-3 font-semibold text-slate-800">No matching available properties</p>
                                    <p className="mt-1 text-sm text-slate-500">Try a different location, property type, or price range.</p>
                                </div>
                            )}
                        </section>
                    )}

                    {!searchFilters.active && <section id="featured" className="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">Available now</p><h2 className="mt-3 text-4xl font-light">Discover Our Best Spaces</h2><p className="mt-3 text-sm text-slate-500">Explore real available properties and open a listing to see its details.</p></div>{properties.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">There are no available listings yet. Please check back soon.</div>}</section>}

                    <section id="categories" className="bg-white"><div className="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div className="text-center"><h2 className="text-4xl font-light">Explore Our Categories</h2><p className="mt-3 text-sm text-slate-500">Choose a category to see available listings.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{categories.map(({ slug, name, icon: Icon, image }) => { const categoryName = propertyCategories.find((category) => category.slug === slug)?.name || name; return <button type="button" key={slug} onClick={() => { const filters = { ...searchForm, category: slug }; setSearchForm(filters); applySearch(filters); }} className="group relative h-60 overflow-hidden bg-[#0e3b2e] text-left"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><Icon size={22} /><h3 className="mt-3 text-xl font-bold">{categoryName}</h3><p className="mt-1 text-xs text-white/75">Browse available spaces</p></div></button>; })}</div></div></section>

                    <section id="enquiry" className="mx-auto max-w-7xl px-6 py-12 lg:px-8"><div className="grid overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-[1fr_420px]"><div className="relative min-h-80 bg-[#0e3b2e] p-8 text-white sm:p-12"><div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,59,46,.72),rgba(6,75,120,.8)),url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85')] bg-cover bg-center" /><div className="relative max-w-lg"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-300">Need help finding a space?</p><h2 className="mt-4 text-4xl font-light">Tell us what you are looking for.</h2><p className="mt-5 leading-7 text-white/75">Our team can help you find an office, apartment, café, commercial building, or warehouse in Kigali.</p><button type="button" onClick={() => setInquiryOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600">Start an enquiry <MessageCircle size={17} /></button></div></div><div className="flex flex-col justify-center p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Talk to Ituze</p><h3 className="mt-3 text-2xl font-bold">A smoother way to rent.</h3><div className="mt-6 space-y-4 text-sm text-slate-600"><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> No account required to browse</p><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> Direct owner enquiries</p><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> WhatsApp-ready communication</p></div><div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#0e3b2e]"><a href="tel:+250788000000"><Phone size={16} className="mr-1 inline" /> Call us</a><a href="mailto:hello@ituze.rw"><Mail size={16} className="mr-1 inline" /> Email us</a></div></div></div></section>
                    <section className="border-t border-slate-100 bg-[#f6f8fa]">
                        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">Built together</p>
                                <h2 className="mt-3 text-4xl font-light text-slate-900">Our Partners</h2>
                                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">We work with trusted property owners, business communities, relocation teams, and local enterprises to make finding the right space easier.</p>
                            </div>
                            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    ['Property owners', 'Quality spaces from people who know their properties best.'],
                                    ['Business communities', 'Connections that help teams find the right Kigali address.'],
                                    ['Relocation teams', 'Practical support for people moving into a new space.'],
                                    ['Local enterprises', 'Flexible solutions for growing businesses and brands.'],
                                ].map(([title, description]) => (
                                    <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#064b78]/10 text-[#064b78]"><Building2 size={21} /></div>
                                        <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 text-center">
                                <button type="button" onClick={() => setRegisterOpen(true)} className="inline-flex items-center gap-2 rounded bg-[#064b78] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#053653]">Become a partner <ArrowRight size={16} /></button>
                            </div>
                        </div>
                    </section>
                    <section id="partner-contact" className="bg-white">
                        <div className="mx-auto grid max-w-7xl gap-0 px-6 py-14 lg:grid-cols-2 lg:px-8">
                            <div className="rounded-l-2xl bg-[#0e3b2e] p-8 text-white sm:p-12">
                                <p className="text-xs font-bold uppercase tracking-[.2em] text-orange-300">Partner with us</p>
                                <h2 className="mt-3 text-3xl font-light sm:text-4xl">Let’s work together</h2>
                                <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">Tell us how you would like to work with Ituze-Qra Ltd. Complete the form and our team will contact you.</p>
                                {partnerContactSent ? (
                                    <div className="mt-8 rounded-xl bg-white/10 p-5 text-sm leading-6 text-white">
                                        Thank you. Your partner enquiry has been received and our team will contact you soon.
                                    </div>
                                ) : (
                                    <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); setPartnerContactSent(true); }}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <input required placeholder="Your name" className="rounded-xl border-0 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-300" />
                                            <input required type="tel" placeholder="Phone number" className="rounded-xl border-0 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-300" />
                                        </div>
                                        <input required type="email" placeholder="Email address" className="w-full rounded-xl border-0 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-300" />
                                        <select required defaultValue="" className="w-full rounded-xl border-0 bg-white/95 text-slate-900 focus:ring-2 focus:ring-orange-300">
                                            <option value="" disabled>How would you like to partner?</option>
                                            <option>List a property</option>
                                            <option>Relocation support</option>
                                            <option>Business partnership</option>
                                            <option>Other partnership</option>
                                        </select>
                                        <textarea required rows="4" placeholder="Tell us more about your partnership idea..." className="w-full rounded-xl border-0 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-300" />
                                        <button type="submit" className="inline-flex items-center gap-2 rounded bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600">Contact us <ArrowRight size={16} /></button>
                                    </form>
                                )}
                            </div>
                            <div className="relative min-h-[28rem] overflow-hidden rounded-r-2xl bg-slate-200">
                                <iframe title="Ituze-Qra Ltd location map" src={`https://www.google.com/maps?q=${encodeURIComponent(companyAddress)}&output=embed`} className="h-full min-h-[28rem] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                                <a href={companyMapUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/95 p-4 text-sm text-slate-700 shadow-lg transition hover:bg-white sm:right-auto sm:max-w-md">
                                    <MapPin size={20} className="shrink-0 text-orange-600" />
                                    <span className="min-w-0 flex-1"><span className="block font-bold text-slate-900">Find us on Google Maps</span><span className="mt-0.5 block">{companyAddress}</span></span>
                                    <ArrowRight size={16} className="shrink-0 text-[#064b78]" />
                                </a>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="relative bg-[#063f67] text-white">
                    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                            <div>
                                <div className="flex items-center gap-3 text-3xl font-black">
                                    <img src="/images/logo.png" alt="Ituze-Qra Ltd Logo" className="h-11 w-11 rounded-full object-contain bg-white p-0.5 shadow-sm" />
                                    <span>Ituze-Qra Ltd</span>
                                </div>
                                <p className="mt-4 max-w-xs text-sm leading-7 text-white/65">Beautiful spaces, better business, and a simpler way to rent in Rwanda.</p>
                                <div className="mt-6 flex gap-3">
                                    <a href={`tel:${companyPhone}`} aria-label="Call Ituze" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><Phone size={17} /></a>
                                    <a href={`mailto:hello@ituze.rw`} aria-label="Email Ituze" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><Mail size={17} /></a>
                                    <a href="#enquiry" aria-label="Send an enquiry" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><MessageCircle size={17} /></a>
                                </div>
                            </div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">Explore</h3><div className="mt-5 space-y-3 text-sm text-white/70"><a className="block transition hover:text-white" href="#featured">Featured spaces</a><a className="block transition hover:text-white" href="#categories">Property categories</a><a className="block transition hover:text-white" href="#enquiry">Send an enquiry</a></div></div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">For owners</h3><div className="mt-5 space-y-3 text-sm text-white/70"><button type="button" className="block transition hover:text-white" onClick={() => setInquiryOpen(true)}>Inquiry</button>{canLogin && <button type="button" className="block transition hover:text-white" onClick={() => setLoginOpen(true)}>Owner login</button>}</div></div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">Contact us</h3><div className="mt-5 space-y-4 text-sm text-white/70"><a href={companyMapUrl} target="_blank" rel="noreferrer" className="flex gap-3 transition hover:text-white"><MapPin size={17} className="mt-0.5 shrink-0 text-[#f0a052]" /><span>{companyAddress}</span></a><a href={`tel:${companyPhone}`} className="flex items-center gap-3 transition hover:text-white"><Phone size={17} className="text-[#f0a052]" /> {companyPhone}</a><a href={`mailto:hello@ituze.rw`} className="flex items-center gap-3 transition hover:text-white"><Mail size={17} className="text-[#f0a052]" /> hello@ituze.rw</a></div></div>
                        </div>
                        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row"><span>© {new Date().getFullYear()} Ituze-Qra Ltd. All rights reserved.</span><span>Trusted property listings in Rwanda.</span></div>
                    </div>
                    <a href={`https://web.whatsapp.com/send?phone=${companyPhone.replace('+', '')}&text=${encodeURIComponent('Hello Ituze, I am interested in finding a property for rent.')}`} target="_blank" rel="noreferrer" aria-label="Chat with Ituze on WhatsApp Web" className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-black/20 transition hover:scale-105 hover:bg-[#1fba59] sm:bottom-8 sm:right-10">
                        <MessageCircle size={27} />
                    </a>
                </footer>
            </div>
            {inquiryOpen && <InquiryPanel onClose={() => setInquiryOpen(false)} />}
            {loginOpen && <LoginPanel canRegister={canRegister} onClose={() => setLoginOpen(false)} />}
            {registerOpen && <RegisterPanel onClose={() => setRegisterOpen(false)} />}
        </>
    );
}
