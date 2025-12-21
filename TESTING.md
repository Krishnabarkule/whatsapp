# 🧪 Testing Guide - Connection Issues Fixed

## What Was Fixed

### 1. ✅ Reconnection Loop Fixed

- **Issue**: When connection drops, tries to create session that already exists
- **Fix**: Now removes old session before reconnecting
- **Fix**: Skip auto-reconnect for stream errors (515, 500) to prevent loops
- **Fix**: Added 3-second delay before reconnection

### 2. ✅ Pairing Code Format Validated

- **Issue**: Phone numbers might be in wrong format
- **Fix**: Better validation (10-15 digits required)
- **Fix**: Clear console logs showing the format being used
- **Fix**: Better error messages

### 3. ✅ Nodemon Restart Issues

- **Issue**: Server keeps restarting when session files are created
- **Fix**: Updated nodemon.json to properly ignore sessions folder
- **Fix**: More specific watch patterns

### 4. ✅ Session Cleanup

- **Issue**: Old/incomplete sessions causing errors
- **Fix**: Removed all existing sessions (pair, qr)
- **Fix**: Fresh start

## Testing Steps

### Step 1: Clean Start

```bash
# Make sure sessions folder is empty
ls -la sessions/
# Should only show . and ..

# Restart the app
npm run dev
```

**Expected:**

- Server starts cleanly
- No "Loading existing sessions" message
- No errors
- No automatic restarts

### Step 2: Test Pairing Code (Recommended)

**On Frontend:**

1. Click "Add New Session"
2. Session Name: `test1`
3. Method: **Pairing Code**
4. Country Code: `+91` (India)
5. Phone Number: `9999999999` (10 digits only)
6. Click "Create Session"

**Backend Logs Should Show:**

```
Requesting pairing code for: 919999999999
Phone number format: Country code + number without +
Pairing code generated: XXXXXXXX
```

**On Your Phone:**

1. Open WhatsApp
2. Go to: Settings → Linked Devices → Link a Device
3. Choose "Link with phone number instead"
4. Enter the 8-digit code shown in browser
5. Wait for connection

**Expected Result:**
✅ Connection successful
✅ Status changes to "Connected"
✅ No server restarts
✅ No error loops

### Step 3: Test QR Code

**On Frontend:**

1. Click "Add New Session"
2. Session Name: `test2`
3. Method: **QR Code**
4. Click "Create Session"

**Backend Logs Should Show:**

```
QR code received, generating image...
QR code emitted successfully for session: test2
```

**Expected:**

- QR code appears in 2-3 seconds
- Large, clear QR code with border
- No server restarts

**On Your Phone:**

1. Open WhatsApp
2. Settings → Linked Devices → Link a Device
3. Scan the QR code
4. Wait for connection

### Step 4: Test Error Handling

**What Happens If:**

**Connection drops (515 error):**

- ✅ Won't try to reconnect (prevents loop)
- ✅ Session is removed cleanly
- ✅ Shows "Connection closed" message
- ✅ User can create new session

**Invalid phone number:**

- ✅ Shows error: "Invalid phone number length"
- ✅ Session is not created
- ✅ No crashes

**Session already exists:**

- ✅ Shows error: "Session already exists"
- ✅ No crashes

## Phone Number Format Reference

### Correct Formats (What Backend Accepts):

```
Input               → Backend Processes As
------------------  → --------------------
9999999999          → 919999999999 (adds 91)
919999999999        → 919999999999 (keeps as is)
+919999999999       → 919999999999 (removes +)
+1 234 567 8900     → 12345678900 (removes + and spaces)
447700900123        → 447700900123 (UK)
```

### Country Code Examples:

- 🇮🇳 India: `91` + 10 digits = `919999999999`
- 🇺🇸 USA: `1` + 10 digits = `12345678900`
- 🇬🇧 UK: `44` + 10-11 digits = `447700900123`
- 🇦🇪 UAE: `971` + 9 digits = `971501234567`

## Troubleshooting

### Problem: Server keeps restarting

**Check:**

```bash
# Make sure nodemon.json exists
cat nodemon.json

# Should show ignore patterns for sessions/**
```

**Fix:**

```bash
# Restart the app
npm run dev
```

### Problem: "Session already exists" error

**Fix:**

```bash
# Clean sessions and restart
./clean-sessions.sh
npm run dev
```

### Problem: Pairing code not working

**Check backend logs for:**

```
Requesting pairing code for: 919999999999
```

**Make sure:**

- Phone number is 10 digits (India)
- No spaces or special characters
- Country code is correct
- WhatsApp is updated on phone

### Problem: QR code not appearing

**Check:**

1. Wait 5 seconds for generation
2. Check browser console for errors (F12)
3. Check backend logs for "QR code emitted"
4. Refresh the page

### Problem: Connection closes immediately

**Check backend logs for status code:**

- `401`: Invalid credentials → Delete session and recreate
- `515`: Stream error → Normal, don't reconnect
- `500`: Server error → Check WhatsApp is not logged in elsewhere

## Clean Start Command

If you want to completely reset:

```bash
# Clean everything
./clean-sessions.sh

# Or manually
rm -rf sessions/*

# Restart
npm run dev
```

## Success Indicators

### ✅ Everything Working:

1. Server starts with no errors
2. No automatic restarts when creating sessions
3. Pairing code generates in 5 seconds
4. QR code appears in 2-3 seconds
5. Connection completes successfully
6. Status shows "Connected"
7. Can send test messages

### ❌ Still Issues:

1. Server crashes with errors
2. Restarts continuously
3. "Session already exists" errors
4. Pairing code never appears
5. QR code doesn't load
6. Can't connect even after scanning

## Next Steps After Testing

Once connection works:

1. ✅ Upload CSV file with contacts
2. ✅ Create message template
3. ✅ Attach media (optional)
4. ✅ Send bulk messages
5. ✅ Monitor delivery logs

---

**Ready to test! Start with Step 1 above.** 🚀

**Important**: Make sure to use a fresh phone number that is NOT already linked to WhatsApp Web/Desktop, or unlink it first.
