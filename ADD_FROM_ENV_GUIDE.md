# Using "Add from .env" on Render

## Quick Method: Upload .env File

This is the **easiest way** to add all environment variables at once!

---

## Steps:

### 1. Edit the `.env` File (on your local machine)
```bash
# backend/.env
FLASK_ENV=production
SECRET_KEY=your_generated_secret_key_here
DATABASE_URL=mysql+pymysql://user:pass@host/db
JWT_SECRET=your_generated_jwt_secret_here
ENABLE_ADMIN=1
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
```

### 2. Fill in the Actual Values
Replace placeholders with real values:
- `SECRET_KEY` - Generate using: `python -c 'import secrets; print(secrets.token_urlsafe(32))'`
- `DATABASE_URL` - Your MySQL connection string
- `JWT_SECRET` - Generate using same method as SECRET_KEY
- `MAIL_USERNAME` - Your email
- `MAIL_PASSWORD` - Your email app password
- etc.

### 3. On Render Dashboard
1. Go to **Your Service → Environment**
2. Look for the button **"Add from .env"** (usually at the bottom or top)
3. Click it
4. A file upload box appears → Click to browse
5. Select your `.env` file from `backend/.env`
6. Click **"Upload"** or **"Import"**
7. Render will parse all variables automatically
8. Click **"Save"** or **"Apply"**
9. Service auto-redeploys ✅

---

## That's It!

Instead of adding 10 variables one-by-one, you just upload one `.env` file and Render imports them all at once.

---

## Important Security Notes:

⚠️ **NEVER commit `.env` to GitHub**

Make sure `.env` is in your `.gitignore`:

```bash
# In root .gitignore or backend/.gitignore
.env
.env.local
.env.*.local
```

Check current `.gitignore`:
```bash
cat .gitignore
```

If `.env` is already tracked in git, remove it:
```bash
git rm --cached backend/.env
git commit -m "remove .env from git tracking"
```

---

## Workflow:

1. ✅ Create `.env` file locally (NOT in GitHub)
2. ✅ Fill with real values (secrets, passwords, URLs)
3. ✅ On Render: Environment → "Add from .env"
4. ✅ Upload the file
5. ✅ Render auto-redeploys
6. ✅ Never push `.env` to GitHub

---

## Which Method is Better?

| Method | Pros | Cons |
|--------|------|------|
| **Individual Variables** | More secure (one mistake visible) | Tedious (add 10 times) |
| **Add from .env** | Fast & easy (one upload) | Risk of uploading wrong file |

**Recommendation**: Use **"Add from .env"** but be careful to:
- Only upload to Render (never commit to GitHub)
- Keep `.env` in `.gitignore`
- Double-check values before uploading

---

## Template `.env` File

Here's what your `backend/.env` should look like:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=generate_strong_random_key_32chars_min
DEBUG=False

# Database Configuration
DATABASE_URL=mysql+pymysql://admin:password@mysql.onrender.com:3306/gisave_db

# JWT Configuration
JWT_SECRET=generate_different_random_key_32chars_min

# Admin Panel (optional)
ENABLE_ADMIN=1

# Email Configuration (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=gmail_app_password_not_regular_password

# M-Pesa Configuration (optional)
MPESA_CALLBACK_TOKEN=your_mpesa_token

# Redis/Celery Configuration (optional)
CELERY_BROKER_URL=redis://redis.onrender.com:6379/0
CELERY_BACKEND=redis://redis.onrender.com:6379/1
```

---

## Troubleshooting

### Upload Failed: "Invalid .env format"
- Check for syntax errors in `.env`
- Don't have spaces around `=`: `KEY=value` ✅ not `KEY = value` ❌

### Variables Not Showing
- Make sure file extension is `.env` (not `.env.txt`)
- Refresh Render dashboard

### Service Won't Start After Upload
- Check logs for which variable is missing/wrong
- Common: DATABASE_URL format incorrect or SECRET_KEY too short

---

## Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] Never committed `.env` to GitHub
- [ ] All secrets are strong (32+ characters)
- [ ] Different values for SECRET_KEY and JWT_SECRET
- [ ] Only uploading `.env` to Render (not sharing anywhere)
- [ ] Using app passwords (Gmail), not regular passwords

---

## Done!

Just follow this simple workflow:
1. Edit `backend/.env`
2. Fill with real values
3. Render Dashboard → Environment → "Add from .env"
4. Upload file
5. Done! ✅

Much easier than manually entering 10 variables!

