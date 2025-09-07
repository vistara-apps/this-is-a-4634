# EchoSense API Documentation

## Overview

EchoSense is a web application that captures, identifies, and interprets animal sounds using AI-powered analysis. This documentation covers the complete API specifications, data models, and integration requirements.

## Architecture

```
Frontend (React) → Backend Services → AI/ML APIs → Storage
     ↓                    ↓              ↓          ↓
   User Interface    Authentication   OpenAI API   Supabase
   Audio Recording   User Management   Whisper     PostgreSQL
   Spectrogram       Premium Features  GPT-4       IPFS/Pinata
```

## Data Models

### User Entity
```typescript
interface User {
  id: string                    // UUID from Supabase Auth
  email: string                 // User email
  subscription_status: 'free' | 'premium'
  created_at: string           // ISO timestamp
  updated_at: string           // ISO timestamp
}
```

### Recording Entity
```typescript
interface Recording {
  id: string                   // UUID
  user_id: string             // Foreign key to User
  audio_url: string           // URL to audio file
  identified_species: string   // AI-identified species name
  call_type: string           // Type of animal call
  confidence_score: number    // 0-1 confidence rating
  behavioral_insight: string  // AI-generated behavioral explanation
  location: string            // GPS coordinates or location name
  timestamp: string           // ISO timestamp of recording
  is_public_contribution: boolean // Whether shared for research
  alternative_species?: string[]  // Other possible species
  acoustic_features?: string      // Technical audio analysis
  time_of_day?: string           // Optimal time for this call
  habitat?: string               // Typical habitat information
  transcription?: string         // Whisper transcription
  created_at: string             // ISO timestamp
}
```

### Profile Entity
```typescript
interface Profile {
  id: string                  // UUID, matches User.id
  subscription_status: 'free' | 'premium'
  stripe_customer_id?: string
  subscription_id?: string
  daily_recordings_count: number
  total_recordings: number
  species_discovered: number
  research_contributions: number
  achievements: string[]      // Array of achievement IDs
  preferences: {
    location_sharing: boolean
    research_contribution: boolean
    notifications: boolean
  }
  updated_at: string
}
```

## API Endpoints

### Authentication (Supabase Auth)

#### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Sign Out
```http
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

### Recording Management

#### Create Recording
```http
POST /rest/v1/recordings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "audio_url": "https://example.com/audio.wav",
  "identified_species": "American Robin",
  "call_type": "Territory Call",
  "confidence_score": 0.87,
  "behavioral_insight": "This bird is marking territory...",
  "location": "40.7128, -74.0060",
  "is_public_contribution": false
}
```

#### Get User Recordings
```http
GET /rest/v1/recordings?user_id=eq.<user_id>&order=created_at.desc
Authorization: Bearer <access_token>
```

#### Update Recording
```http
PATCH /rest/v1/recordings?id=eq.<recording_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_public_contribution": true
}
```

#### Delete Recording
```http
DELETE /rest/v1/recordings?id=eq.<recording_id>
Authorization: Bearer <access_token>
```

### AI Analysis Integration

#### OpenAI Whisper Transcription
```http
POST https://api.openai.com/v1/audio/transcriptions
Authorization: Bearer <openai_api_key>
Content-Type: multipart/form-data

file: <audio_file>
model: whisper-1
response_format: json
```

#### OpenAI GPT-4 Analysis
```http
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer <openai_api_key>
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert ornithologist..."
    },
    {
      "role": "user",
      "content": "Analyze this audio transcription..."
    }
  ],
  "temperature": 0.2,
  "max_tokens": 1000
}
```

### IPFS/Pinata Integration

#### Upload Audio to IPFS
```http
POST https://api.pinata.cloud/pinning/pinFileToIPFS
pinata_api_key: <api_key>
pinata_secret_api_key: <secret_key>
Content-Type: multipart/form-data

file: <audio_file>
pinataMetadata: {
  "name": "EchoSense Recording - Species Name",
  "keyvalues": {
    "species": "American Robin",
    "callType": "Territory Call",
    "confidence": "0.87"
  }
}
```

#### Upload Metadata to IPFS
```http
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
pinata_api_key: <api_key>
pinata_secret_api_key: <secret_key>
Content-Type: application/json

