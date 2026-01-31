# SETUP_GUIDE.md

## Quick Start Guide

This guide will help you get the SpineAI application running in minutes.

## Prerequisites

- **Node.js** 16.x or higher (LTS recommended)
- **npm** 8.x or higher
- **MongoDB** (either local installation or MongoDB Atlas)
- **Git** (for version control)

## Step 1: MongoDB Setup

### Option A: Local MongoDB (macOS with Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongo # Should open MongoDB shell
```

### Option B: MongoDB (Windows)

- Download from: https://www.mongodb.com/try/download/community
- Run installer and follow instructions
- MongoDB runs as a Windows service automatically

### Option C: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/spineai`
5. Update backend `.env` file with this URI

## Step 2: Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
```

### Configure .env

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/spineai
JWT_SECRET=your-super-secret-jwt-key-change-this-12345
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

### Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 Environment: development
🔐 JWT Secret configured: Yes
```

**Test Backend:**
```bash
# In another terminal
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-25T10:30:00.000Z",
  "environment": "development"
}
```

## Step 3: Frontend Setup

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access Application

Open browser and visit: **http://localhost:5173**

## Testing the Application

### 1. Test Registration

1. Click "Register" button
2. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Click "Create Account"
4. Should see success toast and redirect to dashboard

### 2. Test Login

1. Click "Logout" button
2. Click "Login" button
3. Enter email: `test@example.com`
4. Enter password: `TestPass123!`
5. Click "Sign In"
6. Should see dashboard with user's analysis data

### 3. Test Protected Routes

1. Try accessing `/dashboard` directly without login
2. Should redirect to login page
3. Login and try again
4. Should show dashboard

### 4. Test Dark Mode

1. Click moon/sun icon in navbar
2. Page should toggle between light/dark mode
3. Refresh page - theme should persist

### 5. Test Token Refresh

1. Open DevTools (F12)
2. Go to Application → LocalStorage
3. Copy the `accessToken` value
4. Delete it manually
5. Make any request (e.g., visit dashboard)
6. Axios interceptor should refresh token automatically
7. Request should complete successfully

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
- Check if MongoDB is running: `mongosh`
- Mac: `brew services list` (check status)
- Windows: Services → MongoDB Community Server (should be Running)
- If using Atlas: Check connection string and firewall rules

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find and kill process using port 5000
lsof -i :5000  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
```

### Issue: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Check `CORS_ORIGIN` in backend `.env`
- Should be `http://localhost:5173` for local development
- Restart backend server after changing

### Issue: "Cannot find module" errors

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force
```

### Issue: Form validation not working

**Solutions:**
- Check browser console for errors (F12)
- Ensure Formik/Yup are installed: `npm list formik yup`
- Clear browser cache: Ctrl+Shift+Delete

## NPM Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
npm test             # Run tests (when configured)
```

## API Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Copy the `accessToken` from response

### Get Current User (Protected)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

## Next Steps

1. **Customize Branding**
   - Change logo in navbar
   - Update colors in Tailwind config
   - Modify hero section text

2. **Add Your Features**
   - Create new pages
   - Add API endpoints
   - Implement image upload

3. **Database**
   - Add more collections
   - Create indexes for performance
   - Set up backup strategy

4. **Deployment**
   - Deploy frontend to Netlify/Vercel
   - Deploy backend to Heroku/Railway
   - Set up CI/CD pipeline

5. **Security**
   - Change JWT secret
   - Enable HTTPS
   - Set up rate limiting
   - Add input validation

## Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [JWT Introduction](https://jwt.io/introduction)
- [Formik Documentation](https://formik.org)

## Getting Help

1. Check the main README.md for detailed documentation
2. Review error messages in browser console and server logs
3. Check project structure in README.md
4. Verify all dependencies are installed
5. Ensure environment variables are correctly set

## What to Do Next?

With your development environment running:

1. **Explore the Code**
   - Read through components in `frontend/src/components`
   - Check authentication flow in `frontend/src/context`
   - Review API integration in `frontend/src/services`

2. **Try Features**
   - Register a new account
   - Log in and explore dashboard
   - Update your profile
   - Toggle dark mode

3. **Make Your First Change**
   - Edit homepage heading
   - Change button colors
   - Modify error messages

4. **Build Something**
   - Add new pages
   - Create custom components
   - Implement new API endpoints

Happy coding! 🚀
