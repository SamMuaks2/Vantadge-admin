import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

// Use server-only var (no NEXT_PUBLIC_ prefix) so it's available in the
// authorize() callback which runs server-side, not in the browser.
const API_URL =
  process.env.NEXTAUTH_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_URL}/auth/admin/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });
          if (res.data?.accessToken) {
            return {
              id: res.data.user._id,
              email: res.data.user.email,
              name: res.data.user.name,
              accessToken: res.data.accessToken,
              adminRole: res.data.user.adminRole,
            };
          }
          return null;
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Login failed";
          console.error("[Admin Auth] authorize error:", msg);
          // Throw so NextAuth surfaces the message on the login page
          throw new Error(msg);
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.adminRole = (user as any).adminRole;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      (session.user as any).adminRole = token.adminRole;
      (session.user as any).id = token.id;
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };