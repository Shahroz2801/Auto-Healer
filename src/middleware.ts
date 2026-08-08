import { clerkMiddleware } from "@clerk/nextjs/server";

// Auth checks live in each protected layout/route (resource-based checks —
// see src/app/(dashboard)/layout.tsx) rather than here. Clerk's own guidance
// is that middleware path-matching can diverge from how Next.js actually
// routes requests, so `createRouteMatcher` + `auth.protect()` here is
// deprecated in favor of checking auth where the data is actually read.
// This middleware's job is just to make the Clerk session available to
// `auth()`/`currentUser()` in Server Components and Route Handlers.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
