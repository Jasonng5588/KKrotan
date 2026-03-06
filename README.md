# KK Rotan Commerce Platform

A complete, production-ready full-stack e-commerce system for KK Rotan, providing a responsive web storefront, a Next.js admin dashboard, and a Flutter mobile app.

## Project Structure

- `web/` - Next.js 14 Web Application (Storefront + Admin Panel)
- `mobile/` - Flutter Mobile App
- `database/` - Supabase SQL Schema

## 1. Supabase Backend Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor**, and run the SQL script found in `database/schema.sql` to create all tables, policies, and triggers.
3. Once initialized, grab your **Project URL** and **Anon Key** from the Project Settings -> API.

## 2. Web & Admin Setup (Next.js)

1. Navigate to the `web` folder:
   ```bash
   cd web
   ```
2. Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. The storefront will be accessible at `http://localhost:3000`.
6. To access the admin panel at `http://localhost:3000/admin`, you must first register an account and then manually set the user's role to `admin` in your Supabase `profiles` table via the Supabase dashboard.

## 3. Mobile App Setup (Flutter)

1. Ensure you have the Flutter SDK installed.
2. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
3. Run the app, providing your Supabase credentials via Dart environment variables. For example:
   ```bash
   flutter run --dart-define=SUPABASE_URL=your_project_url --dart-define=SUPABASE_ANON_KEY=your_anon_key
   ```
   *Note: If you run without these arguments, the app will use placeholder URLs.*
4. To build a standalone APK, run:
   ```bash
   flutter build apk --dart-define=SUPABASE_URL=your_project_url --dart-define=SUPABASE_ANON_KEY=your_anon_key
   ```
   The APK will be generated at `build/app/outputs/flutter-apk/app-release.apk`.

## Deployment

### Next.js (Vercel)
The recommended way to deploy the Next.js application is via [Vercel](https://vercel.com).
1. Push your code to a GitHub repository.
2. Import the `web` folder as the Root Directory in Vercel.
3. Make sure the Framework Preset is set to `Next.js`.
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables.
5. Deploy.

### Flutter (Android/iOS)
- For Android: Use the `flutter build apk` or `flutter build appbundle` command and distribute via direct download or Google Play Store.
- For iOS: Use `flutter build ipa` and deploy via TestFlight/App Store (requires a Mac and Apple Developer Account).
