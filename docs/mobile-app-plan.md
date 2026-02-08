# Expo/React Native Mobile App — Monorepo Setup

## Context

Event Empower currently exists as a web-only app (React + Vite frontend, Express backend). The goal is to build native iOS/Android apps using **Expo/React Native** in a **monorepo** structure, covering **both** the guest-facing experience (RSVP, shared story, vendor browsing) and the planner experience (dashboard, todos, expenses, vendor management, couple story editor).

The existing backend API stays unchanged — the mobile app will consume the same REST endpoints. The main architectural challenge is adapting the web auth flow (httpOnly cookies for refresh tokens) to work on native, and extracting shared types/logic into a reusable package.

---

## Monorepo Structure

```
event-empower/
├── apps/
│   ├── web/                    ← Current frontend (moved from root)
│   │   ├── src/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── mobile/                 ← New Expo app
│       ├── app/                ← Expo Router file-based routing
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── constants/
│       ├── app.json
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/                 ← Shared types & API service logic
│       ├── src/
│       │   ├── types/          ← User, Vendor, Story, Event types
│       │   └── api/            ← Platform-agnostic API client + services
│       ├── tsconfig.json
│       └── package.json
├── backend/                    ← Unchanged
├── package.json                ← Workspace root (npm workspaces)
└── tsconfig.base.json          ← Shared TS config
```

---

## Step 1: Monorepo Workspace Setup

**Files to create/modify:**

### Root `package.json`
- Add `"workspaces": ["apps/*", "packages/*", "backend"]`
- Move current devDependencies (vite, eslint, tailwind, etc.) to `apps/web/package.json`
- Root keeps only workspace-level scripts

### Move web app to `apps/web/`
- Move all frontend files: `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `eslint.config.js`, `components.json`
- Move frontend dependencies to `apps/web/package.json`
- Update `vite.config.ts` path alias: `@/` → `path.resolve(__dirname, './src')`
- Add `"@event-empower/shared": "workspace:*"` dependency
- Root retains `backend/` in place (already a subdirectory)

### Create `tsconfig.base.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## Step 2: Shared Package (`packages/shared`)

**Extract from `apps/web/src/services/`:**

### `packages/shared/src/types/index.ts`
Extract and re-export all shared types currently scattered across web service files:
- `AuthUser`, `UserType`, `LoginCredentials`, `RegisterCredentials` (from `authService.ts`)
- `VendorProfile`, `VendorSearchParams` (from `vendorService.ts`)
- `CoupleStory`, `FaqItem`, `WeddingPartyMember`, etc. (from `storyService.ts`)
- API response type `ApiResponse<T>` (from `client.ts`)

### `packages/shared/src/api/client.ts`
Platform-agnostic API client:
- Abstract token storage into an interface:
  ```ts
  interface TokenStorage {
    getRefreshToken(): Promise<string | null>;
    setRefreshToken(token: string | null): Promise<void>;
    clearAll(): Promise<void>;
  }
  ```
- **Web implementation**: Uses `credentials: 'include'` (cookie-based, current behavior)
- **Mobile implementation**: Uses `expo-secure-store` to store/retrieve refresh token, sends it as a request body field to `/auth/refresh`
- The `createApiClient(storage: TokenStorage, baseUrl: string)` factory creates the client

### `packages/shared/src/api/services/`
Move service functions (authService, vendorService, storyService, etc.) here, parameterized by the api client instance. Exception: `vendorService.uploadVendorImage` stays web-only (uses browser `File` API).

### `packages/shared/package.json`
```json
{
  "name": "@event-empower/shared",
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {}
}
```

---

## Step 3: Backend Auth Adaptation

The current refresh token flow relies on httpOnly cookies (`credentials: 'include'`). React Native does not support httpOnly cookies reliably.

**Add a new refresh endpoint variant** in `backend/src/routes/authRoutes.ts`:
- `POST /auth/refresh-token` — accepts `{ refreshToken }` in the request body (in addition to the existing cookie-based `/auth/refresh`)
- The handler reuses the same `authService.refreshToken()` logic
- Mobile sends the refresh token from SecureStore in the body; web continues using cookies
- No changes to the existing web flow

---

## Step 4: Expo App Initialization

### Create the Expo app
```bash
cd apps
npx create-expo-app mobile --template tabs
```

### Key dependencies
- `expo-router` — file-based navigation (already in tabs template)
- `expo-secure-store` — secure refresh token storage
- `nativewind` + `tailwindcss` — use Tailwind-like styling (familiar from web)
- `@tanstack/react-query` — same data fetching pattern as web
- `react-hook-form` + `zod` — same form pattern as web
- `expo-image` — optimized image loading
- `expo-linking` — deep links (for shared story URLs)
- `@event-empower/shared` — shared types and API client

### `app.json` config
- `scheme: "eventempower"` (deep linking)
- `plugins: ["expo-router", "expo-secure-store"]`

---

## Step 5: Mobile Navigation Structure

Using Expo Router (file-based routing):

