'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {HiEye, HiEyeOff} from 'react-icons/hi';
import {signup} from '@/services/AuthService';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

export interface SignupData {
    Username: string;
    Email: string;
    Password: string;
    Full_name: string;
}

const PASSWORD_RULE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const SignUp: React.FC = () => {
    const [Username, setUsername] = useState('');
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [Full_name, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!PASSWORD_RULE.test(Password)) {
            setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter and a number.');
            return;
        }

        if (Password !== confirmPassword) {
            setError('The two passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        const loadingToastId = toast.loading('Creating your account...');

        try {
            const response = await signup({Username, Email, Password, Full_name});

            if (response?.success) {
                toast.success(response.message || 'Account created. You can sign in now.', {id: loadingToastId});
                router.push('/login');
            } else {
                toast.error(response?.message || 'Signup failed. Try again.', {id: loadingToastId});
            }
        } catch {
            toast.error('Network error. Please try again.', {id: loadingToastId});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-rise">
            <div className="mb-8">
                <h1 className="text-2xl font-bold sm:text-3xl">Create your account</h1>
                <p className="mt-2 text-[0.9375rem] text-ink-500">
                    Free to join. Only pay for the courses you want.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="fullname" className="field-label">Full name</label>
                    <Input
                        id="fullname"
                        value={Full_name}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ada Lovelace"
                        autoComplete="name"
                    />
                </div>

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
                    <label htmlFor="email" className="field-label">Email</label>
                    <Input
                        id="email"
                        type="email"
                        value={Email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="field-label">Password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={Password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                    <p className="field-hint">
                        At least 8 characters, with an uppercase letter, a lowercase letter and a number.
                    </p>
                </div>

                <div>
                    <label htmlFor="confirm-password" className="field-label">Confirm password</label>
                    <div className="relative">
                        <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="pr-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 transition hover:text-ink-700"
                        >
                            {showConfirmPassword ? <HiEyeOff className="h-5 w-5"/> : <HiEye className="h-5 w-5"/>}
                        </button>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                    Sign in
                </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-relaxed text-ink-400">
                By creating an account you agree to our{' '}
                <Link href="/terms" className="underline hover:text-ink-600">Terms</Link> and{' '}
                <Link href="/privacy" className="underline hover:text-ink-600">Privacy Policy</Link>.
            </p>
        </div>
    );
};

export default SignUp;
