# Render Deployment Guide for Girls I Save Backend

## Overview
This guide explains how to deploy the Flask backend to Render using GitHub integration.

## Prerequisites
- GitHub repository connected to Render
- Render account (render.com)
- MySQL database (either Render's or external)

---

## Step-by-Step Configuration

### 1. **Root Directory**
```
backend
```
✅ Set this to `backend` since your Flask app is in the `backend/` folder of your monorepo.

---

### 2. **Build Command**
```bash
pip install -r requirements.txt
```
✅ This installs all Python dependencies from `backend/requirements.txt`.

---

### 3. **Start Command**
```bash
gunicorn --bind 0.0.0.0:10000 --workers 2 --worker-class sync --timeout 30 app:app
```

**Explanation:**
- `gunicorn` - WSGI server for production
- `--bind 0.0.0.0:10000` - Listen on all interfaces on port 10000 (Render's default)
- `--workers 2` - Use 2 worker processes
- `--worker-class sync` - Synchronous worker (suitable for Flask)
- `--timeout 30` - 30-second timeout for requests
- `app:app` - Refers to `app` module with `app` Flask application object (from `app/__init__.py` and `wsgi.py`)

> **Note:** Render assigns port 10000. Do not hardcode a different port.

---

### 4. **Environment Variables** (Set in Render Dashboard)

Click "Advanced" → "Environment" and add:

#### Required Variables:
```
FLASK_ENV=production
SECRET_KEY=your_secret_key_here_generate_a_strong_one
```

#### Database Variables:
```
DATABASE_URL=mysql+pymysql://user:password@host/database_name
# Example: mysql+pymysql://root:pass@mysql.render.com/gisave_db
```

#### Optional Variables:
```
JWT_SECRET=your_jwt_secret_key
DEBUG=False
```

---

### 5. **Instance Type**
- **Free Tier**: Good for testing/development
- **Paid Plans**: Recommended for production

Free tier will be slow initially but adequate for MVP testing.

---

## Deployment Steps

### On Render Dashboard:

1. **New Service** → **Web Service**
2. **Connect GitHub** (if not already done)
3. **Select Repository**: `main-gisave`
4. **Configure**:
   - **Name**: `gisave-backend`
   - **Environment**: `Python`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:10000 --workers 2 --worker-class sync --timeout 30 app:app`

5. **Advanced**:
   - **Auto-Deploy**: Enable (auto-deploys on GitHub push)
   - **Environment**: Add variables (see Section 4)

6. **Create Web Service**

---

## Troubleshooting

### Build Fails: "No module named 'app'"
✅ **Solution**: Ensure `Root Directory` is set to `backend`

### Build Fails: "No module named 'gunicorn'"
✅ **Solution**: Verify `gunicorn==21.2.0` is in `backend/requirements.txt`

### Application Won't Start: "Address already in use"
✅ **Solution**: Use `--bind 0.0.0.0:10000` (Render's default port)

### 502 Bad Gateway
✅ **Common causes**:
- Database connection string incorrect
- Missing environment variables
- Application crashing (check logs)
- Check Render logs: Dashboard → Service → Logs

### CORS Errors from Frontend
✅ **Solution**: Frontend must use the Render backend URL
```
Update frontend to point to: https://your-service-name.onrender.com
```

---

## Database Setup

### Option 1: MySQL on Render
1. Create MySQL instance on Render
2. Get connection string: `mysql+pymysql://user:password@host/db_name`
3. Add to `DATABASE_URL` environment variable

### Option 2: External MySQL
1. Use existing MySQL provider (e.g., AWS RDS, DigitalOcean)
2. Ensure Render can reach it (firewall rules)
3. Add connection string to `DATABASE_URL`

---

## Post-Deployment

### First Deploy Checklist:
- [ ] Build completes successfully
- [ ] Check Render Logs for errors
- [ ] Test API endpoint: `https://your-service.onrender.com/users/list`
- [ ] Verify database connection
- [ ] Update frontend `.env` or proxy config to use Render URL

### Monitoring:
- Render Dashboard → Metrics (CPU, Memory, Network)
- Render Dashboard → Logs (check for errors)

---

## File Structure Reference

```
main-gisave/
├── backend/                    ← Root Directory set to this
│   ├── app/
│   │   ├── __init__.py        ← create_app() function here
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── users.py
│   │   │   ├── mentors.py
│   │   │   └── ...
│   │   └── ...
│   ├── wsgi.py                ← Entry point: app = create_app()
│   ├── requirements.txt        ← Include gunicorn
│   └── ...
└── src/                        ← Frontend (deployed to Vercel)
```

---

## Example: Full Render Configuration

**Root Directory**: `backend`  
**Build Command**: `pip install -r requirements.txt`  
**Start Command**: `gunicorn --bind 0.0.0.0:10000 --workers 2 --worker-class sync --timeout 30 app:app`  
**Environment**:
```
FLASK_ENV=production
SECRET_KEY=your_strong_random_key
DATABASE_URL=mysql+pymysql://user:pass@host/gisave_db
DEBUG=False
```

---

## Deployment Result

After successful deployment, your backend will be available at:
```
https://gisave-backend.onrender.com
```

Update your frontend to call this URL instead of `http://localhost:5000`.

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Connect Render to GitHub repository
3. ✅ Configure Root Directory, Build, and Start commands (see above)
4. ✅ Set environment variables
5. ✅ Deploy
6. ✅ Test endpoints
7. ✅ Monitor logs

---

## Support

For Render-specific issues: https://render.com/docs
For Flask/Gunicorn issues: Check logs in Render dashboard

