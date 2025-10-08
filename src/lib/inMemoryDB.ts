import { User, VaultItem } from '@/types';

// In-memory database as fallback
class InMemoryDB {
  private users: Map<string, User> = new Map();
  private vaultItems: Map<string, VaultItem[]> = new Map();
  private userIdCounter = 1;
  private itemIdCounter = 1;

  // User operations
  async findUser(email: string): Promise<User | null> {
    const user = this.users.get(email) || null;
    console.log(`[InMemoryDB] Looking for user: ${email}, found: ${!!user}`);
    console.log(`[InMemoryDB] Total users in database: ${this.users.size}`);
    if (this.users.size > 0) {
      console.log(`[InMemoryDB] All users: ${Array.from(this.users.keys())}`);
    }
    return user;
  }

  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    const user: User = {
      ...userData,
      _id: (this.userIdCounter++).toString(),
    };
    this.users.set(userData.email, user);
    console.log(`[InMemoryDB] User created: ${user.email} (ID: ${user._id})`);
    console.log(`[InMemoryDB] Total users now: ${this.users.size}`);
    return user;
  }

  // Vault operations
  async getVaultItems(userId: string): Promise<VaultItem[]> {
    return this.vaultItems.get(userId) || [];
  }

  async createVaultItem(userId: string, itemData: Omit<VaultItem, '_id' | 'userId'>): Promise<VaultItem> {
    const item: VaultItem = {
      ...itemData,
      _id: (this.itemIdCounter++).toString(),
      userId,
    };

    const userItems = this.vaultItems.get(userId) || [];
    userItems.push(item);
    this.vaultItems.set(userId, userItems);
    
    return item;
  }

  async updateVaultItem(userId: string, itemId: string, updateData: Partial<VaultItem>): Promise<VaultItem | null> {
    const userItems = this.vaultItems.get(userId) || [];
    const itemIndex = userItems.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) return null;
    
    userItems[itemIndex] = { ...userItems[itemIndex], ...updateData, updatedAt: new Date() };
    this.vaultItems.set(userId, userItems);
    
    return userItems[itemIndex];
  }

  async deleteVaultItem(userId: string, itemId: string): Promise<boolean> {
    const userItems = this.vaultItems.get(userId) || [];
    const itemIndex = userItems.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) return false;
    
    userItems.splice(itemIndex, 1);
    this.vaultItems.set(userId, userItems);
    
    return true;
  }

  async findVaultItem(userId: string, itemId: string): Promise<VaultItem | null> {
    const userItems = this.vaultItems.get(userId) || [];
    return userItems.find(item => item._id === itemId) || null;
  }
}

// Ensure we have a global singleton in development
let globalWithInMemoryDB = global as typeof globalThis & {
  inMemoryDB?: InMemoryDB;
};

if (!globalWithInMemoryDB.inMemoryDB) {
  globalWithInMemoryDB.inMemoryDB = new InMemoryDB();
}

export const inMemoryDB = globalWithInMemoryDB.inMemoryDB;