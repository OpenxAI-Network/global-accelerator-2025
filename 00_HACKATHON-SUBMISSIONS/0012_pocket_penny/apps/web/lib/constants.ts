/**
 * Application configuration constants
 *
 * This file contains all application-wide constants used across the monorepo.
 * These constants should be imported and used instead of hardcoded strings
 * to ensure consistency and maintainability.
 */

// =============================================================================
// APPLICATION METADATA
// =============================================================================

/**
 * Core application identifiers and branding
 */
export const APP_CONFIG = {
  /** Main application name used across the monorepo */
  SITE_NAME: "MyMonorepoApp",
  /** Admin dashboard title displayed in the UI */
  DASHBOARD_TITLE: "Admin Dashboard",
  /** Application version - should be synced with package.json */
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  /** Storage key prefix - derived from app name or environment variable */
  STORAGE_PREFIX: process.env.NEXT_PUBLIC_STORAGE_PREFIX || "mymonorepoapp", // fallback derived from SITE_NAME
} as const;

// =============================================================================
// STORAGE KEY GENERATORS
// =============================================================================

/**
 * Generate a prefixed storage key
 * @param key - The base key name
 * @returns Prefixed storage key
 */
const createStorageKey = (key: string): string => `${APP_CONFIG.STORAGE_PREFIX}-${key}`;

/**
 * Create multiple storage keys with consistent prefixing
 * @param keys - Object with key names as values
 * @returns Object with prefixed keys
 */
const createStorageKeys = <T extends Record<string, string>>(keys: T): T => {
  return Object.entries(keys).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: createStorageKey(value),
    }),
    {} as T
  );
};

// =============================================================================
// STORAGE KEYS
// =============================================================================

/**
 * Base cookie key names (without prefix)
 */
const COOKIE_KEY_NAMES = {
  /** JWT authorization token */
  AUTHORIZATION: "authorization",
  /** Refresh token for token renewal */
  REFRESH_TOKEN: "refresh-token",
  /** User identifier */
  USER_ID: "user-id",
  /** User preferences (theme, language, etc.) */
  USER_PREFERENCES: "user-preferences",
} as const;

/**
 * Base session storage key names (without prefix)
 */
const SESSION_STORAGE_KEY_NAMES = {
  /** Current authentication action being performed */
  AUTH_ACTION: "auth-action",
  /** Temporary form data */
  FORM_DATA: "form-data",
  /** Navigation state */
  NAVIGATION_STATE: "navigation-state",
} as const;

/**
 * Base local storage key names (without prefix)
 */
const LOCAL_STORAGE_KEY_NAMES = {
  /** User theme preference */
  THEME: "theme",
  /** User language preference */
  LANGUAGE: "language",
  /** Recently accessed items */
  RECENT_ITEMS: "recent-items",
} as const;

/**
 * Cookie names used for client-side storage
 *
 * All cookie keys are automatically prefixed to avoid conflicts with other applications
 */
export const COOKIE_KEYS = createStorageKeys(COOKIE_KEY_NAMES);

/**
 * Session storage keys used for temporary client-side data
 *
 * Session storage is cleared when the browser tab is closed
 */
export const SESSION_STORAGE_KEYS = createStorageKeys(SESSION_STORAGE_KEY_NAMES);

/**
 * Local storage keys used for persistent client-side data
 *
 * Local storage persists until explicitly cleared
 */
export const LOCAL_STORAGE_KEYS = createStorageKeys(LOCAL_STORAGE_KEY_NAMES);

// =============================================================================
// STORAGE CONFIGURATION
// =============================================================================

/**
 * Storage configuration options
 */
export const STORAGE_CONFIG = {
  /** Cookie expiration times in milliseconds */
  COOKIE_EXPIRY: {
    /** Authorization token expires in 1 hour */
    AUTH_TOKEN: 60 * 60 * 1000,
    /** Refresh token expires in 7 days */
    REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,
    /** User preferences expire in 1 year */
    USER_PREFERENCES: 365 * 24 * 60 * 60 * 1000,
  },
  /** Cookie security options */
  COOKIE_OPTIONS: {
    /** Use secure cookies in production */
    secure: process.env.NODE_ENV === "production",
    /** Prevent XSS attacks */
    httpOnly: false, // Set to true for sensitive cookies
    /** SameSite policy */
    sameSite: "strict" as const,
  },
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Type-safe cookie key union
 */
export type CookieKey = keyof typeof COOKIE_KEYS;

/**
 * Type-safe session storage key union
 */
export type SessionStorageKey = keyof typeof SESSION_STORAGE_KEYS;

/**
 * Type-safe local storage key union
 */
export type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS;

/**
 * All possible storage keys
 */
export type StorageKey = CookieKey | SessionStorageKey | LocalStorageKey;

/**
 * Cookie value type for type safety
 */
export type CookieValue = string | number | boolean;

/**
 * Storage item interface for structured data
 */
export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the actual storage key string from a key constant
 *
 * @param keyType - The storage type ('cookie' | 'session' | 'local')
 * @param key - The key from the respective constants object
 * @returns The actual string value to use as storage key
 */
export function getStorageKey(keyType: "cookie", key: CookieKey): string;
export function getStorageKey(keyType: "session", key: SessionStorageKey): string;
export function getStorageKey(keyType: "local", key: LocalStorageKey): string;
export function getStorageKey(keyType: "cookie" | "session" | "local", key: StorageKey): string {
  switch (keyType) {
    case "cookie":
      return COOKIE_KEYS[key as CookieKey];
    case "session":
      return SESSION_STORAGE_KEYS[key as SessionStorageKey];
    case "local":
      return LOCAL_STORAGE_KEYS[key as LocalStorageKey];
    default:
      throw new Error(`Invalid storage type: ${keyType}`);
  }
}

/**
 * Validate if a string is a valid storage key
 *
 * @param keyType - The storage type to validate against
 * @param key - The key string to validate
 * @returns True if the key is valid for the given storage type
 */
export function isValidStorageKey(keyType: "cookie" | "session" | "local", key: string): boolean {
  const storageKeys = {
    cookie: Object.values(COOKIE_KEYS) as readonly string[],
    session: Object.values(SESSION_STORAGE_KEYS) as readonly string[],
    local: Object.values(LOCAL_STORAGE_KEYS) as readonly string[],
  } as const;

  const keys = storageKeys[keyType];
  return keys?.includes(key) ?? false;
}

// =============================================================================
// ENVIRONMENT-SPECIFIC EXPORTS
// =============================================================================

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;
