'use client';

import { useState } from 'react';
import { VaultItem } from '@/types';
import { Search, Plus, Edit, Trash2, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface VaultListProps {
  items: VaultItem[];
  onAdd: () => void;
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function VaultList({
  items,
  onAdd,
  onEdit,
  onDelete,
  isLoading = false,
}: VaultListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const allTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  ).sort();

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.url && item.url.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || (item.tags && item.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const togglePasswordVisibility = (itemId: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(itemId)) {
      newVisible.delete(itemId);
    } else {
      newVisible.add(itemId);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    await navigator.clipboard.writeText(text);
    const newCopied = new Set(copiedItems);
    newCopied.add(itemId);
    setCopiedItems(newCopied);
    
    // Auto-clear after 15 seconds
    setTimeout(() => {
      setCopiedItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }, 15000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading vault items...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f6f3', 
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        width: '100%',
        margin: '0 auto' 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#2d1810',
            margin: 0,
            fontFamily: 'Inter, sans-serif'
          }}>
            Password Vault
          </h1>
          <button
            onClick={onAdd}
            style={{
              backgroundColor: '#d97548',
              color: 'white',
              padding: '0.875rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = '#c5633d')}
            onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = '#d97548')}
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            position: 'relative', 
            flex: 1 
          }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#9ca3af' 
              }} 
            />
            <input
              type="text"
              placeholder="Search vault items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 3rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
          </div>
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '150px'
              }}
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>

        {/* Content Area */}
        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e0d6d1',
            marginTop: '2rem',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              color: '#8b7355',
              marginBottom: '1rem',
              fontSize: '1.125rem'
            }}>
              {items.length === 0 
                ? 'No vault items yet. Add your first password!' 
                : 'No items match your search criteria.'}
            </div>
            {items.length === 0 && (
              <button
                onClick={onAdd}
                style={{
                  backgroundColor: '#d97548',
                  color: 'white',
                  padding: '0.875rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = '#c5633d')}
                onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = '#d97548')}
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '1rem' 
          }}>
            {filteredItems.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0d6d1',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  (e.target as HTMLElement).style.borderColor = '#d97548';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.boxShadow = 'none';
                  (e.target as HTMLElement).style.borderColor = '#e0d6d1';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#2d1810',
                      margin: '0 0 0.25rem 0',
                      fontFamily: 'Inter, sans-serif'
                    }}>{item.title}</h3>
                    <p style={{
                      color: '#8b7355',
                      fontSize: '0.875rem',
                      margin: '0',
                      fontFamily: 'Inter, sans-serif'
                    }}>{item.username}</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#d97548',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          marginTop: '0.25rem',
                          transition: 'color 0.2s'
                        }}
                        onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#c5633d')}
                        onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#d97548')}
                      >
                        <ExternalLink size={12} />
                        <span>{item.url}</span>
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onEdit(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8b7355',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#f3f1ee';
                        (e.target as HTMLElement).style.color = '#2d1810';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.color = '#8b7355';
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item._id!)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8b7355',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#fef2f2';
                        (e.target as HTMLElement).style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.color = '#8b7355';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    backgroundColor: '#f8f6f3',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e0d6d1',
                    color: '#2d1810'
                  }}>
                    {visiblePasswords.has(item._id!) 
                      ? item.password 
                      : '•'.repeat(item.password.length)}
                  </div>
                  <button
                    onClick={() => togglePasswordVisibility(item._id!)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8b7355',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#f3f1ee';
                      (e.target as HTMLElement).style.color = '#2d1810';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLElement).style.color = '#8b7355';
                    }}
                  >
                    {visiblePasswords.has(item._id!) 
                      ? <EyeOff size={16} /> 
                      : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.password, item._id!)}
                    style={{
                      background: copiedItems.has(item._id!) ? '#dcfce7' : 'none',
                      border: 'none',
                      color: copiedItems.has(item._id!) ? '#16a34a' : '#8b7355',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!copiedItems.has(item._id!)) {
                        (e.target as HTMLElement).style.backgroundColor = '#f3f1ee';
                        (e.target as HTMLElement).style.color = '#2d1810';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!copiedItems.has(item._id!)) {
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLElement).style.color = '#8b7355';
                      }
                    }}
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {item.notes && (
                  <p style={{
                    color: '#8b7355',
                    fontSize: '0.875rem',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Inter, sans-serif'
                  }}>{item.notes}</p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: '#fef3f0',
                          color: '#d97548',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #f4d2c7',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: '500'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {copiedItems.has(item._id!) && (
                  <p style={{
                    color: '#16a34a',
                    fontSize: '0.75rem',
                    margin: '0.5rem 0 0 0',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Password copied! Will clear in 15 seconds.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}