# SpineAI - AI-Powered Spine Disease Detection System

A production-ready full-stack application for AI-powered spine disease detection using YOLO v8, featuring advanced authentication, real-time analysis, and comprehensive medical reporting.

## 🎯 Overview

SpineAI is a complete medical imaging analysis system featuring:
- **AI Analysis**: YOLO v8-based spine disease detection
- **Advanced Frontend**: React + Vite with Tailwind CSS
- **Real-time Analysis**: Python backend integration
- **Secure Authentication**: JWT-based with access & refresh tokens
- **Medical Reporting**: Comprehensive disease detection and recommendations
- **Database**: MongoDB with analysis history
- **Dark Mode**: Full dark mode support
- **Modern UX**: Framer Motion animations, responsive design

## 🏥 Medical Features

### Disease Detection:
- ✅ **Compression Fracture** - Vertebral compression detection
- ✅ **Herniated Disc** - Disc herniation analysis
- ✅ **Listhesis** - Vertebral slip detection
- ✅ **Scoliosis** - Spinal curvature (Cobb angle)
- ✅ **Lordosis** - Lordotic curve analysis

### Analysis Capabilities:
- 📊 Cobb angle measurement
- 🔍 Vertebrae counting and positioning
- 📈 Health scoring (0-100)
- 📋 Medical recommendations
- 🏥 Doctor consultation alerts

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- Trained YOLO model (`best.pt`)

### Installation

1️⃣ **Install Python Dependencies:**
```bash
# Run the automatic installer
powershell -ExecutionPolicy Bypass -File install_python.ps1

# Or manually
cd backend
pip install -r requirements.txt
```

2️⃣ **Place Your Model:**
```bash
# Copy your trained YOLO model
backend/models/best.pt
```

3️⃣ **Test Environment:**
```bash
cd backend
python test_environment.py
```

4️⃣ **Start Backend:**
```bash
cd backend
npm install
npm run dev
```

5️⃣ **Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📋 Documentation

- 📖 [**START HERE**](START_ANALYSIS_SETUP.md) - Complete setup guide
- 🐍 [Python Setup](backend/PYTHON_SETUP.md) - Detailed Python configuration
- ✅ [Completion Summary](START_ANALYSIS_COMPLETED.md) - What's been implemented

## 📁 Project Structure

```
postur_tespit/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Responsive navigation
│   │   │   ├── ProtectedRoute.jsx  # Auth protection
│   │   │   ├── Toast.jsx       # Toast notifications
│   │   │   └── UI.jsx          # Base UI components
│   │   ├── pages/              # Route pages
│   │   │   ├── Home.jsx        # Hero section
│   │   │   ├── Login.jsx       # Login form
│   │   │   ├── Register.jsx    # Registration form
│   │   │   ├── Dashboard.jsx   # Protected dashboard
│   │   │   └── Profile.jsx     # User profile
│   │   ├── context/            # Global state
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js      # Auth hook
│   │   │   └── useDarkMode.js  # Dark mode hook
│   │   ├── services/           # API services
│   │   │   └── authService.js  # Auth API
│   │   ├── utils/              # Utility functions
│   │   │   ├── validation.js   # Validation helpers
│   │   │   └── validationSchemas.js  # Formik schemas
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind config
│   ├── postcss.config.js       # PostCSS config
│   ├── package.json            # Dependencies
│   └── .gitignore
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── models/             # Database models
│   │   │   ├── User.js         # User schema
│   │   │   └── Analysis.js     # Analysis schema
│   │   ├── controllers/        # Route handlers
│   │   │   └── authController.js  # Auth logic
│   │   ├── routes/             # API routes
│   │   │   ├── authRoutes.js   # Auth endpoints
│   │   │   └── analysisRoutes.js # Analysis endpoints
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.js         # Auth middleware
│   │   │   └── tokenUtils.js   # JWT utilities
│   │   ├── config/             # Configuration
│   │   │   └── index.js        # Config file
│   │   └── server.js           # Express server
│   ├── package.json            # Dependencies
│   ├── .env.example            # Example env file
│   └── .gitignore
│
└── README.md                    # Project documentation
```

## 🔐 Authentication Flow

### Registration
1. User fills registration form (username, email, password, confirm password)
2. Form validation with Formik + Yup
3. Password strength validation (uppercase, lowercase, number, special char)
4. Backend creates new user with bcrypt-hashed password
5. JWT tokens generated (access + refresh)
6. Tokens stored in localStorage
7. User redirected to dashboard

### Login
1. User enters email and password
2. Backend validates credentials
3. Password compared with bcrypt hash
4. Access & refresh tokens generated
5. Tokens stored in localStorage
6. User state updated in Context API
7. Protected routes now accessible

### Token Refresh
- Access token expires (7 days)
- Axios interceptor detects 401 response
- Refresh token sent to backend
- New access token issued
- Request automatically retried
- Transparent to user

