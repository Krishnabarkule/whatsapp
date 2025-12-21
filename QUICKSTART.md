# 🚀 Quick Start Guide - Updated

## ✅ What's Changed

### 1. **Merged Components into "Start Messaging"**

- ✅ Upload CSV
- ✅ Create Template
- ✅ Attach Media (optional)
- ✅ Send Messages

All in ONE streamlined component with step-by-step flow!

### 2. **Simplified Navigation**

Old menu (6 items):

- Session Management
- Upload CSV
- Template Editor
- Attach Media
- Start Sending
- Delivery Logs

New menu (3 items):

- **Session Management** - Connect WhatsApp
- **Start Messaging** - Complete workflow
- **Delivery Logs** - Track results

### 3. **Media Attachments Work**

Messages are sent with media files attached properly:

- Images → Sent with caption
- Videos → Sent with caption
- Audio → Sent as audio message

## 🎯 How To Use

### Step 1: Connect Session

1. Click **"Session Management"**
2. Add new session
3. Choose QR or Pairing Code

**QR Code:** ✅ Working perfectly

- Scans instantly
- Connection stable

**Pairing Code:** ⚠️ Follow these rules:

- Use phone number that's NOT already logged in elsewhere
- Make sure WhatsApp is installed on that phone
- Phone must have active internet
- Enter code within 1 minute of generation
- If you get 401 error: Phone is already logged in somewhere else

### Step 2: Start Messaging

1. Click **"Start Messaging"**
2. Follow 4-step wizard:

**Step 1: Upload CSV**

- Select CSV file
- Must contain: phone, name (minimum)
- Can have custom fields: company, product, etc.

**Step 2: Create Template**

- Write your message
- Use variables: `{{name}}`, `{{phone}}`, `{{company}}`
- Click variable buttons to insert
- Preview with first contact

**Step 3: Attach Media (Optional)**

- Upload image, video, or audio
- Shows preview
- Can skip this step

**Step 4: Send Messages**

- Click "Start Sending Messages"
- Watch real-time progress
- Pause/Resume/Stop controls available

### Step 3: View Logs

1. Click **"Delivery Logs"**
2. See all sent messages
3. Filter by status
4. Export to CSV

## 📱 Pairing Code Troubleshooting

### Why 401 Error Happens:

**The phone number you're pairing MUST be the phone with WhatsApp installed.**

❌ **WRONG:**

- Pairing with `919822327692`
- But WhatsApp is on different phone `919999999999`
- Result: 401 error "Intentional Logout"

✅ **CORRECT:**

- Pairing with `919822327692`
- WhatsApp installed on `919822327692`
- Enter code on that phone
- Result: Connected!

### Backend Log Shows:

```
Requesting pairing code for: 919822327692
⚠️  IMPORTANT: Enter the code on the phone number: 919822327692
⚠️  Make sure this phone is NOT already logged into WhatsApp elsewhere
Pairing code generated: 9R8NLD68
Enter this code in WhatsApp on phone: 919822327692
```

**The phone number in logs = The phone where you enter the code!**

### Common Mistakes:

1. **Phone already logged in**: WhatsApp can only be logged in on ONE phone at a time. If it's already logged in, pairing fails with 401.

2. **Wrong phone number**: You entered code on phone A, but paired with phone B's number.

3. **Code expired**: Codes expire after ~1 minute. Generate fresh code if needed.

4. **No internet on phone**: Phone needs internet to complete pairing.

## 💡 Best Practice

### Use QR Code Method

✅ Faster and more reliable
✅ No phone number issues
✅ Works every time

Steps:

1. Session Management → Add Session
2. Choose "QR Code"
3. Scan with WhatsApp
4. Done in 5 seconds!

### When to Use Pairing Code

- Phone camera not working
- Can't scan QR easily
- Prefer typing code

## 🎨 Media Message Examples

### Image Message:

```
Template: Hi {{name}}, check out our new product!
Media: product_image.jpg
Result: Image sent with caption
```

### Video Message:

```
Template: Hi {{name}}, watch this demo video!
Media: demo.mp4
Result: Video sent with caption
```

### Audio Message:

```
Template: (Optional, audio is standalone)
Media: voice_message.mp3
Result: Audio message sent
```

### Text Only:

```
Template: Hi {{name}}, special offer today!
Media: None
Result: Text message only
```

## 📊 CSV Format

**Example CSV:**

```csv
phone,name,company,product
9822327692,John,TechCorp,Software
9876543210,Sarah,DesignCo,Graphics
7028133123,Mike,SalesPro,CRM
```

**Phone Number Format:**

- Can be 10 digits: `9822327692`
- Or with country code: `919822327692`
- Or with +: `+919822327692`
- Backend auto-formats correctly

## 🔄 Step-by-Step Messaging Flow

```
1. Session Management
   └─> Connect WhatsApp (QR or Pairing)

2. Start Messaging
   ├─> Step 1: Upload CSV (Load contacts)
   ├─> Step 2: Create Template (Write message)
   ├─> Step 3: Attach Media (Optional)
   └─> Step 4: Send Messages (Bulk send)

3. Delivery Logs
   └─> View results & export
```

## 🚨 Error Solutions

### "Session already exists"

```bash
./clean-sessions.sh
npm run dev
```

### "401 Unauthorized" on Pairing

- Check phone number is correct
- Make sure phone is NOT logged in elsewhere
- Log out from WhatsApp Web/Desktop first
- Generate fresh code

### "Connection closed: Stream Errored"

- Normal temporary error
- System won't auto-reconnect (prevents loops)
- Create new session

### QR Not Appearing

- Wait 5 seconds
- Refresh page
- Check backend logs for errors

## ✨ Features

✅ **Multi-session support** - Connect multiple WhatsApp accounts
✅ **Smart delays** - 3-5 seconds between messages
✅ **Media support** - Images, videos, audio
✅ **Template variables** - Dynamic personalization
✅ **Real-time progress** - Live sending status
✅ **Pause/Resume** - Control during sending
✅ **Delivery logs** - Track success/failures
✅ **CSV export** - Download logs

## 🎉 Ready to Start!

```bash
npm run dev
```

Then open: http://localhost:5173

Follow the 3-step process:

1. Session Management → Connect
2. Start Messaging → Follow wizard
3. Delivery Logs → Check results

---

**Need help? Check logs in backend terminal!** 📝
