import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User.model';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: { identifier: { label: 'Email or username', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;
        await dbConnect();
        const identifier = credentials.identifier.trim();
        const user = await UserModel.findOne({ $or: [{ email: identifier.toLowerCase() }, { username: identifier }] });
        if (!user?.password || !(await bcrypt.compare(credentials.password, user.password))) return null;
        return { id: String(user._id), _id: String(user._id), name: user.name, email: user.email, username: user.username, isVerified: user.isVerified };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token._id = user._id; token.username = user.username; token.isVerified = user.isVerified; }
      return token;
    },
    async session({ session, token }) {
      session.user._id = token._id as string;
      session.user.username = token.username as string;
      session.user.isVerified = token.isVerified as boolean;
      return session;
    },
  },
  pages: { signIn: '/sign-in', error: '/sign-in' },
  session: { strategy: 'jwt' }, secret: process.env.NEXTAUTH_SECRET,
};
