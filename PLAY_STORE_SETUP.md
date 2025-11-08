# Google Play Store Feltöltési Útmutató

Ez az útmutató segít feltölteni az alkalmazást a Google Play Store-ba.

## Előkészületek

### 1. Google Play Console Fiók

1. Menj a [Google Play Console](https://play.google.com/console)-ra
2. Hozz létre egy fejlesztői fiókot (egyszeri $25 regisztrációs díj)
3. Fogadd el a feltételeket

### 2. Keystore Létrehozása (App Signing)

A Play Store-ba **csak aláírt (signed)** APK-t/AAB-t lehet feltölteni.

#### Keystore generálás:

```bash
keytool -genkey -v -keystore budget-tracker.keystore \
  -alias budget-tracker \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Kérdések amikre válaszolni kell:**
- Password: **Válassz egy biztonságos jelszót** (MENTSD EL BIZTONSÁGOSAN!)
- Name: Neved
- Organization: Cégnév vagy saját név
- City, State, Country: Adataid

**⚠️ FONTOS:**
- **Soha ne commitold a keystore fájlt GitHub-ra!**
- **Mentsd el biztonságosan** (pl. password manager, biztonságos cloud storage)
- **Ha elveszted, nem tudsz több update-et kiadni az apphoz!**

### 3. GitHub Secrets Beállítása

Az automatikus signed APK buildhez add hozzá a következő secreteket a GitHub repository-dhoz:

1. GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Kattints: **New repository secret**

Hozd létre ezeket a secreteket:

| Secret Name | Érték | Leírás |
|-------------|-------|--------|
| `KEYSTORE_BASE64` | (a keystore base64 kódolva) | Lásd alább |
| `KEYSTORE_PASSWORD` | (a keystore jelszó) | Amit a generálásnál megadtál |
| `KEY_ALIAS` | `budget-tracker` | Az alias amit használtál |
| `KEY_PASSWORD` | (a key jelszó) | Általában ugyanaz mint a keystore password |

#### Keystore Base64 kódolása:

**Linux/Mac:**
```bash
base64 -i budget-tracker.keystore -o keystore.base64.txt
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("budget-tracker.keystore")) | Out-File keystore.base64.txt
```

Nyisd meg a `keystore.base64.txt` fájlt és másold ki a teljes tartalmat (lehet hogy több sorban van, az egészet másold ki).

## Signed APK/AAB Build

### Opció 1: GitHub Actions (Automatikus)

Ha beállítottad a GitHub Secrets-et:

1. **Módosítsd a `.github/workflows/android-build.yml` fájlt** a signed build engedélyezéséhez
2. Push-old a változtatást
3. Az Actions automatikusan készít egy signed APK-t/AAB-t
4. Töltsd le az Artifacts-ból

### Opció 2: Manuális Build Android Studio-val

1. Nyisd meg a projektet Android Studio-ban
2. **Build** → **Generate Signed Bundle / APK**
3. Válaszd: **Android App Bundle** (AAB - ajánlott Play Store-hoz)
4. Válaszd ki a keystore fájlt
5. Add meg a jelszavakat
6. Válaszd a **release** build variant-ot
7. Kattints **Finish**

Az AAB/APK itt lesz: `android/app/release/`

## Google Play Console - Új App Létrehozása

### 1. Új Alkalmazás Készítése

1. Play Console → **All apps** → **Create app**
2. Töltsd ki az adatokat:
   - **App name:** Budget Tracker - Költségvetés Követő
   - **Default language:** Hungarian (hu-HU)
   - **App or game:** App
   - **Free or paid:** Free
3. Fogadd el a feltételeket
4. Kattints **Create app**

### 2. Dashboard Kitöltése

A Play Console különböző szekciói amit ki kell tölteni:

#### A) App Content (Kötelező)

1. **Privacy policy:** Add meg az app privacy policy URL-jét
2. **App access:** Jelöld meg ha az app teljesen hozzáférhető
3. **Ads:** Van-e hirdetés az appban?
4. **Content rating:** Kérdőív kitöltése (pár perc)
5. **Target audience:** Célközönség megadása
6. **News apps:** Nem
7. **COVID-19 contact tracing:** Nem
8. **Data safety:** Adatkezelési információk

#### B) Store Settings

1. **App category:** Finance (vagy Productivity)
2. **Store listing contact details:** Email cím support-hoz
3. **External marketing:** Opt-in/out marketing-hez

### 3. Store Listing Készítése

**Main store listing** → **Manage**

#### Szükséges Anyagok:

**1. Rövid leírás (80 karakter max):**
```
Költségvetés követő nyugta szkenneléssel, OCR-rel és offline támogatással.
```

**2. Teljes leírás (4000 karakter max):**
```
Budget Tracker - Professzionális Költségvetés Követő Alkalmazás

