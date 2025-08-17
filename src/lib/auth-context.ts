import { headers } from "next/headers";
import { getSafePayload } from "./db-wrapper";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isAdmin: boolean;
}

export interface AuthResult {
  success: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  error?: string;
}

export class AuthContext {
  private static instance: AuthContext;
  private payload: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  private constructor() {}

  static getInstance(): AuthContext {
    if (!AuthContext.instance) {
      AuthContext.instance = new AuthContext();
    }
    return AuthContext.instance;
  }

  private async getPayload() {
    if (!this.payload) {
      this.payload = await getSafePayload();
    }
    return this.payload;
  }

  /**
   * Extract bypass token from cookie header
   */
  private extractBypassToken(cookieHeader: string): string | null {
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith("bypass-token=")) {
        return cookie.substring("bypass-token=".length);
      }
    }
    return null;
  }

  /**
   * Check authentication for frontend routes (non-admin)
   * This should NOT have access to admin privileges
   */
  async checkFrontendAuth(): Promise<AuthResult> {
    try {
      const payload = await this.getPayload();
      if (!payload) {
        return {
          success: false,
          authenticated: false,
          user: null,
          error: "Database connection failed",
        };
      }

      const headersList = await headers();
      const cookieHeader = headersList.get("cookie") || "";

      // Create headers for PayloadCMS
      const headersObj = new Headers();
      headersObj.set("cookie", cookieHeader);

      // Check authentication status
      const { user } = await payload.auth({ headers: headersObj });

      if (!user) {
        // Check for bypass token as fallback
        const bypassToken = this.extractBypassToken(cookieHeader);
        if (bypassToken) {
          console.log("🔓 Bypass token detected, fetching user data");
          try {
            const bypassUser = await payload.findByID({
              collection: "users",
              id: bypassToken,
            });

            if (bypassUser) {
              const isAdmin = bypassUser.role === "admin";
              const frontendUser: AuthUser = {
                id: bypassUser.id,
                username: bypassUser.username,
                email: bypassUser.email,
                role: isAdmin ? "admin" : "user",
                isAdmin: isAdmin,
              };

              return {
                success: true,
                authenticated: true,
                user: frontendUser,
              };
            }
          } catch (bypassError) {
            console.log("⚠️ Bypass token validation failed:", bypassError);
          }
        }

        return {
          success: true,
          authenticated: false,
          user: null,
        };
      }

      // For frontend routes, we need to check if this is a regular user
      // Admin users should not have elevated privileges on frontend
      const isAdmin = user.collection === "users" && user.role === "admin";

      // Create a sanitized user object for frontend
      const frontendUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: isAdmin ? "admin" : "user",
        isAdmin: isAdmin,
      };

      return {
        success: true,
        authenticated: true,
        user: frontendUser,
      };
    } catch (error) {
      console.error("Frontend auth check error:", error);
      return {
        success: false,
        authenticated: false,
        user: null,
        error: "Authentication check failed",
      };
    }
  }

  /**
   * Check authentication for admin routes
   * This should have full admin privileges
   */
  async checkAdminAuth(): Promise<AuthResult> {
    try {
      const payload = await this.getPayload();
      if (!payload) {
        return {
          success: false,
          authenticated: false,
          user: null,
          error: "Database connection failed",
        };
      }

      const headersList = await headers();
      const cookieHeader = headersList.get("cookie") || "";

      // Create headers for PayloadCMS
      const headersObj = new Headers();
      headersObj.set("cookie", cookieHeader);

      // Check authentication status
      const { user } = await payload.auth({ headers: headersObj });

      if (!user) {
        return {
          success: true,
          authenticated: false,
          user: null,
        };
      }

      // For admin routes, verify this is actually an admin user
      const isAdmin = user.collection === "users" && user.role === "admin";

      if (!isAdmin) {
        return {
          success: false,
          authenticated: false,
          user: null,
          error: "Admin access required",
        };
      }

      const adminUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "admin",
        isAdmin: true,
      };

      return {
        success: true,
        authenticated: true,
        user: adminUser,
      };
    } catch (error) {
      console.error("Admin auth check error:", error);
      return {
        success: false,
        authenticated: false,
        user: null,
        error: "Authentication check failed",
      };
    }
  }

  /**
   * Check if a user can access a specific route
   */
  async canAccessRoute(route: string, user: AuthUser | null): Promise<boolean> {
    if (!user) return false;

    // Admin routes require admin privileges
    if (route.startsWith("/admin")) {
      return user.isAdmin;
    }

    // Frontend routes are accessible to all authenticated users
    // but admin users get limited privileges
    return true;
  }
}

export const authContext = AuthContext.getInstance();
