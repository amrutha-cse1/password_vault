import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';
import { VaultItem } from '@/types';

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  console.log('Getting authenticated user ID...');
  
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  let token: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
    console.log('Token from Authorization header:', !!token);
  } else {
    // Fallback to cookie
    console.log('All cookies:', Array.from(request.cookies.getAll()).map(c => c.name));
    token = request.cookies.get('token')?.value || null;
    console.log('Token from cookie:', !!token);
  }
  
  console.log('Token length:', token?.length || 0);
  if (!token) {
    console.log('No token found in headers or cookies');
    return null;
  }
  
  const payload = verifyToken(token);
  console.log('Token payload:', payload);
  return payload?.userId || null;
}

// GET - Retrieve all vault items for user
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isInMemory, db } = await getDatabase();
    let items: any[] = [];

    if (isInMemory) {
      items = await (db as any).getVaultItems(userId);
    } else {
      const vaultItems = (db as any).collection('vault_items');
      items = await vaultItems
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();
    }

    // Decrypt sensitive fields
    const decryptedItems = items.map((item: any) => ({
      ...item,
      username: decrypt(item.username),
      password: decrypt(item.password),
      url: item.url ? decrypt(item.url) : '',
      notes: item.notes ? decrypt(item.notes) : '',
    }));

    return NextResponse.json(decryptedItems);
  } catch (error) {
    console.error('GET vault items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new vault item
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/vault - Creating new vault item');
    const userId = await getAuthenticatedUserId(request);
    console.log('User ID:', userId);
    if (!userId) {
      console.log('No user ID found - returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, username, password, url, notes, tags } = await request.json();

    if (!title || !username || !password) {
      return NextResponse.json(
        { error: 'Title, username, and password are required' },
        { status: 400 }
      );
    }

    const { isInMemory, db } = await getDatabase();

    const newItemData = {
      title,
      username: encrypt(username),
      password: encrypt(password),
      url: url ? encrypt(url) : undefined,
      notes: notes ? encrypt(notes) : undefined,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let result: any;
    if (isInMemory) {
      result = await (db as any).createVaultItem(userId, newItemData);
    } else {
      const vaultItems = (db as any).collection('vault_items');
      const insertResult = await vaultItems.insertOne({
        userId,
        ...newItemData,
      });
      result = { _id: insertResult.insertedId };
    }

    return NextResponse.json(
      { message: 'Vault item created', id: result._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}