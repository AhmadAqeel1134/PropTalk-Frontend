'use client'

import { useRouter } from 'next/navigation'
import LoginLayout from '@/components/LoginLayout'

export default function AdminLoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      localStorage.setItem('admin_token', data.access_token)
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    console.log('Forgot password clicked')
  }

  return (
    <LoginLayout
      title="Admin Portal"
      subtitle="Manage your real estate platform"
      userType="admin"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
    />
  )
}

