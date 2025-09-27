import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define the user payload interface
interface UserPayload {
    id: string;
    type?: string;
    username?: string;
    email?: string;
}

// Define paths that should be excluded from authentication
const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/health'
];

// Check if the path is a public API path that doesn't need authentication
function isPublicApiPath(pathname: string): boolean {
    return publicApiPaths.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply middleware to API routes
    if (!pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Skip authentication for public API paths
    if (isPublicApiPath(pathname)) {
        return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('token');

    if (!token) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    try {
        // Verify the JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const decoded = jwt.verify(token.value, jwtSecret) as UserPayload;

        // Add user info to request headers so API routes can access it
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decoded.id);
        requestHeaders.set('x-user-type', decoded.type || '');
        requestHeaders.set('x-user-username', decoded.username || '');
        requestHeaders.set('x-user-email', decoded.email || '');

        // Continue with the request, passing along the user info
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

    } catch (error) {
        console.error('JWT verification failed:', error);

        // Determine the specific error type
        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json(
                { error: 'Token has expired' },
                { status: 401 }
            );
        } else if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        } else {
            return NextResponse.json(
                { error: 'Token verification failed' },
                { status: 401 }
            );
        }
    }
}

// Configure which routes the middleware should run on
export const config = {
    // Match all API routes except static files and internal Next.js routes
    matcher: [
        '/api/((?!_next/static|_next/image|favicon.ico).*)',
    ]
};