# Security & Setup Guide

## ⚠️ IMPORTANT: Before Committing to Git

### 1. Check if .env files are tracked

Run this command to check:

```bash
git status
```

If you see `.env` files listed, they might be tracked. Remove them from git:

```bash
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env files from git tracking"
```

### 2. Verify .gitignore

The `.env` files should already be in `.gitignore` (they are), but double-check:

- ✅ `.env` is in `.gitignore`
- ✅ `.env.local` is in `.gitignore`

### 3. Fix NPM Vulnerabilities in Frontend

Run these commands in the frontend directory:

```bash
cd frontend
npm audit fix
```

If that doesn't fix all issues, you can try:

```bash
npm audit fix --force
```

⚠️ Note: `--force` may cause breaking changes, so test after running.

### 4. Update Documentation

Update README.md to tell users to:

1. Copy `.env.example` to `.env` in both backend and frontend
2. Update the values with their own credentials

## Environment Variables Setup

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and update:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Generate a secure random string (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Frontend (.env)

Copy `frontend/.env.example` to `frontend/.env` (usually no changes needed for local development)

## Security Best Practices ✅

1. ✅ Never commit `.env` files
2. ✅ Always provide `.env.example` files
3. ✅ Use strong JWT secrets
4. ✅ Keep dependencies updated
5. ✅ Run `npm audit` regularly
