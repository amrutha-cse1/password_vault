export interface User {
  _id?: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface VaultItem {
  _id?: string;
  userId: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultItemForm {
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  tags?: string;
}