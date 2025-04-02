# 🎴 Cardly - Digital Business Card Platform

A modern, full-stack digital business card platform built with React, Node.js, and MongoDB. Create, share, and manage beautiful digital business cards with real-time analytics and admin dashboard.

## ✨ Features

### 🎨 **Card Management**
- **Beautiful Card Designs**: 8+ Nepali-inspired templates
- **Custom Card Creation**: Easy-to-use card builder
- **QR Code Generation**: Instant sharing via QR codes
- **Card Analytics**: Track views, loves, shares, and downloads
- **Contact Export**: Save contacts as VCF files

### 👥 **User Features**
- **User Registration & Authentication**: Secure login system
- **Personal Library**: Save and organize favorite cards
- **Card Discovery**: Browse and discover new cards
- **Real-time Updates**: Live card interactions
- **Responsive Design**: Works on all devices

### 🛠️ **Admin Dashboard**
- **Comprehensive Analytics**: User growth, card statistics, engagement metrics
- **User Management**: Manage users, ban/unban, edit profiles
- **Card Management**: Feature cards, moderate content, track performance
- **Template Management**: Create, edit, and manage card templates
- **System Settings**: Configure platform settings and backups

### 🎯 **Technical Features**
- **Cloudinary Integration**: Optimized image uploads and CDN
- **Real-time Data**: Live statistics and analytics
- **Secure Authentication**: JWT-based authentication
- **MongoDB Database**: Scalable data storage
- **RESTful API**: Clean, documented API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (optional, demo mode available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visiting-card-app-new
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend (.env file in backend directory)
   DATABASE_URL=mongodb://localhost:27017/cardly
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=5050
   
   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Seed the database with Nepali-style data**
   ```bash
   cd backend
   node scripts/seedNepaliData.js
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   cd backend
   npm start

   # Start frontend server (in new terminal)
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5050
   - Admin Panel: http://localhost:5173/admin

## 👑 Admin Access

**Default Admin Credentials:**
- Email: `admin@cardly.com`
- Password: `admin123`

## 📊 Sample Data

The application comes pre-loaded with Nepali-style sample data:

- **20 Users**: Suzan Ghimire, Suzan Ghimire, etc.
- **8 Templates**: Nepal Traditional, Himalayan Blue, Kathmandu Modern, etc.
- **100 Cards**: Professional cards with realistic engagement metrics
- **Real Analytics**: Live statistics and performance data

## 🏗️ Project Structure

```
visiting-card-app-new/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # API route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utilities (Cloudinary, etc.)
│   ├── scripts/            # Database seeding scripts
│   └── config.env          # Environment variables
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── features/       # Redux slices and thunks
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── public/             # Static assets
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Cards
- `GET /api/cards` - Get all cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get specific card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/cards` - Card management
- `GET /api/admin/templates` - Template management
- `GET /api/admin/analytics` - Analytics data

## 🎨 Templates

The platform includes 8 beautiful Nepali-inspired templates:

1. **Nepal Traditional** - Cultural elements and traditional design
2. **Himalayan Blue** - Inspired by Himalayan mountains
3. **Kathmandu Modern** - Contemporary city design
4. **Pokhara Serene** - Peaceful lake-inspired design
5. **Nepal Heritage** - Traditional patterns and heritage
6. **Annapurna Elegant** - Sophisticated mountain range design
7. **Lumbini Peaceful** - Minimalist Buddha-inspired design
8. **Chitwan Wild** - Dynamic wildlife-inspired design

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request protection
- **Rate Limiting**: API rate limiting for security
- **Admin Middleware**: Protected admin routes

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Production Deployment

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL=your-mongodb-atlas-url
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Build Commands
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📈 Analytics & Monitoring

The admin dashboard provides comprehensive analytics:
- User growth trends
- Card creation statistics
- Engagement metrics (views, loves, shares)
- Geographic analytics
- Device usage statistics
- Top performing cards

## 🔧 Customization

### Adding New Templates
1. Create template in admin panel
2. Design using the template builder
3. Set template properties (category, featured status)
4. Publish for users

### Customizing Card Fields
Edit the card model in `backend/src/models/cardModel.js` to add custom fields.

### Styling
The application uses Tailwind CSS. Customize styles in `frontend/src/styles/`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the admin dashboard for system status
- Review the API documentation

---

**Built with ❤️ using React, Node.js, MongoDB, and Cloudinary by Suzan Ghimire** 