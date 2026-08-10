'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {HiEye, HiEyeOff, HiOutlineCheck, HiOutlineClipboardCopy} from 'react-icons/hi';
import {loginService} from '@/services/AuthService';
import {LoginData} from '@/utils/Responses';
import {useAuth} from '@/context/AuthContext';
import {DEMO_PASSWORD, DEMO_USERNAME} from '@/utils/demoUser';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

const Login: React.FC = () => {
    const [Username, setUsername] = useState<string>('');
    const [Password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState<'username' | 'password' | null>(null);
    const router = useRouter();
    const {login} = useAuth();

    const signIn = async (payload: LoginData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const loadingToastId = toast.loading('Signing you in...');

        try {
            const response = await loginService(payload);

            if (response?.success) {
                login(response.UserToken);
                toast.success('Welcome back!', {id: loadingToastId});
                router.push('/');
            } else {
                toast.error(response?.message || 'Invalid credentials', {id: loadingToastId});
            }
        } catch {
            toast.error('Network error. Please try again.', {id: loadingToastId});
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await signIn({Username, Password});
    };

    const handleDemoLogin = async () => {
        setUsername(DEMO_USERNAME);
        setPassword(DEMO_PASSWORD);
        await signIn({Username: DEMO_USERNAME, Password: DEMO_PASSWORD});
    };

    const copyCredential = async (field: 'username' | 'password', value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(field);
            setTimeout(() => setCopied(null), 1500);
        } catch {
            toast.error('Could not copy to clipboard');
        }
    };

    return (
        <div className="animate-rise">
            <div className="mb-8">
                <h1 className="text-2xl font-bold sm:text-3xl">Welcome back</h1>
                <p className="mt-2 text-[0.9375rem] text-ink-500">
                    Sign in to pick up where you left off.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="username" className="field-label">Username</label>
                    <Input
                        id="username"
                        value={Username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourusername"
                        autoComplete="username"
                        required
                    />
                </div>

                <div>
                    <div className="flex items-baseline justify-between">
                        <label htmlFor="password" className="field-label">Password</label>
                        <Link
                            href="/forgot-password"
                            className="mb-1.5 text-xs font-medium text-brand-700 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 transition hover:text-ink-700"
                        >
                            {showPassword ? <HiEyeOff className="h-5 w-5"/> : <HiEye className="h-5 w-5"/>}
                        </button>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
                New to SkillSurge?{' '}
                <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
                    Create an account
                </Link>
            </p>

            {/* Demo account */}
            <div className="mt-8 rounded-xl border border-ink-200 bg-ink-25 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-ink-900">Try the demo account</h2>
                    <span className="chip bg-warning-soft text-ink-800">Read-only</span>
                </div>

                <dl className="space-y-2">
                    {([
                        {field: 'username', label: 'Username', value: DEMO_USERNAME},
                        {field: 'password', label: 'Password', value: DEMO_PASSWORD},
                    ] as const).map(({field, label, value}) => (
                        <div
                            key={field}
                            className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-3 py-2"
                        >
                            <dt className="text-xs font-medium text-ink-500">{label}</dt>
                            <dd className="flex min-w-0 items-center gap-2">
                                <code className="truncate font-mono text-sm font-semibold text-ink-900">{value}</code>
                                <button
                                    type="button"
                                    onClick={() => copyCredential(field, value)}
                                    aria-label={`Copy demo ${label.toLowerCase()}`}
                                    className="text-ink-400 transition hover:text-brand-700"
                                >
                                    {copied === field
                                        ? <HiOutlineCheck className="h-4 w-4 text-success"/>
                                        : <HiOutlineClipboardCopy className="h-4 w-4"/>}
                                </button>
                            </dd>
                        </div>
                    ))}
                </dl>

                <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                >
                    Sign in as demo
                </Button>

                <p className="mt-3 text-xs leading-relaxed text-ink-500">
                    Browse courses, watch lessons and explore the dashboard. Buying, uploading and profile changes
                    are disabled on this account.
                </p>
            </div>

            <p className="mt-8 text-center text-xs leading-relaxed text-ink-400">
                By signing in you agree to our{' '}
                <Link href="/terms" className="underline hover:text-ink-600">Terms</Link> and{' '}
                <Link href="/privacy" className="underline hover:text-ink-600">Privacy Policy</Link>.
            </p>
        </div>
    );
};

export default Login;
