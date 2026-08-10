'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import toast from 'react-hot-toast';
import {Types} from 'mongoose';
import {loggedUser} from '@/services/AuthService';
import {addToFavouriteService, removeFromFavouriteService} from '@/services/FavouriteService';
import {User} from '@/models/User';
import {isDemoUsername} from '@/utils/demoUser';

/**
 * Favourite state shared by every course grid. Toggling is optimistic and rolls
 * back if the request fails, which also covers the read-only demo account (the
 * axios interceptor shows the explanation toast).
 */
export function useFavourites() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [favourites, setFavourites] = useState<string[]>([]);
    const [loadingUser, setLoadingUser] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const response = await loggedUser();
            if (response?.success && response.User) {
                setUser(response.User);
                setFavourites(
                    (response.User.Favourite || []).map((id: string | Types.ObjectId) => id.toString())
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUser(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const isFavourite = useCallback(
        (courseId: string) => favourites.includes(courseId),
        [favourites]
    );

    const toggleFavourite = useCallback(
        async (courseId: string) => {
            if (!user) {
                toast('Sign in to save favourites');
                router.push('/login');
                return;
            }

            const wasFavourite = favourites.includes(courseId);

            setFavourites((prev) =>
                wasFavourite ? prev.filter((id) => id !== courseId) : [...prev, courseId]
            );

            try {
                const service = wasFavourite ? removeFromFavouriteService : addToFavouriteService;
                const response = await service({courseId});

                // Services swallow errors and resolve to undefined, so treat that as a failure.
                if (!response?.success) throw new Error(response?.message || 'Request failed');
            } catch {
                setFavourites((prev) =>
                    wasFavourite ? [...prev, courseId] : prev.filter((id) => id !== courseId)
                );
                // The demo account already gets an explanatory toast from the interceptor.
                if (!isDemoUsername(user.Username)) toast.error('Could not update favourites');
            }
        },
        [favourites, router, user]
    );

    return {user, favourites, isFavourite, toggleFavourite, loadingUser, reloadUser: loadUser};
}
