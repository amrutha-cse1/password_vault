import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
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

    const { isInMemory, db } = await getDatabase();

    const updateData = {
      title,
      username: encrypt(username),
      password: encrypt(password),
      url: url ? encrypt(url) : undefined,
      notes: notes ? encrypt(notes) : undefined,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      updatedAt: new Date(),
    };

    let success = false;
    if (isInMemory) {
      const result = await (db as any).updateVaultItem(userId, id, updateData);
      success = result !== null;
    } else {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }
      const vaultItems = (db as any).collection('vault_items');
      const result = await vaultItems.updateOne(
        { _id: new ObjectId(id) as any, userId: userId },
        { $set: updateData }
      );
      success = result.matchedCount > 0;
    }

    if (!success) {
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

    const { isInMemory, db } = await getDatabase();

    let success = false;
    if (isInMemory) {
      success = await (db as any).deleteVaultItem(userId, id);
    } else {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }
      const vaultItems = (db as any).collection('vault_items');
      const result = await vaultItems.deleteOne({
        _id: new ObjectId(id) as any,
        userId: userId,
      });
      success = result.deletedCount > 0;
    }

    if (!success) {
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