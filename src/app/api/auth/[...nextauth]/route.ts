import NextAuth, { type AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers here if needed
  ],
  // Optional: Add callbacks, pages, etc.
  callbacks: {
    async session({ session, user }) {
      // Send properties to the client, like the user id from the database.
      // The user object here comes from the database adapter.
      if (session.user) {
        session.user.id = user.id; // Add the user ID to the session object
      }
      return session;
    },
  },
  // pages: {
  //   signIn: '/auth/signin', // Optional: Custom sign-in page
  // },
  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT signing/encryption
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
