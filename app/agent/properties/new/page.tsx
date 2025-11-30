'use client'

import CreatePropertyForm from '@/components/agent/CreatePropertyForm'
import { useRouter } from 'next/navigation'

export default function NewPropertyPage() {
  const router = useRouter()

  return <CreatePropertyForm onClose={() => router.push('/agent/properties')} />
}

