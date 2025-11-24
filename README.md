<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mbauni Protocol - Trade Hub

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Zh6QZqvi5qj8yPb6VUt_6nJPIR_QZeAd

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set your Supabase credentials in `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
4. Run the app:
   `npm run dev`

## Authentication Setup

This application uses Supabase for authentication with OTP (One-Time Password) email verification:

1. In your Supabase Dashboard, go to Authentication > Settings
2. Enable "Email Confirmations" 
3. Enable "Enable Email OTP"
4. In Authentication > Email Templates, customize the templates to use codes instead of links:

**Signup Confirmation Template:**
```html
<h2>Confirm your email</h2>
<p>Enter this code to confirm your account:</p>
<h1>{{ .Token }}</h1>
<p>This code expires in 24 hours.</p>
```

**Passwordless Login Template:**
```html
<h2>Login to Mbauni Protocol</h2>
<p>Enter this code to login to your account:</p>
<h1>{{ .Token }}</h1>
<p>This code expires in 24 hours.</p>
```

## Database Migrations

Run migrations with:
`npx supabase migration up`