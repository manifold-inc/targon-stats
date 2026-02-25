import { type NextRequest, NextResponse } from "next/server";

import { uncachedValidateRequest } from "./server/auth";

const protectedRoutes = ["/dashboard"];

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
    const redirectUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
