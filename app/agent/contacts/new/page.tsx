'use client'

import { useState } from 'react'
import CreateContactForm from '@/components/agent/CreateContactForm'
import { useRouter } from 'next/navigation'

export default function NewContactPage() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    router.push('/agent/contacts')
  }

  if (!isOpen) return null

  return <CreateContactForm onClose={handleClose} />
}