Tartsd kézben a pénzügyeidet ezzel a modern, könnyen használható költségvetés követő alkalmazással!

✨ Főbb Funkciók:

💰 Költségvetés Kezelés
- Hozz létre és kezelj több költségvetést
- Állíts be kategóriánkénti limiteket
- Kövesd nyomon a kiadásaidat valós időben

📸 Nyugta Szkennelés OCR-rel
- Készíts fotót a nyugtákról
- Automatikus szövegfelismerés (OCR)
- Gyors tranzakció rögzítés

📊 Részletes Riportok
- Havi/napi összesítések
- Kategória szerinti bontás
- Vizuális grafikonok és diagramok

🏷️ Kategóriák és Címkék
- Testreszabható kategóriák
- Színkódolt megjelenítés
- Egyedi ikonok

💡 Pénzügyi Célok
- Állíts be megtakarítási célokat
- Kövesd a haladásodat
- Motiváló értesítések

📱 Ismétlődő Kiadások
- Előfizetések kezelése
- Számla emlékeztetők
- Automatikus tranzakció rögzítés

📴 Offline Támogatás
- Működik internet nélkül is
- Automatikus szinkronizálás
- Helyi adattárolás

🌍 Többnyelvű
- Magyar és angol nyelv támogatás
- Egyszerű nyelvváltás

🎨 Modern Felhasználói Felület
- Sötét és világos téma
- Reszponzív design
- Intuitív navigáció

🔒 Biztonságos
- Helyi adattárolás
- Jelszavas védelem
- Adatvédelem

Tökéletes mindenkinek aki szeretné:
• Nyomon követni a kiadásokat
• Megtakarítani pénzt
• Költségvetést tervezni
• Pénzügyi célokat elérni
• Átlátni a költéseit

Töltsd le most ingyen!
```

**3. Képernyőképek:**

Készíts **minimum 2, maximum 8** képernyőképet az appról:
- Felbontás: min. 320px, max. 3840px
- Aspect ratio: 16:9 vagy 9:16
- Formátum: PNG vagy JPEG

Javasolt képernyőképek:
- Dashboard nézet
- Tranzakciók lista
- Költségvetés kezelő
- Riportok/grafikonok
- Nyugta szkennelés
- Kategóriák
- Beállítások

**4. Feature Graphic (Kötelező):**
- Méret: 1024 x 500 px
- Formátum: PNG vagy JPEG
- Banner kép az app promóciójához

**5. App Icon:**
- Automatikusan az APK/AAB-ból jön
- 512 x 512 px javasolt

### 4. Release Létrehozása

1. **Production** → **Countries/regions** → Válaszd ki az országokat
2. **Create new release**
3. **Upload** az AAB/APK fájlt
4. Add meg a **Release notes** (változási napló):

```
Első kiadás

Funkciók:
- Költségvetés kezelés
- Tranzakció rögzítés
- Nyugta szkennelés OCR-rel
- Részletes riportok
- Kategóriák és címkék
- Pénzügyi célok
- Ismétlődő kiadások
- Offline támogatás
- Magyar és angol nyelv
```

5. **Save** → **Review release**
6. **Start rollout to Production**

### 5. Ellenőrzés és Publikálás

1. Google áttekinti az appot (1-7 nap)
2. Ha minden rendben, az app élő lesz
3. Kapni fogsz email értesítést

## Update Kiadása

Amikor új verziót akarsz kiadni:

1. Növeld a `versionCode`-ot és `versionName`-et az `android/app/build.gradle`-ben
2. Build új signed AAB-t
3. Play Console → **Production** → **Create new release**
4. Upload új AAB
5. Add meg a változási naplót
6. **Review release** → **Start rollout**

## Hasznos Tippek

✅ **AAB vs APK:** Használj AAB-t (Android App Bundle) - kisebb letöltési méret
✅ **Beta Testing:** Használd a **Internal testing** vagy **Closed testing** tracket publikálás előtt
✅ **Release tracks:** Internal → Closed → Open → Production
✅ **Staged rollout:** Kezdd 5-10%-kal, majd növeld fokozatosan
✅ **Store listing:** Optimalizáld ASO (App Store Optimization) keywords-ökkel
✅ **Promo materials:** Használj minőségi képernyőképeket és videót

## Troubleshooting

### "You uploaded a debuggable APK"
→ Signed release APK/AAB-t kell használni, nem debug-ot

### "App not signed"
→ Ellenőrizd hogy használtad-e a keystore-t a signing-hoz

### "Version code must be greater"
→ Növeld a `versionCode`-ot a build.gradle-ben

### "Missing required fields"
→ Töltsd ki az összes kötelező mezőt a Store listing-ben

## További Információ

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Signing](https://developer.android.com/studio/publish/app-signing)
