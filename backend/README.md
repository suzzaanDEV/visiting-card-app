# Cardly Backend API

A comprehensive backend API for managing digital business cards with user authentication, card creation, templates, and sharing features.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or cloud instance)
- Redis (optional, for caching)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `config.env` to `.env` and update the values:
   ```bash
   cp config.env .env
   ```

3. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

4. **Seed the database:**
   ```bash
   npm run clean-seed
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

## 📊 Database Setup

### Seeded Data

The database comes pre-seeded with:

#### Users (5 test users)
- **Admin:** admin@example.com / admin123
- **Suzan Ghimire:** ram.thapa@cardly.com / password123
- **Suzan Ghimire:** example@cardly.com / password123
- **Mike Wilson:** mike@example.com / password123
- **Sarah Johnson:** sarah@example.com / password123
- **David Brown:** david@example.com / password123

#### Templates (5 professional templates)
- Modern Business
- Creative Portfolio
- Minimal Contact
- Executive Professional
- Tech Professional

#### Business Cards (7 cards)
- Each user has 1-3 cards with different templates
- Mix of public and private cards
- Realistic design data

#### Saved Cards (6 saved cards)
- Users have saved cards from other users

### Database Commands

```bash
# Clean and reseed database
npm run clean-seed

# Check database contents
node scripts/checkDatabase.js

# Test login functionality
node scripts/debugLogin.js
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Cards
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `GET /api/cards/templates` - Get available templates

### Library
- `GET /api/library` - Get saved cards
- `POST /api/library/:cardId` - Save a card
- `DELETE /api/library/:cardId` - Remove saved card

### Search
- `GET /api/search/cards` - Search public cards
- `GET /api/search/users` - Search users

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get system stats (admin only)

## 🛠️ Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run clean-seed` - Clean and reseed database
- `npm run seed` - Seed database (legacy)

### Environment Variables
```env
# Database
DATABASE_URL=mongodb://localhost:27017/cardly

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5050
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation and sanitization
- Error handling middleware

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── algorithms/     # Card generation algorithms
├── scripts/            # Database scripts
├── config.env          # Environment configuration
└── package.json
```

## 🧪 Testing

### Manual Testing
```bash
# Test login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram.thapa@cardly.com","password":"password123"}'

# Test profile (with token)
curl -X GET http://localhost:5050/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test cards
curl -X GET http://localhost:5050/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `brew services start mongodb-community`
   - Check database URL in `.env` file

2. **Login Fails**
   - Verify database is seeded: `npm run clean-seed`
   - Check if using correct database URL

3. **CORS Errors**
   - Verify frontend URL is in `ALLOWED_ORIGINS`
   - Check if backend is running on correct port

4. **Port Already in Use**
   - Kill existing process: `pkill -f "node src/app.js"`
   - Or use different port in `.env`

### Database Reset
```bash
# Complete reset
npm run clean-seed

# Manual reset
mongosh digital_business_cards --eval "db.dropDatabase()"
npm run clean-seed
```

## 📈 Performance

- Database indexing on frequently queried fields
- Rate limiting to prevent abuse
- Efficient query patterns
- Connection pooling
- Error logging with Winston

## 🔄 Updates

To update the database schema or add new features:

1. Update models in `src/models/`
2. Run `npm run clean-seed` to reset with new schema
3. Test all endpoints
4. Update documentation

## 📝 License

This project is part of the Cardly application.
