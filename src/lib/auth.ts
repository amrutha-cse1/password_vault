import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No', 'Length:', JWT_SECRET?.length);

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    console.log('Verifying token with secret length:', JWT_SECRET.length);
    const result = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log('Token verification successful:', result);
    return result;
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
}