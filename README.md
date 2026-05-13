# CarePaws (lykasUser) — Branch 2.0 Documentation

> **Repository:** [Kernharu58/lykasUser @ 2.0](https://github.com/Kernharu58/lykasUser/tree/2.0)
> **App Name:** CarePaws
> **Package ID:** `com.kernharu.carepaws`
> **Platform:** iOS & Android (React Native / Expo)
> **Location context:** Angeles City, Pampanga, Philippines

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Architecture](#architecture)
7. [Screens & Navigation](#screens--navigation)
8. [Authentication](#authentication)
9. [API Layer](#api-layer)
10. [Real-Time Chat](#real-time-chat)
11. [Key Components](#key-components)
12. [State Management](#state-management)
13. [Styling](#styling)
14. [Build & Deployment](#build--deployment)

---

## Overview

CarePaws is a mobile application built with Expo and React Native that connects animal lovers with a local pet shelter — Happy Paws Shelter. It enables users to:

- **Browse and adopt pets** — Search available animals by name or breed, view full profiles, and submit adoption applications.
- **Volunteer** — Enroll in shelter volunteer appointments and track upcoming shifts.
- **Donate** — Record and submit manual payment donations to support the shelter. No online payment gateway; donations are logged manually and verified by shelter staff.
- **Chat in real time** — Message the shelter directly via a Socket.io-powered chat with quick-reply shortcuts.
- **Manage their account** — Saved favorites, adopted pets, appointment history, and profile settings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK ~54 |
| Mobile runtime | React Native 0.81.5 |
| Language | TypeScript ~5.9 |
| Navigation | [Expo Router](https://expo.github.io/router) ~6 (file-based routing) |
| Styling | [NativeWind](https://www.nativewind.dev/) ^4 (Tailwind CSS for RN) |
| HTTP client | Axios ^1.14 |
| Real-time | Socket.IO Client ^4.8 |
| Auth storage | expo-secure-store (JWT tokens) |
| Social auth | expo-auth-session (Google OAuth 2.0) |
| Image picking | expo-image-picker |
| Push notifications | expo-notifications |
| Backend (external) | Express.js + MongoDB (hosted on Render) |

---

## Project Structure

```
lykasUser/
├── app/                          # All screens (Expo Router file-based routing)
│   ├── _layout.tsx               # Root layout — wraps app in AuthProvider, declares all routes
│   ├── globals.css               # Global CSS (NativeWind / Tailwind)
│   ├── +not-found.tsx            # 404 fallback screen
│   │
│   ├── (auth)/                   # Unauthenticated screens (no tab bar)
│   │   ├── _layout.tsx
│   │   ├── logIn.tsx             # Email + Google login
│   │   └── signUp.tsx            # New account registration
│   │
│   ├── (tabs)/                   # Main authenticated tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # Home — dashboard & community impact
│   │   ├── adopt.tsx             # Pet listing with search & filter
│   │   ├── chat.tsx              # Real-time shelter chat
│   │   └── settings.tsx          # Account settings & theme toggle
│   │
│   ├── pets/
│   │   ├── [id].tsx              # Individual pet profile
│   │   └── apply/[id].tsx        # Adoption application form
│   │
│   ├── appointments/
│   │   ├── index.tsx             # Browse volunteer appointments
│   │   └── apply/[id].tsx        # Enroll in an appointment
│   │
│   ├── donate.tsx                # Manual Payment Recording modal
│   ├── verify-identity.tsx       # User identity verification (ID upload)
│   ├── favorites.tsx             # Saved/favorited pets
│   ├── forgot-password.tsx       # Forgot password flow
│   ├── verify-email.tsx          # Email verification
│   ├── reset-password.tsx        # Reset password screen
│   └── my-pets.tsx               # Pets the user has adopted
│
├── components/
│   ├── PetCard.tsx               # Reusable pet listing card
│   ├── AppointmentCard.tsx       # Reusable appointment card
│   ├── ChatMessage.tsx           # Individual chat bubble
│   ├── TypingIndicator.tsx       # Animated typing dots
│   └── PrimaryButton.tsx         # Shared button component
│
├── context/
│   └── AuthContext.tsx           # Auth state + routing guard
│
├── utils/
│   └── api.ts                    # Axios instance, interceptors, helpers
│
├── assets/
│   └── lykas/
│       ├── carePawLogo.jpg
│       └── carePawLogo1.jpg
│
├── app.json                      # Expo config (name, bundle IDs, plugins)
├── package.json
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── .env                          # Environment variables (not committed to production)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Expo CLI (`npm install -g expo`)
- Expo Go app on your phone, or an Android/iOS emulator

### Installation

```bash
# Clone the repository and switch to the 2.0 branch
git clone https://github.com/Kernharu58/lykasUser.git
cd lykasUser
git checkout 2.0

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
# (Edit .env — see Environment Variables section below)
```

### Running the App

```bash
# Start Expo dev server
npm start
# or
npx expo start

# Platform-specific launchers
npm run android   # Run on Android emulator / device
npm run ios       # Run on iOS simulator / device
npm run web       # Run in browser (limited support)
```

### Resetting the Project

```bash
npm run reset-project
# Moves starter code to app-example/ and creates a clean app/ directory
```

---

## Environment Variables

Create a `.env` file at the project root with the following keys:

```env
# Google OAuth Client IDs (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<your-web-client-id>
EXPO_PUBLIC_ANDROID_CLIENT_ID=<your-android-client-id>
EXPO_PUBLIC_IOS_CLIENT_ID=<your-ios-client-id>

# Backend API base URL
EXPO_PUBLIC_API_URL=https://lykasserver.onrender.com/api
```

> All variables prefixed with `EXPO_PUBLIC_` are exposed to the client bundle. Never place secret keys in these variables.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              CarePaws Mobile App             │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Auth     │  │  Tabs    │  │  Modals   │ │
│  │ Screens  │  │ (4 tabs) │  │ (donate,  │ │
│  │          │  │          │  │  apply)   │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           AuthContext               │    │
│  │  • JWT token stored in SecureStore  │    │
│  │  • Route guard (auth vs. tabs)      │    │
│  │  • User data hydrated on startup    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │           utils/api.ts              │    │
│  │  • Axios instance                   │    │
│  │  • Request interceptor adds JWT     │    │
│  │  • Response interceptor handles 401 │    │
│  │  • Exponential-backoff registration │    │
│  └─────────────────────────────────────┘    │
└───────────────────┬─────────────────────────┘
                    │ HTTPS (REST + Socket.IO)
                    ▼
┌─────────────────────────────────────────────┐
│   Backend: lykasserver.onrender.com         │
│   Express.js + MongoDB                      │
│                                             │
│   /api/auth        Authentication routes    │
│   /api/pets        Pet CRUD                 │
│   /api/appointments  Volunteer scheduling   │
│   /api/messages    Chat history             │
│   /api/...         Other endpoints          │
└─────────────────────────────────────────────┘
```

### Key Design Decisions

- **File-based routing** via Expo Router means every `.tsx` file inside `app/` automatically becomes a route. Route groups like `(auth)` and `(tabs)` are layout groups that don't appear in the URL.
- **JWT tokens stored in `expo-secure-store`** — the platform's encrypted keychain, not AsyncStorage — for security.
- **All API requests are intercepted** to automatically attach the JWT header, and 401 responses clear local auth state and redirect to login.
- **Socket.IO** is used exclusively for real-time chat with the shelter; all other data fetching uses REST via Axios.
- **NativeWind** (Tailwind for React Native) is used for all styling — no StyleSheet objects; classes are declared directly on components.

---

## Screens & Navigation

### Route Map

```
/                      → (auth) group redirect or (tabs) depending on auth state
├── (auth)/logIn       → Login screen (email/password or Google)
├── (auth)/signUp      → Registration screen
├── forgot-password    → Forgot password
├── verify-email       → Email verification
├── reset-password     → Password reset
│
├── (tabs)/            → Home — dashboard (next appointment, community impact)
├── (tabs)/adopt       → Adopt — pet browser with search & category filter
├── (tabs)/chat        → Chat — real-time shelter messaging
├── (tabs)/settings    → Settings — theme, profile, logout
│
├── pets/[id]          → Pet profile detail page
├── pets/apply/[id]    → Adoption application form
│
├── appointments/      → Browse volunteer appointments
├── appointments/apply/[id] → Enroll in a specific appointment
│
├── favorites          → User's favorited pets
├── my-pets            → Pets the user has adopted
├── donate             → Manual Payment Recording modal (presented as modal)
└── verify-identity    → User identity verification screen (ID upload)
```

### Home Screen (`(tabs)/index.tsx`)

- Greets the user by first name fetched from `AuthContext`.
- **Community Impact card** — shows shelter capacity status with Donate and Volunteer CTAs.
- **Current Appointment widget** — fetches `/appointments/my-appointments`, filters by future dates, and displays the nearest upcoming shift. Shows an empty state with a "Find a shift" link when none exist.
- Location: Angeles City, Pampanga.

### Adopt Screen (`(tabs)/adopt.tsx`)

- Fetches all available pets from `/pets` on screen focus via `useFocusEffect`.
- **Real-time search** with typeahead suggestion dropdown (max 4 suggestions) filtering by `name` and `breed`.
- **Category filter** — selecting a category re-triggers the API call with a `category` query param (the value `"All"` is stripped before the request).
- Pull-to-refresh support.
- Each pet is rendered as a `<PetCard>` that navigates to the detail page.

### Pet Detail Screen (`pets/[id].tsx`)

- Fetches `/pets/:id` by the dynamic route parameter.
- Displays a hero image, name, breed, age, gender, weight, health status, and description.
- **Favorite toggle** — calls `/auth/favorites/:id`.
- **Apply for Adoption** button — routes to `/pets/apply/:id`.
- **Calendar icon** — shortcuts to the appointments screen.

### Chat Screen (`(tabs)/chat.tsx`)

See [Real-Time Chat](#real-time-chat) section for full details.

### Settings Screen (`(tabs)/settings.tsx`)

- Dark mode / light mode toggle persisted via `AsyncStorage` (`appTheme` key).
- Logout button calls `AuthContext.logout()`, which:
  1. Calls `/auth/logout` to blacklist the token on the server.
  2. Deletes `userToken`, `userData`, `userName` from SecureStore.
  3. Navigates to `/(auth)/logIn`.

---

## Authentication

### Flow

```
App Start
  ↓
AuthProvider loads token from SecureStore
  ↓
  ├─ Token found → redirect to /(tabs)
  └─ No token   → redirect to /(auth)/logIn

Login Options:
  1. Email + Password → POST /auth/login → store JWT + user in SecureStore
  2. Google OAuth     → expo-auth-session → send id_token to backend → store JWT
```

### AuthContext API

`AuthContext` is consumed via the `useAuth()` hook. It exposes:

| Property | Type | Description |
|---|---|---|
| `userToken` | `string \| null` | The current JWT access token |
| `setUserToken` | `fn` | Manually update the token (used after login) |
| `user` | `object \| null` | The current user's profile data |
| `setUser` | `fn` | Manually update user data |
| `logout` | `async fn` | Full logout — clears storage, redirects |
| `isLoading` | `boolean` | True while auth state is being restored from SecureStore |
| `identityVerified` | `boolean` | True if admin has approved the user's government ID submission |
| `tokenSyncError` | `string \| null` | Error message if SecureStore read fails |

### Google OAuth

Uses `expo-auth-session`'s `Google.useAuthRequest()` with client IDs loaded from environment variables. The redirect URI scheme is `com.kernharu.carepaws:/oauth2redirect/google`.

After the user completes the OAuth flow, the `id_token` is sent to the backend which validates it and returns its own JWT.

### Password Authentication

- **Sign Up** (`signUp.tsx`): validates email format + strong password regex (min 8 chars, uppercase, lowercase, number, symbol) before calling `registerWithRetry()` which retries up to 3 times with exponential backoff.
- **Login** (`logIn.tsx`): standard email/password POST to `/auth/login`.
- **Forgot / Reset Password**: separate screens for the email-based reset flow.
- **Email Verification**: dedicated screen for verifying the user's email after registration.
- **Identity Verification**: users upload a government-issued ID via `verify-identity.tsx` before submitting an adoption application. The `identityVerified` flag on the user object (returned from `/auth/me`) controls access to adoption features.

---

## API Layer

All API calls go through the singleton Axios instance exported from `utils/api.ts`.

### Base URL

```ts
const getBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_URL ?? "https://lykasserver.onrender.com";
```

### Request Interceptor

Before every request, the interceptor:
1. Reads `userToken` from `expo-secure-store`.
2. Attaches it as `Authorization: Bearer <token>`.

### Response Interceptor

| Status | Action |
|---|---|
| `200-299` | Pass through, log success |
| `400` | Log validation details |
| `401` | Clear SecureStore auth data (AuthContext handles redirect) |
| `409` | Log conflict (duplicate user/resource) |
| `500` | Log server error |
| Network error | Log unreachable server |

### Notable Exported Functions

```ts
// Fetch pets with optional category and search filters
export const getPets = async (filters?: { category?: string; search?: string }) => { ... }

// Register with automatic retry (exponential back-off, max 3 attempts)
// Does NOT retry on 400, 409, or 429 status codes
export const registerWithRetry = async (data: any, maxRetries = 3) => { ... }

// Default export — the configured Axios instance
export default api;
```

### API Endpoints Used by the App

| Method | Path | Screen |
|---|---|---|
| `POST` | `/auth/register` | Sign Up |
| `POST` | `/auth/login` | Log In |
| `POST` | `/auth/google` | Log In (Google) |
| `POST` | `/auth/logout` | Settings / logout |
| `POST` | `/auth/favorites/:id` | Pet Detail (favorite toggle) |
| `POST` | `/donations` | Manual Payment Recording modal |
| `POST` | `/auth/verify-identity` | Identity Verification screen |
| `GET` | `/pets` | Adopt screen |
| `GET` | `/pets/:id` | Pet Detail |
| `POST` | `/pets/:id/adopt` | Pet Detail |
| `GET` | `/pets/my-pets` | My Pets screen |
| `GET` | `/appointments` | Appointments screen |
| `GET` | `/appointments/my-appointments` | Home (next shift) |
| `GET` | `/messages/:userId` | Chat (history) |

---

## Real-Time Chat

The Chat screen (`(tabs)/chat.tsx`) connects to the backend via **Socket.IO**.

### Connection

```ts
const SOCKET_URL = api.defaults.baseURL?.replace("/api", "");

socketRef.current = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  auth: { token },   // JWT passed in handshake
});
```

### Events

| Direction | Event | Payload |
|---|---|---|
| Emit (client → server) | `joinRoom` | `userId` |
| Emit (client → server) | `sendMessage` | `{ userId, text }` |
| Listen (server → client) | `receiveMessage` | Full message object |

### Features

- **Message history** is fetched once on mount via `GET /messages/:userId`.
- **Deduplication** — incoming messages are only appended if their `_id` doesn't already exist in state.
- **Typing indicator** — `<TypingIndicator>` is shown as the FlatList footer while the bot is composing.
- **Quick Replies** — three preset prompts (schedule a visit, adoption fees, see all dogs) displayed as horizontal chips above the input box.
- **Keyboard avoidance** — uses `KeyboardAvoidingView` with platform-specific behavior (`"padding"` on iOS).

---

## Key Components

### `PetCard`

Renders a pet in the Adopt listing grid.

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | Pet's MongoDB `_id` |
| `name` | `string` | Pet name |
| `breed` | `string` | Breed description |
| `image` | `string` | Image URL |
| `status` | `string` | e.g., `"Available"`, `"Adopted"` |

Tapping navigates to `pets/[id]`.

### `AppointmentCard`

Renders a single volunteer appointment slot.

### `ChatMessage`

Renders a single chat bubble. Differentiates between user messages and shelter (admin) responses using the `sender` field.

### `TypingIndicator`

Animated three-dot indicator shown while the shelter is typing.

### `PrimaryButton`

Reusable button component with a consistent primary style.

---

## State Management

The app uses **React Context** for global state. There is no Redux or Zustand.

| Store | Location | Responsibility |
|---|---|---|
| Auth state | `context/AuthContext.tsx` | JWT token, user object, loading, routing guard |
| Theme | `AsyncStorage` (`appTheme`) | Light / dark mode preference |
| Screen-local state | `useState` per screen | Lists, loading flags, form inputs |

### AuthContext Routing Guard

The guard runs in a `useEffect` that watches `userToken`, `segments`, and `isLoading`:

- If the user **has a token** and is on an auth screen → replace with `/(tabs)`.
- If the user **has no token** and is not on an auth screen → replace with `/(auth)/logIn`.
- Guard is dormant while `isLoading` is true or the navigation state hasn't mounted yet.

---

## Styling

CarePaws uses **NativeWind v4** — Tailwind CSS utility classes applied directly to React Native components.

### Custom Theme Colors

Defined in `tailwind.config.js`:

| Token | Usage |
|---|---|
| `primary` | Main green (`#2D6A4F`) — buttons, icons, links |
| `darkBlue` | Heading text (`#1B2A49`) |
| `neutral` | Subtext, labels |
| `warnBrown` | Accent / breed label (`#D08C60`) |

### Dark Mode

Dark mode is toggled via the `useColorScheme()` hook from NativeWind and persisted to `AsyncStorage`. Classes follow the Tailwind `dark:` prefix pattern (e.g., `dark:bg-gray-900`).

---

## Build & Deployment

The project is configured for [EAS (Expo Application Services)](https://expo.dev/eas).

### EAS Config (`eas.json`)

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    }
  }
}
```

### Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for Android (APK / AAB)
eas build --platform android

# Build for iOS (IPA)
eas build --platform ios

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

### OTA Updates

The app uses `expo-updates` with the EAS Update service:

```
Update URL: https://u.expo.dev/f34897a0-809a-4d0e-9fe8-62d4d56da546
Runtime version policy: appVersion
```

### App Identifiers

| Platform | Identifier |
|---|---|
| Android | `com.kernharu.carepaws` |
| iOS | `com.kernharu.carepaws` |
| EAS Project ID | `f34897a0-809a-4d0e-9fe8-62d4d56da546` |
| Expo owner | `kernharu` |

### Local Emulator Commands

```bash
npm run android   # Runs: expo run:android
npm run ios       # Runs: expo run:ios
npm run web       # Runs: expo start --web
npm run lint      # Runs: expo lint
```
