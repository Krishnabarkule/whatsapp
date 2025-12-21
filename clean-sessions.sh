#!/bin/bash

# Clean WhatsApp Sessions Script
# Run this if you need to reset all sessions

echo "🧹 Cleaning all WhatsApp sessions..."

SESSIONS_DIR="./sessions"

if [ -d "$SESSIONS_DIR" ]; then
    # Count sessions
    SESSION_COUNT=$(find "$SESSIONS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
    
    if [ "$SESSION_COUNT" -gt 0 ]; then
        echo "Found $SESSION_COUNT session(s) to remove:"
        ls -1 "$SESSIONS_DIR"
        
        # Remove all session folders
        rm -rf "$SESSIONS_DIR"/*
        
        echo "✅ All sessions cleaned successfully!"
    else
        echo "✅ Sessions folder is already clean"
    fi
else
    echo "⚠️  Sessions directory not found"
fi

echo ""
echo "You can now restart the app with: npm run dev"
