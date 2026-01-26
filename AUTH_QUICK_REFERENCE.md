# 🔐 Auth System - Quick Reference

## 🎯 Common Tasks

### Frontend

#### Check if user is logged in
```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return isAuthenticated ? <Dashboard /> : <Login />;
}
```

#### Login programmatically
```jsx
const { login } = useAuth();

try {
  await login(email, password);
  navigate('/dashboard');
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### Logout
```jsx
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate('/login');
};
```

#### Protect a route
```jsx
<Route path="/secret" element={
  <PrivateRoute>
    <SecretPage />
  </PrivateRoute>
} />
```

---

### Backend

#### Protect an endpoint
```javascript
import { protect } from '../middleware/auth.js';

router.get('/protected', protect, async (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

#### Restrict to local auth only
```javascript
import { protect, restrictTo } from '../middleware/auth.js';

router.put('/change-password', 
  protect, 
  restrictTo('local'), 
  changePasswordController
);
```

#### Optional authentication
```javascript
import { optionalAuth } from '../middleware/auth.js';

router.get('/content', optionalAuth, (req, res) => {
  if (req.user) {
    // Show personalized content
  } else {
    // Show public content
  }
});
```

---

## 📡 API Reference

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🗂️ File Locations

### Backend
- **User Model**: `server/src/models/User.js`
- **Auth Controller**: `server/src/controllers/authController.js`
- **Auth Routes**: `server/src/routes/auth.routes.js`
- **Auth Middleware**: `server/src/middleware/auth.js`
- **JWT Utils**: `server/src/utils/jwtUtils.js`
- **Passport Config**: `server/src/config/passport.js`

### Frontend
- **Auth Context**: `client/src/contexts/AuthContext.jsx`
- **Login/Signup Page**: `client/src/components/AuthPage.jsx`
- **OAuth Callback**: `client/src/components/AuthCallback.jsx`
- **Private Route**: `client/src/components/PrivateRoute.jsx`
- **API Client**: `client/src/api/client.js`

---

## 🔑 Key Concepts

### JWT (JSON Web Token)
- Stateless authentication
- Contains user info in the token itself
- Signed with secret key
- Expires after set time (default: 7 days)
- Stored in sessionStorage (not localStorage for security)

### Password Hashing
- Uses bcrypt with 10 salt rounds
- Automatically hashed on user save
- Never stored in plain text
- Compared securely with `user.comparePassword()`

### OAuth Flow
1. User clicks "Sign in with Google"
2. Redirected to Google login
3. User authorizes
4. Google redirects to `/auth/google/callback`
5. Backend exchanges code for profile
6. Find or create user
7. Generate JWT
8. Redirect to frontend with token

---

## ⚡ Quick Fixes

### "No token provided"
- User needs to log in
- Check Authorization header format: `Bearer <token>`

### "Token has expired"
- User needs to log in again
- Check JWT_EXPIRE in .env

### "Invalid token"
- Token might be corrupted
- Check JWT_SECRET matches between requests
- Try logging in again

### "Google authentication failed"
- Check Google OAuth credentials in .env
- Verify redirect URI in Google Console
- Ensure Google+ API is enabled

---

## 🛠️ Development Tips

### Testing Authentication
```javascript
// In browser console
window.authToken // Check if token exists
sessionStorage.getItem('authToken') // Check stored token
```

### Clear Authentication
```javascript
// In browser console
sessionStorage.clear()
window.location.reload()
```

### Test Protected Routes
```bash
# Without token (should fail)
curl http://localhost:5000/api/v1/protected

# With token (should succeed)
curl http://localhost:5000/api/v1/protected \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Environment Variables

```env
# Required
JWT_SECRET=your_secret_key_here
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173

# Optional
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

---

## 🐛 Debug Mode

Enable detailed auth logging:

```javascript
// In AuthContext.jsx
useEffect(() => {
  console.log('[Auth] State changed:', { user, isAuthenticated, token });
}, [user, isAuthenticated, token]);
```

```javascript
// In auth.js middleware
export const protect = async (req, res, next) => {
  console.log('[Auth] Headers:', req.headers);
  console.log('[Auth] Token:', extractTokenFromHeader(req));
  // ... rest of code
};
```

---

## 📞 Support

Check these files for detailed explanations:
- Backend: See comments in `authController.js`
- Frontend: See comments in `AuthContext.jsx`
- Complete guide: `AUTH_SETUP_COMPLETE.md`
