'use client';

import { useState } from 'react';
import { generatePassword, calculatePasswordStrength, PasswordOptions } from '@/lib/passwordGenerator';
import { Copy, RefreshCw } from 'lucide-react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    onPasswordGenerated?.(newPassword);
  };

  const handleCopy = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 15000); // Auto-clear after 15 seconds
    }
  };

  const strength = password ? calculatePasswordStrength(password) : null;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e0d6d1',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#2d1810',
        marginBottom: '1rem',
        fontFamily: 'Inter, sans-serif'
      }}>Password Generator</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#2d1810',
            fontFamily: 'Inter, sans-serif'
          }}>
            Length: {options.length}
          </label>
          <input
            type="range"
            min="4"
            max="50"
            value={options.length}
            onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
            style={{
              width: '100%',
              height: '0.5rem',
              borderRadius: '0.25rem',
              background: '#e0d6d1',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
              style={{
                width: '1rem',
                height: '1rem',
                accentColor: '#d97548',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Uppercase (A-Z)</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
              style={{
                width: '1rem',
                height: '1rem',
                accentColor: '#d97548',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Lowercase (a-z)</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
              style={{
                width: '1rem',
                height: '1rem',
                accentColor: '#d97548',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Numbers (0-9)</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
              style={{
                width: '1rem',
                height: '1rem',
                accentColor: '#d97548',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: '0.875rem',
              color: '#2d1810',
              fontFamily: 'Inter, sans-serif'
            }}>Symbols (!@#$)</span>
          </label>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={options.excludeSimilar}
            onChange={(e) => setOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
            style={{
              width: '1rem',
              height: '1rem',
              accentColor: '#d97548',
              cursor: 'pointer'
            }}
          />
          <span style={{
            fontSize: '0.875rem',
            color: '#2d1810',
            fontFamily: 'Inter, sans-serif'
          }}>Exclude similar characters (il1Lo0O)</span>
        </label>

        <button
          onClick={handleGenerate}
          style={{
            width: '100%',
            backgroundColor: '#d97548',
            color: 'white',
            padding: '0.875rem 1rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = '#c5633d')}
          onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = '#d97548')}
        >
          <RefreshCw size={16} />
          <span>Generate Password</span>
        </button>

        {password && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={password}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #e0d6d1',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f8f6f3',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: '#2d1810',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: copied ? '#16a34a' : '#8b7355',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!copied) {
                    (e.target as HTMLElement).style.backgroundColor = '#6d5a45';
                  }
                }}
                onMouseOut={(e) => {
                  if (!copied) {
                    (e.target as HTMLElement).style.backgroundColor = '#8b7355';
                  }
                }}
              >
                <Copy size={16} />
              </button>
            </div>
            {strength && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#2d1810',
                  fontFamily: 'Inter, sans-serif'
                }}>Strength:</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: strength.color === 'red' ? '#ef4444' : 
                         strength.color === 'yellow' ? '#f59e0b' : 
                         strength.color === 'green' ? '#10b981' : '#d97548',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {strength.label}
                </span>
                <div style={{
                  flex: 1,
                  backgroundColor: '#e0d6d1',
                  borderRadius: '9999px',
                  height: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div
                    style={{
                      backgroundColor: strength.color === 'red' ? '#ef4444' : 
                                     strength.color === 'yellow' ? '#f59e0b' : 
                                     strength.color === 'green' ? '#10b981' : '#d97548',
                      height: '100%',
                      borderRadius: '9999px',
                      width: `${(strength.score / 6) * 100}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </div>
              </div>
            )}
            {copied && (
              <p style={{
                fontSize: '0.875rem',
                color: '#16a34a',
                fontFamily: 'Inter, sans-serif',
                margin: 0
              }}>Password copied! Will clear in 15 seconds.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}