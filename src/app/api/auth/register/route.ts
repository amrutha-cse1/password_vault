import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Registration attempt for email:', email);

    if (!email || !password) {
      console.log('Missing email or password in registration');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const { isInMemory, db } = await getDatabase();

    // Check if user already exists
    let existingUser: User | null = null;
    
    if (isInMemory) {
      existingUser = await (db as any).findUser(email);
    } else {
      const users = (db as any).collection('users');
      existingUser = await users.findOne({ email });
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUserData: Omit<User, '_id'> = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    let user: User;
    if (isInMemory) {
      user = await (db as any).createUser(newUserData);
    } else {
      const users = (db as any).collection('users');
      const result = await users.insertOne(newUserData);
      user = { ...newUserData, _id: result.insertedId };
    }

    // Generate token for the new user
    const token = generateToken(user._id!.toString());
    console.log('Generated token for new user:', user._id, 'Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    // Return token in response body for frontend to store
    const response = NextResponse.json(
      { message: 'Registration successful', userId: user._id, token: token },
      { status: 201 }
    );

    // Also set cookie as fallback
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}