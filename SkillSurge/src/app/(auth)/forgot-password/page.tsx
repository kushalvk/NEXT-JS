'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {HiEye, HiEyeOff, HiOutlineArrowLeft} from 'react-icons/hi';
import {resetPasswordByEmail} from '@/services/AuthService';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {EMAIL_RULE, PASSWORD_REQUIREMENT, PASSWORD_RULE} from '@/utils/validation';

const ForgotPassword: React.FC = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!EMAIL_RULE.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!PASSWORD_RULE.test(password)) {
            setError(PASSWORD_REQUIREMENT + '.');
            return;
        }

        if (password !== confirmPassword) {
            setError('The two passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await resetPasswordByEmail(email.trim(), password);

            if (response?.success) {
                toast.success(response.message || 'Password changed. Sign in with your new password.');
                router.push('/login');
            } else {
                setError(response?.message || 'Could not change your password. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-rise">
            <Link
                href="/login"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition hover:text-ink-900"
            >
                <HiOutlineArrowLeft className="h-4 w-4"/>
                Back to sign in
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold sm:text-3xl">Reset your password</h1>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-500">
                    Enter the email on your account and the new password you&apos;d like to use.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                    <label htmlFor="email" className="field-label">Email</label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="field-label">New password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
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
                    <p className="field-hint">{PASSWORD_REQUIREMENT}.</p>
                </div>

                <div>
                    <label htmlFor="confirm-password" className="field-label">Confirm new password</label>
                    <Input
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </div>

                {error && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                        {error}
                    </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Changing password...' : 'Change password'}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-ink-500">
                Remembered it?{' '}
                <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default ForgotPassword;
