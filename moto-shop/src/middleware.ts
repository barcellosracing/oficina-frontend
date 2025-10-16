import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register") || request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isAuthRoute && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/auth/:path*"],
};
