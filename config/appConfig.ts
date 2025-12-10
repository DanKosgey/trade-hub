// Configuration file for application branding
export const appConfig = {
  // App name variables from environment
  appName: import.meta.env.VITE_APP_NAME || 'Trade Hub',
  appShortName: import.meta.env.VITE_APP_SHORT_NAME || 'Trade Hub',
  
  // Default app name for fallback (for database migrations and static content)
  defaultAppName: 'Trade Hub',
  defaultAppShortName: 'Trade Hub',
  
  // Community links - will use the short name in URLs
  getCommunityUrls: (shortName: string = 'trade_hub_protocol') => ({
    telegram: `https://t.me/${shortName}`,
    whatsapp: `https://chat.whatsapp.com/${shortName}`,
    tiktok: `https://tiktok.com/@${shortName}`,
    instagram: `https://instagram.com/${shortName}`,
  }),
};

// Helper function to get display text
export const getAppDisplayName = () => appConfig.appName;
export const getAppShortName = () => appConfig.appShortName;
