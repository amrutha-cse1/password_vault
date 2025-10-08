'use client';

import { useState, useEffect } from 'react';
import { VaultItem, VaultItemForm } from '@/types';
import AuthForm from '@/components/AuthForm';
import VaultList from '@/components/VaultList';
import VaultItemFormComponent from '@/components/VaultItemForm';
import { LogOut, User } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | undefined>();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVaultItems();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token === 'null' || token.length < 50) {
        console.log('No valid token found');
        localStorage.removeItem('auth_token');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserEmail(data.email);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      console.log('=== STARTING SIMPLE AUTH ===');
      console.log('Email:', data.email);
      
      // Clear any existing tokens first
      localStorage.removeItem('auth_token');
      
      // Try registration first since database is empty
      console.log('Trying registration...');
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (registerResponse.ok) {
        const result = await registerResponse.json();
        console.log('✅ Registration successful:', result);
        
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          console.log('✅ Token stored, length:', result.token.length);
          setIsAuthenticated(true);
          setUserEmail(data.email);
          console.log('✅ AUTH COMPLETE - USER LOGGED IN');
          return;
        }
      } else {
        // Registration failed, try login
        console.log('Registration failed, trying login...');
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (loginResponse.ok) {
          const result = await loginResponse.json();
          console.log('✅ Login successful:', result);
          
          if (result.token) {
            localStorage.setItem('auth_token', result.token);
            console.log('✅ Token stored, length:', result.token.length);
            setIsAuthenticated(true);
            setUserEmail(data.email);
            console.log('✅ AUTH COMPLETE - USER LOGGED IN');
            return;
          }
        }
      }
      
      // If we get here, both failed
      setAuthError('Authentication failed. Please try again.');
    } catch (error) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth_token');
      setIsAuthenticated(false);
      setVaultItems([]);
      setUserEmail('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchVaultItems = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || token.length < 50) {
        console.log('No valid token for fetching items');
        setIsAuthenticated(false);
        return;
      }
      
      const response = await fetch('/api/vault', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const items = await response.json();
        console.log('Fetched items:', items);
        setVaultItems(items);
      } else {
        const errorData = await response.json();
        console.error('Fetch failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to fetch vault items:', error);
    }
  };

  const handleSaveItem = async (formData: VaultItemForm) => {
    setIsLoading(true);
    try {
      console.log('=== SAVE ITEM STARTED ===');
      const token = localStorage.getItem('auth_token');
      console.log('Token for save:', token ? `Found (${token.length} chars)` : 'Not found');
      
      if (!token || token.length < 50) {
        console.error('❌ No valid token for save operation');
        alert('Please login first to save items');
        setIsAuthenticated(false);
        return;
      }
      
      const url = editingItem ? `/api/vault/${editingItem._id}` : '/api/vault';
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        console.log('=== SAVE ITEM COMPLETED ===');
        await fetchVaultItems();
        setShowForm(false);
        setEditingItem(undefined);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', response.status, errorData);
        console.log('=== SAVE ITEM FAILED ===');
        alert(`Failed to save: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Network error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/vault/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchVaultItems();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleEditItem = (item: VaultItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        onSuccess={(email) => {
          console.log('AuthForm success callback called');
          setUserEmail(email);
          setIsAuthenticated(true);
          setAuthError('');
        }}
        onError={(error) => {
          console.log('AuthForm error callback called:', error);
          setAuthError(error);
        }}
        onAuth={handleAuth}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fef7f0',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e0d6d1'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0'
          }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2d1810',
              margin: 0,
              fontFamily: 'Inter, sans-serif'
            }}>
              Password Vault
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#8b7355',
                fontFamily: 'Inter, sans-serif'
              }}>
                <User size={16} />
                <span style={{ fontSize: '0.875rem' }}>{userEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#8b7355',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#2d1810')}
                onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#8b7355')}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <VaultList
          items={vaultItems}
          onAdd={handleAddItem}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isLoading={isLoading}
        />
      </main>

      {showForm && (
        <VaultItemFormComponent
          item={editingItem}
          onSubmit={handleSaveItem}
          onCancel={handleCancelForm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}