import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { roleToPath } from '@/lib/role-redirect';

const PROTECTED = ['/crear', '/evento/manage', '/admin'];
const ADMIN_ONLY = ['/admin'];
const ORG_OR_ADMIN = ['/evento/manage'];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const session = await auth.api.getSession({ headers: req.headers });

  if ((pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) && session) {
    const role = (session as any).role;
    const url = req.nextUrl.clone();
    url.pathname = roleToPath(role);
    return NextResponse.redirect(url);
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-in';
      url.searchParams.set(
        'redirect_url',
        pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
      );
      return NextResponse.redirect(url);
    }
    // Roles
    const role = (session as any).role;
    if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = roleToPath(role);
      return NextResponse.redirect(url);
    }
    if (
      ORG_OR_ADMIN.some((p) => pathname.startsWith(p)) &&
      !['ADMIN', 'ORGANIZADOR'].includes(role)
    ) {
      const url = req.nextUrl.clone();
      url.pathname = roleToPath(role);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\.(?:png|jpg|jpeg|gif|svg|css|js|ico|txt|json)).*)'],
};
