import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { isInMemory, db } = await getDatabase();

    // Debug: List all users in in-memory database
    if (isInMemory) {
      console.log('All users in in-memory database:', (db as any).users ? Array.from((db as any).users.keys()) : 'No users');
    }

    // Find user
    let user: User | null = null;
    
    if (isInMemory) {
      user = await (db as any).findUser(email);
    } else {
      const users = (db as any).collection('users');
      user = await users.findOne({ email });
    }

    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    console.log('Password validation result:', isValid);
    if (!isValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user._id!.toString());
    console.log('Generated token for user:', user._id, 'Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    // Return token in response body for frontend to store
    const response = NextResponse.json(
      { message: 'Login successful', userId: user._id, token: token },
      { status: 200 }
    );
    
    // Also set HTTP-only cookie as backup
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    console.log('Token generated and sent:', token.substring(0, 20) + '...');

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}