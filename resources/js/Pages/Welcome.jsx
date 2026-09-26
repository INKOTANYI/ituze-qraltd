import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Home,
    Mail,
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
    { name: 'Offices', icon: Building2, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=82' },
    { name: 'Apartments', icon: Home, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=82' },
    { name: 'Coffee Shops', icon: Coffee, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=82' },
    { name: 'Commercial Buildings', icon: Store, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=82' },
    { name: 'Warehouses', icon: Warehouse, image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=82' },
];

const showcase = [
    { title: 'Modern Kacyiru Office', type: 'Office', price: '21,750 RWF / m²', location: 'Kacyiru, Kigali', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85' },
    { title: 'The Green View Residence', type: 'Apartment', price: '850,000 RWF / month', location: 'Nyarutarama, Kigali', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85' },
    { title: 'Kigali Corner Café', type: 'Coffee Shop', price: '1,200,000 RWF / month', location: 'Kimihurura, Kigali', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=85' },
];

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

function LoginPanel({ onClose }) {
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('login'), {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#078dcc]">Owner access</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">Log in to manage your properties and enquiries.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">Email
                        <input type="email" required value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-200" />
                    </label>
                    {form.errors.email && <p className="-mt-2 text-sm text-red-600">{form.errors.email}</p>}
                    <label className="block text-sm font-semibold text-slate-700">Password
                        <input type="password" required value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-200" />
                    </label>
                    {form.errors.password && <p className="-mt-2 text-sm text-red-600">{form.errors.password}</p>}
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" checked={form.data.remember} onChange={(event) => form.setData('remember', event.target.checked)} className="rounded border-slate-300 text-[#078dcc] focus:ring-[#078dcc]" />
                        Remember me
                    </label>
                    <button type="submit" disabled={form.processing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#078dcc] px-5 py-3 font-bold text-white transition hover:bg-[#0677ad] disabled:opacity-60">
                        {form.processing ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Welcome({ auth, canLogin, canRegister }) {
    const [slide, setSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [inquiryOpen, setInquiryOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const current = heroSlides[slide];
    const companyPhone = '+250789265436';
    const companyAddress = 'KG 14 Ave, Kigali-Gisozi-Musezero: ULK-Kagugu Road, Source Oil Building';

    useEffect(() => {
        const timer = window.setInterval(() => setSlide((value) => (value + 1) % heroSlides.length), 6500);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="Find your perfect space to rent | Ituze-Qra Ltd" />
            <div className="min-h-screen bg-[#f6f8fa] text-slate-900">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
                    <div className="bg-[#063f67] text-white">
                        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3.5 text-xs font-medium sm:flex-row sm:items-center sm:justify-between lg:px-8">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white/85 transition hover:text-white">
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
                        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#064b78]"><span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#064b78]"><Building2 size={18} /></span> Ituze-Qra Ltd</Link>
                        <nav className="hidden items-center gap-8 text-xs font-bold uppercase text-slate-700 md:flex"><a href="#featured" className="hover:text-[#078dcc]">Home</a><a href="#featured" className="hover:text-[#078dcc]">Properties</a><a href="#categories" className="hover:text-[#078dcc]">Property types</a><a href="#enquiry" className="hover:text-[#078dcc]">Enquiry</a></nav>
                        <div className="flex items-center gap-2">{auth?.user ? <Link href={route('dashboard')} className="rounded bg-[#08a8ec] px-4 py-2 text-xs font-bold uppercase text-white">Dashboard</Link> : <>{canLogin && <button type="button" onClick={() => setLoginOpen(true)} className="hidden px-3 py-2 text-xs font-bold uppercase text-slate-600 sm:block">Log in</button>}<button type="button" onClick={() => setInquiryOpen(true)} className="rounded bg-[#08a8ec] px-4 py-2 text-xs font-bold uppercase text-white">Inquiry</button></>}<button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
                    </div>
                    {menuOpen && <div className="border-t border-slate-100 px-6 py-3 text-sm md:hidden"><a className="block py-2" href="#featured">Properties</a><a className="block py-2" href="#categories">Property types</a><a className="block py-2" href="#enquiry">Enquiry</a>{!auth?.user && canLogin && <button type="button" onClick={() => { setLoginOpen(true); setMenuOpen(false); }} className="block py-2 font-semibold text-slate-700">Log in</button>}{!auth?.user && <button type="button" onClick={() => { setInquiryOpen(true); setMenuOpen(false); }} className="block py-2 font-semibold text-[#078dcc]">Inquiry</button>}</div>}
                </header>

                <main>
                    <section className="relative h-[34rem] overflow-hidden bg-[#0e3b2e]">
                        {heroSlides.map((item, index) => <img key={item.image} src={item.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === slide ? 'opacity-60' : 'opacity-0'}`} />)}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-transparent" />
                        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8"><div className="max-w-2xl text-white"><p className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-orange-400" /> {current.location}</p><h1 className="mt-5 text-5xl font-light leading-tight sm:text-7xl">{current.title}</h1><p className="mt-4 text-lg font-medium text-white/85">{current.subtitle}</p><p className="mt-6 text-2xl font-bold">{current.price}</p><button type="button" onClick={() => setInquiryOpen(true)} className="mt-8 inline-flex items-center gap-2 bg-orange-500 px-7 py-3.5 text-sm font-bold text-white hover:bg-orange-600">Make an enquiry <ArrowRight size={16} /></button></div></div>
                        <div className="absolute bottom-7 right-6 flex gap-2 lg:right-8"><button type="button" onClick={() => setSlide((slide - 1 + heroSlides.length) % heroSlides.length)} className="rounded bg-white/90 p-2 text-slate-700"><ChevronLeft size={18} /></button><button type="button" onClick={() => setSlide((slide + 1) % heroSlides.length)} className="rounded bg-white/90 p-2 text-slate-700"><ChevronRight size={18} /></button></div>
                    </section>

                    <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-6 lg:px-8"><div className="flex flex-col gap-2 border border-slate-200 bg-white p-3 shadow-lg md:flex-row"><label className="flex min-h-12 flex-1 items-center gap-3 border border-slate-200 px-4 text-sm text-slate-500"><Search size={18} /><input placeholder="Enter keyword or location..." className="w-full border-0 p-0 outline-none ring-0 focus:ring-0" /></label><select className="min-h-12 rounded border border-slate-200 px-4 text-sm font-semibold text-slate-700"><option>All types</option><option>Offices</option><option>Apartments</option><option>Coffee shops</option><option>Commercial</option><option>Warehouses</option></select><select className="min-h-12 rounded border border-slate-200 px-4 text-sm font-semibold text-slate-700"><option>Any price</option><option>Under 500,000 RWF</option><option>500,000 - 1,500,000 RWF</option></select><button type="button" onClick={() => setInquiryOpen(true)} className="min-h-12 bg-orange-500 px-8 text-sm font-bold text-white hover:bg-orange-600"><Search size={16} className="mr-2 inline" /> Search</button></div></section>

                    <section id="featured" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-600">Available now</p><h2 className="mt-3 text-4xl font-light">Discover Our Best Spaces</h2><p className="mt-3 text-sm text-slate-500">Beautiful places in Kigali ready for your next chapter.</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{showcase.map((item) => <article key={item.title} className="group overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative h-64 overflow-hidden"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase text-white">Featured</span><span className="absolute right-4 top-4 rounded bg-slate-700/80 px-2 py-1 text-[10px] font-bold uppercase text-white">For rent</span></div><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#0e3b2e]">{item.type}</p><h3 className="mt-2 text-xl font-semibold">{item.title}</h3><p className="mt-2 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {item.location}</p><p className="mt-4 text-lg font-bold text-[#0798e6]">{item.price}</p><button type="button" onClick={() => setInquiryOpen(true)} className="mt-5 text-sm font-bold text-[#0e3b2e] hover:text-orange-500">Request details <ArrowRight size={15} className="ml-1 inline" /></button></div></article>)}</div></section>

                    <section id="categories" className="bg-white"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="text-center"><h2 className="text-4xl font-light">Explore Our Categories</h2><p className="mt-3 text-sm text-slate-500">Find the right kind of space for your lifestyle or business.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{categories.map(({ name, icon: Icon, image }) => <a href="#featured" key={name} className="group relative h-64 overflow-hidden bg-[#0e3b2e]"><img src={image} alt={name} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" /><div className="absolute inset-x-5 bottom-5 text-white"><Icon size={22} /><h3 className="mt-3 text-xl font-bold">{name}</h3><p className="mt-1 text-xs text-white/75">Browse available spaces</p></div></a>)}</div></div></section>

                    <section id="enquiry" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"><div className="grid overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-[1fr_420px]"><div className="relative min-h-80 bg-[#0e3b2e] p-8 text-white sm:p-12"><div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,59,46,.72),rgba(6,75,120,.8)),url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85')] bg-cover bg-center" /><div className="relative max-w-lg"><p className="text-xs font-bold uppercase tracking-[.2em] text-orange-300">Need help finding a space?</p><h2 className="mt-4 text-4xl font-light">Tell us what you are looking for.</h2><p className="mt-5 leading-7 text-white/75">Our team can help you find an office, apartment, café, commercial building, or warehouse in Kigali.</p><button type="button" onClick={() => setInquiryOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600">Start an enquiry <MessageCircle size={17} /></button></div></div><div className="flex flex-col justify-center p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-600">Talk to Ituze</p><h3 className="mt-3 text-2xl font-bold">A smoother way to rent.</h3><div className="mt-6 space-y-4 text-sm text-slate-600"><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> No account required to browse</p><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> Direct owner enquiries</p><p className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} /> WhatsApp-ready communication</p></div><div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-[#0e3b2e]"><a href="tel:+250788000000"><Phone size={16} className="mr-1 inline" /> Call us</a><a href="mailto:hello@ituze.rw"><Mail size={16} className="mr-1 inline" /> Email us</a></div></div></div></section>
                </main>

                <footer className="relative bg-[#063f67] text-white">
                    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
                            <div>
                                <div className="flex items-center gap-2 text-3xl font-black">Ituze-Qra Ltd</div>
                                <p className="mt-4 max-w-xs text-sm leading-7 text-white/65">Beautiful spaces, better business, and a simpler way to rent in Rwanda.</p>
                                <div className="mt-6 flex gap-3">
                                    <a href={`tel:${companyPhone}`} aria-label="Call Ituze" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><Phone size={17} /></a>
                                    <a href={`mailto:hello@ituze.rw`} aria-label="Email Ituze" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><Mail size={17} /></a>
                                    <a href="#enquiry" aria-label="Send an enquiry" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f97316]"><MessageCircle size={17} /></a>
                                </div>
                            </div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">Explore</h3><div className="mt-5 space-y-3 text-sm text-white/70"><a className="block transition hover:text-white" href="#featured">Featured spaces</a><a className="block transition hover:text-white" href="#categories">Property categories</a><a className="block transition hover:text-white" href="#enquiry">Send an enquiry</a></div></div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">For owners</h3><div className="mt-5 space-y-3 text-sm text-white/70"><button type="button" className="block transition hover:text-white" onClick={() => setInquiryOpen(true)}>Inquiry</button>{canLogin && <button type="button" className="block transition hover:text-white" onClick={() => setLoginOpen(true)}>Owner login</button>}</div></div>
                            <div><h3 className="text-sm font-bold uppercase tracking-wider text-[#f0a052]">Contact us</h3><div className="mt-5 space-y-4 text-sm text-white/70"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`} target="_blank" rel="noreferrer" className="flex gap-3 transition hover:text-white"><MapPin size={17} className="mt-0.5 shrink-0 text-[#f0a052]" /><span>{companyAddress}</span></a><a href={`tel:${companyPhone}`} className="flex items-center gap-3 transition hover:text-white"><Phone size={17} className="text-[#f0a052]" /> {companyPhone}</a><a href={`mailto:hello@ituze.rw`} className="flex items-center gap-3 transition hover:text-white"><Mail size={17} className="text-[#f0a052]" /> hello@ituze.rw</a></div></div>
                        </div>
                        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row"><span>© {new Date().getFullYear()} Ituze QR Ltd. All rights reserved.</span><span>Trusted property listings in Rwanda.</span></div>
                    </div>
                    <a href={`https://web.whatsapp.com/send?phone=${companyPhone.replace('+', '')}&text=${encodeURIComponent('Hello Ituze, I am interested in finding a property for rent.')}`} target="_blank" rel="noreferrer" aria-label="Chat with Ituze on WhatsApp Web" className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-black/20 transition hover:scale-105 hover:bg-[#1fba59] sm:bottom-8 sm:right-10">
                        <MessageCircle size={27} />
                    </a>
                </footer>
            </div>
            {inquiryOpen && <InquiryPanel onClose={() => setInquiryOpen(false)} />}
            {loginOpen && <LoginPanel onClose={() => setLoginOpen(false)} />}
        </>
    );
}
