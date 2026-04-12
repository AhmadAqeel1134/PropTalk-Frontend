'use client'

import { useRouter } from 'next/navigation'
import LoginLayout from '@/components/LoginLayout'
import { endUserLogin } from '@/lib/end_user/api'

export default function UserLoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    const data = await endUserLogin(email, password)
    localStorage.setItem('user_token', data.access_token)
    router.push('/user')
  }

  const handleForgotPassword = () => {
    console.log('Forgot password clicked')
  }

  return (
    <LoginLayout
      title="Welcome back"
      subtitle="Find agents and your history with each of them"
      userType="user"
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      showSignUp={true}
      signUpLink="/register/user"
    />
  )
}
