import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Refreshes the Supabase auth session on every request. Renamed from
// "middleware" to "proxy" per the Next.js 16 file convention.
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
