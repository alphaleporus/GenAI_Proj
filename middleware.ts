import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// TEMPORARY: Authentication disabled for debugging
// TODO: Re-enable once login is working

export function middleware(req: NextRequest) {
    // Allow all requests to proceed (no auth check)
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
