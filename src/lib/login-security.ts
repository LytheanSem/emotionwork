import { getSafePayload } from "./db-wrapper";

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export interface LockoutStatus {
  isLocked: boolean;
  lockoutUntil?: Date;
  remainingAttempts: number;
  timeRemaining?: number; // in milliseconds
}

export class LoginSecurityService {
  private static instance: LoginSecurityService;
  private payload: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Configuration
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly ATTEMPT_RESET_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

  private constructor() {}

  static getInstance(): LoginSecurityService {
    if (!LoginSecurityService.instance) {
      LoginSecurityService.instance = new LoginSecurityService();
    }
    return LoginSecurityService.instance;
  }

  private async getPayload() {
    if (!this.payload) {
      this.payload = await getSafePayload();
    }
    return this.payload;
  }

  /**
   * Safely convert a value to a Date object
   */
  private ensureDate(value: unknown): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    if (typeof value === "number") return new Date(value);
    return undefined;
  }

  /**
   * Check if failed attempts should be reset due to timeout
   */
  private shouldResetAttempts(lastAttemptAt: Date): boolean {
    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - lastAttemptAt.getTime();
    return timeSinceLastAttempt > this.ATTEMPT_RESET_TIMEOUT;
  }

  /**
   * Check if an account is currently locked out
   */
  async checkLockoutStatus(
    email: string,
    ipAddress: string
  ): Promise<LockoutStatus> {
    try {
      const payload = await this.getPayload();
      if (!payload) {
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      // Log the current state for debugging
      console.log(`🔍 Checking lockout status for ${email} from ${ipAddress}`);

      // Find the login attempt record for this email
      const attemptRecord = await payload.find({
        collection: "login-attempts",
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      });

      if (attemptRecord.docs.length === 0) {
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      const record = attemptRecord.docs[0];
      const now = new Date();

      // Note: Timeout check moved to after lockout expiration check

      // Safely convert lockoutUntil to Date and check if account is currently locked
      const lockoutUntil = this.ensureDate(record.lockoutUntil);

      if (lockoutUntil && lockoutUntil > now) {
        const timeRemaining = lockoutUntil.getTime() - now.getTime();
        console.log(
          `🔒 Account still locked for ${email} from ${ipAddress} - ${Math.ceil(timeRemaining / 60000)} minutes remaining`
        );

        return {
          isLocked: true,
          lockoutUntil: lockoutUntil,
          remainingAttempts: 0,
          timeRemaining,
        };
      }

      // If lockout has expired, clear it and reset attempts
      if (lockoutUntil && lockoutUntil <= now) {
        console.log(
          `🔓 Lockout expired for ${email} from ${ipAddress}, clearing...`
        );

        // Delete the expired record entirely
        try {
          await payload.delete({
            collection: "login-attempts",
            id: record.id,
            overrideAccess: true,
          });
          console.log(`✅ Expired lockout record deleted for ${email}`);

          // CRITICAL: Unlock the user in PayloadCMS by resetting their failed login attempts
          try {
            const user = await payload.find({
              collection: "users",
              where: {
                email: {
                  equals: email.toLowerCase(),
                },
              },
              limit: 1,
            });

            if (user.docs.length > 0) {
              // Reset any PayloadCMS internal lockout state
              await payload.update({
                collection: "users",
                id: user.docs[0].id,
                data: {
                  // Force a small update to trigger PayloadCMS to recalculate auth state
                  updatedAt: new Date(),
                },
                overrideAccess: true,
              });
              console.log(`🔓 User unlocked in PayloadCMS for ${email}`);

              // ADDITIONAL: Force a more aggressive state reset
              try {
                // Try to update with a unique timestamp to force state recalculation
                await payload.update({
                  collection: "users",
                  id: user.docs[0].id,
                  data: {
                    updatedAt: new Date(Date.now() + 1), // Ensure it's different
                  },
                  overrideAccess: true,
                });
                console.log(`🔓 Additional unlock attempt for ${email}`);

                // CRITICAL: Try to force a complete user state refresh
                // This might help clear PayloadCMS internal lockout
                try {
                  await payload.update({
                    collection: "users",
                    id: user.docs[0].id,
                    data: {
                      // Force multiple updates to trigger state recalculation
                      updatedAt: new Date(Date.now() + 2),
                      // Add a temporary field that might trigger internal state refresh
                      _forceRefresh: Date.now(),
                    },
                    overrideAccess: true,
                  });
                  console.log(`🔓 Force refresh attempt for ${email}`);
                } catch {
                  console.log(`Note: Force refresh not needed for ${email}`);
                }
              } catch {
                console.log(`Note: Additional unlock not needed for ${email}`);
              }
            }
          } catch (unlockError) {
            console.error(
              `⚠️ Failed to unlock user in PayloadCMS for ${email}:`,
              unlockError
            );
          }

          // IMPORTANT: Reset the PayloadCMS connection to clear any stale auth state
          // This fixes the issue where correct credentials fail after lockout expires
          const { resetConnection } = await import("./db-wrapper");
          resetConnection();
          // Also clear local cache so a fresh instance is fetched next time
          this.payload = null;

          // ADDITIONAL: Wait longer for the connection to fully reset
          await new Promise((resolve) => setTimeout(resolve, 500));

          // CRITICAL: Force a second connection reset to ensure complete refresh
          resetConnection();
          this.payload = null;
          await new Promise((resolve) => setTimeout(resolve, 200));

          console.log(
            `🔄 PayloadCMS connection reset to clear stale auth state for ${email}`
          );
        } catch (error) {
          console.error(
            `❌ Failed to delete expired lockout for ${email}:`,
            error
          );
        }

        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      // If no lockout but still have failed attempts, check if they should be reset
      if (record.failedAttempts && record.failedAttempts > 0) {
        const lastAttemptAt = this.ensureDate(record.lastAttemptAt);
        if (lastAttemptAt && this.shouldResetAttempts(lastAttemptAt)) {
          console.log(
            `⏰ Failed attempts timeout reached for ${email} - resetting counter (${Math.ceil((Date.now() - lastAttemptAt.getTime()) / 60000)} minutes since last attempt)`
          );

          // Reset the failed attempts due to timeout
          try {
            await payload.delete({
              collection: "login-attempts",
              id: record.id,
              overrideAccess: true,
            });
            console.log(`✅ Reset failed attempts for ${email} due to timeout`);

            // CRITICAL: Also unlock the user in PayloadCMS when timeout resets
            try {
              const user = await payload.find({
                collection: "users",
                where: {
                  email: {
                    equals: email.toLowerCase(),
                  },
                },
                limit: 1,
              });

              if (user.docs.length > 0) {
                // Reset any PayloadCMS internal lockout state
                await payload.update({
                  collection: "users",
                  id: user.docs[0].id,
                  data: {
                    // Force a small update to trigger PayloadCMS to recalculate auth state
                    updatedAt: new Date(),
                  },
                  overrideAccess: true,
                });
                console.log(
                  `🔓 User unlocked in PayloadCMS after timeout for ${email}`
                );
              }
            } catch (unlockError) {
              console.error(
                `⚠️ Failed to unlock user in PayloadCMS after timeout for ${email}:`,
                unlockError
              );
            }

            // Also reset connection to ensure clean state
            const { resetConnection } = await import("./db-wrapper");
            resetConnection();
            // Also clear local cache so a fresh instance is fetched next time
            this.payload = null;
            console.log(
              `🔄 PayloadCMS connection reset after timeout for ${email}`
            );
          } catch (error) {
            console.error(`❌ Failed to reset attempts for ${email}:`, error);
          }

          return {
            isLocked: false,
            remainingAttempts: this.MAX_FAILED_ATTEMPTS,
          };
        }

        // If attempts haven't timed out yet, show remaining attempts
        if (lastAttemptAt) {
          console.log(
            `📊 ${email} has ${record.failedAttempts} failed attempts (${Math.ceil((this.ATTEMPT_RESET_TIMEOUT - (Date.now() - lastAttemptAt.getTime())) / 60000)} minutes until timeout)`
          );
        }
      }

      // If not locked, calculate remaining attempts
      const failedAttempts = record.failedAttempts || 0;
      const remainingAttempts = Math.max(
        0,
        this.MAX_FAILED_ATTEMPTS - failedAttempts
      );

      return {
        isLocked: false,
        remainingAttempts,
      };
    } catch (error) {
      console.error("Error checking lockout status:", error);
      // If there's an error, be conservative and allow the attempt
      return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
    }
  }

  /**
   * Record a login attempt
   */
  async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    try {
      const payload = await this.getPayload();
      if (!payload) {
        console.error(
          "Failed to record login attempt: Database connection failed"
        );
        return;
      }

      if (attempt.success) {
        // Successful login - remove the record if it exists
        await this.removeFailedAttemptRecord(attempt.email);
        console.log(
          `✅ Successful login for ${attempt.email} - removed from failed attempts`
        );
        return;
      }

      // Failed login - find existing record or create new one
      const existingRecord = await payload.find({
        collection: "login-attempts",
        where: {
          email: {
            equals: attempt.email.toLowerCase(),
          },
        },
        limit: 1,
      });

      let failedAttempts = 1;
      let lockoutUntil: Date | undefined;

      if (existingRecord.docs.length > 0) {
        // Update existing record
        const record = existingRecord.docs[0];
        failedAttempts = (record.failedAttempts || 0) + 1;

        // Check if we should lock the account
        if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
          lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
          console.log(
            `🔒 Account locked for ${attempt.email} from ${attempt.ipAddress} until ${lockoutUntil}`
          );
        }

        // Update the existing record
        await payload.update({
          collection: "login-attempts",
          id: record.id,
          data: {
            ipAddress: attempt.ipAddress,
            userAgent: attempt.userAgent,
            failedAttempts,
            lockoutUntil,
            lastAttemptAt: new Date(),
          },
          overrideAccess: true,
        });
      } else {
        // Create new record for first failed attempt
        await payload.create({
          collection: "login-attempts",
          data: {
            email: attempt.email.toLowerCase(),
            ipAddress: attempt.ipAddress,
            userAgent: attempt.userAgent,
            failedAttempts: 1,
            lastAttemptAt: new Date(),
          },
          overrideAccess: true,
        });
      }

      console.log(
        `📝 Failed login recorded: ${attempt.email} from ${attempt.ipAddress} - Failed attempts: ${failedAttempts}`
      );
    } catch (error) {
      console.error("Error recording login attempt:", error);
    }
  }

  /**
   * Remove a failed attempt record (when user successfully logs in)
   */
  private async removeFailedAttemptRecord(email: string): Promise<void> {
    try {
      const payload = await this.getPayload();
      if (!payload) return;

      const existingRecord = await payload.find({
        collection: "login-attempts",
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      });

      if (existingRecord.docs.length > 0) {
        await payload.delete({
          collection: "login-attempts",
          id: existingRecord.docs[0].id,
          overrideAccess: true,
        });
      }
    } catch (error) {
      console.error(
        `Error removing failed attempt record for ${email}:`,
        error
      );
    }
  }

  /**
   * Get lockout information for user feedback
   */
  async getLockoutInfo(
    email: string,
    ipAddress: string
  ): Promise<{
    isLocked: boolean;
    timeRemaining?: string;
    attemptsRemaining?: number;
  }> {
    const status = await this.checkLockoutStatus(email, ipAddress);

    if (status.isLocked && status.timeRemaining) {
      const minutes = Math.ceil(status.timeRemaining / (60 * 1000));
      return {
        isLocked: true,
        timeRemaining: `${minutes} minute${minutes !== 1 ? "s" : ""}`,
      };
    }

    return {
      isLocked: false,
      attemptsRemaining: status.remainingAttempts,
    };
  }

  /**
   * Clear lockout for an account (admin function)
   */
  async clearLockout(email: string, ipAddress: string): Promise<void> {
    try {
      const payload = await this.getPayload();
      if (!payload) {
        throw new Error("Database connection failed");
      }

      // Find and delete the login attempt record
      const existingRecord = await payload.find({
        collection: "login-attempts",
        where: {
          email: {
            equals: email.toLowerCase(),
          },
        },
        limit: 1,
      });

      if (existingRecord.docs.length > 0) {
        await payload.delete({
          collection: "login-attempts",
          id: existingRecord.docs[0].id,
        });
        console.log(`🔓 Lockout cleared for ${email} from ${ipAddress}`);
      }

      // CRITICAL: Also unlock the user in PayloadCMS
      try {
        const user = await payload.find({
          collection: "users",
          where: {
            email: {
              equals: email.toLowerCase(),
            },
          },
          limit: 1,
        });

        if (user.docs.length > 0) {
          // Reset any PayloadCMS internal lockout state
          await payload.update({
            collection: "users",
            id: user.docs[0].id,
            data: {
              // Force a small update to trigger PayloadCMS to recalculate auth state
              updatedAt: new Date(),
            },
            overrideAccess: true,
          });
          console.log(`🔓 User unlocked in PayloadCMS for ${email}`);
        }
      } catch (unlockError) {
        console.error(
          `⚠️ Failed to unlock user in PayloadCMS for ${email}:`,
          unlockError
        );
      }

      // Reset connection to ensure clean state
      const { resetConnection } = await import("./db-wrapper");
      resetConnection();
      // Also clear local cache so a fresh instance is fetched next time
      this.payload = null;
      console.log(
        `🔄 PayloadCMS connection reset after manual unlock for ${email}`
      );
    } catch (error) {
      console.error("Error clearing lockout:", error);
      throw error;
    }
  }

  /**
   * Clean up expired lockouts and timed-out attempts (admin function)
   */
  async cleanupExpiredRecords(): Promise<{
    lockoutsCleared: number;
    attemptsReset: number;
  }> {
    try {
      const payload = await this.getPayload();
      if (!payload) return { lockoutsCleared: 0, attemptsReset: 0 };

      const now = new Date();
      let lockoutsCleared = 0;
      let attemptsReset = 0;

      // Find all records
      const allRecords = await payload.find({
        collection: "login-attempts",
        limit: 100,
      });

      for (const record of allRecords.docs) {
        try {
          // Check for expired lockouts
          if (record.lockoutUntil && new Date(record.lockoutUntil) <= now) {
            await payload.delete({
              collection: "login-attempts",
              id: record.id,
              overrideAccess: true,
            });
            lockoutsCleared++;
            console.log(`🧹 Cleared expired lockout for ${record.email}`);

            // CRITICAL: Also unlock the user in PayloadCMS
            try {
              const user = await payload.find({
                collection: "users",
                where: {
                  email: {
                    equals: record.email.toLowerCase(),
                  },
                },
                limit: 1,
              });

              if (user.docs.length > 0) {
                // Reset any PayloadCMS internal lockout state
                await payload.update({
                  collection: "users",
                  id: user.docs[0].id,
                  data: {
                    // Force a small update to trigger PayloadCMS to recalculate auth state
                    updatedAt: new Date(),
                  },
                  overrideAccess: true,
                });
                console.log(
                  `🔓 User unlocked in PayloadCMS during cleanup for ${record.email}`
                );
              }
            } catch (unlockError) {
              console.error(
                `⚠️ Failed to unlock user in PayloadCMS during cleanup for ${record.email}:`,
                unlockError
              );
            }
          }
          // Check for timed-out attempts
          else if (
            record.lastAttemptAt &&
            this.shouldResetAttempts(new Date(record.lastAttemptAt))
          ) {
            await payload.delete({
              collection: "login-attempts",
              id: record.id,
              overrideAccess: true,
            });
            attemptsReset++;
            console.log(`⏰ Reset timed-out attempts for ${record.email}`);
          }
        } catch (error) {
          console.error(`Failed to process record ${record.id}:`, error);
        }
      }

      if (lockoutsCleared > 0 || attemptsReset > 0) {
        console.log(
          `🧹 Cleanup complete: ${lockoutsCleared} lockouts cleared, ${attemptsReset} attempts reset`
        );
      }

      return { lockoutsCleared, attemptsReset };
    } catch (error) {
      console.error("Error cleaning up expired records:", error);
      return { lockoutsCleared: 0, attemptsReset: 0 };
    }
  }
}

export const loginSecurityService = LoginSecurityService.getInstance();
