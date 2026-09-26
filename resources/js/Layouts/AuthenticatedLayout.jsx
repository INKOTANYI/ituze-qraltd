import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashToast from '@/Components/FlashToast';
import InlineAlert from '@/Components/InlineAlert';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users as UsersIcon,
    FileText,
    CreditCard,
    Wrench,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    Menu,
    X,
    Bell,
    ChevronDown,
    CheckCircle,
} from 'lucide-react';

const ownerNavigation = [
    { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard, ready: true },
    { name: 'Properties', href: 'properties.index', icon: Building2, ready: true },
    { name: 'Tenants', href: 'tenants.index', icon: UsersIcon, ready: true },
    { name: 'Leases', href: 'dashboard', icon: FileText, ready: false },
    { name: 'Payments', href: 'dashboard', icon: CreditCard, ready: false },
    { name: 'Maintenance', href: 'dashboard', icon: Wrench, ready: false },
    { name: 'Messages', href: 'dashboard', icon: MessageSquare, ready: true },
    { name: 'Reports', href: 'dashboard', icon: BarChart3, ready: false },
];

const adminNavigation = [
    { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard, ready: true },
    { name: 'Approvals', href: 'admin.approvals', icon: ShieldCheck, ready: true },
    { name: 'All Users', href: 'admin.users', icon: UsersIcon, ready: true },
    { name: 'Properties', href: 'properties.index', icon: Building2, ready: true },
    { name: 'Tenants', href: 'tenants.index', icon: UsersIcon, ready: true },
    { name: 'Leases', href: 'dashboard', icon: FileText, ready: false },
    { name: 'Payments', href: 'dashboard', icon: CreditCard, ready: false },
    { name: 'Maintenance', href: 'dashboard', icon: Wrench, ready: false },
    { name: 'Messages', href: 'dashboard', icon: MessageSquare, ready: true },
    { name: 'Reports', href: 'dashboard', icon: BarChart3, ready: false },
];

const languages = [
    { code: 'EN', flag: '🇬🇧' },
    { code: 'FR', flag: '🇫🇷' },
    { code: 'RW', flag: '🇷🇼' },
];

