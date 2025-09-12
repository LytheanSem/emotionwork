import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "admin" | "manager" | "user";
      isAdmin: boolean;
      isManager: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "admin" | "manager" | "user";
    isAdmin: boolean;
    isManager: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "manager" | "user";
    isAdmin: boolean;
    isManager: boolean;
  }
}
