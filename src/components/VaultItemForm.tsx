'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { VaultItemForm, VaultItem } from '@/types';
import { X, Eye, EyeOff } from 'lucide-react';
import PasswordGenerator from './PasswordGenerator';

interface VaultItemFormProps {
  item?: VaultItem;
  onSubmit: (data: VaultItemForm) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VaultItemFormComponent({
  item,
  onSubmit,
  onCancel,
  isLoading = false,
}: VaultItemFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VaultItemForm>({
    defaultValues: {
      title: item?.title || '',
      username: item?.username || '',
      password: item?.password || '',
      url: item?.url || '',
      notes: item?.notes || '',
      tags: item?.tags?.join(', ') || '',
    },
  });

  const onFormSubmit = (data: VaultItemForm) => {
    console.log('=== FORM SUBMITTED ===');
    console.log('Form data:', data);
    onSubmit(data);
  };

  const password = watch('password');

  const handlePasswordGenerated = (generatedPassword: string) => {
    setValue('password', generatedPassword);
    setShowGenerator(false);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '32rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #e0d6d1',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: '1px solid #e0d6d1'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#2d1810',
            margin: 0,
            fontFamily: 'Inter, sans-serif'
          }}>
            {item ? 'Edit' : 'Add'} Vault Item
          </h2>
          <button
            onClick={onCancel}
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
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem' 
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s'
              }}
              placeholder="e.g., Gmail Account"
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
            {errors.title && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                fontFamily: 'Inter, sans-serif'
              }}>{errors.title.message}</p>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Username *</label>
            <input
              {...register('username', { required: 'Username is required' })}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s'
              }}
              placeholder="username or email"
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
            {errors.username && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                fontFamily: 'Inter, sans-serif'
              }}>{errors.username.message}</p>
            )}
          </div>

          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#2d1810',
                fontFamily: 'Inter, sans-serif'
              }}>Password *</label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d97548',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#c5633d')}
                onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#d97548')}
              >
                {showGenerator ? 'Hide Generator' : 'Generate Password'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                style={{
                  width: '100%',
                  padding: '0.875rem 3rem 0.875rem 1rem',
                  border: '1px solid #e0d6d1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#ffffff',
                  color: '#2d1810',
                  outline: 'none',
                  fontFamily: 'monospace',
                  transition: 'border-color 0.2s'
                }}
                placeholder="password"
                onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
                onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8b7355',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => ((e.target as HTMLElement).style.color = '#2d1810')}
                onMouseOut={(e) => ((e.target as HTMLElement).style.color = '#8b7355')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginTop: '0.25rem',
                fontFamily: 'Inter, sans-serif'
              }}>{errors.password.message}</p>
            )}
          </div>

          {showGenerator && (
            <div style={{
              border: '1px solid #e0d6d1',
              borderRadius: '0.5rem',
              padding: '1rem',
              backgroundColor: '#fef7f0'
            }}>
              <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>URL</label>
            <input
              {...register('url')}
              type="url"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s'
              }}
              placeholder="https://example.com"
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Tags</label>
            <input
              {...register('tags')}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s'
              }}
              placeholder="work, personal, social (comma separated)"
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '1px solid #e0d6d1',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: '#ffffff',
                color: '#2d1810',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              placeholder="Additional notes..."
              onFocus={(e) => ((e.target as HTMLElement).style.borderColor = '#d97548')}
              onBlur={(e) => ((e.target as HTMLElement).style.borderColor = '#e0d6d1')}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '1rem'
          }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: isLoading ? '#d9bba8' : '#d97548',
                color: 'white',
                padding: '0.875rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.backgroundColor = '#c5633d';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.backgroundColor = '#d97548';
                }
              }}
            >
              {isLoading ? 'Saving...' : (item ? 'Update' : 'Save')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#8b7355',
                color: 'white',
                padding: '0.875rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = '#6d5a45')}
              onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = '#8b7355')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}