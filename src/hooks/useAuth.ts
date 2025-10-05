import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook to get current auth state and optionally fetch user if not authenticated
 */
export function useAuth(redirectTo?: string) {
    const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
    const router = useRouter();
    const hasAttemptedFetch = useRef(false);

    useEffect(() => {
        // If not authenticated and not loading, try to fetch user (only once)
        if (!isAuthenticated && !isLoading && !hasAttemptedFetch.current) {
            hasAttemptedFetch.current = true;
            fetchUser().catch(() => {
                // If fetch fails and redirectTo is provided, redirect
                if (redirectTo) {
                    router.push(redirectTo);
                }
            });
        }
    }, [isAuthenticated, isLoading, fetchUser, router, redirectTo]);

    return { user, isAuthenticated, isLoading };
}

/**
 * Hook for protected routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = "/login") {
    const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
    const router = useRouter();
    const hasAttemptedFetch = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Skip if already authenticated or still loading
            if (isAuthenticated || isLoading) {
                return;
            }

            // Skip if already attempted fetch
            if (hasAttemptedFetch.current) {
                return;
            }

            hasAttemptedFetch.current = true;

            try {
                await fetchUser();
            } catch {
                // Only redirect if user fetch fails
                router.push(redirectTo);
            }
        };

        checkAuth();
    }, [isAuthenticated, isLoading, fetchUser, router, redirectTo]);

    return { user, isAuthenticated, isLoading };
}

/**
 * Hook to check if user has specific role(s)
 */
export function useRequireRole(
    allowedRoles: string[],
    redirectTo: string = "/dashboard"
) {
    const { user, isAuthenticated, isLoading } = useRequireAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (!allowedRoles.includes(user.type)) {
                router.push(redirectTo);
            }
        }
    }, [user, isAuthenticated, isLoading, allowedRoles, router, redirectTo]);

    return { user, isAuthenticated, isLoading };
}

/**
 * Hook to check if user is admin
 */
export function useRequireAdmin(redirectTo: string = "/dashboard") {
    return useRequireRole(["Admin"], redirectTo);
}

/**
 * Hook to check if user is physician
 */
export function useRequirePhysician(redirectTo: string = "/dashboard") {
    return useRequireRole(["Physician", "Admin"], redirectTo);
}
