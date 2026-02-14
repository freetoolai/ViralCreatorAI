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
        const hasAccess = !!localStorage.getItem('viral_access_token') || !!localStorage.getItem('portal_client_id') || status === 'authenticated';
        const accessType = localStorage.getItem('viral_access_type') || (localStorage.getItem('portal_client_id') ? 'client' : sessionUser?.role);

        const isAdminRoute = pathname?.startsWith('/admin');
        const isPortalLogin = pathname === '/portal';
        const isSharedGroupRoute = pathname?.startsWith('/portal/groups/');
        const isSharedCampaignRoute = pathname?.startsWith('/portal/campaigns/');
        const isAccessRoute = pathname === '/access';
        const isHomePage = pathname === '/';
        const isLoginRoute = pathname === '/login';

        // 1. If identified as a client, strictly block admin, login and home
        if (accessType === 'client') {
            if (isAdminRoute || isLoginRoute || isHomePage || isAccessRoute) {
                router.push('/portal/dashboard');
                return;
            }
        }

        // 2. Allow shared views and portal login without session check
        if (isPortalLogin || isSharedGroupRoute || isSharedCampaignRoute) return;

        // 3. Admin access check
        if (isAdminRoute && accessType !== 'admin') {
            if (hasAccess) {
                router.push('/portal/dashboard');
            } else {
                router.push('/access');
            }
            return;
        }

        // Allow homepage and login for everyone else
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
    }, [pathname, router, status, session]);

    // Handle home/access/login/shared pages during hydration
    const isAccessRoute = pathname === '/access';
    const isHomePage = pathname === '/' || pathname === '';
    const isLoginRoute = pathname === '/login';
    const isPortalLogin = pathname === '/portal';
    const isSharedGroupRoute = pathname?.startsWith('/portal/groups/');
    const isSharedCampaignRoute = pathname?.startsWith('/portal/campaigns/');

    if (isAccessRoute || isHomePage || isLoginRoute || isPortalLogin || isSharedGroupRoute || isSharedCampaignRoute) {
        return <>{children}</>;
    }

    // Still hydrating or session loading
    if (!mounted || status === 'loading') {
        return null;
    }

    const sessionUser = session?.user as CustomUser | undefined;
    const hasAccess = !!localStorage.getItem('viral_access_token') || !!localStorage.getItem('portal_client_id') || status === 'authenticated';
    const accessType = localStorage.getItem('viral_access_type') || (localStorage.getItem('portal_client_id') ? 'client' : sessionUser?.role);
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
