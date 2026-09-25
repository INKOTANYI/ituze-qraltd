import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="pt-4 text-center">
                <h2 className="font-[Sora] text-xl font-bold text-gray-800">
                    Welcome back
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Log in to continue
                </p>
            </div>

            {status && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E]"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock
                            size={18}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-[#0E3B2E] focus:ring-1 focus:ring-[#0E3B2E]"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-gray-300 text-[#0E3B2E] focus:ring-[#0E3B2E]"
                        />
                        Remember me
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-[#0E3B2E] hover:underline"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-lg bg-[#0E3B2E] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a2e23] disabled:opacity-60"
                >
                    LOG IN
                </button>

                <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-[#0E3B2E] hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}