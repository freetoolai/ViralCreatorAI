'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hasAccess = localStorage.getItem('viral_access_granted') === 'true';
        const accessType = localStorage.getItem('viral_access_type');

        const isAdminRoute = pathname?.startsWith('/admin');
        const isPortalRoute = pathname?.startsWith('/portal');
        const isAccessRoute = pathname === '/access';
        const isHomePage = pathname === '/';
        const isLoginRoute = pathname === '/login';

        // Allow homepage without access
        if (isHomePage) {
            return;
        }

        // Redirect to access page if no access code
        if (!hasAccess && !isAccessRoute) {
            router.push('/access');
            return;
        }

        // Redirect from login page to access page ONLY if no access code is granted
        if (isLoginRoute && !hasAccess) {
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

        // Block portal routes for admins (optional)
        if (isPortalRoute && accessType === 'admin') {
            router.push('/admin');
            return;
        }
    }, [pathname, router]);

    // Show nothing while redirecting
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    const hasAccess = localStorage.getItem('viral_access_granted') === 'true';
    const accessType = localStorage.getItem('viral_access_type');
    const isAdminRoute = pathname?.startsWith('/admin');
    const isHomePage = pathname === '/';
    const isAccessRoute = pathname === '/access';

    // Allow access page and homepage
    if (isAccessRoute || isHomePage) {
        return <>{children}</>;
    }

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
