# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-18

This is the initial major release, featuring a complete UI and backend overhaul.

### Added

- **New Modern UI/UX:** Completely redesigned the entire frontend with a modern, professional, and visually appealing design system.
- **New Color Palette:** Introduced a new color scheme with `violet` as the primary color and `slate` for neutrals.
- **Standalone Header Component:** Created a reusable `Header.tsx` component with a user menu dropdown.
- **Skeleton Loading States:** Implemented skeleton loaders for the marketplace grid to improve the perceived loading performance.
- **Component Documentation:** Added JSDoc comments to `Header`, `ListingCard`, and `ListingCardSkeleton` to improve developer experience.
- **BFF (Backend for Frontend) API Routes:** Created API routes in the Next.js app for all auth operations (`login`, `signup`, `me`, `forgot-password`, `reset-password`) to improve security and separate concerns.
- **`prefers-reduced-motion`:** Added global styles to respect user's motion reduction preferences for better accessibility.
- **Changelog:** Added this `CHANGELOG.md` file to track changes.

### Changed

- **Refactored `auth-service`:**
    - Separated database logic, email sending, and routing into dedicated modules.
    - Improved error handling for the signup endpoint to provide clear feedback for existing emails.
    - Enabled CORS to allow requests from the frontend.
- **Refactored `auth-context.tsx`:**
    - Updated the context to use the new BFF API routes instead of calling the `auth-service` directly.
    - Improved security by removing the `refreshToken` from `localStorage`. The BFF now handles it in a secure `HttpOnly` cookie.
- **Refactored `marketplace.tsx`:**
    - Replaced the inline header with the new `Header` component.
    - Updated all styling to use the new design system.
    - Redesigned the search and filter controls.
- **Consolidated Typography:** Removed the `Inter` font and now exclusively use `GeistSans` across the application.

### Fixed

- **CORS Errors:** Fixed `TypeError: Failed to fetch` errors on login/signup by enabling CORS on the `auth-service`.
- **Build Errors:**
    - Resolved `Module not found: Can't resolve 'cookie'` by adding the dependency to the `nextjs-app`.
    - Resolved `Module not found: Can't resolve 'react-server-dom-webpack/server'` by reinstalling dependencies.
- **Next.js Warnings:**
    - Silenced the "multiple lockfiles" warning by setting `outputFileTracingRoot`.
    - Fixed the `experimental.outputFileTracingRoot` warning by moving the configuration to the top level.
- **Signup Logic:** Fixed the bug where signing up with an existing email gave a generic error.
- **`ECONNREFUSED` Error:** Resolved the connection error by starting the `auth-service` background process.

### Removed

- **Old Mock API Files:** Deleted `forgot-password.ts` and `reset-password.ts` from the `components` directory.
- **Old Component Styles:** Removed outdated and unused utility classes from `globals.css`.
