# GapLogic Mobile App - Setup & Deployment Guide

## Overview
GapLogic has been architected as a responsive web app with a dedicated React Native mobile application for iOS and Android. Both share the same business logic and data storage layer.

## Project Structure

```
gaplogic/
├── src/                    # Shared web + mobile business logic
│   ├── lib/               # Shared utilities, contexts, schemas
│   │   ├── SessionContext.tsx
│   │   ├── DataContext.tsx
│   │   ├── database-schema.ts
│   │   └── ai-feedback.ts
│   └── ...
├── (web app)              # Next.js web application
├── mobile/                # React Native mobile app
│   ├── app/              # Expo Router navigation
│   ├── components/       # Mobile-specific components
│   └── package.json
└── README.md
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS) or Android Studio (for Android)
- EAS CLI: `npm install -g eas-cli`

### Setup Mobile App Locally

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (testing)
npm run web
```

## Database Integration

### Current Setup (Local Storage)
- Uses browser/phone localStorage for persistence
- User data stored in JSON format
- Perfect for MVP and testing

### Upgrade to PostgreSQL/Railway

When ready to use cloud database:

1. **Get Railway PostgreSQL credentials:**
   - Sign up at [railway.app](https://railway.app)
   - Create PostgreSQL database
   - Copy connection string

2. **Create .env file:**
```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Implement API routes:**
```typescript
// pages/api/intentions.ts
import { db } from '@/lib/db-connection';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const intentions = await db.query('SELECT * FROM intentions WHERE user_id = $1', [req.user.id]);
    return res.json(intentions.rows);
  }
  // POST, PUT, DELETE handlers...
}
```

4. **Update DataContext to use API:**
```typescript
// Instead of localStorage
const loadData = async () => {
  const [intentions, logs] = await Promise.all([
    fetch('/api/intentions').then(r => r.json()),
    fetch('/api/logs').then(r => r.json())
  ]);
  setIntentions(intentions);
  setLogs(logs);
};
```

## Mobile App Deployment

### iOS Deployment (App Store)

```bash
cd mobile

# Build
eas build --platform ios --auto-submit

# After build completes, review in Apple App Store Connect
# - Add screenshots
# - Add description
# - Set pricing
# - Submit for review
```

### Android Deployment (Google Play)

```bash
cd mobile

# Build
eas build --platform android --auto-submit

# After build completes, upload to Google Play Console
# - Add screenshots
# - Add description
# - Set pricing
# - Roll out gradually
```

### Web Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy --prod

# Or deploy to Railway
railway deploy
```

## Environment Setup by Platform

### iOS (Xcode)
1. `eas build --platform ios --local` (build locally)
2. Open `.ipa` in Xcode
3. Test on simulator: `npm run ios`

### Android (Android Studio)
1. `eas build --platform android --local`
2. Open `.apk` with Android Studio
3. Test on emulator: `npm run android`

### Web (Browser)
1. Works on all modern browsers
2. Responsive design adapts to all screen sizes
3. PWA support for offline usage

## Performance Optimizations

### Mobile-specific:
- Image optimization for slower connections
- Lazy loading of charts and data
- Background sync for data persistence
- Minimal bundle size (target: <5MB)

### Web-specific:
- Next.js optimizations (code splitting, image optimization)
- CSS-in-JS minification
- Static generation where possible

## Architecture Notes

### Responsive Design
- **Mobile-first approach** using React Native + Tailwind CSS
- **Breakpoints:**
  - Mobile: < 640px (handled by React Native)
  - Tablet: 640px - 1024px (md breakpoint)
  - Desktop: > 1024px (lg breakpoint)

### Shared Code
- `SessionContext`: User authentication (web + mobile)
- `DataContext`: Data loading and caching
- `ai-feedback.ts`: AI insights generation
- `database-schema.ts`: Type definitions for all entities

### Data Sync
- Conflicts resolved by "latest write wins"
- Periodic sync in background on mobile
- Real-time updates with WebSockets (optional upgrade)

## Testing Mobile

### Using Expo Go (Easiest)
```bash
cd mobile
npm start
# Scan QR code with Expo Go app on physical device
```

### Using Local Build
```bash
# iOS
npm run ios

# Android
npm run android
```

### Testing Web Responsive Design
```bash
# Chrome DevTools
# Device toolbar (Ctrl+Shift+M on Windows/Linux, Cmd+Shift+M on Mac)
# Test at: iPhone 12, iPad, Desktop
```

## Production Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Error logging set up (Sentry recommended)
- [ ] Analytics configured (PostHog/Mixpanel)
- [ ] App icons created (all sizes)
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] Build for production tested
- [ ] App submission credentials ready

## Monitoring & Analytics

### Recommended Services:
- **Error Tracking:** Sentry
- **Analytics:** PostHog or Mixpanel
- **Performance:** Vercel Analytics
- **Database:** Railway dashboard

## Support & Documentation

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Railway Documentation](https://docs.railway.app)

## Future Enhancements

1. **Push Notifications** - Remind users to log sessions
2. **Apple Health Integration** - Sync with Health app
3. **Google Fit Integration** - Sync with Google Fit
4. **Cloud Backup** - Automatic backup to cloud storage
5. **Collaborative Goals** - Share and track group goals
6. **Advanced AI** - GPT-4 powered insights
7. **Wearable Integration** - Apple Watch, Fitbit support

---

**Last Updated:** May 19, 2026
**Maintainer:** GapLogic Team