### Logout
- User clicks logout button
- Tokens cleared from localStorage
- Auth context reset
- User redirected to home page

## 🎨 UI/UX Features

### Responsive Navbar
- **Desktop**: Logo, nav links, auth buttons, dark mode toggle
- **Mobile**: Hamburger menu with smooth slide animation
- **Profile Dropdown**: Shows when logged in (Profile, Settings, Logout)
- **Dark Mode Toggle**: Sun/Moon icon with instant theme switch

### Modern Design Elements
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Gradient Text**: Eye-catching headings
- **Smooth Animations**: Framer Motion transitions
- **Loading Skeletons**: Placeholder UI while loading
- **Toast Notifications**: Success/error/info messages

### Form Validation
- **Real-time Validation**: Formik + Yup
- **Field-level Errors**: Shows inline error messages
- **Password Requirements**: Visual indicator of strength
- **Accessible Forms**: Proper labels and ARIA attributes

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (optional)
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Build for production
npm run build
```

Access at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# MONGO_URI=mongodb://localhost:27017/spineai
# JWT_SECRET=your-secret-key

# Start development server with auto-reload
npm run dev

# Or start production server
npm start
```

Server runs on `http://localhost:5000`

## 📋 API Endpoints

### Authentication Routes

```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/refresh-token   - Refresh access token
POST   /api/auth/logout          - Logout (protected)
GET    /api/auth/me              - Get current user (protected)
PUT    /api/auth/profile         - Update profile (protected)
POST   /api/auth/change-password - Change password (protected)
```

### Request/Response Examples

**Register**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "message": "User registered successfully",
  "user": { "_id", "username", "email", "role": "user" },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "message": "Login successful",
  "user": { "_id", "username", "email", "role": "user" },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

## 🔑 Role-Based Authorization

### User Roles
- **user**: Default role for regular users
- **admin**: Full access to system (can be set in database)

### Protected Routes
- `/dashboard` - Requires authentication
- `/profile` - Requires authentication
- `/settings` - Requires authentication

## 🛠️ Technology Stack

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first styling
- **Formik**: Form state management
- **Yup**: Schema validation
- **Framer Motion**: Animations
- **React Hot Toast**: Notifications
- **Lucide React**: Icons
- **Axios**: HTTP client

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variables
- **CORS**: Cross-origin requests
- **Nodemon**: Development auto-reload

## 🔄 Development Workflow

### Making Changes

**Frontend**
1. Changes are hot-reloaded in development
2. Tailwind CSS classes are compiled on-the-fly
3. React Fast Refresh preserves component state

**Backend**
1. Nodemon watches for file changes
2. Server automatically restarts
3. Changes visible immediately

### Testing Authentication

1. **Register**: Create new account
2. **Check Tokens**: Open DevTools → Application → LocalStorage
3. **Login**: Sign in with credentials
4. **Protected Routes**: Visit dashboard (redirects if not logged in)
5. **Token Expiry**: Manually clear access token, then make request (auto-refresh)

## 🚀 Production Deployment

### Frontend (Netlify/Vercel)

```bash
# Build
npm run build

# Deploy dist/ folder
```

### Backend (Heroku/Railway/Render)

```bash
# Set environment variables
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=strong_random_secret
NODE_ENV=production

# Deploy
git push heroku main
```

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/spineai
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env.local)
```
VITE_API_URL=https://api.yourdomain.com
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
Solution: Ensure MongoDB is running
  Mac: brew services start mongodb-community
  Windows: mongod
  Atlas: Check connection string and IP whitelist
```

### CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Check CORS_ORIGIN in backend .env
```

### Token Expired Errors
```
Error: Token expired
Solution: Automatic refresh handled by axios interceptor
Fallback: Clear localStorage and login again
```

### Port Already in Use
```
Error: EADDRINUSE: address already in use
Solution: 
  Frontend: npx kill-port 5173
  Backend: npx kill-port 5000
```

## 📚 Code Examples

### Using useAuth Hook

```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  return (
    <>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </>
  );
}
```

### Toast Notifications

```jsx
import { toastService } from '../components/Toast';

// Simple notifications
toastService.success('Profile updated!');
toastService.error('Something went wrong');

// Promise-based
toastService.promise(
  fetch('/api/data'),
  {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: 'Failed to load'
  }
);
```

### Protected Routes

```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute requiredRole="user">
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 🎯 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] User profile pictures
- [ ] Analysis image upload and storage
- [ ] Advanced analytics dashboard
- [ ] User activity logging
- [ ] Admin user management panel
- [ ] API rate limiting
- [ ] Request caching
- [ ] WebSocket for real-time updates

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🤝 Support

For support, email support@spineai.com or create an issue in the repository.

---

**Made with ❤️ by SpineAI Team**
