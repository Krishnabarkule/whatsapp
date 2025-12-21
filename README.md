# WhatsApp Bulk Messaging Application

A full-stack WhatsApp bulk messaging application with user management, session handling, and message tracking.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Default admin: admin@whatsapp.com / admin123

## Features

### For Admin
- User management (create, edit, delete users)
- View all users' message usage (daily/monthly/yearly)
- Set message limits per user
- Monitor system-wide statistics
- WhatsApp session management

### For Users
- Send bulk messages via WhatsApp
- Upload media (images, videos, audio)
- Track message delivery logs
- View remaining message limits
- Manage personal WhatsApp sessions

## Project Structure

```
whats_dev/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # WhatsApp & messaging services
│   ├── middleware/      # Auth & validation
│   └── server.js        # Express server
├── frontend/
│   └── src/
│       ├── components/  # React components
│       ├── context/     # Auth context
│       └── App.jsx      # Main app
├── media/              # Uploaded media files
├── sessions/           # WhatsApp session data
└── .env               # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Reset password

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Messages
- `POST /api/messages/send-bulk` - Send bulk messages
- `GET /api/messages/logs` - Get delivery logs

### Sessions
- `POST /api/sessions/create` - Create WhatsApp session
- `GET /api/sessions/:id/qr` - Get QR code
- `DELETE /api/sessions/:id` - Logout session

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Troubleshooting

### Port Already in Use
```bash
killall -9 node
npm run dev
```

### WhatsApp Session Issues
```bash
rm -rf sessions/*
# Rescan QR code in app
```

### Message Tracking Not Working
- Ensure user object is passed to MessageService
- Check MessageLog collection in MongoDB
- Verify mediaType is 'none' for text messages

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Frontend:** React, Vite, React Router, Axios
- **WhatsApp:** @whiskeysockets/baileys
- **Authentication:** JWT, bcrypt

## License

MIT License
