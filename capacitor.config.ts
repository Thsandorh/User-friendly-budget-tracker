import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finflow.app',
  appName: 'FinFlow',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Production URL - connects to deployed Vercel app
    url: 'https://user-friendly-budget-tracker.vercel.app',
    cleartext: false, // Use HTTPS for production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
};

export default config;
