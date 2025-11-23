# PropTalk Frontend

AI-Powered Receptionist Service for Real Estate - Frontend Application

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
PropTalk-Frontend/
├── app/
│   ├── login/        # Login pages (admin, agent, user)
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/       # Reusable components
│   └── LoginLayout.tsx
├── lib/             # Utilities and API services
│   ├── api.ts       # API functions
│   └── utils.ts     # Utility functions
├── types/           # TypeScript types
└── public/          # Static assets
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Login Pages

- **Admin Login**: `/login/admin`
- **Agent Login**: `/login/agent`
- **User Login**: `/login/user`

## Backend API

Backend runs on: http://localhost:8000
API Documentation: http://localhost:8000/docs

