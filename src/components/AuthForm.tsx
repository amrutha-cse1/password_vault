'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';

interface AuthFormData {
  email: string;
  password: string;
}

interface AuthFormProps {
  onSuccess: (email: string) => void;
  onError: (error: string) => void;
  onAuth?: (data: { email: string; password: string }) => Promise<void>;
}

export default function AuthForm({ onSuccess, onError, onAuth }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false);
    reset();
  };

  const handleFormSubmit = async (data: AuthFormData) => {
    if (onAuth) {
      // Use the working authentication function from parent
      console.log('Using parent auth function');
      setIsLoading(true);
      setError('');
      
      try {
        await onAuth(data);
        // If we get here, auth was successful
        onSuccess(data.email);
        reset();
      } catch (error) {
        console.error('Auth failed:', error);
        setError('Authentication failed');
        onError('Authentication failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback to original auth logic
      setIsLoading(true);
      setError('');

      try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          onSuccess(data.email);
          reset();
        } else {
          setError(result.error || 'An error occurred');
          onError(result.error || 'An error occurred');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError('Network error. Please try again.');
        onError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f8f6f3' }}>
      {/* Left Side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        maxWidth: '600px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2d1810',
              marginBottom: '0.5rem',
              fontFamily: 'Inter, sans-serif'
            }}>
              {isLogin ? 'Login' : 'Create Account'}
            </h1>
            <p style={{
              color: '#6b5b5b',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              {isLogin ? 'Welcome back to your secure vault' : 'Join thousands protecting their passwords'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#2d1810',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="Type your email"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
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
              {errors.email && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: '#2d1810',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Type your password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    paddingRight: '3rem',
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
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.password.message}
                </p>
              )}
            </div>
            
            {isLogin && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      marginRight: '0.5rem',
                      accentColor: '#d97548'
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#6b5b5b' }}>Remember me</span>
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d97548',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '0.75rem'
              }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#d97548',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !isLoading && ((e.target as HTMLElement).style.backgroundColor = '#c5633d')}
              onMouseOut={(e) => !isLoading && ((e.target as HTMLElement).style.backgroundColor = '#d97548')}
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log in' : 'Create Account')}
            </button>
            
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Or</span>
            </div>
            
            <button
              type="button"
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.backgroundColor = '#e5e7eb')}
              onMouseOut={(e) => ((e.target as HTMLElement).style.backgroundColor = '#f3f4f6')}
            >
              <Shield size={20} />
              Sign in with Google
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#d97548',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right Side - Image/Background */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d97548 0%, #c5633d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <Lock size={60} color="white" />
          </div>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Password Vault
          </h2>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            Your secure, encrypted password manager. Protect what matters most with military-grade encryption.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '100px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%'
        }}></div>
      </div>
    </div>
  );
}