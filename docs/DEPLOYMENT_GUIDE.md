# EchoSense Deployment Guide

## Overview

This guide covers the complete deployment process for EchoSense, from development to production. The application is designed to be deployed as a modern web application with multiple service integrations.

## Prerequisites

### Required Services
1. **Supabase Account** - Database and authentication
2. **OpenAI API Key** - AI analysis capabilities
3. **Stripe Account** - Payment processing (optional)
4. **Pinata Account** - IPFS storage (optional)
5. **Domain Name** - For production deployment

### Development Environment
- Node.js 18+ 
- npm or yarn
- Git
- Modern web browser

## Environment Configuration

### 1. Create Environment Files

Create `.env` file in the project root:

```bash
# OpenAI Configuration (Required)
VITE_OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration (Optional - for premium features)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Pinata Configuration (Optional - for IPFS storage)
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key
```

### 2. Supabase Setup

#### Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  stripe_customer_id TEXT,
  subscription_id TEXT,
  daily_recordings_count INTEGER DEFAULT 0,
  total_recordings INTEGER DEFAULT 0,
  species_discovered INTEGER DEFAULT 0,
  research_contributions INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{"location_sharing": false, "research_contribution": false, "notifications": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recordings table
CREATE TABLE recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  identified_species TEXT NOT NULL,
  call_type TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  behavioral_insight TEXT,
  location TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public_contribution BOOLEAN DEFAULT FALSE,
  alternative_species TEXT[],
  acoustic_features TEXT,
  time_of_day TEXT,
  habitat TEXT,
  transcription TEXT,
  ipfs_hash TEXT,
  metadata_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for recordings
CREATE POLICY "Users can view own recordings" ON recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings" ON recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings" ON recordings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings" ON recordings
  FOR DELETE USING (auth.uid() = user_id);

-- Public recordings can be viewed by anyone (for research)
CREATE POLICY "Public recordings are viewable by all" ON recordings
  FOR SELECT USING (is_public_contribution = true);

-- Create indexes for performance
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX idx_recordings_species ON recordings(identified_species);
CREATE INDEX idx_recordings_public ON recordings(is_public_contribution) WHERE is_public_contribution = true;
CREATE INDEX idx_profiles_subscription ON profiles(subscription_status);

-- Create function to automatically create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update daily recording count
CREATE OR REPLACE FUNCTION public.update_daily_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset daily count if it's a new day
  UPDATE profiles 
  SET daily_recordings_count = CASE 
    WHEN DATE(updated_at) < CURRENT_DATE THEN 1
    ELSE daily_recordings_count + 1
  END,
  total_recordings = total_recordings + 1,
  updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for recording count
CREATE TRIGGER on_recording_created
  AFTER INSERT ON recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_count();
```

#### Storage Setup (Optional)
If you want to store audio files in Supabase Storage:

```sql
-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', false);

-- Create storage policy
CREATE POLICY "Users can upload own audio files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy to Vercel**
```bash
# Build the project
npm run build

# Deploy
vercel --prod
```

3. **Configure Environment Variables**
In Vercel dashboard, add all environment variables from your `.env` file.

4. **Custom Domain** (Optional)
Configure your custom domain in Vercel dashboard.

### Option 2: Netlify

1. **Build Command**
```bash
npm run build
```

2. **Publish Directory**
```
dist
```

3. **Environment Variables**
Add all environment variables in Netlify dashboard.

4. **Redirects Configuration**
Create `public/_redirects` file:
```
/*    /index.html   200
```

### Option 3: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

3. **Build and Run**
```bash
docker build -t echosense .
docker run -p 80:80 echosense
```

## Production Optimizations

### 1. Performance
- Enable gzip compression
- Configure CDN for static assets
- Implement service worker for offline functionality
- Optimize images and audio files

### 2. Security
- Configure HTTPS/SSL
- Set up proper CORS headers
- Implement rate limiting
- Use environment variables for all secrets

### 3. Monitoring
- Set up error tracking (Sentry)
- Configure analytics (Google Analytics)
- Monitor API usage and costs
- Set up uptime monitoring

## Environment-Specific Configurations

### Development
```bash
# .env.development
VITE_OPENAI_API_KEY=sk-test-key
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

### Staging
```bash
# .env.staging
VITE_OPENAI_API_KEY=sk-staging-key
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
```

### Production
```bash
# .env.production
VITE_OPENAI_API_KEY=sk-prod-key
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

## Post-Deployment Checklist

### Functionality Testing
- [ ] User registration and login
- [ ] Audio recording and playback
- [ ] AI analysis integration
- [ ] Spectrogram visualization (premium)
- [ ] Payment processing (if enabled)
- [ ] IPFS storage (if enabled)
- [ ] Mobile responsiveness

### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Audio processing performance
- [ ] Database query optimization
- [ ] API response times

### Security Testing
- [ ] HTTPS configuration
- [ ] Authentication flows
- [ ] Data privacy compliance
- [ ] API key security

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring
- [ ] API usage monitoring
- [ ] Uptime monitoring

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify rate limits
   - Monitor usage quotas

2. **Supabase Connection Issues**
   - Verify URL and keys
   - Check RLS policies
   - Monitor connection limits

3. **Audio Recording Problems**
   - Check browser permissions
   - Verify HTTPS requirement
   - Test microphone access

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)

## Maintenance

### Regular Tasks
- Monitor API usage and costs
- Update dependencies monthly
- Review and rotate API keys quarterly
- Backup database regularly
- Monitor error rates and performance

### Scaling Considerations
- Database connection pooling
- CDN implementation
- Load balancing for high traffic
- Caching strategies
- Background job processing

This deployment guide ensures a robust, scalable, and secure deployment of the EchoSense application.
