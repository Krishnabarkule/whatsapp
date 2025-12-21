# Quick Reference Card

## 🚀 Start Application

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## 📋 Workflow

```
1. Session Management → Add Session → Connect via QR/Pairing
2. Upload CSV → Select session → Upload file
3. Template Editor → Write message with {{variables}}
4. Attach Media → (Optional) Upload image/video/audio
5. Start Sending → Review → Send → Monitor
6. Delivery Logs → Check status → Export if needed
```

## 📁 CSV Format

```csv
phone,name,company
919999999999,John,ABC Corp
```

✅ Required: "phone" column
✅ Include country code
❌ No +, spaces, or special chars

## ✍️ Template Syntax

```
Hello {{name}},

Your phone: {{phone}}
Company: {{company}}
```

Use {{columnName}} for variables

## ⚡ Keyboard Shortcuts

- Sessions: Click card to select
- Upload: Drag & drop CSV
- Template: Ctrl/Cmd + A to select all
- Logs: Auto-refresh on new message

## 🎯 Best Practices

✅ Test with your number first
✅ Send 50-100 messages/hour max
✅ Use 3-5 sec delay (automatic)
✅ Personalize with variables
✅ Keep messages concise
✅ Get opt-in consent

❌ No spam or unsolicited messages
❌ No suspicious content
❌ No excessive ALL CAPS

## 🔧 Common Commands

**Install:**

```bash
npm run install-all
```

**Start Dev:**

```bash
npm run dev
```

**Start Backend Only:**

```bash
npm run server
```

**Start Frontend Only:**

```bash
npm run client
```

**Build for Production:**

```bash
cd frontend && npm run build
```

## 📞 Support

- 📖 Full Guide: USER_GUIDE.md
- 🛠 Setup: INSTALLATION.md
- 🌐 Baileys: https://baileys.wiki

## ⚠️ Troubleshooting

**Session won't connect:**
→ Check internet, update WhatsApp, retry

**Messages failing:**
→ Verify session connected, check phone numbers

**CSV upload error:**
→ Check "phone" column exists, verify format

**Template not working:**
→ Match variable names with CSV columns
