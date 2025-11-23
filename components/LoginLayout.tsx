'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [activeProperty, setActiveProperty] = useState(0)
  const [rememberMe, setRememberMe] = useState(false)

  const properties = [
    { price: "2.45M", location: "Miami", beds: 5, color: "from-violet-600 to-purple-600" },
    { price: "3.85M", location: "NYC", beds: 4, color: "from-cyan-600 to-blue-600" },
    { price: "1.95M", location: "LA", beds: 4, color: "from-emerald-600 to-teal-600" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProperty((prev) => (prev + 1) % properties.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(email, password)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex">
      {/* LEFT SIDE - INTERACTIVE PROPERTY DISPLAY */}
      <div 
        className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-16"
        onMouseMove={handleMouseMove}
      >
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Cursor follower glow */}
        <div 
          className="absolute w-96 h-96 pointer-events-none opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%)',
            left: `${mousePos.x - 192}px`,
            top: `${mousePos.y - 192}px`,
            transition: 'all 0.1s ease-out'
          }}
        ></div>

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-cyan-400">PROPTALK</div>
              <div className="text-xs text-gray-500">AI-Powered Real Estate</div>
            </div>
          </div>
        </div>

        {/* Center - 3D Property Cards */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-full max-w-md h-80">
            {properties.map((prop, idx) => {
              const offset = (idx - activeProperty + properties.length) % properties.length
              const isActive = offset === 0
              const isPrev = offset === properties.length - 1
              const isNext = offset === 1

              let transform = 'scale(0.8) translateY(40px) opacity-0'
              if (isPrev) transform = 'scale(0.9) translateY(20px) rotateX(15deg) opacity-50'
              if (isActive) transform = 'scale(1) translateY(0) rotateX(0deg) opacity-100'
              if (isNext) transform = 'scale(0.9) translateY(20px) rotateX(-15deg) opacity-50'

              return (
                <div
                  key={idx}
                  className={`absolute w-full h-full transition-all duration-700 ease-out`}
                  style={{ transform, perspective: '1200px' }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${prop.color} rounded-2xl overflow-hidden relative group cursor-pointer`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300" style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)'
                    }}></div>

                    <div className="relative w-full h-full p-8 flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white/80 mb-2">FEATURED</div>
                        <h3 className="text-3xl font-black text-white">{prop.location}</h3>
                      </div>
                      <div>
                        <div className="text-5xl font-black text-white mb-2">{prop.price}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 font-semibold">{prop.beds} Bedrooms</span>
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation dots */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 justify-center">
            {properties.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveProperty(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeProperty 
                    ? 'w-8 h-2 bg-gradient-to-r from-cyan-500 to-blue-600' 
                    : 'w-2 h-2 bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mt-12">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">Active</div>
              <div className="text-3xl font-black text-white">2.8K</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">Calls Today</div>
              <div className="text-3xl font-black text-white">847</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2">Conversion</div>
              <div className="text-3xl font-black text-white">42%</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-600/20 to-transparent rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">{title}</h1>
            <p className="text-gray-400 text-lg">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={userType === 'admin' ? 'admin@proptalk.com' : userType === 'agent' ? 'agent@proptalk.com' : 'user@example.com'}
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all backdrop-blur-sm text-white placeholder-gray-600 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all backdrop-blur-sm text-white placeholder-gray-600 focus:bg-white/10 focus:shadow-lg focus:shadow-cyan-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                  rememberMe ? 'bg-cyan-500 border-cyan-500' : 'bg-white/5 border-white/20 group-hover:border-cyan-500/50'
                }`}>
                  {rememberMe && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Stay signed in</span>
              </label>
              {onForgotPassword && (
                <button 
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Forgot?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden mb-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {showSignUp && signUpLink && (
            <p className="text-center text-sm text-gray-500 mt-8">
              New here?{' '}
              <a href={signUpLink} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Sign up
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

