import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      // Lần đầu đăng nhập, user sẽ có dữ liệu từ DB
      if (user) {
        token.role = user.role;
        token.id = user.id; // 👈 QUAN TRỌNG: Lưu ID vào token
      }
      return token;
    },
    async session({ session, token }) {
      // Truyền dữ liệu từ token vào session để Client/Server Action sử dụng
      if (session.user) {
        if (token.role) {
          session.user.role = token.role;
        }
        if (token.id) {
          session.user.id = token.id as string; // 👈 QUAN TRỌNG: Truyền ID vào session
        }
      }
      return session;
    },
  },
});