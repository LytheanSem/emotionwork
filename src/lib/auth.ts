import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb, User } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const db = await getDb();
        if (!db) {
          console.error("Failed to connect to database");
          return false;
        }

        if (account?.provider === "google" && profile) {
          // Check if user already exists in either collection
          const existingAdminUser = await db
            .collection("adminUsers")
            .findOne({ email: user.email });
          const existingRegularUser = await db
            .collection("regularUsers")
            .findOne({ email: user.email });

          if (!existingAdminUser && !existingRegularUser) {
            // Generate unique username
            let username = user.name || user.email?.split("@")[0] || "user";
            let counter = 1;
            while (
              (await db.collection("adminUsers").findOne({ username })) ||
              (await db.collection("regularUsers").findOne({ username }))
            ) {
              username = `${user.name || user.email?.split("@")[0] || "user"}${counter}`;
              counter++;
            }

            // Create new user in regular users collection
            const newUser: Omit<User, "_id"> = {
              email: user.email!,
              username: username,
              role: "user", // Default to regular user
              image: user.image || undefined,
              provider: account.provider,
              providerId: account.providerAccountId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Store in regular users collection
            await db.collection("regularUsers").insertOne(newUser);
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "user";
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "user"; // Default role for new users
        token.isAdmin = false;
      }

      // Always fetch the latest user role from database to ensure admin changes are reflected
      if (token.email) {
        try {
          const db = await getDb();
          if (db) {
            // Check admin users first
            let dbUser = await db.collection("adminUsers").findOne({
              email: token.email,
            });

            // If not found in admin users, check regular users
            if (!dbUser) {
              dbUser = await db.collection("regularUsers").findOne({
                email: token.email,
              });
            }

            if (dbUser) {
              token.id = dbUser._id?.toString();
              token.role = dbUser.role || "user";
              token.isAdmin = dbUser.role === "admin";
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
