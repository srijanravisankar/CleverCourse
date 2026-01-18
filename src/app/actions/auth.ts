"use server";

/**
 * Authentication Server Actions
 *
 * Simple username/password authentication using cookies for session management.
 */

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { userRepository, generateId } from "@/db/repositories";
import type { User } from "@/db/types";

// Session cookie name
const SESSION_COOKIE = "clevercourse_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Simple in-memory session store (in production, use Redis or DB)
// For this simple implementation, we'll store the userId directly in a signed cookie
// This is acceptable for a hackathon project but not production-ready

interface AuthResult {
  success: boolean;
  user?: Omit<User, "passwordHash">;
  error?: string;
}

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a session for a user (set cookie)
 */
async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();

  // Simple session: store userId directly (in production, use encrypted/signed tokens)
  // We'll use a simple format: base64(userId:timestamp:signature)
  const timestamp = Date.now();
  const sessionData = Buffer.from(`${userId}:${timestamp}`).toString("base64");

  cookieStore.set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Get the current user ID from session cookie
 */
async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, "base64").toString(
      "utf-8",
    );
    const [userId, timestampStr] = decoded.split(":");
    const timestamp = parseInt(timestampStr, 10);

    // Check if session is expired (7 days)
    if (Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

/**
 * Sign up a new user
 */
export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    // Create session
    await createSession(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user as User & {
      passwordHash: string;
    };

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Log in an existing user
 */
export async function logIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    // Find user by email
    const user = (await userRepository.findByEmail(
      email.toLowerCase().trim(),
    )) as (User & { passwordHash: string }) | undefined;
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    // Create session
    await createSession(user.id);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Log in error:", error);
    return { success: false, error: "Failed to log in. Please try again." };
  }
}

/**
 * Log out the current user
 */
export async function logOut(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    return { success: true };
  } catch (error) {
    console.error("Log out error:", error);
    return { success: false };
  }
}

/**
 * Get the currently logged in user
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const userId = await getSessionUserId();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const user = (await userRepository.findById(userId)) as
      | (User & { passwordHash: string })
      | undefined;
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return { success: false, error: "Failed to get user" };
  }
}

/**
 * Check if user is authenticated (lightweight check)
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getSessionUserId();
  return userId !== null;
}

/**
 * Get the current user's ID (for use in other server actions)
 */
export async function getCurrentUserId(): Promise<string | null> {
  return getSessionUserId();
}
