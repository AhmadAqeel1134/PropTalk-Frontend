// TypeScript type definitions

export interface User {
  id: string
  email: string
  full_name: string
}

export interface Admin extends User {
  is_super_admin: boolean
}

export interface RealEstateAgent extends User {
  company_name?: string
  phone?: string
  address?: string
  is_verified: boolean
}

