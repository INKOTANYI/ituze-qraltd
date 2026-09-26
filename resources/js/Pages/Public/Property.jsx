import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronRight,
    Coffee,
    Compass,
    Eye,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const locationLabel = (property) => {
    const parts = [
        property.cell?.sector?.district?.province?.name,
        property.cell?.sector?.district?.name,
        property.cell?.sector?.name,
    ].filter(Boolean);

    return parts.length ? parts.join(', ') : property.address || 'Kigali, Rwanda';
};

const formatRent = (unit) => {
    if (!unit?.rent_amount) return 'Price on request';
    const labels = { daily: 'day', weekly: 'week', monthly: 'month', quarterly: 'quarter', yearly: 'year' };
    return `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(Number(unit.rent_amount))} RWF / ${labels[unit.rent_frequency] || unit.rent_frequency}`;
};

const listValues = (value) => (Array.isArray(value) ? value : []);

function InquiryModal({ property, unit, channel, onClose }) {
    const form = useForm({
        unit_id: unit?.id || '',
        visitor_name: '',
        visitor_email: '',
        visitor_phone: '',
        message: '',
        channel,
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('public.properties.inquiries.store', property.id), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl sm:p-8">
                <div className="flex items-start justify-between">
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-[.18em] ${channel === 'whatsapp' ? 'text-[#168447]' : 'text-[#b57c35]'}`}>
                            {channel === 'whatsapp' ? 'WhatsApp inquiry' : 'Free inquiry'}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">{channel === 'whatsapp' ? 'Message the owner on WhatsApp' : 'Ask about this property'}</h2>
                        <p className="mt-2 text-sm text-slate-500">No account is required. Your message will be saved to the owner dashboard{channel === 'whatsapp' ? ' and sent through Meta WhatsApp Cloud API' : ''}.</p>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={19} /></button>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold text-slate-700">Your name<input required value={form.data.visitor_name} onChange={(event) => form.setData('visitor_name', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-200" /></label>
                        <label className="text-sm font-semibold text-slate-700">Phone / WhatsApp<input required value={form.data.visitor_phone} onChange={(event) => form.setData('visitor_phone', event.target.value)} placeholder="+250..." className="mt-1.5 w-full rounded-xl border-slate-200" /></label>
                    </div>
                    <label className="block text-sm font-semibold text-slate-700">Email (optional)<input type="email" value={form.data.visitor_email} onChange={(event) => form.setData('visitor_email', event.target.value)} className="mt-1.5 w-full rounded-xl border-slate-200" /></label>
                    <label className="block text-sm font-semibold text-slate-700">Message<textarea required rows="4" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} placeholder={`I am interested in ${property.name}...`} className="mt-1.5 w-full rounded-xl border-slate-200" /></label>
                    {form.errors.visitor_phone && <p className="text-sm text-red-600">{form.errors.visitor_phone}</p>}
                    <button disabled={form.processing} className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white transition disabled:opacity-60 ${channel === 'whatsapp' ? 'bg-[#168447] hover:bg-[#126b39]' : 'bg-[#0e3b2e] hover:bg-[#175640]'}`}>{form.processing ? 'Sending...' : channel === 'whatsapp' ? 'Send through WhatsApp' : 'Send inquiry to owner'} <Send size={16} /></button>
                </form>
            </div>
        </div>
    );
}

