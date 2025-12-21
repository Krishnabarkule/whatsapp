#!/bin/bash

echo "🚀 Starting WhatsApp Bulk Sender..."
echo ""
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend and frontend concurrently
npm run dev
