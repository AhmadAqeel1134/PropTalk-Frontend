'use client'

import PropertyDetails from '@/components/agent/PropertyDetails'

// `params` is a plain object in app router, not a Promise
export default function PropertyDetailsPage({ params }: { params: { propertyId: string } }) {
  return <PropertyDetails propertyId={params.propertyId} />
}

