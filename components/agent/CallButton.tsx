// components/agent/CallButton.tsx
'use client'

import { useState } from 'react'
import { Phone, PhoneCall, Loader2 } from 'lucide-react'
import { initiateCall } from '@/lib/real_estate_agent/api'

interface Contact {
  id: string
  name: string
  phone_number: string
}

interface CallButtonProps {
  contact: Contact
  variant?: 'primary' | 'secondary' | 'compact'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onCallInitiated?: (contactId: string, result?: any) => void
  onError?: (error: string) => void
}

export default function CallButton({ 
  contact, 
  variant = 'secondary', 
  size = 'medium',
  disabled = false,
  onCallInitiated,
  onError
}: CallButtonProps) {
  const [isInitiating, setIsInitiating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCall = async () => {
    if (disabled || isInitiating) return
    
    setIsInitiating(true)
    setError(null)
    
    console.log('📞 Initiating call to:', contact.name, contact.phone_number)
    console.log('📋 Contact ID:', contact.id)
    
    try {
      // Ensure phone number is in E.164 format
      let phoneNumber = contact.phone_number.trim()
      if (!phoneNumber.startsWith('+')) {
        // If no country code, assume Pakistan (+92)
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '+92' + phoneNumber.substring(1)
        } else {
          phoneNumber = '+92' + phoneNumber
        }
      }
      
      console.log('📞 Calling API with:', {
        contact_id: contact.id,
        phone_number: phoneNumber
      })
      
      // Call the backend API
      const result = await initiateCall({
        contact_id: contact.id,
        phone_number: phoneNumber
      })
      
      console.log('✅ Call initiated successfully:', result)
      
      // Call the callback if provided
      onCallInitiated?.(contact.id, result)
      
      // Show success message (optional)
      // You can add a toast notification here
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to initiate call'
      console.error('❌ Failed to initiate call:', error)
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Show error to user (optional)
      alert(`Failed to initiate call: ${errorMessage}`)
    } finally {
      setIsInitiating(false)
    }
  }

  // Size classes
  const sizeClasses = {
    small: 'px-3 py-2 text-sm gap-2',
    medium: 'px-6 py-3 gap-2',
    large: 'px-8 py-4 text-lg gap-3',
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0',
    secondary: 'bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white',
    compact: 'bg-gray-800 border border-gray-700 hover:border-emerald-600 text-gray-300 hover:text-emerald-400',
  }

  const iconSize = size === 'large' ? 'size-6' : size === 'small' ? 'size-4' : 'size-5'

  if (variant === 'compact') {
    return (
      <button
        onClick={handleCall}
        disabled={disabled || isInitiating}
        className={`flex items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Call ${contact.name}`}
      >
        {isInitiating ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Phone className={iconSize} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCall}
      disabled={disabled || isInitiating}
      className={`flex items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isInitiating ? (
        <>
          <Loader2 className={`${iconSize} animate-spin`} />
          Connecting...
        </>
      ) : (
        <>
          <PhoneCall className={iconSize} />
          Call {contact.name}
        </>
      )}
    </button>
  )
}
