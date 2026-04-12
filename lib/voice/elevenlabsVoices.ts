export interface ElevenLabsVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  accent: string
  description: string
  tags: string[]
}

const voices: ElevenLabsVoice[] = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'male',
    accent: 'American',
    description: 'Warm, deep, and conversational — ideal for professional outreach.',
    tags: ['Warm', 'Professional', 'Deep'],
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'female',
    accent: 'American',
    description: 'Calm and articulate — great for client consultations.',
    tags: ['Calm', 'Articulate', 'Friendly'],
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    gender: 'male',
    accent: 'British',
    description: 'Authoritative yet approachable — suits premium property discussions.',
    tags: ['Authoritative', 'Premium', 'Polished'],
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'female',
    accent: 'American',
    description: 'Soft and engaging — perfect for nurturing leads.',
    tags: ['Soft', 'Engaging', 'Nurturing'],
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'male',
    accent: 'American',
    description: 'Young, energetic — best for fast-paced sales.',
    tags: ['Energetic', 'Youthful', 'Sales'],
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    gender: 'female',
    accent: 'American',
    description: 'Bright and clear — works well for property tours.',
    tags: ['Bright', 'Clear', 'Friendly'],
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    gender: 'male',
    accent: 'American',
    description: 'Strong and confident — great for closing deals.',
    tags: ['Confident', 'Strong', 'Trustworthy'],
  },
  {
    id: 'ThT5KcBeYPX3keUQqHPh',
    name: 'Dorothy',
    gender: 'female',
    accent: 'British',
    description: 'Elegant and warm — ideal for luxury real estate.',
    tags: ['Elegant', 'Warm', 'Luxury'],
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'female',
    accent: 'American',
    description: 'Natural and relaxed — casual yet professional.',
    tags: ['Natural', 'Relaxed', 'Casual'],
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    gender: 'male',
    accent: 'American',
    description: 'Smooth and reassuring — perfect for first impressions.',
    tags: ['Smooth', 'Reassuring', 'Personable'],
  },
]

export default voices
