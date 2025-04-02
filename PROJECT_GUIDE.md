# 🎴 Cardly - Complete Project Guide

## 📋 Overview

**Cardly** is a modern digital business card platform built with React, Node.js, and MongoDB. Users can create, share, and manage professional digital business cards with QR codes and real-time analytics.

---

## 🏗️ System Architecture

```
Frontend (React) ←→ Backend (Node.js) ←→ Database (MongoDB)
       ↓                    ↓                    ↓
   Cloudinary (Images)   JWT Auth          Collections
```

### Key Components:
- **Frontend**: React with Redux, Tailwind CSS, Framer Motion
- **Backend**: Node.js with Express, MongoDB with Mongoose
- **Authentication**: JWT with SHA256 algorithm
- **Images**: Cloudinary CDN integration
- **QR Codes**: Unique URL generation and tracking

---

## 🔐 Authentication System (JWT SHA256)

### JWT Token Structure
```javascript
// Token Payload
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1516239022,
  "exp": 1516325422
}
```

### JWT Implementation
```javascript
// Token Generation
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256' // SHA256 algorithm
  });
};

// Token Verification
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256']
  });
};

// Password Hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

---

## 📱 QR Code Algorithm

### QR Code Generation Process

1. **Unique URL Creation**
```javascript
const generateShortLink = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `card-${timestamp}-${random}`;
};
```

2. **QR Code Generation**
```javascript
import QRCode from 'qrcode';

const generateQRCode = async (cardUrl) => {
  const qrCodeDataUrl = await QRCode.toDataURL(cardUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
  
  return qrCodeDataUrl;
};
```

3. **Complete QR Process**
```javascript
const createCardWithQR = async (cardData) => {
  // Generate unique short link
  const shortLink = generateShortLink();
  const cardUrl = `${process.env.FRONTEND_URL}/card/${shortLink}`;
  
  // Generate QR code
  const qrCodeDataUrl = await generateQRCode(cardUrl);
  
  // Upload to Cloudinary
  const qrCodeUrl = await uploadToCloudinary(qrCodeDataUrl, {
    folder: 'cardly_qr',
    width: 300,
    height: 300,
    crop: 'fill'
  });
  
  // Save card with QR code
  const card = new Card({
    ...cardData,
    shortLink,
    qrCode: qrCodeUrl
  });
  
  await card.save();
  return card;
};
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  name: String,
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date
}
```

### Card Collection
```javascript
{
  _id: ObjectId,
  ownerUserId: ObjectId (ref: User),
  title: String,
  fullName: String,
  jobTitle: String,
  company: String,
  email: String,
  phone: String,
  website: String,
  address: String,
  bio: String,
  shortLink: String (unique),
  qrCode: String (Cloudinary URL),
  isPublic: Boolean,
  views: Number,
  loveCount: Number,
  shares: Number,
  downloads: Number,
  createdAt: Date
}
```

### Template Collection
```javascript
{
  _id: ObjectId,
  id: String (unique),
  name: String,
  description: String,
  category: String,
  preview: {
    backgroundColor: String,
    elements: [Object]
  },
  design: {
    backgroundColor: String,
    elements: [Object]
  },
  isActive: Boolean,
  isFeatured: Boolean,
  usageCount: Number,
  createdAt: Date
}
```

---

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Admin/          # Admin dashboard components
│   ├── Cards/          # Card management components
│   └── Layout/         # Layout components
├── pages/              # Page components
├── features/           # Redux slices and thunks
├── services/           # API services
└── utils/              # Utility functions
```

### State Management (Redux)
```javascript
// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});
```

---

## 🖥️ Backend Architecture

### Directory Structure
```
src/
├── app.js              # Main application
├── controllers/        # Request handlers
├── models/            # Database models
├── routes/            # API routes
├── services/          # Business logic
├── middleware/        # Custom middleware
└── utils/             # Utility functions
```

### Main Application Setup
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',')
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/admin', adminRoutes);

