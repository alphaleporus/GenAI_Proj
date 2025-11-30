import {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// In-memory user storage (for demo purposes)
// In production, use a real database
const users = [
    {
        id: '1',
        email: 'admin@chainreaction.com',
        password: 'admin123', // In production, use hashed passwords!
        name: 'Admin User',
        role: 'admin',
    },
    {
        id: '2',
        email: 'demo@chainreaction.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'user',
    },
];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email', placeholder: 'user@example.com'},
                password: {label: 'Password', type: 'password'},
            },
            async authorize(credentials) {
                console.log('🔐 Auth attempt:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ Missing credentials');
                    throw new Error('Please enter email and password');
                }

                // Find user
                const user = users.find(
                    (u) => u.email === credentials.email && u.password === credentials.password
                );

                console.log('👤 User found:', !!user);

                if (!user) {
                    console.log('❌ Invalid credentials');
                    throw new Error('Invalid email or password');
                }

                console.log('✅ Auth successful:', user.email);

                // Return user object (without password)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({session, token}) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
    debug: true, // Enable debug logs
};
