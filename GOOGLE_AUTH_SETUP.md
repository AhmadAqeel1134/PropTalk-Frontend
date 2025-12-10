# Google OAuth Authentication Setup Guide

## Overview
This guide will help you implement Google OAuth authentication alongside email/password login for Admin and Real Estate Agent users.

---

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy **Client ID** and **Client Secret**

---

## Step 2: Install Frontend Packages

```bash
cd PropTalk-Frontend
npm install next-auth@beta @auth/core
```

---

## Step 3: Install Backend Packages

```bash
cd PropTalk-Backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

Add to `requirements.txt`:
```
google-auth==2.23.4
google-auth-oauthlib==1.1.0
google-auth-httplib2==0.1.1
```

---

## Step 4: Add Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

---

## Step 5: Backend Implementation

### 5.1 Update Backend Config (`app/config.py`)
Add Google OAuth credentials:
```python
GOOGLE_CLIENT_ID: Optional[str] = None
GOOGLE_CLIENT_SECRET: Optional[str] = None
```

### 5.2 Create Google Auth Service (`app/services/google_auth_service.py`)
```python
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config import settings

async def verify_google_token(token: str) -> dict:
    """Verify Google ID token and return user info"""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        return {
            "email": idinfo["email"],
            "name": idinfo.get("name", ""),
            "picture": idinfo.get("picture", ""),
            "google_id": idinfo["sub"]
        }
    except ValueError:
        raise ValueError("Invalid Google token")
```

### 5.3 Create Google Auth Endpoint (`app/controllers/google_auth_controller.py`)
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.google_auth_service import verify_google_token
from app.services.auth_service import create_admin_from_google
from app.services.real_estate_agent_auth_service import create_agent_from_google

router = APIRouter(prefix="/auth/google", tags=["Google Auth"])

class GoogleTokenRequest(BaseModel):
    token: str
    user_type: str  # "admin" or "agent"

@router.post("/login")
async def google_login(request: GoogleTokenRequest):
    """Login with Google OAuth token"""
    try:
        user_info = await verify_google_token(request.token)
        
        if request.user_type == "admin":
            admin = await create_admin_from_google(user_info)
            # Generate JWT token
            # Return token
        elif request.user_type == "agent":
            agent = await create_agent_from_google(user_info)
            # Generate JWT token
            # Return token
        else:
            raise HTTPException(400, "Invalid user type")
            
    except ValueError as e:
        raise HTTPException(401, str(e))
```

---

## Step 6: Frontend Implementation

### 6.1 Create Google Auth Hook (`lib/hooks/useGoogleAuth.ts`)
```typescript
export const useGoogleAuth = () => {
  const handleGoogleLogin = async (userType: 'admin' | 'agent') => {
    // Google OAuth flow
    // Call backend endpoint
  }
  
  return { handleGoogleLogin }
}
```

### 6.2 Add Google Login Button to LoginLayout
Update `components/LoginLayout.tsx` to include Google login button

---

## Step 7: Update Database Models

Add Google ID field to Admin and RealEstateAgent models:
- `google_id` (String, nullable, unique)
- `auth_provider` (String) - "email" or "google"

---

## Implementation Flow

1. **User clicks "Sign in with Google"**
2. **Frontend redirects to Google OAuth**
3. **Google returns authorization code**
4. **Frontend exchanges code for ID token**
5. **Frontend sends ID token to backend**
6. **Backend verifies token with Google**
7. **Backend creates/updates user in database**
8. **Backend returns JWT token**
9. **Frontend stores token and redirects**

---

## Security Considerations

1. ✅ Always verify tokens on backend (never trust frontend)
2. ✅ Use HTTPS in production
3. ✅ Store Google credentials securely in environment variables
4. ✅ Validate user email domain for admin (if needed)
5. ✅ Handle account linking (if user signs up with email then Google)

---

## Testing

1. Test Google login flow
2. Test email/password login still works
3. Test account creation with Google
4. Test error handling (invalid token, network errors)

---

## Next Steps

Would you like me to:
1. Implement the backend Google auth service?
2. Implement the frontend Google login button?
3. Update the database models?
4. Create the complete integration?

Let me know which step you'd like me to implement first!

