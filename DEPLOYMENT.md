# Deployment Guide

This guide will help you deploy the Visiting Card App to production.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Cloudinary account (for image storage)
- A hosting service (Vercel, Netlify, Heroku, AWS, etc.)

## Environment Variables Setup

### Backend (.env)

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update the following variables in `backend/.env`:
   - `DATABASE_URL`: Your MongoDB connection string
   - `JWT_SECRET`: A strong, random secret key (use a password generator)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `NODE_ENV`: Set to `production` for production
   - `PORT`: Port number (default: 5050)
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs

### Frontend (.env)

1. Copy the example file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Update the following variables in `frontend/.env`:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api`)
   - `VITE_APP_NAME`: Your app name
   - `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name (if needed)
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset (if needed)

## Local Development Setup

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5050`

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Production Build

### Backend

1. Build and start:
   ```bash
   cd backend
   npm install --production
   npm start
   ```

Or use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

### Frontend

1. Build for production:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. The `dist` folder contains the production build that can be deployed to any static hosting service.

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Backend (Railway/Render):**
1. Push your code to GitHub
2. Create a new service in Railway/Render
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

### Option 2: Full Stack on Heroku

1. Create two Heroku apps (one for frontend, one for backend)
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git push heroku master
   ```

### Option 3: AWS/DigitalOcean

1. Set up EC2/Droplet instance
2. Install Node.js and MongoDB
3. Clone repository
4. Set environment variables
5. Use PM2 to run the backend
6. Use Nginx to serve the frontend

## Important Security Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate a random string for production
3. **Enable HTTPS** - Always use HTTPS in production
4. **Set proper CORS origins** - Only allow your frontend domain
5. **Use environment-specific configs** - Different configs for dev/staging/prod

## Health Check

After deployment, check the health endpoint:
- Backend: `https://your-api-domain.com/health`
- Should return status 200 with health information

## Troubleshooting

### Backend won't start
- Check if MongoDB is running and accessible
- Verify all environment variables are set
- Check logs for specific errors

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running and accessible

### Database connection issues
- Verify `DATABASE_URL` is correct
- Check MongoDB network access settings
- Ensure MongoDB credentials are correct

## Support

For issues or questions, check the logs:
- Backend logs: Check console output or log files
- Frontend logs: Check browser console