export default function AuthenticatedLayout({ header, children }) {
    const pageProps = usePage().props;
    const user = pageProps.auth.user;
    const flash = pageProps.flash || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeLang, setActiveLang] = useState('EN');
    const [toasts, setToasts] = useState([]);
    const [successModal, setSuccessModal] = useState(null);

    const navigation = user.role === 'admin' ? adminNavigation : ownerNavigation;

    useEffect(() => {
        const order = ['error', 'warning', 'success', 'info', 'status'];
        const newToasts = [];
        order.forEach((type, i) => {
            const msg = flash[type];
            if (msg) {
                const toastType = type === 'status' ? 'info' : type;
                newToasts.push({ id: `${type}-${Date.now()}-${i}`, type: toastType, message: msg });
            }
        });
        if (newToasts.length) setToasts(prev => [...prev, ...newToasts]);
        if (flash.success) setSuccessModal(flash.success);
    }, [flash]);

    const dismissToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F4F6F5] font-[Inter]">
            {toasts.length > 0 && (
                <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
                    {toasts.map(t => (
                        <FlashToast
                            key={t.id}
                            type={t.type}
                            message={t.message}
                            onClose={() => dismissToast(t.id)}
                        />
                    ))}
                </div>
            )}
            {successModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl ring-1 ring-white/30">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle size={34} className="text-emerald-600" />
                        </div>
                        <h2 className="mt-5 text-xl font-bold text-gray-900">Success</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{successModal}</p>
                        <button
                            type="button"
                            onClick={() => setSuccessModal(null)}
                            className="mt-6 inline-flex min-w-32 items-center justify-center rounded-xl bg-[#0E3B2E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2e23]"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-1">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform bg-[#0E3B2E] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex h-16 items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-auto fill-current text-[#D9A441]" />
                            <span className="font-[Sora] font-bold text-white tracking-tight">
                                Ituze QR Ltd
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white/60 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {user.role === 'admin' && (
                        <div className="mx-4 mt-3 rounded-lg bg-[#D9A441]/10 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[#D9A441]">
                            Admin Access
                        </div>
                    )}

                    <nav className="flex flex-1 flex-col gap-1.5 px-4 pt-4">
                        {navigation.map((item) => {
                            const isActive =
                                item.ready && route().current(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={route(item.href)}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? 'bg-[#D9A441] text-[#0E3B2E] shadow-sm'
                                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <item.icon
                                        size={18}
                                        className={
                                            isActive
                                                ? 'text-[#0E3B2E]'
                                                : 'text-white/50 group-hover:text-white'
                                        }
                                    />
                                    {item.name}
                                    {!item.ready && (
                                        <span className="ml-auto text-[9px] uppercase tracking-wide text-white/30">
                                            soon
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-white/10 px-6 py-4">
                        <p className="text-xs text-white/40">Signed in as</p>
                        <p className="text-sm font-medium text-white/80">
                            {user.name}
                        </p>
                    </div>
                </aside>

                {/* Main content area */}
                <div className="flex flex-1 flex-col">
                    {/* Top bar */}
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#111827] px-4 sm:px-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="text-white/60 hover:text-white lg:hidden"
                            >
                                <Menu size={22} />
                            </button>
                            {header && (
                                <h1 className="font-[Sora] text-lg font-semibold text-white">
                                    {header}
                                </h1>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-1 rounded-full bg-white/5 px-2 py-1 sm:flex">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() =>
                                            setActiveLang(lang.code)
                                        }
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${
                                            activeLang === lang.code
                                                ? 'bg-white/15'
                                                : 'hover:bg-white/10'
                                        }`}
                                        title={lang.code}
                                    >
                                        {lang.flag}
                                    </button>
                                ))}
                            </div>

                            <button className="relative rounded-full p-2 text-white/60 hover:bg-white/5 hover:text-white">
                                <Bell size={18} />
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D9A441]" />
                            </button>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white/90 hover:bg-white/10">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D9A441] text-[#111827] font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:inline">
                                            {user.name}
                                        </span>
                                        <ChevronDown size={14} />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link
                                        href={route('profile.edit')}
                                    >
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 sm:p-6">
                        {flash.error && (
                            <div className="mb-4 max-w-7xl mx-auto">
                                <InlineAlert message={flash.error} type="error" />
                            </div>
                        )}
                        {flash.warning && (
                            <div className="mb-4 max-w-7xl mx-auto">
                                <InlineAlert message={flash.warning} type="warning" />
                            </div>
                        )}
                        {flash.info && (
                            <div className="mb-4 max-w-7xl mx-auto">
                                <InlineAlert message={flash.info} type="info" />
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#111827] px-4 py-8 sm:px-6">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-3">
                    <div>
                        <span className="font-[Sora] text-lg font-bold text-white">
                            Ituze QR Ltd
                        </span>
                        <p className="mt-2 text-sm text-white/50">
                            Simplifying property management for landlords and
                            tenants across Rwanda.
                        </p>
                    </div>

                    <div>
                        <p className="font-[Sora] text-sm font-semibold text-white">
                            Support
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-white/50">
                            <li>Help center & FAQs</li>
                            <li>Contact admin</li>
                            <li>Live chat</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-[Sora] text-sm font-semibold text-white">
                            Company
                        </p>
                        <ul className="mt-2 space-y-1.5 text-sm text-white/50">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>
                </div>

                <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-4">
                    <p className="text-xs text-white/30">
                        © {new Date().getFullYear()} Ituze QR Ltd. All rights
                        reserved. Made for landlords and tenants across Rwanda
                        🇷🇼
                    </p>
                </div>
            </footer>
        </div>
    );
}