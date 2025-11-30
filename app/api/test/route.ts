import {NextResponse} from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'API is working',
        env: {
            hasSecret: !!process.env.NEXTAUTH_SECRET,
            secret: process.env.NEXTAUTH_SECRET?.slice(0, 10) + '...',
            url: process.env.NEXTAUTH_URL,
        }
    });
}

export async function POST(request: Request) {
    const body = await request.json();

    const users = [
        {
            email: 'demo@chainreaction.com',
            password: 'demo123',
            name: 'Demo User',
        }
    ];

    const user = users.find(
        u => u.email === body.email && u.password === body.password
    );

    return NextResponse.json({
        credentials: body,
        found: !!user,
        user: user ? {email: user.email, name: user.name} : null
    });
}
