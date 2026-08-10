'use client';

import React, {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {useRouter} from 'next/navigation';
import {Calendar, CreditCard, Mail, User as UserIcon} from 'lucide-react';
import {loggedUser, updatedProfile} from '@/services/AuthService';
import {User} from '@/models/User';
import PageHeader from '@/components/PageHeader';
import Loader from '@/components/Loader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

interface LoggedUserResponse {
    success: boolean;
    User: User;
}

interface UpdateProfileResponse {
    success: boolean;
    message?: string;
}

const FIELDS = [
    {name: 'fullName', key: 'Full_name' as const, label: 'Full name', Icon: UserIcon, type: 'text', placeholder: 'Ada Lovelace'},
    {name: 'username', key: 'Username' as const, label: 'Username', Icon: UserIcon, type: 'text', placeholder: 'yourusername'},
    {name: 'email', key: 'Email' as const, label: 'Email', Icon: Mail, type: 'email', placeholder: 'you@example.com'},
    {name: 'razorpayId', key: 'RazorpayId' as const, label: 'Razorpay ID', Icon: CreditCard, type: 'text', placeholder: 'Optional'},
];

const ProfilePage: React.FC = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState<User | null>(null);

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await loggedUser() as LoggedUserResponse;
            if (response?.success) {
                setUserData(response.User);
            } else {
                toast.error('Please sign in to view your profile');
                router.push('/login');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Could not load your profile');
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleCancel = () => {
        setIsEditing(false);
        fetchUserData();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;

        setIsSaving(true);
        const loadingToast = toast.loading('Updating profile...');

        try {
            const formData = new FormData();
            formData.append('Username', userData.Username);
            formData.append('Email', userData.Email);
            formData.append('Full_name', userData.Full_name);
            if (userData.RazorpayId) formData.append('RazorpayId', userData.RazorpayId);

            const response = await updatedProfile(formData) as UpdateProfileResponse;

            if (response?.success) {
                toast.success('Profile updated', {id: loadingToast});
                setIsEditing(false);
            } else {
                // A demo rejection already shows its own toast from the interceptor.
                toast.dismiss(loadingToast);
                if (response?.message) toast.error(response.message);
                handleCancel();
            }
        } catch (err) {
            console.error('Update error:', err);
            toast.error('Something went wrong', {id: loadingToast});
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        const fieldMap: Record<string, keyof User> = {
            username: 'Username',
            email: 'Email',
            fullName: 'Full_name',
            razorpayId: 'RazorpayId',
        };

        const userField = fieldMap[name];
        if (!userField) return;

        setUserData((prev) => (prev ? ({...prev, [userField]: value} as User) : prev));
    };

    if (isLoading) {
        return (
            <div className="container-page page-shell">
                <Loader fullPage label="Loading your profile"/>
            </div>
        );
    }

    if (!userData) return null;

    const joined = userData.createdAt
        ? new Date(userData.createdAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})
        : null;

    const stats = [
        {label: 'Courses bought', value: userData.Buy_Course?.length ?? 0, href: '/mycourses'},
        {label: 'Certificates', value: userData.Certificate?.length ?? 0, href: '/mycourses'},
        {label: 'Favourites', value: userData.Favourite?.length ?? 0, href: '/favorite'},
        {label: 'Courses uploaded', value: userData.Upload_Course?.length ?? 0, href: '/uploadCourse'},
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader
                eyebrow="Account"
                title="Profile"
                description="Your account details and a snapshot of your activity."
                actions={
                    !isEditing && (
                        <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
                    )
                }
            />

            <div className="container-page page-shell">
                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                    {/* Identity card */}
                    <aside className="min-w-0 lg:col-span-1">
                        <div className="surface-card p-6 text-center">
                            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white">
                                {userData.Username?.[0]?.toUpperCase()}
                            </div>
                            <h2 className="mt-4 text-lg font-bold">{userData.Full_name || userData.Username}</h2>
                            <p className="text-sm text-ink-500">@{userData.Username}</p>

                            {joined && (
                                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-500">
                                    <Calendar className="h-3.5 w-3.5"/>
                                    Joined {joined}
                                </p>
                            )}
                        </div>

                        <dl className="mt-4 grid grid-cols-2 gap-3">
                            {stats.map((stat) => (
                                <Link
                                    key={stat.label}
                                    href={stat.href}
                                    className="surface-card p-4 transition hover:border-brand-300 hover:shadow-e3"
                                >
                                    <dt className="text-xs text-ink-500">{stat.label}</dt>
                                    <dd className="mt-1 text-2xl font-bold">{stat.value}</dd>
                                </Link>
                            ))}
                        </dl>
                    </aside>

                    {/* Details */}
                    <section className="min-w-0 lg:col-span-2">
                        <form onSubmit={handleSave} className="surface-card p-5 sm:p-6">
                            <h2 className="text-lg font-bold">Account details</h2>
                            <p className="mt-1 text-sm text-ink-500">
                                {isEditing ? 'Update your details and save.' : 'Select “Edit profile” to make changes.'}
                            </p>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                {FIELDS.map(({name, key, label, Icon, type, placeholder}) => (
                                    <div key={name} className={name === 'razorpayId' ? 'sm:col-span-2' : undefined}>
                                        <label htmlFor={name} className="field-label">{label}</label>
                                        {isEditing ? (
                                            <Input
                                                id={name}
                                                name={name}
                                                type={type}
                                                value={(userData[key] as string) || ''}
                                                onChange={handleChange}
                                                placeholder={placeholder}
                                            />
                                        ) : (
                                            <p className="flex min-h-11 items-center gap-2 rounded-lg border border-ink-200 bg-ink-25 px-3.5 text-[0.9375rem] text-ink-800">
                                                <Icon className="h-4 w-4 shrink-0 text-ink-400"/>
                                                <span className="truncate">
                                                    {(userData[key] as string) || <span className="text-ink-400">Not set</span>}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="mt-7 flex flex-col gap-3 border-t border-ink-200 pt-5 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save changes'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
