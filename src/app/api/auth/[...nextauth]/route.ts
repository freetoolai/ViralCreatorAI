import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@viralcreatorai.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // DEMO USERS (Hardcoded for now, will be replaced with DB check in Phase 15)
                const demoUsers = [
                    {
                        id: "1",
                        name: "Admin User",
                        email: "admin@viralcreatorai.com",
                        password: "demo123",
                        role: "admin"
                    },
                    {
                        id: "2",
                        name: "Client User",
                        email: "client@example.com",
                        password: "demo123",
                        role: "client"
                    }
                ];

                if (!credentials?.email || !credentials?.password) return null;

                const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password);

                if (user) {
                    return { id: user.id, name: user.name, email: user.email, role: user.role };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only",
});

export { handler as GET, handler as POST };
