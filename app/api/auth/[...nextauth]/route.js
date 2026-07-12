import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!user) {
          throw new Error('Invalid email or password.');
        }

        // Only enforce isVerified check for admin accounts
        if (user.role === 'admin' && !user.isVerified) {
          throw new Error('This account has not been verified yet. Please check your email inbox.');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role || 'user',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours session lifetime
  },
  // NOTE: No global `pages` config here. This app has two separate login UIs
  // (/login for regular users, /admin/login for admins) sharing one NextAuth
  // instance. All auth redirects are handled precisely by middleware.js instead,
  // which correctly routes each role to the right login page. Adding a global
  // pages.signIn would force ALL NextAuth-internal redirects to one page,
  // breaking the admin login flow.
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
