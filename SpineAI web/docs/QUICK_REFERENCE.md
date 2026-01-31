# QUICK_REFERENCE.md

## Quick Reference Guide

### Command Reference

#### Frontend Commands
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

#### Backend Commands
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start with auto-reload (requires nodemon)
npm run dev

# Start production server
npm start
```

---

### Common Development Tasks

#### Add a New Page
1. Create file: `frontend/src/pages/NewPage.jsx`
2. Import in `frontend/src/App.jsx`
3. Add route: `<Route path="/newpage" element={<NewPage />} />`
4. Add navbar link (if public)

#### Add a New API Endpoint
1. Create/update controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Import route in `backend/src/server.js`
4. Update frontend service accordingly

#### Add Protected Route
```jsx
<Route
  path="/mypage"
  element={
    <ProtectedRoute requiredRole="user">
      <MyPage />
    </ProtectedRoute>
  }
/>
```

#### Use Authentication Hook
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // Use auth data...
}
```

#### Show Toast Notification
```jsx
import { toastService } from '../components/Toast';

toastService.success('Action completed!');
toastService.error('Something went wrong');
toastService.loading('Loading...');
```

---

### Folder Navigation Shortcuts

```
Frontend
├── pages/           # Route pages
├── components/      # Reusable components
├── context/         # Global state (AuthContext)
├── hooks/           # Custom hooks
├── services/        # API calls (authService)
├── utils/           # Helper functions
└── index.css        # Global styles

Backend
├── routes/          # API endpoints
├── controllers/     # Business logic
├── models/          # Database schemas
├── middleware/      # Express middleware
├── config/          # Configuration
└── server.js        # Main server file
```

---

### API Quick Reference

#### Authentication Endpoints

```
POST /api/auth/register
Body: { username, email, password }
Response: { user, accessToken, refreshToken }

POST /api/auth/login
Body: { email, password }
Response: { user, accessToken, refreshToken }

GET /api/auth/me (protected)
Headers: Authorization: Bearer <token>
Response: { user }

PUT /api/auth/profile (protected)
Body: { firstName, lastName, phone, ... }
Response: { user }

POST /api/auth/change-password (protected)
Body: { currentPassword, newPassword }
Response: { message }

POST /api/auth/refresh-token
Body: { refreshToken }
Response: { accessToken, refreshToken }

POST /api/auth/logout (protected)
Response: { message }
```

---

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development        # development or production
PORT=5000                   # Server port
MONGO_URI=mongodb://localhost:27017/spineai
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d              # Access token expiration
REFRESH_TOKEN_EXPIRE=30d   # Refresh token expiration
```

#### Frontend (.env.local - optional)
```
VITE_API_URL=http://localhost:5000
```

---

### Common Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin main

# Pull latest
git pull origin main
```

---

### Debugging Tips

#### Frontend
1. Open DevTools: F12
2. Check Console tab for errors
3. Check Network tab for API calls
4. Check Application tab for localStorage
5. Use React DevTools browser extension

#### Backend
1. Check terminal for logs
2. Check MongoDB connection: `mongosh`
3. Test API with curl or Postman
4. Check .env file is loaded correctly
5. Look for "Cannot find module" errors

#### Common Issues
```
Issue: API calls failing
Fix: Check CORS_ORIGIN in backend .env

Issue: Login not working
Fix: Check MongoDB is running and connected

Issue: Dark mode not saving
Fix: Check browser allows localStorage

Issue: Tokens not refreshing
Fix: Check JWT_SECRET is set in .env

Issue: Port already in use
Fix: Kill process or change PORT in .env
```

---

### Tailwind CSS Quick Classes

```jsx
// Spacing
className="p-4 m-2 px-6 py-3"

// Display
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// Colors
className="bg-blue-500 text-white"
className="hover:bg-blue-600 dark:bg-gray-800"

// Text
className="text-lg font-bold text-center"
className="text-gray-600 dark:text-gray-400"

// Borders & Shadows
className="border border-gray-300 rounded-lg"
className="shadow-lg hover:shadow-xl"

// Responsive
className="hidden md:flex"  // Hide on mobile, show on desktop
className="w-full md:w-1/2" // Full width on mobile, half on desktop
```

---

### React & Formik Quick Tips

#### Form with Validation
```jsx
import { useFormik } from 'formik';
import { Input, Button } from '../components/UI';
import { loginValidationSchema } from '../utils/validationSchemas';

const MyForm = () => {
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      // Handle submission
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Input
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.errors.email}
        touched={formik.touched.email}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

#### Using Context API
```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return isAuthenticated ? (
    <>
      <p>Welcome, {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <p>Please login</p>
  );
};
```

---

### MongoDB Quick Commands

```bash
# Start MongoDB shell
mongosh

# List databases
show databases

# Switch database
use spineai

# List collections
show collections

# View users
db.users.find()

# View specific user
db.users.findOne({ email: "test@example.com" })

# Count documents
db.users.countDocuments()

# Delete all users (careful!)
db.users.deleteMany({})

# Exit shell
exit
```

---

### Security Checklist Before Production

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS for all connections
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGIN to your domain
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set up HTTPS certificates
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Enable request validation
- [ ] Add input sanitization
- [ ] Set security headers
- [ ] Enable logging and monitoring
- [ ] Test authentication thoroughly

---

### Performance Optimization Tips

#### Frontend
- Use React.memo() for expensive components
- Implement code splitting with React.lazy()
- Optimize images
- Cache API responses
- Use loading skeletons

#### Backend
- Add database indexes
- Implement caching
- Use connection pooling
- Optimize queries
- Enable gzip compression

---

### Useful Resources

- [React Docs](https://react.dev)
- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Formik Docs](https://formik.org)
- [Axios Docs](https://axios-http.com)
- [JWT.io](https://jwt.io)
- [Vite Docs](https://vitejs.dev)

---

### Version Information

```
Node.js:        16.x or higher
npm:            8.x or higher
React:          18.2.0
React Router:   6.20.0
Express:        4.18.2
MongoDB:        4.x or higher (local) or Atlas
Tailwind CSS:   3.3.6
Vite:           5.0.8
```

---

### Support & Troubleshooting

1. **Check README.md** - Comprehensive project documentation
2. **Check SETUP_GUIDE.md** - Step-by-step setup instructions
3. **Check ARCHITECTURE.md** - System architecture details
4. **Check PROJECT_CHECKLIST.md** - Feature checklist
5. **Check console errors** - Browser DevTools
6. **Check server logs** - Terminal output
7. **Test API endpoints** - Use curl or Postman

---

## Quick Start (Copy-Paste)

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

### Open Browser
```
http://localhost:5173
```

### Test Registration
```
Username: testuser
Email: test@example.com
Password: TestPass123!
```

---

**Happy coding! 🚀**

For detailed information, refer to README.md, SETUP_GUIDE.md, and ARCHITECTURE.md