{
  "pinataContent": {
    "species": "American Robin",
    "callType": "Territory Call",
    "confidence": 0.87,
    "behavioralInsight": "...",
    "license": "CC-BY-4.0"
  },
  "pinataMetadata": {
    "name": "EchoSense Metadata - American Robin"
  }
}
```

### Stripe Payment Integration

#### Create Checkout Session
```http
POST /api/create-checkout-session
Content-Type: application/json

{
  "priceId": "price_premium_monthly",
  "userId": "<user_id>",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/profile"
}
```

#### Webhook Handler
```http
POST /api/stripe-webhook
stripe-signature: <signature>
Content-Type: application/json

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "customer": "<customer_id>",
      "subscription": "<subscription_id>"
    }
  }
}
```

## Feature Access Control

### Free Tier Limitations
- 5 recordings per day
- Basic species identification
- Simple behavioral insights
- Personal sound library access

### Premium Tier Features
- Unlimited recordings
- Advanced AI analysis with alternative species
- Detailed acoustic feature analysis
- Spectrogram visualization
- Offline mode support
- Research contribution tools
- Priority support

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "Unable to analyze audio file",
    "details": "OpenAI API returned an error",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: User authentication required
- `QUOTA_EXCEEDED`: Daily recording limit reached
- `ANALYSIS_FAILED`: AI analysis could not be completed
- `INVALID_AUDIO`: Audio file format not supported
- `PAYMENT_REQUIRED`: Premium feature requires subscription
- `RATE_LIMITED`: Too many requests

## Security Considerations

### API Key Management
- OpenAI API keys should be stored server-side only
- Use environment variables for all sensitive credentials
- Implement rate limiting to prevent abuse
- Validate all user inputs

### Data Privacy
- Audio files can be stored locally or on IPFS
- User location data is optional and anonymized for research
- Research contributions are anonymized
- GDPR compliance for EU users

### Authentication
- JWT tokens for session management
- Row Level Security (RLS) in Supabase
- Secure password requirements
- Optional 2FA for premium users

## Rate Limits

### OpenAI API
- Whisper: 50 requests per minute
- GPT-4: 20 requests per minute
- Monitor usage to prevent quota exhaustion

### Supabase
- 500 requests per minute per user
- 10MB file upload limit
- Connection pooling for database

### Pinata IPFS
- 100 requests per minute
- 1GB monthly storage limit (free tier)
- File size limit: 100MB per file

## Deployment Configuration

### Environment Variables
```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...

# Supabase Configuration
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_...

# Pinata Configuration (Optional)
VITE_PINATA_API_KEY=...
VITE_PINATA_SECRET_KEY=...
```

### Database Schema (Supabase)
```sql
-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recordings" ON recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings" ON recordings
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_species ON recordings(identified_species);
```

## Testing

### Unit Tests
- Audio processing functions
- AI response parsing
- Feature access control
- Data validation

### Integration Tests
- OpenAI API integration
- Supabase database operations
- Stripe payment flow
- IPFS upload/retrieval

### End-to-End Tests
- Complete recording workflow
- Premium upgrade process
- Research contribution flow
- Cross-browser compatibility

## Performance Optimization

### Frontend
- Lazy loading of components
- Audio file compression
- Caching of analysis results
- Progressive Web App features

### Backend
- Database query optimization
- CDN for static assets
- Connection pooling
- Background job processing

### AI Processing
- Batch processing for multiple files
- Caching of common species
- Fallback to mock data when APIs fail
- Retry logic with exponential backoff

## Monitoring and Analytics

### Key Metrics
- Daily active users
- Recording success rate
- AI analysis accuracy
- Premium conversion rate
- Research contribution volume

### Error Tracking
- API failure rates
- Audio processing errors
- Payment processing issues
- User experience problems

### Performance Monitoring
- Page load times
- API response times
- Database query performance
- Third-party service availability
