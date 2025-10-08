import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    return NextResponse.json({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
      allCookies: Array.from(request.cookies.getAll()).map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Debug error', details: String(error) });
  }
}