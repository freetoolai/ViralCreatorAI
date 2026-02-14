import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPass = process.env.ADMIN_PASSWORD;

                if (adminEmail && adminPass && credentials.email === adminEmail && credentials.password === adminPass) {
                    return { id: "1", name: "Admin User", email: adminEmail, role: "admin" };
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
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
