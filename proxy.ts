import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, SESSION_COOKIE } from "@/lib/erp/constants";

/*
 * Optimistic gate for the ERP: no session cookie, straight to the login page.
 * This saves a render for signed-out visitors but proves nothing; every page,
 * Server Action and Route Handler still verifies the session itself.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname !== LOGIN_PATH && !request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
