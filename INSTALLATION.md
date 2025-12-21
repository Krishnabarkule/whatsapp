# Installation Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Step 1: Install Dependencies

Navigate to the project root and run:

```bash
npm run install-all
```

This will install dependencies for both backend and frontend.

## Step 2: Start the Application

Start both backend and frontend:

```bash
npm run dev
```

Or start them separately:

**Backend:**

```bash
npm run server
```

**Frontend:**

```bash
npm run client
```

## Step 3: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Usage Flow

1. **Session Management**

   - Click "Add New Session"
   - Choose connection method (QR Code or Pairing Code)
   - For QR Code: Scan with WhatsApp app
   - For Pairing Code: Enter the code in WhatsApp settings

2. **Upload CSV**

   - Prepare CSV file with 'phone' column
   - Select the active session
   - Upload CSV file
   - Contacts will be loaded

3. **Create Template**

   - Write your message template
   - Use {{variable}} for dynamic content
   - Preview with sample contact

4. **Attach Media** (Optional)

   - Upload image, video, or audio
   - Preview the media

5. **Start Sending**

   - Review summary
   - Click "Start Sending"
   - Monitor progress
   - Use Pause/Resume/Stop as needed

6. **Check Logs**
   - View delivery status
   - Filter by success/failed
   - Export logs as CSV

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use, modify:

- Backend: `backend/server.js` - change PORT
- Frontend: `frontend/vite.config.js` - change server.port

### Session Connection Issues

- Make sure phone has internet connection
- Try deleting and recreating session
- Check if WhatsApp is up to date

### CSV Upload Issues

- Ensure CSV has 'phone' column
- Phone numbers should be with country code
- No special characters in phone numbers

## Production Build

To build for production:

```bash
cd frontend
npm run build
```

The build will be in `frontend/dist/`

## Support

For issues, check:

1. Console logs in browser (F12)
2. Backend terminal logs
3. Sessions folder for authentication data
