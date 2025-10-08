import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const email = 'amruthabalusu03@gmail.com';
    const password = '123456789';
    
    console.log('Creating test user:', email);
    
    const { isInMemory, db } = await getDatabase();
    const hashedPassword = await hashPassword(password);
    
    const newUserData = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    let user: any;
    if (isInMemory) {
      user = await (db as any).createUser(newUserData);
    } else {
      const users = (db as any).collection('users');
      const result = await users.insertOne(newUserData);
      user = { ...newUserData, _id: result.insertedId };
    }

    const token = generateToken(user._id.toString());
    
    console.log('Test user created successfully:', user._id);
    
    return NextResponse.json({
      message: 'Test user created',
      email,
      password,
      userId: user._id,
      token
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { error: 'Failed to create test user' },
      { status: 500 }
    );
  }
}