'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Lock, Eye, EyeOff } from 'lucide-react'
import { useChangePassword } from '@/hooks/useAgent'
import { useState, useEffect } from 'react'

const schema = z.object({
  old_password: z.string().min(6, 'Password must be at least 6 characters'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type FormData = z.infer<typeof schema>

interface ChangePasswordFormProps {
  onClose: () => void
}

export default function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const mutation = useChangePassword()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      style={{
        animation: 'fade-in 0.3s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-2xl w-full"
        style={{
          animation: isMounted ? 'slide-in-from-bottom-4 0.4s ease-out' : 'none',
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Change Password</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(data => {
          mutation.mutate({
            old_password: data.old_password,
            new_password: data.new_password
          }, {
            onSuccess: () => {
              alert('Password changed successfully')
              onClose()
            },
            onError: (error: any) => {
              alert(error.message || 'Failed to change password')
            }
          })
        })} className="space-y-6">
          <div style={{ animationDelay: '0.1s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline size-4 mr-2" />
              Current Password
            </label>
            <div className="relative">
              <input
                {...register('old_password')}
                type={showOldPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.old_password && <p className="text-red-400 text-sm mt-1">{errors.old_password.message}</p>}
          </div>

          <div style={{ animationDelay: '0.15s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline size-4 mr-2" />
              New Password
            </label>
            <div className="relative">
              <input
                {...register('new_password')}
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password && <p className="text-red-400 text-sm mt-1">{errors.new_password.message}</p>}
          </div>

          <div style={{ animationDelay: '0.2s' }} className="animate-[slide-in-from-bottom-2_0.5s_ease-out]">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="inline size-4 mr-2" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                {...register('confirm_password')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-red-400 text-sm mt-1">{errors.confirm_password.message}</p>}
          </div>

          <div className="flex gap-4 pt-4 animate-[slide-in-from-bottom-2_0.5s_ease-out]" style={{ animationDelay: '0.25s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-70"
            >
              {mutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

