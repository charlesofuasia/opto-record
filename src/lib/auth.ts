import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
    id: string;
    type?: string;
    username?: string;
    email?: string;
}

/**
 * Extract authenticated user information from request headers
 * This should be used in API routes that are protected by the authentication middleware
 */
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser {
    const userId = request.headers.get('x-user-id');
    const userType = request.headers.get('x-user-type');
    const username = request.headers.get('x-user-username');
    const email = request.headers.get('x-user-email');

    if (!userId) {
        throw new Error('User information not found in request headers. Ensure the route is protected by middleware.');
    }

    return {
        id: userId,
        type: userType || undefined,
        username: username || undefined,
        email: email || undefined,
    };
}

/**
 * Check if the authenticated user is an admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
    return user.type === 'Admin';
}

/**
 * Check if the authenticated user can access a specific user's data
 * Users can access their own data, admins can access any user's data
 */
export function canAccessUserData(authenticatedUser: AuthenticatedUser, targetUserId: string): boolean {
    return authenticatedUser.id === targetUserId || isAdmin(authenticatedUser);
}