'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/animations.css'
import { endUserRegister, endUserLogin } from '@/lib/end_user/api'
import { loadGoogleScript } from '@/lib/googleAuth'

export default function EndUserRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return
    loadGoogleScript()
      .then(() => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential: string }) => {
              void handleGoogleSuccess(response.credential)
            },
          })
        }
      })
      .catch((err) => console.error('Failed to load Google script:', err))
  }, [])

  const handleGoogleSuccess = async (credential: string) => {
    setIsGoogleLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credential,
          user_type: 'end_user',
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Google sign-up failed')
      }
      const data = await response.json()
      localStorage.setItem('user_token', data.access_token)
      router.push('/user')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Google sign-up failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGoogleClick = () => {
    if (!window.google) {
      alert('Google sign-in is not available. Please refresh the page.')
      return
    }
    setIsGoogleLoading(true)
    const el = document.getElementById('google-signup-button-user')
    if (el) {
      el.innerHTML = ''
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        width: '100%',
        type: 'standard',
      })
      setTimeout(() => {
        const btn = el.querySelector('div[role="button"]') as HTMLElement
        if (btn) btn.click()
        else setIsGoogleLoading(false)
      }, 100)
    } else {
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }
    setIsLoading(true)
    try {
      await endUserRegister({
        email,
        password,
        full_name: fullName,
        phone_number: phone.trim() || undefined,
      })
      const login = await endUserLogin(email, password)
      localStorage.setItem('user_token', login.access_token)
      router.push('/user')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-1">Create account</h1>
        <p className="text-slate-400 text-sm mb-6">Browse agents and see your own history per agent.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full name</label>
            <input
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password (8+ characters)</label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Phone (optional)</label>
            <input
              type="tel"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="You can add this later"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Please wait…' : 'Sign up'}
          </button>
        </form>

        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900/80 px-3 text-slate-500">or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading || isGoogleLoading}
              className="w-full rounded-lg border border-slate-600 bg-slate-950 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {isGoogleLoading ? 'Signing in…' : 'Sign up with Google'}
            </button>
            <div id="google-signup-button-user" ref={googleButtonRef} className="hidden" aria-hidden />
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login/user" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
