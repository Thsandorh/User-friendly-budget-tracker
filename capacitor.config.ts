import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgettracker.app',
  appName: 'Budget Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For development with Android emulator, use this:
    // url: 'http://10.0.2.2:3000',
    // For development with physical device on same network, use your computer's IP:
    // url: 'http://YOUR_COMPUTER_IP:3000',
    // For production, set this to your deployed URL or remove it to use static files
    // url: 'https://your-app-url.vercel.app',
    cleartext: true, // Allow HTTP connections for development
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
