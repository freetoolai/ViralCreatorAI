'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CustomUser {
    role?: string;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't do anything until session is determined
        if (status === 'loading') return;

        const sessionUser = session?.user as CustomUser | undefined;
        const hasAccess = !!localStorage.getItem('viral_access_token') || status === 'authenticated';
        const accessType = localStorage.getItem('viral_access_type') || sessionUser?.role;

        const isAdminRoute = pathname?.startsWith('/admin');
        const isPortalRoute = pathname?.startsWith('/portal');
        const isAccessRoute = pathname === '/access';
        const isHomePage = pathname === '/';
        const isLoginRoute = pathname === '/login';

        // Allow homepage and login without access
        if (isHomePage || isLoginRoute) return;

        // Redirect to access page if no access code and not logged in
        if (!hasAccess && !isAccessRoute) {
            router.push('/access');
            return;
        }

        // Redirect away from access page if already has access
        if (hasAccess && isAccessRoute) {
            if (accessType === 'admin') {
                router.push('/admin');
            } else {
                router.push('/portal/dashboard');
            }
            return;
        }

        // Block admin routes for clients
        if (isAdminRoute && accessType === 'client') {
            router.push('/portal/dashboard');
            return;
        }

        // Block portal routes for admins
        if (isPortalRoute && accessType === 'admin') {
            router.push('/admin');
            return;
        }
    }, [pathname, router, status, session]);

    // Handle home/access/login pages during hydration
    const isAccessRoute = pathname === '/access';
    const isHomePage = pathname === '/' || pathname === '';
    const isLoginRoute = pathname === '/login';

    if (isAccessRoute || isHomePage || isLoginRoute) {
        return <>{children}</>;
    }

    // Still hydrating or session loading
    if (!mounted || status === 'loading') {
        return null;
    }

    const sessionUser = session?.user as CustomUser | undefined;
    const hasAccess = !!localStorage.getItem('viral_access_token') || status === 'authenticated';
    const accessType = localStorage.getItem('viral_access_type') || sessionUser?.role;
    const isAdminRoute = pathname?.startsWith('/admin');

    // Block if no access
    if (!hasAccess) {
        return null;
    }

    // Block admin routes for clients
    if (isAdminRoute && accessType === 'client') {
        return null;
    }

    return <>{children}</>;
}
