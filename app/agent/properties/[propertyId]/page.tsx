'use client'

import { use } from 'react'
import PropertyDetails from '@/components/agent/PropertyDetails'

export default function PropertyDetailsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params)
  return <PropertyDetails propertyId={propertyId} />
}

