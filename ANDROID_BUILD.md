# Android App Build Útmutató

Ez az útmutató segít a Budget Tracker alkalmazás Android APK buildjének létrehozásában.

## Előfeltételek

1. **Android Studio** telepítése
   - Töltsd le: https://developer.android.com/studio
   - Telepítsd az Android SDK-t és az Android Build Tools-t

2. **Java Development Kit (JDK)**
   - JDK 17 vagy újabb szükséges
   - Ellenőrizd: `java -version`

## Build Folyamat

### 1. Függőségek telepítése

```bash
npm install
```

### 2. Capacitor szinkronizálás

```bash
npx cap sync android
```

### 3. Android Studio megnyitása

```bash
npm run cap:open:android
```

Ez megnyitja az Android projektet az Android Studio-ban.

### 4. APK Build Android Studio-ban

1. Android Studio-ban: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Várj amíg a build befejeződik
3. Az APK itt lesz: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5. APK Telepítése eszközre

**USB kapcsolattal:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Vagy** másold az APK-t a telefonodra és telepítsd manuálisan.

## Konfiguráció

### Development Mode

Az alkalmazás alapértelmezetten statikus fájlokat használ az `out/` könyvtárból.

Ha szeretnéd hogy egy élő szerverhez kapcsolódjon (pl. localhost fejlesztéshez):

1. Módosítsd a `capacitor.config.ts` fájlt:
```typescript
server: {
  url: 'http://10.0.2.2:3000', // Android emulator
  // vagy
  url: 'http://YOUR_COMPUTER_IP:3000', // Fizikai eszköz
  cleartext: true,
}
```

2. Szinkronizáld újra:
```bash
npx cap sync android
```

### Production Build

1. Deploy-old az alkalmazást (pl. Vercel, Netlify)
2. Frissítsd a `capacitor.config.ts` fájlt:
```typescript
server: {
  url: 'https://your-deployed-url.vercel.app',
}
```

3. Vagy távolítsd el a `server.url` mezőt és használd a statikus fájlokat

## Production APK (Release)

Release APK-hoz keystore-ra van szükség:

### 1. Keystore létrehozása

```bash
keytool -genkey -v -keystore budget-tracker.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Konfiguráció

Hozz létre egy `android/key.properties` fájlt:
```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=budget-tracker
storeFile=../budget-tracker.keystore
```

### 3. Build.gradle módosítása

A `android/app/build.gradle` fájlban add hozzá a signing config-ot (már be van állítva alapból).

### 4. Release Build

Android Studio-ban: **Build** → **Build Bundle(s) / APK(s)** → **Build Bundle(s)** vagy **Build APK(s)**

Válaszd a **release** build variant-ot.

## Google Play Store Feltöltés

1. **Google Play Console**-ban hozz létre egy új alkalmazást
2. Töltsd fel az AAB fájlt (Android App Bundle - ajánlott) vagy az APK-t
3. Állítsd be az app részleteit (leírás, képernyőképek, stb.)
4. Küldd be ellenőrzésre

## Hasznos Parancsok

```bash
# Android projekt megnyitása
npm run cap:open:android

# Sync Capacitor
npm run cap:sync

# Build + Sync + Open
npm run android

# Csak build
npm run build

# Logok megtekintése
npx cap run android
```

## Troubleshooting

### "AAPT: error: resource android:attr/lStar not found"

Frissítsd az Android SDK Build Tools-t a legújabb verzióra.

### "Execution failed for task ':app:mergeDebugResources'"

Futtasd le:
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Az app nem kapcsolódik a szerverhez

- Ellenőrizd hogy a `capacitor.config.ts` `server.url` megfelelően van-e beállítva
- Android emulatorhoz használd: `http://10.0.2.2:3000`
- Fizikai eszközhöz használd a számítógéped IP címét ugyanazon a WiFi hálózaton
- Győződj meg róla hogy a `cleartext: true` be van állítva HTTP kapcsolatokhoz

## További Információ

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Google Play Console](https://play.google.com/console)
