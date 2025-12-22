# Visiting Card App

A modern digital business card platform built with React and Node.js.

## Features

- 🎨 Create beautiful digital business cards
- 🔍 Search and discover cards
- 📱 Responsive design
- 🔐 Secure authentication
- 📊 Analytics dashboard
- 👥 Admin panel
- 💾 Save cards to library
- 🔗 Shareable links and QR codes

## Tech Stack

### Frontend
- React 18
- Redux Toolkit
- Vite
- Tailwind CSS
- Konva (for card editing)
- React Router

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication
- Cloudinary (for image storage)
- Winston (logging)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd visiting-card-app
   ```

2. Set up backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

3. Set up frontend:
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

### Running Locally

1. Start MongoDB (if running locally)

2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5050`

3. Start frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

### Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories for required environment variables.

**Backend (.env):**
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `PORT` - Server port (default: 5050)
- `NODE_ENV` - Environment (development/production)

**Frontend (.env):**
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:5050/api`)

## Project Structure

```
visiting-card-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utilities
│   │   └── app.js          # Express app
│   ├── config/             # Configuration files
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── features/       # Redux slices and thunks
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── .env                # Environment variables
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Cards
- `GET /api/cards` - Get user's cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get card by ID
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Search
- `GET /api/search` - Search cards

### Library
- `GET /api/library` - Get saved cards
- `POST /api/library` - Save card to library
- `DELETE /api/library/:id` - Remove card from library

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

