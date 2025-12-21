# Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Installation Issues

#### Error: Cannot find module

**Problem:** Dependencies not installed

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install-all
```

#### Error: Port 3000 already in use

**Problem:** Another application using port 3000

**Solution 1 - Kill process:**

```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Solution 2 - Change port:**
Edit `backend/server.js`:

```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

#### Error: Port 5173 already in use

**Problem:** Another Vite app running

**Solution:**
Edit `frontend/vite.config.js`:

```javascript
server: {
  port: 5174, // Change to 5174
}
```

---

### 🔴 Session Connection Issues

#### QR Code Not Displaying

**Problem:** Session creation failed

**Solutions:**

1. Check backend console for errors
2. Verify internet connection
3. Delete session folder and recreate:

```bash
rm -rf sessions/your-session-id
```

4. Restart application

#### QR Code Scan Succeeds But No Connection

**Problem:** Network or WhatsApp issue

**Solutions:**

1. Check phone has stable internet
2. Update WhatsApp to latest version
3. Try pairing code method instead
4. Check backend logs for errors

#### Pairing Code Not Generating

**Problem:** Phone number invalid or network issue

**Solutions:**

1. Verify phone number format (no +, spaces, or dashes)
2. Include country code (e.g., 919999999999)
3. Check internet connection
4. Wait 3-5 seconds after creating session

#### Session Disconnects Frequently

**Problem:** Network instability or WhatsApp restrictions

**Solutions:**

1. Check internet stability
2. Don't use VPN
3. Ensure phone stays online
4. Don't log out from phone
5. Avoid sending too many messages too quickly

---

### 🔴 CSV Upload Issues

#### CSV Upload Fails

**Problem:** Invalid file format

**Solutions:**

1. Ensure file has `.csv` extension
2. Check file has "phone" column:

```csv
phone,name
919999999999,John
```

3. Save as "CSV UTF-8" format
4. Remove special characters
5. Check file isn't corrupted

#### No Contacts Loaded

**Problem:** Missing phone column or empty file

**Solutions:**

1. Verify "phone" column exists (case-sensitive)
2. Check rows have data
3. Remove empty rows
4. Verify phone numbers aren't empty

#### Phone Numbers Not Working

**Problem:** Invalid format

**Solutions:**

1. Include country code: 919999999999 ✅
2. Remove symbols: +91-9999999999 ❌
3. No spaces: 91 999 999 9999 ❌
4. Numbers only: 919999999999 ✅

---

### 🔴 Template Issues

#### Variables Not Replacing

**Problem:** Variable name doesn't match CSV column

**Solutions:**

1. Check variable spelling matches CSV exactly
2. Variables are case-sensitive
3. Use {{phone}} not {{Phone}}
4. Re-upload CSV if columns changed

#### Template Preview Empty

**Problem:** No contacts loaded

**Solutions:**

1. Upload CSV first
2. Verify contacts loaded (check count)
3. Refresh page and try again

---

### 🔴 Media Upload Issues

#### Media Upload Fails

**Problem:** File too large or unsupported format

**Solutions:**

1. Check file size (max 16MB recommended)
2. Use supported formats:
   - Images: JPG, PNG, GIF
   - Videos: MP4
   - Audio: MP3, OGG
3. Try compressing file
4. Convert to supported format

#### Media Not Sending

**Problem:** Format compatibility

**Solutions:**

1. For audio, convert to OGG:

```bash
ffmpeg -i input.mp3 -avoid_negative_ts make_zero -ac 1 output.ogg
```

2. For video, use MP4 format
3. Reduce file size
4. Test with image first

---

### 🔴 Sending Issues

#### Cannot Start Sending

**Problem:** Missing requirements

**Solutions:**

1. ✅ Select a connected session
2. ✅ Upload CSV with contacts
3. ✅ Create message template
4. Check each requirement is met

#### Messages Stuck at 0%

**Problem:** Session disconnected or network issue

**Solutions:**

1. Verify session still connected (green badge)
2. Check phone has internet
3. Stop and restart sending
4. Reconnect session if needed

#### All Messages Failing

**Problem:** Session disconnected or phone numbers invalid

**Solutions:**

1. Check session status
2. Verify phone number format
3. Test with your own number
4. Check backend logs for errors
5. Try smaller batch (5-10 contacts)

#### Some Messages Failing

**Problem:** Invalid phone numbers

**Solutions:**

1. Check failed numbers in logs
2. Verify numbers exist on WhatsApp
3. Remove invalid numbers from CSV
4. Numbers may not have WhatsApp installed

#### Sending Too Slow

**Problem:** Large delay between messages

**Solution:**
This is intentional (3-5 second delay) to prevent blocking. Reducing delay may get your number blocked.

---

### 🔴 Performance Issues

#### Application Slow/Laggy

**Problem:** Memory or CPU overload

**Solutions:**

1. Close unnecessary browser tabs
2. Restart application:

```bash
# Stop (Ctrl+C)
npm run dev
```

3. Clear browser cache
4. Check system resources
5. Reduce CSV size (split into batches)

#### High Memory Usage

**Problem:** Large file processing

**Solutions:**

1. Process smaller batches (50-100 contacts)
2. Split large CSV files
3. Remove unnecessary columns
4. Restart application periodically

---

### 🔴 UI Issues

#### QR Code/Pairing Code Not Visible

**Problem:** Browser compatibility or zoom

**Solutions:**

1. Use modern browser (Chrome, Firefox, Safari)
2. Reset browser zoom (100%)
3. Clear browser cache
4. Try different browser
5. Check console for errors (F12)

#### Real-time Updates Not Working

**Problem:** WebSocket connection failed

**Solutions:**

1. Check browser console for WebSocket errors
2. Verify backend is running
3. Check firewall/antivirus settings
4. Restart application
5. Try different network

#### Logs Not Showing

**Problem:** WebSocket disconnected

**Solutions:**

1. Refresh page
2. Check backend is running
3. Verify Socket.io connection
4. Check browser console

---

### 🔴 Backend Errors

#### Error: EADDRINUSE

**Problem:** Port already in use

**Solution:**

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

#### Error: Cannot find module '@whiskeysockets/baileys'

**Problem:** Dependencies not installed

**Solution:**

```bash
npm install
```

#### Error: ENOENT: no such file or directory

**Problem:** Required directories missing

**Solution:**
Directories auto-create on startup. If error persists:

```bash
mkdir sessions uploads media
```

---

### 🔴 WhatsApp Specific Issues

#### Number Gets Blocked

**Problem:** Sending too many messages

**Prevention:**

1. Max 50-100 messages/hour
2. Use proper delays (3-5 seconds)
3. Don't send spam
4. Get consent before messaging
5. Use business account

**Recovery:**
Wait 24-48 hours before trying again

#### Messages Marked as Spam

**Problem:** Suspicious content or behavior

**Solutions:**

1. Avoid suspicious links
2. Don't use ALL CAPS excessively
3. Personalize messages
4. Get opt-in consent
5. Include opt-out option

#### Can't Scan QR Code

**Problem:** Camera or app issue

**Solutions:**

1. Update WhatsApp
2. Check camera permissions
3. Clean camera lens
4. Try pairing code instead
5. Restart WhatsApp

---

### 🔴 Data/Log Issues

#### Logs Disappear After Restart

**Problem:** In-memory storage only

**Solution:**
This is by design. Export logs before closing:

- Go to Delivery Logs
- Click "Export as CSV"
- Save file for records

#### Session Data Lost

**Problem:** Session folder deleted

**Solution:**
Session data stored in `sessions/` folder. Don't delete unless intentional. If lost, recreate session.

---

## 🔍 Debugging Tips

### Check Backend Logs

```bash
# Start backend with visible logs
npm run server
```

Look for error messages

### Check Browser Console

1. Press F12
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

### Check WebSocket Connection

1. F12 → Console
2. Look for "Client connected" message
3. Check for Socket.io errors

### Verify File Structure

```bash
ls -la
# Should see: backend/, frontend/, package.json, etc.
```

### Test Individual Components

1. Test session connection alone
2. Test CSV upload alone
3. Test template editor alone
4. Then test together

---

## 📞 Still Having Issues?

### Gather Information

1. **Error message** - Exact text
2. **Steps to reproduce** - What did you do?
3. **Browser** - Chrome, Firefox, Safari?
4. **OS** - Windows, Mac, Linux?
5. **Logs** - Backend console output
6. **Screenshots** - If visual issue

### Check Documentation

- [README.md](README.md) - Overview
- [INSTALLATION.md](INSTALLATION.md) - Setup
- [USER_GUIDE.md](USER_GUIDE.md) - Usage
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commands

### Common Fixes Summary

```bash
# Nuclear option - fresh start
rm -rf node_modules frontend/node_modules
rm package-lock.json frontend/package-lock.json
npm run install-all
npm run dev
```

---

## ✅ Verification Checklist

Before asking for help, verify:

- [ ] Dependencies installed (`node_modules/` exists)
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] Browser console shows no errors
- [ ] Internet connection working
- [ ] WhatsApp updated on phone
- [ ] CSV has "phone" column
- [ ] Session shows "connected" status

---

**Last Updated:** December 2025
