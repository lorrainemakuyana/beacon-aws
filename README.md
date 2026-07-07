# Beacon Core Platform

A mobile-first volunteer operations platform that streamlines volunteer event management through real-time coordination, attendance tracking, and incident reporting.

**🆓 100% Free Tier Firebase Backend** - This project uses only Firebase's free backend services (Auth, Firestore, Storage). Host the web app on your preferred platform.

## Repository Structure

This is a monorepo containing the following packages:

```
/
├── mobile/                # React Native mobile app
│   ├── app/              # Expo Router screens
│   ├── components/       # React components
│   ├── firebase/         # Firebase config and services
│   │   ├── types/       # TypeScript interfaces
│   │   ├── services/    # Auth and data services
│   │   └── utils.ts     # Firebase utilities
│   └── package.json
├── web/                   # Next.js web dashboard
│   ├── src/
│   └── package.json
├── firebase/              # Firebase backend configuration
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   ├── storage.rules
│   └── firebase.json
└── package.json           # Root package.json for workspace management
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Firebase CLI** (for deployment): `npm install -g firebase-tools`
- **Java 11+** (for Firestore emulator)

### 1. Clone and Install

```bash
git clone <repository-url>
cd beacon-core-platform
npm install
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: `beacon-core-platform-dev`
3. Enable these services (all free):
   - **Authentication** → Email/Password
   - **Firestore Database** → Start in test mode
   - **Storage** → Start in test mode
   - **DO NOT enable Hosting** (you'll host the web app elsewhere)

#### Configure Firebase

The mobile app uses Firebase configuration in `mobile/firebase/config.ts`. Update this file with your Firebase project credentials from the Firebase Console.

### 3. Start Development

#### Option A: Full Stack Development

```bash
# Start Firebase emulators (recommended for development)
npm run firebase:emulators

# In another terminal, start the web dashboard
npm run dev:web

# In another terminal, start mobile development
npm run dev:mobile
```

#### Option B: Individual Services

```bash
# Web dashboard only
npm run dev:web

# Mobile app only
npm run dev:mobile

# Firebase emulators only
npm run firebase:emulators
```

### 4. Access the Applications

- **Firebase Emulator UI**: http://localhost:4000
- **Web Dashboard**: http://localhost:3000
- **Mobile App**: Use Expo Go app with QR code

## 🔧 Development Workflow

### Building

```bash
# Build all packages
npm run build

# Build web package
npm run build --workspace=web
```

### Testing

```bash
# Run all tests
npm run test

# Run tests for mobile
npm run test --workspace=mobile
```

### Linting

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚀 Deployment

### Deploy Firebase Backend (Free)

```bash
# Deploy Firestore rules and indexes (FREE)
npm run firebase:deploy
```

### Deploy Web App

Choose your preferred hosting platform:

**Vercel (Recommended for Next.js):**

```bash
cd web
npm install -g vercel
vercel
```

**Netlify:**

```bash
cd web
npm run build
# Upload 'out' folder to Netlify
```

**Railway:**

```bash
# Connect GitHub repo to Railway
```

**Other Options:**

- Render
- AWS Amplify
- DigitalOcean App Platform
- Cloudflare Pages

See [HOSTING.md](HOSTING.md) for detailed hosting guides.

### Deploy Mobile App

```bash
# Build for Expo
cd mobile
npm run build

# Deploy with Expo (free tier available)
npx expo publish
```

## 📱 Platform-Specific Setup

### Mobile Development (React Native + Expo)

```bash
cd mobile

# Install Expo CLI globally
npm install -g @expo/cli

# Start development server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Web Development (Next.js)

```bash
cd web

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## 🔥 Firebase Free Tier Limits

This project is designed to stay within these limits:

### Firestore Database

- **Reads**: 50,000/day
- **Writes**: 20,000/day
- **Deletes**: 20,000/day
- **Storage**: 1 GiB

### Authentication

- **Monthly Active Users**: 50,000

### Storage

- **Stored**: 5 GB
- **Downloaded**: 1 GB/day

### Hosting

- **Storage**: 10 GB
- **Transfer**: 360 MB/day

## 🏗️ Architecture

### Frontend

- **Mobile**: React Native with Expo
- **Web**: Next.js with React
- **State Management**: React Query + Zustand
- **UI**: Native Base (mobile), Chakra UI (web)

### Backend (100% Free)

- **Database**: Firestore (real-time, NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Business Logic**: Client-side (no Cloud Functions)

### Hosting (Your Choice)

- **Web App**: Vercel, Netlify, Railway, Render, AWS Amplify, etc.
- **Mobile App**: Expo, App Store, Google Play
- **Backend**: Firebase (free tier)

### Key Design Decisions

- **Self-contained platforms**: Mobile and web each have their own Firebase setup
- **No Cloud Functions**: All business logic runs client-side to avoid costs
- **No Firebase Hosting**: Host web app on your preferred platform
- **Security Rules**: Firestore rules handle authorization
- **Real-time Updates**: Firestore listeners for live data
- **Offline Support**: Built-in Firestore offline capabilities

## 🔒 Security

- **Firestore Rules**: Role-based access control
- **Authentication**: Firebase Auth with email/password
- **Client-side Validation**: Input validation and sanitization
- **Storage Rules**: File access control

## 🧪 Testing Strategy

- **Unit Tests**: Vitest for all packages
- **Integration Tests**: Firebase emulator testing
- **E2E Tests**: Playwright for web, Detox for mobile
- **Property-Based Tests**: fast-check for correctness properties

## 📊 Monitoring (Free)

- **Firebase Analytics**: User behavior and app performance
- **Crashlytics**: Crash reporting for mobile
- **Performance Monitoring**: Firebase Performance
- **Console Logging**: Built-in Firebase logging

## 🔧 Troubleshooting

### Common Issues

1. **Emulator Connection Issues**

   ```bash
   # Check if ports are available
   lsof -i :4000,5001,8080,9099,9199

   # Restart emulators
   npm run firebase:emulators:kill
   npm run firebase:emulators
   ```

2. **Build Errors**

   ```bash
   # Clean and rebuild
   npm run clean
   npm install
   npm run build
   ```

3. **Firebase Permission Errors**
   ```bash
   # Re-login to Firebase
   firebase logout
   firebase login
   ```

### Getting Help

- Check Firebase Console for detailed error logs
- Use Firebase emulator UI for debugging: http://localhost:4000
- Review Firestore security rules in Firebase Console

## 📄 License

Private - All rights reserved
