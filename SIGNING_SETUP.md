# APK Signing - Lépésről Lépésre Útmutató

Ez az útmutató segít **aláírt (signed) APK/AAB** készítésében GitHub Actions-zel.

---

## 📋 Gyors Áttekintés

1. **Keystore létrehozása** (egyszeri, ~2 perc)
2. **GitHub Secrets beállítása** (egyszeri, ~3 perc)
3. **Push a kódot** → GitHub automatikusan készít signed APK-t + AAB-t
4. **Letöltés** → Kész a Play Store feltöltésre!

---

## 1. Keystore Létrehozás

A keystore egy fájl ami azonosítja téged mint fejlesztőt. **Csak egyszer kell létrehozni**.

### Windows (PowerShell vagy CMD):

```bash
keytool -genkey -v -keystore budget-tracker.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 10000
```

### Mac / Linux:

```bash
keytool -genkey -v -keystore budget-tracker.keystore -alias budget-tracker -keyalg RSA -keysize 2048 -validity 10000
```

### Kérdések amiket meg fog kérdezni:

```
Enter keystore password: [Válassz egy erős jelszót, pl: MySecurePass123!]
Re-enter new password: [Ugyanaz megint]

What is your first and last name?
  [Unknown]:  [Neved, pl: Kiss János]

What is the name of your organizational unit?
  [Unknown]:  [Press Enter vagy írd be: Budget Tracker]

What is the name of your organization?
  [Unknown]:  [Press Enter vagy cégnév]

What is the name of your City or Locality?
  [Unknown]:  [Városod, pl: Budapest]

What is the name of your State or Province?
  [Unknown]:  [Press Enter]

What is the two-letter country code for this unit?
  [Unknown]:  HU

Is CN=Kiss János, OU=Budget Tracker, O=Unknown, L=Budapest, ST=Unknown, C=HU correct?
  [no]:  yes

Enter key password for <budget-tracker>
	(RETURN if same as keystore password): [Press Enter]
```

**✅ Kész!** Létrejött egy `budget-tracker.keystore` fájl.

### ⚠️ NAGYON FONTOS:

- **MENTSD EL BIZTONSÁGOSAN** ezt a fájlt és a jelszót!
- **NE VESZÍTSD EL** - nélküle nem tudsz update-et kiadni!
- **NE COMMITOLD GITHUB-RA** - ez a titkos kulcsod!
- Mentsd le pl:
  - Password manager (1Password, Bitwarden)
  - Biztonságos cloud (Google Drive privát mappa)
  - External hard drive

---

## 2. Keystore Konvertálása Base64-re

A GitHub nem tud fájlokat tárolni secretként, ezért Base64 stringgé kell konvertálni.

### Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("budget-tracker.keystore")) | Out-File keystore-base64.txt
```

### Mac / Linux:

```bash
base64 -i budget-tracker.keystore > keystore-base64.txt
```

**✅ Létrejött egy `keystore-base64.txt` fájl** ami egy hosszú szöveget tartalmaz.

---

## 3. GitHub Secrets Beállítása

Most a GitHub repository-dba felvisszük a secreteket.

### Lépések:

1. **Menj a GitHub repository-dhoz**
   ```
   https://github.com/Thsandorh/User-friendly-budget-tracker
   ```

2. **Kattints a "Settings" fülre** (felül, jobb oldalon)

3. **Bal oldali menüben:**
   - Kattints: **"Secrets and variables"**
   - Majd: **"Actions"**

4. **Kattints: "New repository secret"** (zöld gomb)

5. **Hozd létre ezeket a secreteket egyesével:**

#### Secret #1: KEYSTORE_BASE64

- **Name:** `KEYSTORE_BASE64`
- **Secret:** Nyisd meg a `keystore-base64.txt` fájlt és **MÁSOLD BE A TELJES TARTALMÁT**
  - (Ez egy nagyon hosszú szöveg lesz, lehet hogy több sorban van - az EGÉSZET másold be!)
- Kattints **"Add secret"**

#### Secret #2: KEYSTORE_PASSWORD

- **Name:** `KEYSTORE_PASSWORD`
- **Secret:** A jelszó amit a keystore létrehozásakor megadtál (pl: `MySecurePass123!`)
- Kattints **"Add secret"**

#### Secret #3: KEY_ALIAS

- **Name:** `KEY_ALIAS`
- **Secret:** `budget-tracker`
- Kattints **"Add secret"**

#### Secret #4: KEY_PASSWORD

- **Name:** `KEY_PASSWORD`
- **Secret:** Ugyanaz mint a KEYSTORE_PASSWORD (ha ENTER-t nyomtál amikor kérdezte)
- Kattints **"Add secret"**

### Ellenőrzés:

A "Actions secrets" alatt most 4 secret-et kell látnod:
- ✅ KEYSTORE_BASE64
- ✅ KEYSTORE_PASSWORD
- ✅ KEY_ALIAS
- ✅ KEY_PASSWORD

---

## 4. Signed APK/AAB Készítése

Most már minden be van állítva! 🎉

### Automatikus Build:

1. **Push-olj bármit GitHub-ra** (vagy indítsd el manuálisan):
   ```bash
   git push
   ```

2. **Menj a GitHub repository-ba → Actions fül**

3. **Várj ~5-10 percet** amíg a build elkészül

4. **Amikor kész, görgess le az "Artifacts" szekcióhoz**

5. **Letöltés:**
   - **`budget-tracker-debug-apk`** - Tesztelésre (nem kell signing)
   - **`budget-tracker-release-signed-apk`** - Signed APK telefonra
   - **`budget-tracker-play-store-aab`** - **EZT TÖLTSD FEL A PLAY STORE-BA!** ⭐

### Manuális Trigger:

1. GitHub repo → **Actions** fül
2. Bal oldalt: **"Build Android APK"**
3. Jobb oldalt: **"Run workflow"** gomb
4. Válaszd a branch-et
5. **"Run workflow"**

---

## 5. Play Store Feltöltés

1. **Töltsd le az AAB-t** az Artifacts-ból: `budget-tracker-play-store-aab`

2. **Csomagold ki a ZIP-et** → megkapod az `app-release.aab` fájlt

3. **Menj a Google Play Console-ra:**
   - https://play.google.com/console

4. **Production → Create new release**

5. **Upload az AAB fájlt** (app-release.aab)

6. **Add meg a release notes-ot** (változási napló)

7. **Review release → Start rollout to Production**

**Kész!** ✅ Az appod a Play Store-ban van!

---

## Troubleshooting

### ❌ "Error: secrets.KEYSTORE_BASE64 is empty"

→ Ellenőrizd hogy létrehoztad-e a GitHub Secrets-et
→ A secret neve pontosan `KEYSTORE_BASE64` (NAGYBETŰVEL!)

### ❌ "Keystore file not found"

→ A base64 konvertálás nem sikerült
→ Próbáld újra a base64 parancsot

### ❌ "Incorrect keystore password"

→ Ellenőrizd a `KEYSTORE_PASSWORD` secret értékét
→ Biztos hogy ugyanazt a jelszót adtad meg?

### ❌ "Key alias not found"

→ Ellenőrizd hogy a `KEY_ALIAS` értéke `budget-tracker`

### ❌ GitHub Actions nem készít signed APK-t

→ Ellenőrizd hogy mind a 4 secret létezik
→ Nézd meg a GitHub Actions log-okat részletekért

---

## Biztonság

✅ **Secure:**
- GitHub Secrets titkosítva vannak
- Soha nem jelennek meg a logokban
- Csak a workflow férhet hozzájuk

❌ **NE csináld:**
- Ne commitold a keystore fájlt
- Ne írd ki a secret értékeket
- Ne oszd meg senkivel a jelszót

---

## Következő Lépések

1. ✅ Keystore létrehozva
2. ✅ GitHub Secrets beállítva
3. ✅ Automatikus build működik
4. 📱 Töltsd le az AAB-t
5. 🚀 Töltsd fel a Play Store-ba

**További infó:** Lásd `PLAY_STORE_SETUP.md`

---

## Hasznos Linkek

- [Android Signing Documentation](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
