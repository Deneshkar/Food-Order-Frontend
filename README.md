# Food Order Frontend

A mobile frontend for a Food Order Management System built with Expo and React Native.

This app supports:
- Public browsing for guests
- Authentication (login/register)
- Role-based app flows for users and admins
- Menu, categories, cart, orders, payments, reviews, and profile management

## Tech Stack

- Expo SDK 55
- React 19
- React Native 0.83
- React Navigation (stack + bottom tabs)
- Axios (API client)
- AsyncStorage (session persistence)
- Expo Image Picker and custom upload helpers

## App Flows

### Public
- View public home content
- Browse categories and featured menu previews
- Navigate to login/register

### User
- Home, Menu, Cart, Orders, Profile
- View menu details and order details
- Place and manage food orders

### Admin
- Dashboard
- Manage categories
- Manage menu items
- Manage orders
- Manage users
- Profile

## Project Structure

```text
src/
  api/            # API modules and shared axios client
  components/     # Reusable UI components
  context/        # Auth and cart providers
  hooks/          # Custom hooks
  navigation/     # App/auth/user/admin navigators
  screens/        # Screen modules grouped by role
  utils/          # Constants, helpers, and local storage helpers
```

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (optional if you use npx)
- Android Studio emulator, iOS simulator (macOS), or Expo Go on a physical device

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure API endpoint:

Create a `.env` file in the project root and set:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

If this variable is not set, the app falls back to the default value in `src/utils/constants.js`.

3. Start the app:

```bash
npm run start
```

4. Run on a platform:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

- `npm run start` - Start Expo dev server
- `npm run android` - Launch Android target
- `npm run ios` - Launch iOS target
- `npm run web` - Launch web target

## API Integration Notes

- Axios client is configured in `src/api/client.js`.
- Bearer token is attached via `setAuthToken` after authentication.
- Image payload helpers are included for multipart uploads.

## Authentication and Session

- Auth state is managed in `src/context/AuthContext.js`.
- Session token and user are persisted with AsyncStorage helpers.
- Navigation automatically switches between auth, user, and admin areas based on role.

## Troubleshooting

- If API requests fail, verify `EXPO_PUBLIC_API_URL` and backend availability.
- For device testing, use a LAN-accessible backend URL (not `localhost`) when needed.
- Clear Expo cache if stale behavior occurs:

```bash
npx expo start -c
```

## Security Notes

- Do not commit `.env` files.
- Keep secrets and private endpoints out of source control.

## License

This project is for educational and internal development use unless specified otherwise by the repository owner.
