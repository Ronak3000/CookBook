import { NextResponse, NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect authenticated users away from auth-related pages
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") 
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }



  // Redirect unauthenticated users away from protected pages
  if (!token && (url.pathname.startsWith("/post-blogs") || url.pathname.startsWith("/get-user-blogs") || url.pathname.startsWith("/edit-blog"))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Allow requests to proceed as normal
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/",
    "/dashboard/:path*",
    "/verify/:path*",
    "/post-blogs/:path*",
    "/get-user-blogs/:path*",
    "/edit-blog/:path*",
    "/suggest"
  ],
};