export default function PublicProperty({ property }) {
    const [selectedUnit, setSelectedUnit] = useState(property.units?.[0]);
    const [inquiryOpen, setInquiryOpen] = useState(false);
    const [inquiryChannel, setInquiryChannel] = useState('message');
    const [activeImage, setActiveImage] = useState(0);
    const images = property.images || [];
    const amenities = listValues(property.amenities);
    const proximity = listValues(property.proximity);
    const gallery = images.length ? images : [{ image_path: null }];
    const location = locationLabel(property);
    const ownerName = property.owner?.name || [property.owner?.first_name, property.owner?.last_name].filter(Boolean).join(' ') || 'Property owner';
    const ownerPhone = property.owner?.phone || '';
    const openInquiry = (channel = 'message') => {
        setInquiryChannel(channel);
        setInquiryOpen(true);
    };

    return (
        <>
            <Head title={`${property.name} | Property for rent in ${location}`} />
            <div className="min-h-screen bg-[#f8faf9] text-slate-900">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d49a4d] text-white"><Building2 size={21} /></span><span className="text-xl font-black tracking-tight text-[#0e3b2e]">ituze<span className="text-[#b57c35]">.</span></span></Link>
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0e3b2e]"><ArrowLeft size={16} /> Browse available spaces</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-12">
                    <div className="mb-8 flex items-center gap-2 text-sm text-slate-500"><Link href="/" className="transition hover:text-[#0e3b2e]">Home</Link><ChevronRight size={15} /><span>{location}</span><ChevronRight size={15} /><span className="truncate text-slate-800">{property.name}</span></div>
                    <section className="grid gap-3 lg:grid-cols-[1.45fr_.55fr]">
                        <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] bg-[#dcebe5] sm:h-[32rem]">
                            {gallery[activeImage]?.image_path ? <img src={`/storage/${gallery[activeImage].image_path}`} alt={property.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-24 w-24 text-[#0e3b2e]/20" /></div>}
                            <div className="absolute bottom-5 left-5 rounded-full bg-slate-950/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"><Eye size={13} className="mr-1 inline" /> {images.length || 1} photos</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                            {[1, 2].map((offset) => {
                                const image = gallery[(activeImage + offset) % gallery.length];
                                return <button type="button" key={offset} onClick={() => setActiveImage((activeImage + offset) % gallery.length)} className="relative min-h-36 overflow-hidden rounded-[1.5rem] bg-[#dcebe5] text-left sm:min-h-0">{image?.image_path ? <img src={`/storage/${image.image_path}`} alt="" className="h-full w-full object-cover transition hover:scale-105" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-10 w-10 text-[#0e3b2e]/20" /></div>}</button>;
                            })}
                        </div>
                    </section>

                    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_350px]">
                        <article>
                            <div className="border-b border-slate-200 pb-8">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#b57c35]"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5f0] px-3 py-1.5 text-[#0e3b2e]"><CheckCircle2 size={13} /> Available for rent</span><span>Commercial property</span></div>
                                <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.03em] text-slate-900 sm:text-5xl">{property.name}</h1>
                                <p className="mt-4 flex items-center gap-2 text-base text-slate-500"><MapPin size={18} className="text-[#b57c35]" /> {location}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 py-7 sm:grid-cols-4">
                                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p><p className="mt-2 text-lg font-black text-[#0e3b2e]">{formatRent(selectedUnit)}</p></div>
                                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</p><p className="mt-2 text-lg font-black text-slate-900">{property.units.length} space{property.units.length === 1 ? '' : 's'}</p></div>
                                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Type</p><p className="mt-2 text-lg font-black text-slate-900">{selectedUnit?.unitType?.name || 'Office'}</p></div>
                                <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Service charge</p><p className="mt-2 text-lg font-black text-slate-900">Included</p></div>
                            </div>
                            <section className="border-b border-slate-200 py-8"><h2 className="text-2xl font-black">About this property</h2><p className="mt-4 max-w-3xl whitespace-pre-line text-[16px] leading-8 text-slate-600">{property.description || `This well-positioned ${selectedUnit?.unitType?.name?.toLowerCase() || 'commercial space'} in ${location} offers a professional environment for businesses, organizations, and growing teams. Contact the owner to arrange a viewing and learn more.`}</p></section>
                            <section className="border-b border-slate-200 py-8"><h2 className="text-2xl font-black">Property amenities</h2>{amenities.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{amenities.map((amenity) => <div key={amenity} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf5f0] text-[#0e3b2e]"><CheckCircle2 size={16} /></span>{amenity}</div>)}</div> : <p className="mt-4 text-slate-500">Contact the owner for available facilities and amenities.</p>}</section>
                            <section className="border-b border-slate-200 py-8"><h2 className="text-2xl font-black">Nearby infrastructure</h2>{proximity.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{proximity.map((place) => <div key={place} className="flex items-center gap-3 text-sm text-slate-600"><Compass size={17} className="text-[#b57c35]" /> {place}</div>)}</div> : <p className="mt-4 text-slate-500">Strategically located with convenient access to surrounding services.</p>}</section>
                            <section className="py-8"><h2 className="text-2xl font-black">Available spaces</h2><div className="mt-5 space-y-3">{property.units.map((unit) => <button type="button" key={unit.id} onClick={() => setSelectedUnit(unit)} className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition sm:flex-row sm:items-center sm:justify-between ${selectedUnit?.id === unit.id ? 'border-[#0e3b2e] bg-[#f2f8f4]' : 'border-slate-200 bg-white hover:border-[#b57c35]'}`}><span><span className="block font-bold">{unit.unitType?.name || 'Commercial space'} · Unit {unit.unit_number}</span><span className="mt-1 block text-sm text-slate-500">{unit.size_sqm ? `${unit.size_sqm} m² · ` : ''}{formatRent(unit)}</span></span><span className="font-bold text-[#0e3b2e]">Select</span></button>)}</div></section>
                        </article>
                        <aside className="h-fit lg:sticky lg:top-6">
                            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(15,23,42,.45)]">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5f1eb] text-[#0e3b2e]"><Users size={25} /></div>
                                    <div><p className="flex items-center gap-1.5 text-base font-bold text-slate-900">{ownerName} <CheckCircle2 size={14} className="text-emerald-600" /></p><p className="mt-1 text-sm font-semibold text-[#b57c35]">Property owner</p><p className="mt-1 text-xs text-slate-400">Responds to inquiries directly</p></div>
                                </div>
                                <h2 className="mt-5 text-xl font-black text-slate-900">Interested in this space?</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">Contact the owner about availability, viewing times, and rental terms.</p>
                                <button type="button" onClick={() => openInquiry('message')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d84b2a] px-4 py-3 font-bold text-white transition hover:bg-[#bd3d20]"><MessageCircle size={17} /> Send Message</button>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <a href={ownerPhone ? `tel:${ownerPhone}` : '#'} className="flex items-center justify-center gap-2 rounded-xl border border-[#d84b2a] px-3 py-2.5 text-sm font-bold text-[#d84b2a] transition hover:bg-[#fff5f2]"><Phone size={15} /> Call</a>
                                    <a href={ownerPhone ? `sms:${ownerPhone}` : '#'} className="flex items-center justify-center gap-2 rounded-xl border border-[#d84b2a] px-3 py-2.5 text-sm font-bold text-[#d84b2a] transition hover:bg-[#fff5f2]"><Mail size={15} /> SMS</a>
                                </div>
                                <button type="button" onClick={() => openInquiry('whatsapp')} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#25a366] px-3 py-2.5 text-sm font-bold text-[#168447] transition hover:bg-[#f0fbf5]"><MessageCircle size={16} /> WhatsApp</button>
                                <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400"><ShieldCheck size={13} className="mr-1 inline text-emerald-600" /> Your inquiry is saved securely and delivered to the owner dashboard and WhatsApp.</p>
                            </div>
                            <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#b57c35]">Why Ituze?</p><p className="mt-3 text-sm leading-6 text-slate-600">Explore real spaces with transparent details and connect directly with the people managing them.</p><div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0e3b2e]"><Sparkles size={16} /> Built for better renting</div></div>
                        </aside>
                    </div>
                </main>
                {inquiryOpen && <InquiryModal property={property} unit={selectedUnit} channel={inquiryChannel} onClose={() => setInquiryOpen(false)} />}
            </div>
        </>
    );
}
