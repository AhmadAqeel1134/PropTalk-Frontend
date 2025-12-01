'use client'

import UploadDocumentForm from '@/components/agent/UploadDocumentForm'
import { useRouter } from 'next/navigation'

export default function UploadDocumentPage() {
  const router = useRouter()

  return <UploadDocumentForm onClose={() => router.push('/agent/documents')} />
}

