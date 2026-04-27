import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET!

// ✅ Sign token
export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// ✅ Verify token
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}

// ✅ Extract token from cookie
function getTokenFromCookie(request: Request) {
  const cookie = request.headers.get('cookie')

  if (!cookie) return null

  return cookie
    .split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1] || null
}

// ✅ MAIN: Get current logged-in user
export async function getCurrentUser(request: Request) {
  try {
    const token = getTokenFromCookie(request)

    if (!token) return null

    const decoded: any = verifyToken(token)

    if (!decoded?.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    return user
  } catch (err) {
    return null
  }
}