import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/encryption';

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  return payload?.userId || null;
}

// PUT - Update vault item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, username, password, url, notes, tags } = await request.json();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('password-vault');
    const vaultItems = db.collection('vault_items');

    const updateData: any = {
      title,
      username: encrypt(username),
      password: encrypt(password),
      url: url ? encrypt(url) : undefined,
      notes: notes ? encrypt(notes) : undefined,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      updatedAt: new Date(),
    };

    const result = await vaultItems.updateOne(
      { _id: new ObjectId(id), userId: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vault item updated' });
  } catch (error) {
    console.error('PUT vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete vault item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('password-vault');
    const vaultItems = db.collection('vault_items');

    const result = await vaultItems.deleteOne({
      _id: new ObjectId(id),
      userId: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Vault item deleted' });
  } catch (error) {
    console.error('DELETE vault item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}