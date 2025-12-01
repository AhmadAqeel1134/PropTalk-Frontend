'use client'

import DocumentDetails from '@/components/agent/DocumentDetails'

// In Next.js app router, `params` is a plain object, not a Promise.
export default function DocumentDetailsPage({ params }: { params: { documentId: string } }) {
  return <DocumentDetails documentId={params.documentId} />
}

