import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get('Authorization');
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = request.cookies.get('token')?.value || null;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { isInMemory, db } = await getDatabase();
    
    // Find user by ID to get email
    let user = null;
    if (isInMemory) {
      // For in-memory DB, we need to find user by ID
      // This is a simple implementation - in production you'd optimize this
      const allUsers = Array.from((db as any).users.values());
      user = allUsers.find((u: any) => u._id === payload.userId);
    } else {
      const users = (db as any).collection('users');
      user = await users.findOne({ _id: payload.userId });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { userId: payload.userId, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}