// Database connection
mongoose.connect(process.env.DATABASE_URL);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Cards
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get specific card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/cards` - Card management
- `GET /api/admin/analytics` - Analytics data

---

## 🎯 Features & Workflows

### 1. User Registration & Authentication
```
User visits site → Register/Login → Enter credentials → 
Backend validates → Generate JWT token → Store token → 
Redirect to dashboard
```

### 2. Card Creation Process
```
User clicks Create Card → Select template → Fill information → 
Preview design → Save card → Generate QR code → 
Upload to Cloudinary → Save to database → Redirect to view
```

### 3. Card Sharing & Analytics
```
User shares card → Generate unique URL → Create QR code → 
Someone scans QR → View card details → Track analytics → 
Update view count → Store in database
```

### 4. Admin Dashboard
```
Admin login → View dashboard → Check analytics → 
Manage users → Manage cards → View templates → 
System settings
```

---

## 🛠️ Admin Dashboard

### Dashboard Components
1. **Statistics Cards**
   - Total Users, Cards, Views, Revenue

2. **System Health**
   - Database, Server, API Status

3. **Recent Activity**
   - User registrations, Card creations

4. **Popular Templates**
   - Usage statistics, Ratings

### User Management
```javascript
const fetchUsers = async (filters) => {
  const params = new URLSearchParams({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status
  });
  
  const response = await fetch(`/api/admin/users?${params}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  return response.json();
};
```

---

## ☁️ Cloudinary Integration

### Image Upload Process
```javascript
const uploadToCloudinary = async (file, options = {}) => {
  const uploadOptions = {
    folder: 'cardly',
    resource_type: 'auto',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    ...options
  };

  const result = await cloudinary.uploader.upload(file, uploadOptions);
  return result;
};
```

### Image Types
- **Profile Photos**: 400x400px, face detection
- **Card Backgrounds**: 800x600px, high quality
- **QR Codes**: 300x300px, best quality

---

## 🔒 Security Features

### Password Security
```javascript
// Password hashing with bcrypt
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Password verification
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### JWT Security
```javascript
// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### Rate Limiting
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Analytics & Monitoring

### Analytics Tracking
```javascript
// Card view tracking
const trackCardView = async (cardId, viewerInfo) => {
  await Card.findByIdAndUpdate(cardId, {
    $inc: { views: 1 },
    $push: {
      viewHistory: {
        timestamp: new Date(),
        ip: viewerInfo.ip,
        userAgent: viewerInfo.userAgent
      }
    }
  });
};

// Engagement tracking
const trackEngagement = async (cardId, action) => {
  const updateField = action === 'love' ? 'loveCount' : 
                     action === 'share' ? 'shares' : 
                     action === 'download' ? 'downloads' : null;
  
  if (updateField) {
    await Card.findByIdAndUpdate(cardId, {
      $inc: { [updateField]: 1 }
    });
  }
};
```

### Real-time Analytics
```javascript
const getDashboardStats = async () => {
  return {
    totalUsers: await User.countDocuments(),
    totalCards: await Card.countDocuments(),
    totalViews: await Card.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]),
    recentActivity: await getRecentActivity(),
    popularTemplates: await getPopularTemplates()
  };
};
```

---

## 🎨 Template System

### Template Structure
```javascript
const templateExample = {
  id: 'template-nepal-1',
  name: 'Nepal Traditional',
  category: 'Traditional',
  preview: {
    backgroundColor: '#ffffff',
    elements: [
      {
        type: 'Text',
        x: 60,
        y: 100,
        text: '{{fullName}}',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#1f2937'
      }
    ]
  }
};
```

### Template Rendering
```javascript
const renderTemplate = (template, cardData) => {
  return template.elements.map(element => {
    if (element.type === 'Text') {
      let text = element.text;
      
      // Replace placeholders with actual data
      if (text === '{{fullName}}') text = cardData.fullName;
      else if (text === '{{jobTitle}}') text = cardData.jobTitle;
      else if (text === '{{email}}') text = cardData.email;
      
      return { ...element, text };
    }
    return element;
  });
};
```

---

## 🚀 Deployment

### Environment Variables
```bash
DATABASE_URL=mongodb://localhost:27017/cardly
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=5050
NODE_ENV=production
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

---

## 📱 Mobile Responsiveness

### Responsive Features
- **Flexible Grid**: Tailwind CSS grid system
- **Mobile-First**: Design starts with mobile
- **Touch-Friendly**: Large buttons and targets
- **Optimized Images**: Responsive image sizing
- **PWA Support**: Can be installed on mobile

---

## 🔄 Data Flow Summary

### Complete User Journey
1. **Registration**: User creates account → JWT token generated
2. **Login**: User authenticates → Token stored
3. **Card Creation**: User fills form → Template applied → QR code generated
4. **Card Sharing**: QR code scanned → Analytics tracked
5. **Admin Management**: Admin monitors → Analytics reviewed

### Technical Flow
1. **Frontend Request** → React component dispatches action
2. **Redux Thunk** → API call to backend
3. **Backend Route** → Controller handles request
4. **Service Layer** → Business logic processing
5. **Database** → MongoDB operation
6. **Response** → Data returned to frontend
7. **State Update** → Redux store updated
8. **UI Update** → Component re-renders

---

## 🎯 Key Algorithms Explained

### 1. JWT SHA256 Algorithm
- **Purpose**: Secure token-based authentication
- **Process**: 
  - User login → Password verification → Generate JWT with SHA256
  - Token contains user info and expiration
  - Each API request → Verify token → Extract user info
- **Security**: SHA256 hashing, token expiration, role-based access

### 2. QR Code Algorithm
- **Purpose**: Generate unique sharing links for cards
- **Process**:
  - Create unique short link → Generate QR code → Upload to Cloudinary
  - QR code contains card URL → Scan → Redirect to card page
  - Track analytics on each scan
- **Features**: High quality, error correction, analytics tracking

### 3. Password Security (bcrypt)
- **Purpose**: Secure password storage and verification
- **Process**: 
  - Registration → Hash password with bcrypt → Store in database
  - Login → Compare password with hash → Generate JWT
- **Security**: Salt rounds, one-way hashing, timing attack protection

---

## 📈 Performance Features

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Browser caching for static assets
- **Minification**: Compressed JavaScript and CSS

### Backend Optimization
- **Database Indexing**: Proper MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Rate Limiting**: API rate limiting
- **Compression**: Gzip compression for responses

---

## 🎯 Conclusion

Cardly demonstrates modern web development practices with:

- **Secure Authentication**: JWT with SHA256 algorithm
- **QR Code Generation**: Unique URLs with analytics
- **Real-time Analytics**: User engagement tracking
- **Admin Dashboard**: Full platform management
- **Responsive Design**: Mobile-first approach
- **Cloud Integration**: Cloudinary for images
- **Production Ready**: Scalable architecture

The platform successfully combines frontend and backend technologies to create a seamless digital business card experience.

---

**Built with ❤️ using React, Node.js, MongoDB, and Cloudinary** 