# Environment Variables for Render Deployment

This guide explains which environment variables to set on Render for your Flask backend.

---

## How to Add Environment Variables on Render

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Click **"Add Environment Variable"**
3. Enter **NAME** (left) and **Value** (right)
4. Click **"Save"**
5. Service will auto-redeploy

### Alternative: "Add from .env"
- Upload your `.env` file directly (skip if you don't have it)

---

## Required Environment Variables

### 1. **FLASK_ENV**
```
NAME: FLASK_ENV
VALUE: production
```
- Sets Flask to production mode
- Disables debug mode on Render

---

### 2. **SECRET_KEY**
```
NAME: SECRET_KEY
VALUE: [Generate a strong random key]
```

**How to generate a strong SECRET_KEY:**

**Option A: Using Python (Recommended)**
```python
import secrets
print(secrets.token_urlsafe(32))
```
Will output something like: `k-3Z_mN9pQr8sT5uV2wX1yZ0aB_cD4eF5gH6`

**Option B: Using OpenSSL**
```bash
openssl rand -hex 32
```

**Option C: Online Generator**
- https://randomkeygen.com/ (Fort Knox option - 256 bit)

**⚠️ Important**: 
- Use a DIFFERENT key for production
- Never use "dev" or "secret"
- Keep it secret (don't share in code)

---

### 3. **DATABASE_URL**
```
NAME: DATABASE_URL
VALUE: mysql+pymysql://username:password@host:3306/database_name
```

**Example formats:**

**Option A: Render MySQL Database**
```
mysql+pymysql://root:your_password@mysql-render.onrender.com:3306/gisave_db
```
Get this from Render → Your MySQL Instance → Internal Database URL

**Option B: External MySQL (AWS RDS, DigitalOcean, etc.)**
```
mysql+pymysql://admin:your_password@your-mysql-host.com:3306/gisave_db
```

**Option C: Local Testing (SQLite - NOT for production)**
```
sqlite:///data.db
```

---

### 4. **JWT_SECRET**
```
NAME: JWT_SECRET
VALUE: [Generate like SECRET_KEY above]
```
- Used for signing JWT tokens for API authentication
- Must be different from SECRET_KEY
- Generate using same methods as SECRET_KEY

---

## Optional but Recommended

### 5. **ENABLE_ADMIN**
```
NAME: ENABLE_ADMIN
VALUE: 1
```
- Enables Flask-Admin dashboard at `/admin`
- Set to "0" or leave empty to disable
- Only enable if you have authentication set up

---

## Optional: Email Configuration

### 6. **MAIL_SERVER**
```
NAME: MAIL_SERVER
VALUE: smtp.gmail.com
```

### 7. **MAIL_PORT**
```
NAME: MAIL_PORT
VALUE: 587
```

### 8. **MAIL_USERNAME**
```
NAME: MAIL_USERNAME
VALUE: your-email@gmail.com
```

### 9. **MAIL_PASSWORD**
```
NAME: MAIL_PASSWORD
VALUE: your_app_password
```
⚠️ For Gmail: Use App Password (not regular password)
- Go to myaccount.google.com → Security
- Create "App password" for SMTP

### 10. **MPESA_CALLBACK_TOKEN**
```
NAME: MPESA_CALLBACK_TOKEN
VALUE: your_mpesa_token_here
```
- Only needed if using M-Pesa payments
- Get from M-Pesa portal

---

## Optional: Background Jobs (Advanced)

### 11. **CELERY_BROKER_URL**
```
NAME: CELERY_BROKER_URL
VALUE: redis://redis.onrender.com:6379/0
```
- Only if using Redis for Celery
- Leave blank to disable async tasks

### 12. **CELERY_BACKEND**
```
NAME: CELERY_BACKEND
VALUE: redis://redis.onrender.com:6379/1
```
- Celery backend for storing results

---

## Complete Minimal Setup (Recommended)

Add these 4 variables minimum:

| NAME | VALUE | Notes |
|------|-------|-------|
| `FLASK_ENV` | `production` | Required |
| `SECRET_KEY` | `[random 32-char string]` | Generate once, keep secure |
| `DATABASE_URL` | `mysql+pymysql://...` | Your MySQL connection |
| `JWT_SECRET` | `[different random 32-char]` | Generate once, keep secure |

---

## Full Production Setup (Recommended)

Add these for production-ready deployment:

| NAME | VALUE | Notes |
|------|-------|-------|
| `FLASK_ENV` | `production` | Required |
| `SECRET_KEY` | `[random 32-char]` | Session encryption |
| `DATABASE_URL` | `mysql+pymysql://...` | Your MySQL connection |
| `JWT_SECRET` | `[different random 32-char]` | API token signing |
| `ENABLE_ADMIN` | `1` | Enable admin panel (optional) |
| `MAIL_SERVER` | `smtp.gmail.com` | Email sending |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | `your@gmail.com` | Gmail address |
| `MAIL_PASSWORD` | `your_app_password` | Gmail app password |

---

## Step-by-Step Setup Instructions

### Step 1: Generate SECRET_KEY
Run this in Python:
```python
import secrets
secret_key = secrets.token_urlsafe(32)
print(f"SECRET_KEY={secret_key}")
```

### Step 2: Generate JWT_SECRET
```python
import secrets
jwt_secret = secrets.token_urlsafe(32)
print(f"JWT_SECRET={jwt_secret}")
```

### Step 3: Get DATABASE_URL
**If using Render MySQL:**
1. Create MySQL instance on Render
2. Wait for it to be ready
3. Copy "Internal Database URL" from dashboard
4. Format: `mysql+pymysql://user:pass@host/database`

**If using external MySQL:**
1. Get connection string from your MySQL provider
2. Ensure it includes: `mysql+pymysql://` prefix

### Step 4: Add to Render
1. Go to Render Dashboard → Your Web Service
2. Click "Environment"
3. Add each variable:

```
NAME: FLASK_ENV
VALUE: production
[Save]

NAME: SECRET_KEY
VALUE: [Your generated key]
[Save]

NAME: DATABASE_URL
VALUE: mysql+pymysql://user:pass@host/db
[Save]

NAME: JWT_SECRET
VALUE: [Your generated JWT secret]
[Save]
```

### Step 5: Verify
- Render will auto-redeploy
- Check logs for errors
- Test your API: `curl https://your-service.onrender.com/`

---

## Troubleshooting

### Error: "Could not load a database"
```
Check:
- DATABASE_URL is set
- MySQL is accessible from Render
- Firewall allows Render's IP
```

### Error: "Invalid token"
```
Check:
- JWT_SECRET is set correctly
- Frontend is using the right token
- Token hasn't expired
```

### Email not sending
```
Check:
- MAIL_SERVER and MAIL_PORT are correct
- MAIL_USERNAME and MAIL_PASSWORD are correct
- Gmail: Use App Password, not regular password
```

### Admin panel not accessible
```
Check:
- ENABLE_ADMIN is set to "1"
- You have proper authentication in place
```

---

## Security Best Practices

✅ **DO:**
- Generate strong random keys (32+ characters)
- Use different SECRET_KEY and JWT_SECRET
- Keep secrets in environment variables (never in code)
- Regenerate keys if compromised
- Use secure email app passwords (not actual passwords)

❌ **DON'T:**
- Use weak passwords like "secret" or "password"
- Share your SECRET_KEY or JWT_SECRET
- Put secrets in GitHub commits
- Use same key for multiple environments
- Use local/test keys in production

---

## Reference: What Each Variable Does

| Variable | Purpose | Can be Empty? |
|----------|---------|---------------|
| FLASK_ENV | Sets Flask environment mode | No (defaults to 'development') |
| SECRET_KEY | Encrypts session cookies & CSRF tokens | No (required for security) |
| DATABASE_URL | Connects to database | No (required for app to work) |
| JWT_SECRET | Signs JWT authentication tokens | No (required for API auth) |
| ENABLE_ADMIN | Enables admin panel | Yes (defaults to disabled) |
| MAIL_* | Email configuration | Yes (if not sending emails) |
| CELERY_* | Background job broker | Yes (if not using async tasks) |

---

## Example: Complete .env File (for reference, never commit to GitHub)

```bash
FLASK_ENV=production
SECRET_KEY=k-3Z_mN9pQr8sT5uV2wX1yZ0aB_cD4eF5gH6
DATABASE_URL=mysql+pymysql://admin:strongpass@mysql.onrender.com:3306/gisave_db
JWT_SECRET=aB_cD4eF5gH6k-3Z_mN9pQr8sT5uV2wX1yZ0
ENABLE_ADMIN=1
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gisave@gmail.com
MAIL_PASSWORD=abcd1234efgh5678ijkl9012
```

---

## Next Steps

1. ✅ Generate SECRET_KEY and JWT_SECRET
2. ✅ Set up DATABASE_URL with MySQL
3. ✅ Add all 4 required variables to Render
4. ✅ Let service auto-redeploy
5. ✅ Check logs for success
6. ✅ Test API endpoints
7. ✅ (Optional) Add email configuration
8. ✅ (Optional) Enable admin panel

---

**Questions?** Check Render docs: https://render.com/docs/environment-variables

