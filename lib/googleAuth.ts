/**
 * Google OAuth Authentication Utility
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

export interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  google_id: string
}

/**
 * Load Google OAuth script
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'))
      return
    }

    // Check if script already loaded
    if (window.google && window.google.accounts) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'))
    document.head.appendChild(script)
  })
}

/**
 * Initialize Google Sign-In button
 */
export const initializeGoogleSignIn = (
  callback: (credential: string) => void
): void => {
  if (typeof window === 'undefined' || !window.google) {
    console.error('Google OAuth script not loaded')
    return
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: { credential: string }) => {
      callback(response.credential)
    },
  })
}

/**
 * Trigger Google Sign-In popup
 */
export const triggerGoogleSignIn = (): void => {
  if (typeof window === 'undefined' || !window.google) {
    console.error('Google OAuth script not loaded')
    return
  }

  window.google.accounts.id.prompt()
}

/**
 * Login with Google token
 */
export const loginWithGoogle = async (
  token: string,
  userType: 'admin' | 'agent'
): Promise<{ access_token: string; token_type: string }> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${API_URL}/auth/google/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      user_type: userType,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Google login failed')
  }

  return response.json()
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}
