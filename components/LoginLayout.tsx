'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/animations.css'
import { loadGoogleScript, initializeGoogleSignIn, loginWithGoogle } from '@/lib/googleAuth'

interface LoginLayoutProps {
  title: string
  subtitle: string
  userType: 'admin' | 'agent' | 'user'
  onSubmit: (email: string, password: string) => Promise<void>
  onForgotPassword?: () => void
  showSignUp?: boolean
  signUpLink?: string
}

export default function LoginLayout({
  title,
  subtitle,
  userType,
  onSubmit,
  onForgotPassword,
  showSignUp = false,
  signUpLink
}: LoginLayoutProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // Load Google script and initialize
    if (userType === 'admin' || userType === 'agent') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (clientId) {
        loadGoogleScript()
          .then(() => {
            // Initialize Google Sign In
            if (window.google) {
              window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response: { credential: string }) => {
                  handleGoogleSuccess(response.credential)
                },
              })
              
              // Render button after a short delay to ensure DOM is ready
              setTimeout(() => {
                const buttonElement = document.getElementById('google-signin-button')
                if (buttonElement && window.google) {
                  window.google.accounts.id.renderButton(buttonElement, {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: '100%',
                  })
                }
              }, 500)
            }
          })
          .catch((error) => {
            console.error('Failed to load Google script:', error)
          })
      }
    }
  }, [userType])

  const handleGoogleSuccess = async (credential: string) => {
    if (userType !== 'admin' && userType !== 'agent') return
    
    setIsGoogleLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credential,
          user_type: userType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Google login failed')
      }

      const data = await response.json()
      
      // Store token
      if (userType === 'admin') {
        localStorage.setItem('admin_token', data.access_token)
        router.push('/admin/dashboard')
      } else if (userType === 'agent') {
        localStorage.setItem('agent_token', data.access_token)
        router.push('/agent/dashboard')
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      alert(error.message || 'Google login failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleError = (error: string) => {
    console.error('Google auth error:', error)
    alert('Google authentication failed. Please try again.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(email, password)
    } catch (error: any) {
      console.error('Login error:', error)
      alert(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 overflow-hidden page-transition`} style={{
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.4s ease-out',
      width: '100vw',
      height: '100vh',
      background: '#000000'
    }}>
      {/* Login Image Background - Raw, No Effects */}
      <div className="absolute inset-0">
        <img 
          src="/images/login.png" 
          alt="Login Design"
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white transition-colors">
        <ArrowRight size={20} className="rotate-180" />
      </Link>

      {/* Main Form Container */}
      <div className="relative w-full max-w-lg z-10" style={{ marginTop: '-140px' }}>
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2">{title}</h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-blue-300">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="relative rounded-2xl p-8 backdrop-blur-sm" style={{
          background: 'rgba(15, 31, 58, 0.7)',
          border: '1px solid rgba(77, 184, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          minHeight: '420px',
          marginTop: '30px'
        }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-blue-200 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                style={{
                  background: 'rgba(10, 22, 40, 0.6)',
                  border: focusedField === 'email' 
                    ? '2px solid #4db8ff'
                    : '1px solid rgba(77, 184, 255, 0.3)',
                  color: '#ffffff',
                  boxShadow: focusedField === 'email'
                    ? '0 0 20px rgba(77, 184, 255, 0.3)'
                    : 'none'
                }}
                placeholder={userType === 'admin' ? 'admin@proptalk.com' : userType === 'agent' ? 'agent@proptalk.com' : 'user@example.com'}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-blue-200 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: focusedField === 'password' 
                      ? '2px solid #4db8ff'
                      : '1px solid rgba(77, 184, 255, 0.3)',
                    color: '#ffffff',
                    boxShadow: focusedField === 'password'
                      ? '0 0 20px rgba(77, 184, 255, 0.3)'
                      : 'none'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-black/40 border-slate-700 group-hover:border-blue-500/50'
                }`} style={{
                  background: rememberMe ? '#3b9eff' : 'rgba(10, 22, 40, 0.6)',
                  border: rememberMe ? '1px solid #3b9eff' : '1px solid rgba(77, 184, 255, 0.3)'
                }}>
                  {rememberMe && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-blue-200 group-hover:text-blue-100 transition-colors">Remember me</span>
              </label>
              {onForgotPassword && (
                <button 
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Forgot?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #3b9eff 0%, #1e5fb8 100%)',
                boxShadow: '0 4px 20px rgba(59, 158, 255, 0.4)'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          {(userType === 'admin' || userType === 'agent') && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(77, 184, 255, 0.2)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-blue-300" style={{ background: 'rgba(15, 31, 58, 0.9)' }}>
                  or continue with
                </span>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          {(userType === 'admin' || userType === 'agent') && (
            <div className="mb-6">
              <div id="google-signin-button" ref={googleButtonRef}></div>
            </div>
          )}

          {/* Sign Up Link */}
          {showSignUp && signUpLink && (
            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                Don't have an account?{' '}
                <Link href={signUpLink} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
