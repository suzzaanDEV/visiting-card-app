# 🎨 Cardly - Complete Digital Business Card Solution

A modern, full-stack visiting card application with template-based card creation, admin panel, and QR code functionality.

## ✨ Features

### 🎯 Core Features
- **Template-based Card Creation**: Choose from 6 beautiful pre-designed templates
- **Advanced Card Editor**: Full-featured Konva.js editor for custom designs
- **QR Code Generation**: Automatic QR code generation for each card
- **Admin Panel**: Complete admin dashboard for managing templates and users
- **Modern UI**: Google Material Design inspired interface
- **Responsive Design**: Works perfectly on all devices

### 🎨 Templates Available
1. **Professional** - Clean business design
2. **Creative** - Bold and colorful for creative professionals
3. **Minimal** - Simple and elegant typography
4. **Corporate** - Traditional business card design
5. **Modern** - Contemporary with gradient backgrounds
6. **Elegant** - Sophisticated premium styling

### 🔧 Technical Stack
- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Image Storage**: Cloudinary
- **QR Codes**: QRCode library
- **Authentication**: JWT tokens

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd visiting-card-app

# Install frontend dependencies
cd fnt
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/cardly
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
PORT=5000
```

#### Frontend (.env)
Create a `.env` file in the `fnt` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

#### Option A: Using the provided script
```bash
cd backend
./start-backend.sh
```

#### Option B: Manual setup
```bash
# Start MongoDB (if running locally)
mongod

# In another terminal, seed the templates
cd backend
node seed-templates.js
```

### 4. Start the Application

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd fnt
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin/login

## 👨‍💼 Admin Panel

### Access Admin Panel
1. Navigate to `/admin/login`
2. Create an admin account using the API or database
3. Login with admin credentials

### Admin Features
- **Dashboard**: View statistics and recent activity
- **Template Management**: Add, edit, delete card templates
- **User Management**: View user statistics
- **Analytics**: Track card creation and usage

### Create Admin Account
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "super_admin"
  }'
```

## 🎨 Using the App

### For Users
1. **Register/Login**: Create an account or sign in
2. **Create Card**: Choose between template-based or advanced editor
3. **Template Selection**: Pick from 6 beautiful templates
4. **Fill Details**: Enter your information in the form
5. **Preview & Save**: Review your card and save it
6. **Share**: Use the generated QR code or link to share

### For Admins
1. **Login**: Access admin panel with admin credentials
2. **Dashboard**: View system statistics
3. **Manage Templates**: Add new templates or modify existing ones
4. **Monitor Usage**: Track user activity and card creation

## 📁 Project Structure

```
visiting-card-app/
├── fnt/                          # Frontend (React)
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── features/             # Redux slices and thunks
│   │   ├── pages/                # Page components
│   │   │   ├── Admin/           # Admin panel pages
│   │   │   └── Cards/           # Card-related pages
│   │   └── App.jsx              # Main app component
│   └── package.json
├── backend/                      # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── middleware/          # Custom middleware
│   ├── templates-data.json      # Template seed data
│   ├── seed-templates.js        # Database seeding script
│   └── start-backend.sh         # Backend startup script
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Cards
- `GET /api/cards` - Get all public cards
- `GET /api/cards/user` - Get user's cards
- `POST /api/cards` - Create card (advanced editor)
- `POST /api/cards/from-template` - Create card from template
- `GET /api/cards/templates` - Get available templates
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Admin
- `POST /api/admin/register` - Create admin account
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/templates` - Get all templates
- `POST /api/admin/templates` - Create template
- `PUT /api/admin/templates/:id` - Update template
- `DELETE /api/admin/templates/:id` - Delete template

## 🎨 Customization

### Adding New Templates
1. Add template data to `backend/templates-data.json`
2. Run the seeding script: `node seed-templates.js`
3. Templates will be available in the frontend

### Styling
The app uses Tailwind CSS with Google Material Design colors:
- Primary: Blue (#3B82F6)
- Secondary: Indigo (#6366F1)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd fnt
npm run build
# Deploy the dist folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables
# Deploy using your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Made with ❤️ using modern web technologies**
