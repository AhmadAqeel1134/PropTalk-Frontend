'use client'

import { use } from 'react'
import DocumentDetails from '@/components/agent/DocumentDetails'

export default function DocumentDetailsPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = use(params)
  return <DocumentDetails documentId={documentId} />
}

