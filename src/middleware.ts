
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail';
    const token = request.cookies.get('token')?.value || '';
    if (path === '/signup') {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
    else if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/home', request.nextUrl));
    }
    else if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/profile',
        '/profile/:id*',
        '/login',
        '/signup',
        '/verifyemail',
        '/home',
        '/chatroom/:id*',
        '/voiceroom/:id*',
        '/room/:id*',
    ],
}