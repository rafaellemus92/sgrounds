cat > middleware.ts << 'EOF'
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
EOF

git add middleware.ts
git commit -m "fix middleware matcher pattern"
git push origin main