```
apps/mobile/app/
├── _layout.tsx                 ← Root layout (QueryClientProvider, AuthProvider)
├── (auth)/                     ← Auth group (unauthenticated)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── phone-login.tsx
├── (tabs)/                     ← Main tab navigator (authenticated)
│   ├── _layout.tsx             ← Tab bar config
│   ├── index.tsx               ← Home / Dashboard
│   ├── vendors/
│   │   ├── index.tsx           ← Vendor directory
│   │   └── [id].tsx            ← Vendor detail
│   ├── planning/
│   │   ├── index.tsx           ← Planner home
│   │   ├── todos.tsx           ← Todo lists
│   │   ├── expenses.tsx        ← Expense tracker
│   │   └── calendar.tsx        ← Calendar
│   ├── story/
│   │   ├── index.tsx           ← Couple story view/edit
│   │   └── preview.tsx         ← Story preview
│   └── profile/
│       └── index.tsx           ← User profile & settings
├── shared-story/
│   └── [slug].tsx              ← Public shared story (deep link target)
└── rsvp/
    └── [code].tsx              ← RSVP page (deep link target)
```

### Tab bar (4 tabs)
1. **Home** — Dashboard with wedding countdown, quick stats, recent activity
2. **Vendors** — Browse, search, filter vendors; view details; send inquiries
3. **Planning** — Todo lists, expense tracker, calendar (sub-navigation)
4. **Story** — View/edit couple story, manage sections

---

## Step 6: Mobile Auth Flow

### `apps/mobile/services/auth.ts`
- On login success: store refresh token in `expo-secure-store`, access token in memory
- On app launch: check SecureStore for refresh token → call `/auth/refresh-token` with body → get new access token
- On 401: same retry logic as web, but sends refresh token from SecureStore in body
- On logout: clear SecureStore + clear in-memory token

### `apps/mobile/context/AuthContext.tsx`
- Same shape as web's `AuthContext` (`user`, `isLoading`, `isAuthenticated`, `login`, `register`, `logout`)
- Uses mobile-specific token storage under the hood

---

## Step 7: Mobile UI Components

### Styling: NativeWind (Tailwind for RN)
- Familiar syntax for team already using Tailwind on web
- `className` prop on RN components
- Separate `tailwind.config.ts` for mobile (can share color tokens from shared package)

### Core components to build
| Component | Purpose |
|-----------|---------|
| `Button` | Themed pressable with variants |
| `Input` | Text input with label, error state |
| `Card` | Rounded container with shadow |
| `Avatar` | User/vendor avatar with fallback |
| `Badge` | Status/category badges |
| `BottomSheet` | Modal-like sliding panel (for filters, actions) |
| `ImagePicker` | Camera/gallery selection wrapper |
| `LoadingScreen` | Full-screen skeleton/spinner |

### Key differences from web
- No hover effects (touch-only)
- Bottom sheet instead of modal dialogs
- Pull-to-refresh on lists
- Native image picker instead of `<input type="file">`
- Platform-specific status bar handling
- Safe area insets (notch/dynamic island)

---

## Step 8: Screen Implementation Priority

### Phase A — Auth + Core Navigation
1. Login screen (email/password + Google + phone)
2. Register screen
3. Tab navigation with placeholder screens
4. Auth persistence (SecureStore)

### Phase B — Guest Experience
5. Vendor directory (list + search + filters)
6. Vendor detail (gallery, reviews, inquiry form)
7. Shared story viewer (deep link)
8. RSVP page (deep link)

### Phase C — Planner Experience
9. Dashboard (countdown, stats, recent activity)
10. Todo lists (CRUD, drag-to-reorder)
11. Expense tracker (add/edit expenses, summary charts)
12. Calendar view

### Phase D — Story & Media
13. Couple story viewer
14. Section editor (basic text editing)
15. Image upload (gallery + camera)
16. Story sharing (native share sheet)

---

## Files Modified/Created Summary

| File | Action |
|------|--------|
| `package.json` (root) | Add workspaces, simplify |
| `tsconfig.base.json` | Create shared TS base config |
| `apps/web/` | Move entire frontend here |
| `apps/web/package.json` | Frontend-specific deps |
| `apps/web/vite.config.ts` | Update paths |
| `packages/shared/package.json` | Create shared package |
| `packages/shared/src/types/` | Extract shared types |
| `packages/shared/src/api/client.ts` | Platform-agnostic API client |
| `packages/shared/src/api/services/` | Extract service functions |
| `apps/mobile/` | New Expo app (entire directory) |
| `apps/mobile/app/` | Expo Router screens |
| `apps/mobile/services/auth.ts` | Mobile auth with SecureStore |
| `apps/mobile/context/AuthContext.tsx` | Mobile auth context |
| `backend/src/routes/authRoutes.ts` | Add body-based refresh endpoint |
| `backend/src/controllers/authController.ts` | Add refresh-token handler |

---

## Verification

1. **Web still works**: After monorepo restructure, `cd apps/web && npm run dev` serves the web app correctly
2. **Shared package**: `cd packages/shared && npx tsc --noEmit` — no errors
3. **Mobile builds**: `cd apps/mobile && npx expo start` — app launches in simulator
4. **Auth flow**: Login on mobile → tokens stored in SecureStore → app restart maintains session
5. **API calls**: Mobile vendor list loads from same backend API
6. **Deep links**: `eventempower://shared-story/slug` opens the shared story screen
