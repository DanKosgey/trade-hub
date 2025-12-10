# App Name Configuration

This Trade Hub application is designed to be rebranded easily through environment variables. The app name is now fully customizable without requiring code changes.

## Configuration

### Environment Variables

Two environment variables control the app branding:

- **`VITE_APP_NAME`** - Full application name (default: "Mbauni Protocol")
  - Used in page titles, headers, and throughout the UI
  - Example: "MyTrading Protocol", "Elite Traders Hub"

- **`VITE_APP_SHORT_NAME`** - Short application name (default: "Mbauni")
  - Used in compact areas like sidebars
  - Example: "MyTrading", "Elite"

### Setting up Custom Names

1. **Update your `.env` file:**
   ```env
   VITE_APP_NAME=Your Custom App Name
   VITE_APP_SHORT_NAME=YourCustom
   ```

2. **Or use `.env.example` as a template:**
   ```bash
   cp .env.example .env
   # Edit .env with your custom values
   ```

3. **Restart your development server** for changes to take effect

## Where App Names Are Used

The app name is dynamically replaced in the following locations:

### Frontend Components
- **LoginPage**: "Access the [APP_NAME] Terminal"
- **SignupPage**: "Join the [APP_NAME] Community"
- **Layout**: Header and sidebar branding
- **LandingPage**: Main branding and footer copyright
- **Dashboard**: Calendar event locations
- **Browser Tab**: Page title (set in index.html)

### Database References (Static)
- Email templates in Supabase migrations
- Community links (contain hardcoded handles like "mbauni_protocol")

## Application Config

The `config/appConfig.ts` file provides helper functions for accessing these variables:

```typescript
import { getAppDisplayName, getAppShortName } from '../config/appConfig';

// In your components
const appName = getAppDisplayName(); // "Mbauni Protocol"
const shortName = getAppShortName(); // "Mbauni"
```

## Notes

- Community link URLs (Telegram, WhatsApp, TikTok, Instagram) still reference specific handles like "mbauni_protocol". These are stored in database migrations and would need to be updated manually if you want to change them.
- The app name changes are reflected immediately upon component render without requiring a full page reload.
- Environment variables must start with `VITE_` to be accessible in Vite-based React applications.
