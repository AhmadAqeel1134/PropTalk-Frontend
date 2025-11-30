'use client'

import { use } from 'react'
import ContactDetails from '@/components/agent/ContactDetails'

export default function ContactDetailsPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = use(params)
  return <ContactDetails contactId={contactId} />
}

