'use client'

import ContactDetails from '@/components/agent/ContactDetails'

// `params` is a plain object provided by Next.js app router
export default function ContactDetailsPage({ params }: { params: { contactId: string } }) {
  return <ContactDetails contactId={params.contactId} />
}

