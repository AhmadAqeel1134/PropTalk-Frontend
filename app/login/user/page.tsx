'use client'

import { useRouter } from 'next/navigation'
import LoginLayout from '@/components/LoginLayout'

export default function UserLoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      // TODO: Implement user login endpoint when ready
      // For now, this is a placeholder
      console.log('User login:', { email, password })
      
      // Placeholder - replace with actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/login`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email, password }),
      // })
      
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.detail || 'Login failed')
      // }
      
      // const data = await response.json()
      // localStorage.setItem('user_token', data.access_token)
      // router.push('/user/dashboard')
      
      alert('User login endpoint not yet implemented')
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
      title="Welcome Back"
      subtitle="Find your dream property"
      userType="user"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      showSignUp={true}
      signUpLink="/register/user"
    />
  )
}

