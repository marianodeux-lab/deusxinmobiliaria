import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 0. Archivos estáticos de PWA y recursos públicos esenciales (nunca interceptar ni redirigir a login)
  if (
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/Recursos") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Rutas públicas que no requieren inicio de sesión
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/landing") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/registro") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js";

  // 1. Si no está autenticado y quiere ingresar a una ruta privada -> Redirigir a /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Si ya está autenticado y quiere ir a /login o /registro -> Redirigir a /contratos
  if (user && (pathname === "/login" || pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/contratos";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|sw.js|Recursos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ico|json|webmanifest)$).*)",
  ],
};
