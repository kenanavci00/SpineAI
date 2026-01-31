# ARCHITECTURE.md

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Pages      │  │ Components   │  │   Context    │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ • Home       │  │ • Navbar     │  │ • AuthCtx    │           │
│  │ • Login      │  │ • UI         │  │ • Dark Mode  │           │
│  │ • Register   │  │ • Toast      │  │              │           │
│  │ • Dashboard  │  │ • Protected  │  │              │           │
│  │ • Profile    │  │   Route      │  │              │           │
│  │ • About      │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Services & Hooks                             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • authService.js (Axios + interceptors)                  │   │
│  │ • useAuth() (React Context Hook)                         │   │
│  │ • useDarkMode() (Theme Management)                       │   │
│  │ • Validation schemas (Formik + Yup)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │ HTTP/REST
                           │ (Axios with JWT)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Node.js + Express)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Routes     │  │ Controllers  │  │  Middleware  │           │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤           │
│  │ • auth/*     │  │ • register   │  │ • auth()     │           │
│  │ • analyses/* │  │ • login      │  │ • authorize()│           │
│  │              │  │ • getUser    │  │ • errorHdlr()│           │
│  │              │  │ • updateProf │  │ • logger()   │           │
│  │              │  │ • changePwd  │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Database Models (Mongoose)                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • User Schema                                             │   │
│  │   - username, email, password (hashed)                   │   │
│  │   - role (user/admin), lastLogin, timestamps             │   │
│  │ • Analysis Schema                                         │   │
│  │   - userId, imageUrl, result, score                      │   │
│  │   - measurements, issues, recommendations               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │ MongoDB Driver
                           │ (Mongoose ODM)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • users collection                                              │
│  • analyses collection                                           │
│  • indexes for performance optimization                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
User Interaction                  Frontend                  Backend
─────────────────────────────────────────────────────────────────
                                                              
    1. Fill form ──────────────>                             
                                                              
                   2. Submit /register
                     {username, email, pwd}
                   ────────────────────────────>
                                              
                                              3. Create User
                                              (Hash password)
                                              
                                              4. Generate tokens
                                              (AccessToken)
                                              (RefreshToken)
                                              
                   5. Receive tokens
                   <────────────────────────
                
                6. Store in localStorage
                (accessToken, refreshToken, user)
                
                7. Set AuthContext
                
                8. Redirect to /dashboard
```

## Request Flow with Token Refresh

```
Client Action                   Frontend                   Backend
──────────────────────────────────────────────────────────────────

User requests data             Axios ──────────────────────>
                               (Authorization header with
                                accessToken)
                                                            
                                                    ✓ Valid?
                                                    Return data
                                <──────────────────
                               (Success)
                                
────────────────────────────────────────────────────────────────

User waits 7+ days,             Axios ──────────────────────>
Makes new request             (Authorization header with
                               old accessToken)
                               
                                              ✗ Expired
                                              Return 401
                                <──────────────────
                                              
                               Interceptor detects 401
                               
                               Send refreshToken ─────────>
                               (POST /api/auth/refresh-token)
                               
                                              Generate new
                                              accessToken
                                              
                               <─────────────────
                               (new accessToken,
                                new refreshToken)
                               
                               Store new tokens
                               
                               Retry original request
                               (with new accessToken)
                               
                                              ✓ Valid
                                              Return data
                                <──────────────────
                               (Success)
                               
Show data to user
```

## Component Hierarchy

```
App
├── AuthProvider (Context wrapper)
│   ├── Navbar
│   │   ├── Logo/Link
│   │   ├── Nav links
│   │   ├── Dark mode toggle
│   │   └── Auth section
│   │       ├── Login button
│   │       ├── Register button
│   │       └── Profile dropdown
│   │
│   └── Routes
│       ├── / (Home)
│       │   └── Hero section
│       │   └── Features grid
│       │   └── CTA
│       │
│       ├── /about (About)
│       │   └── Mission statement
│       │   └── Features list
│       │   └── Tech stack
│       │
│       ├── /login (Login)
│       │   └── Form
│       │   └── Validation errors
│       │   └── Toast notifications
│       │
│       ├── /register (Register)
│       │   └── Form
│       │   └── Password requirements
│       │   └── Validation errors
│       │
│       ├── ProtectedRoute
│       │   ├── /dashboard (Dashboard)
│       │   │   ├── Stats cards
│       │   │   ├── Analysis list
│       │   │   └── Loading skeletons
│       │   │
│       │   └── /profile (Profile)
│       │       ├── Profile info
│       │       ├── Edit form
│       │       └── Security section
│       │
│       └── Toaster (Toast notifications)
```

## Data Flow State Management

```
User logs in
    │
    ├─> authService.login()
    │       │
    │       ├─> POST /api/auth/login
    │       │       │
    │       │       ├─> Backend validates
    │       │       └─> Returns tokens + user data
    │       │
    │       ├─> Store in localStorage
    │       └─> Return user data
    │
    └─> AuthContext updated
            │
            ├─> user = {_id, username, email, role}
            ├─> isAuthenticated = true
            └─> Triggers re-render
                    │
                    └─> Components using useAuth()
                        get updated state
                            │
                            └─> Navbar shows profile dropdown
                            └─> Protected routes allow access
                            └─> Dashboard displays user data
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: Frontend                                        │
│  ├─> HTTPS only (production)                             │
│  ├─> localStorage for tokens (not cookies)              │
│  ├─> Formik + Yup validation                             │
│  └─> Protected routes                                     │
│                                                            │
│  Layer 2: Transport                                       │
│  ├─> TLS/SSL encryption                                  │
│  ├─> CORS validation                                      │
│  └─> HTTPS headers                                        │
│                                                            │
│  Layer 3: Backend                                         │
│  ├─> JWT verification                                     │
│  ├─> Token expiration (7 days)                           │
│  ├─> Middleware authentication                           │
│  ├─> Role-based authorization                            │
│  └─> Input validation                                     │
│                                                            │
│  Layer 4: Database                                        │
│  ├─> bcrypt password hashing (10 salt rounds)           │
│  ├─> Indexed fields for security                         │
│  ├─> Unique constraints (email, username)               │
│  └─> Timestamps for audit trail                          │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Error occurs
    │
    ├─> Frontend catches error
    │       │
    │       ├─> Console logs for debugging
    │       ├─> Displays user-friendly toast
    │       └─> Updates UI state
    │
    └─> Backend error middleware
            │
            ├─> Logs error details
            ├─> Formats error response
            ├─> Sets appropriate HTTP status
            ├─> Sends to frontend
            │
            └─> Frontend displays
                    │
                    ├─> Network errors: "Connection failed"
                    ├─> 400 errors: "Invalid request"
                    ├─> 401 errors: "Unauthorized"
                    ├─> 403 errors: "Access denied"
                    ├─> 404 errors: "Not found"
                    └─> 500 errors: "Server error"
```

## Scalability Considerations

### Frontend Scalability
- Code splitting with Vite
- Lazy loading routes with React.lazy()
- Image optimization
- Component memoization
- Redux/Zustand for complex state (future)

### Backend Scalability
- API rate limiting
- Caching strategies (Redis)
- Database indexing
- Connection pooling
- Load balancing
- Microservices (future)

### Database Scalability
- Sharding strategy
- Replica sets for HA
- Regular backups
- Query optimization
- Archive old data

## Performance Metrics

```
Frontend:
├─> Lighthouse: 90+ score (target)
├─> First Paint: < 1s
├─> First Contentful Paint: < 1.5s
├─> Time to Interactive: < 3s
└─> Cumulative Layout Shift: < 0.1

Backend:
├─> API Response Time: < 200ms (p95)
├─> Database Query Time: < 50ms (p95)
├─> Error Rate: < 0.1%
├─> Uptime: 99.9%
└─> Requests/second capacity: 1000+
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│              PRODUCTION DEPLOYMENT                    │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────┐          ┌────────────────┐    │
│  │ Netlify/Vercel │          │  Railway/Render│    │
│  │    (Frontend)  │          │   (Backend)    │    │
│  ├────────────────┤          ├────────────────┤    │
│  │ Static files   │          │ Node.js app    │    │
│  │ CDN enabled    │          │ MongoDB Atlas  │    │
│  │ HTTPS auto     │          │ HTTPS enabled  │    │
│  └────────────────┘          └────────────────┘    │
│         │                             │             │
│         └──────────────┬──────────────┘             │
│                        │                            │
│                  GitHub Actions                     │
│              (CI/CD Pipeline)                       │
│                                                     │
│  Push to main
│      ├─> Run tests
│      ├─> Build frontend
│      ├─> Build backend
│      ├─> Deploy to production
│      └─> Run smoke tests
│                                                     │
└──────────────────────────────────────────────────────┘
```

---

This architecture is designed to be:
- **Scalable**: Ready to grow with more users
- **Secure**: Multiple layers of security
- **Maintainable**: Clean separation of concerns
- **Performant**: Optimized for speed
- **Production-Ready**: Following best practices
