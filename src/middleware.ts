import { type NextRequest, NextResponse } from "next/server";

import { uncachedValidateRequest } from "./server/auth";

const protectedRoutes = ["/dashboard"];
const signInUrl = "https://targon.com";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const { session } = await uncachedValidateRequest();

  if (!session) {
    const redirectUrl = new URL("/sign-in", signInUrl);
    redirectUrl.searchParams.set("source", "stats");
    redirectUrl.searchParams.set("redirect", req.nextUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
