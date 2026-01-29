'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const hasAccess = !!localStorage.getItem('viral_access_token');
        const accessType = localStorage.getItem('viral_access_type');

        const isAdminRoute = pathname?.startsWith('/admin');
        const isPortalRoute = pathname?.startsWith('/portal');
        const isAccessRoute = pathname === '/access';
        const isHomePage = pathname === '/';
        const isLoginRoute = pathname === '/login';

        // Allow homepage without access
        if (isHomePage) return;

        // Redirect to access page if no access code
        if (!hasAccess && !isAccessRoute && !isLoginRoute) {
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
    }, [pathname, router]);

    // Handle home/access pages during hydration
    const isAccessRoute = pathname === '/access';
    const isHomePage = pathname === '/' || pathname === '';

    if (isAccessRoute || isHomePage) {
        return <>{children}</>;
    }

    // Still hydrating or no access - return null to keep client/server sync
    // This looks like a blank screen for a split second, which is better than a hydration mismatch or data leak flicker
    if (!mounted) {
        return null;
    }

    const hasAccess = !!localStorage.getItem('viral_access_token');
    const accessType = localStorage.getItem('viral_access_type');
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
