'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/animations.css'
import { endUserRegister, endUserLogin } from '@/lib/end_user/api'

export default function EndUserRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Please wait…' : 'Sign up'}
          </button>
        </form>
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
