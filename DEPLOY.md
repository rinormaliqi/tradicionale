# Deploying Tradicionale (Vercel + Turso)

This app runs on **Vercel** (free) with a **Turso** database (free, SQLite-compatible,
never sleeps). The database layer is already set up to use Turso in production and a
local file during development — no code changes needed to deploy.

You'll run these steps with your own accounts. Anything in `<angle brackets>` is a value
you replace.

---

## 1. Put the code on GitHub

```bash
cd /Users/apple/Desktop/tradicionale
git add -A
git commit -m "Tradicionale app ready for deploy"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/tradicionale.git
git branch -M main
git push -u origin main
```

(If `git remote add origin` says it already exists, use `git remote set-url origin ...`.)

---

## 2. Create the Turso database

Install the Turso CLI and sign up (free, no card):

```bash
curl -sSfL https://get.tur.so/install.sh | bash      # installs the 'turso' CLI
turso auth signup                                     # opens browser to sign up/login
```

Create the database and read its connection details:

```bash
turso db create tradicionale
turso db show tradicionale --url           # -> copy this (looks like libsql://tradicionale-xxx.turso.io)
turso db tokens create tradicionale        # -> copy this long token
```

Keep both values handy for step 4. You do **not** need to create any tables — the app
creates them automatically on first run and adds the starter menu.

---

## 3. Import the project into Vercel

1. Go to https://vercel.com → **Add New… → Project**.
2. Import the GitHub repo `tradicionale`.
3. Framework preset is auto-detected as **Next.js**. Leave build settings as default.
4. **Before clicking Deploy**, open **Environment Variables** and add the four below.

---

## 4. Environment variables (Vercel → Project → Settings → Environment Variables)

Add these for the **Production** (and Preview) environment:

| Name                  | Value                                                        |
| --------------------- | ----------------------------------------------------------- |
| `ADMIN_PASSWORD`      | the password you want for `/admin/login`                    |
| `AUTH_SECRET`         | a long random string (run `openssl rand -hex 32`)           |
| `TURSO_DATABASE_URL`  | the `libsql://…` URL from step 2                             |
| `TURSO_AUTH_TOKEN`    | the token from step 2                                        |

Then click **Deploy**. First load may take a few seconds while it creates the tables and
seeds the starter products.

---

## 5. After deploy

- Your site: `https://<project>.vercel.app`
- Admin: `https://<project>.vercel.app/admin` (log in with `ADMIN_PASSWORD`)
- Add your real products & photos in **Produktet**, set the hero/offers in **Përmbajtja**.
- Every `git push` to `main` auto-deploys a new version.

### Notes
- **Images** are stored in the Turso database (no extra storage service to configure).
- **Backups:** `turso db dump tradicionale > backup.sql` saves all data.
- To change the admin password later, update `ADMIN_PASSWORD` in Vercel and redeploy.
  Changing `AUTH_SECRET` logs everyone out (they must log in again).

---

## Local development (unchanged)

With no Turso env vars set, the app uses a local file (`data/tradicionale.db`):

```bash
npm install
npm run dev      # http://localhost:3100
```
