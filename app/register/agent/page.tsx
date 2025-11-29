'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/animations.css'
import { loadGoogleScript } from '@/lib/googleAuth'

export default function AgentSignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phone: '',
    address: ''
  })
  const [focusedField, setFocusedField] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Google script and initialize
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (clientId) {
      loadGoogleScript()
        .then(() => {
          // Initialize Google Sign In
          if (window.google) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleSuccess,
            })
            
            // Render button after a short delay to ensure DOM is ready
            setTimeout(() => {
              const buttonElement = document.getElementById('google-signup-button')
              if (buttonElement && window.google) {
                window.google.accounts.id.renderButton(buttonElement, {
                  theme: 'outline',
                  size: 'large',
                  text: 'signup_with',
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
  }, [])

  const handleGoogleSuccess = async (response: { credential: string }) => {
    setIsGoogleLoading(true)
    try {
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
          user_type: 'agent',
        }),
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        throw new Error(error.detail || 'Google sign-up failed')
      }

      const data = await apiResponse.json()
      localStorage.setItem('agent_token', data.access_token)
      router.push('/agent/dashboard')
    } catch (error: any) {
      console.error('Google sign-up error:', error)
      alert(error.message || 'Google sign-up failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/real-estate-agent/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          company_name: formData.companyName || null,
          phone: formData.phone || null,
          address: formData.address || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Registration failed')
      }

      const data = await response.json()
      alert('Registration successful! Please login.')
      window.location.href = '/login/agent'
    } catch (error: any) {
      console.error('Registration error:', error)
      alert(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden" style={{
      width: '100vw',
      height: '100vh',
      background: `
        radial-gradient(circle at center, #000000 0%, #000000 50%, #0a0a0a 70%, transparent 85%),
        radial-gradient(circle at top left, transparent 0%, #0a1525 30%, #0f1b2e 50%, #1a2332 80%, #1e3a5f 100%),
        radial-gradient(circle at top right, transparent 0%, #0a1525 30%, #0f1b2e 50%, #1a2332 80%, #1e3a5f 100%),
        radial-gradient(circle at bottom left, transparent 0%, #0a1525 30%, #0f1b2e 50%, #1a2332 80%, #1e3a5f 100%),
        radial-gradient(circle at bottom right, transparent 0%, #0a1525 30%, #0f1b2e 50%, #1a2332 80%, #1e3a5f 100%),
        radial-gradient(ellipse at top, transparent 0%, #0a1525 40%, #0f1b2e 60%, #1a2332 100%),
        radial-gradient(ellipse at bottom, transparent 0%, #0f1b2e 30%, #1a2332 60%, #1e3a5f 100%),
        #000000
      `
    }}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Login Image Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/images/login.png" 
            alt="Login Design"
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>
        
        {/* Light Beams Overlay */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-r from-blue-900 via-blue-800 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-blue-900 via-blue-800 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 bg-gradient-to-b from-blue-900 to-transparent opacity-15 blur-2xl"></div>
      </div>

      {/* Back Button */}
      <Link href="/login/agent" className="absolute top-4 left-4 z-20 text-gray-400 hover:text-white transition-colors">
        <ArrowRight size={20} className="rotate-180" />
      </Link>

      {/* Main Form Container */}
      <div className="relative w-full max-w-4xl z-10 page-transition">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2">PropTalk</h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-blue-300">Create Your Agent Account</p>
        </div>

        {/* Form Card */}
        <div className="relative rounded-2xl p-8 backdrop-blur-sm" style={{
          background: 'rgba(15, 31, 58, 0.7)',
          border: '1px solid rgba(77, 184, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: focusedField === 'fullName' 
                      ? '2px solid #4db8ff'
                      : '1px solid rgba(77, 184, 255, 0.3)',
                    color: '#ffffff',
                    boxShadow: focusedField === 'fullName'
                      ? '0 0 20px rgba(77, 184, 255, 0.3)'
                      : 'none'
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  placeholder="agent@proptalk.com"
                />
              </div>

              {/* Company Name Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Company Name (Optional)</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: focusedField === 'companyName' 
                      ? '2px solid #4db8ff'
                      : '1px solid rgba(77, 184, 255, 0.3)',
                    color: '#ffffff',
                    boxShadow: focusedField === 'companyName'
                      ? '0 0 20px rgba(77, 184, 255, 0.3)'
                      : 'none'
                  }}
                  placeholder="Real Estate Co."
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: focusedField === 'phone' 
                      ? '2px solid #4db8ff'
                      : '1px solid rgba(77, 184, 255, 0.3)',
                    color: '#ffffff',
                    boxShadow: focusedField === 'phone'
                      ? '0 0 20px rgba(77, 184, 255, 0.3)'
                      : 'none'
                  }}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {/* Address Input - Full Width */}
            <div>
              <label className="block text-blue-200 text-sm mb-2">Address (Optional)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField('')}
                className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                style={{
                  background: 'rgba(10, 22, 40, 0.6)',
                  border: focusedField === 'address' 
                    ? '2px solid #4db8ff'
                    : '1px solid rgba(77, 184, 255, 0.3)',
                  color: '#ffffff',
                  boxShadow: focusedField === 'address'
                    ? '0 0 20px rgba(77, 184, 255, 0.3)'
                    : 'none'
                }}
                placeholder="123 Main St, City, State"
              />
            </div>

            {/* Password Fields - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
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
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-blue-200 text-sm mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  required
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(10, 22, 40, 0.6)',
                    border: focusedField === 'confirmPassword' 
                      ? '2px solid #4db8ff'
                      : '1px solid rgba(77, 184, 255, 0.3)',
                    color: '#ffffff',
                    boxShadow: focusedField === 'confirmPassword'
                      ? '0 0 20px rgba(77, 184, 255, 0.3)'
                      : 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>
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
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
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

          {/* Google Sign Up Button */}
          <div className="mb-6">
            <div id="google-signup-button" ref={googleButtonRef}></div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              Already have an account?{' '}
              <Link href="/login/agent" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-blue-300 text-xs mt-6 opacity-70">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

