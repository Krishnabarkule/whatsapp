# WhatsApp Bulk Sender - User Guide

## Quick Start

1. **Start the Application**

   ```bash
   npm run dev
   ```

   Or use the startup script:

   ```bash
   ./start.sh
   ```

2. **Access the Application**
   - Open your browser and go to: http://localhost:5173

## Features Overview

### 1. 📱 Session Management

**Purpose:** Connect your WhatsApp account to the application

**How to Use:**

1. Click "Session Management" in the left sidebar
2. Click "Add New Session" button
3. Enter a unique Session ID (e.g., "my-whatsapp-1")
4. Choose connection method:
   - **QR Code:** Scan with WhatsApp app (Linked Devices)
   - **Pairing Code:** Enter 8-digit code in WhatsApp settings

**QR Code Method:**

- A QR code will appear on screen
- Open WhatsApp → Settings → Linked Devices → Link a Device
- Scan the QR code
- Wait for connection

**Pairing Code Method:**

- Enter your phone number with country code (e.g., 919999999999)
- An 8-digit code will appear
- Open WhatsApp → Settings → Linked Devices → Link a Device
- Choose "Link with phone number instead"
- Enter the code
- Wait for connection

**Managing Sessions:**

- Active sessions show a green "connected" badge
- Click on a session to select it for sending messages
- Delete sessions using the trash icon
- You can have multiple sessions running simultaneously

---

### 2. 📄 Upload CSV

**Purpose:** Import contacts for bulk messaging

**CSV Format Requirements:**

- Must have a column named "phone"
- Phone numbers should include country code (no + or spaces)
- Additional columns can be used in templates

**Example CSV:**

```csv
phone,name,company
919999999999,John Doe,ABC Corp
918888888888,Jane Smith,XYZ Ltd
```

**How to Use:**

1. Select a connected session from Session Management
2. Click "Upload CSV" in the sidebar
3. Click "Choose CSV File"
4. Select your CSV file
5. Click "Upload CSV"
6. Contacts will be loaded and displayed

**Tips:**

- Use Google Sheets or Excel to create CSV
- Remove special characters from phone numbers
- Test with a small batch first

---

### 3. ✍️ Template Editor

**Purpose:** Create message templates with dynamic content

**How to Use:**

1. Click "Template Editor" in the sidebar
2. Type your message in the text area
3. Use `{{variable}}` for dynamic content
4. Click on available variables to insert them
5. Click "Show Preview" to see how it looks

**Variable Examples:**

- `{{name}}` - Replaced with contact's name
- `{{phone}}` - Replaced with contact's phone
- `{{company}}` - Replaced with contact's company
- Any column from your CSV becomes a variable

**Sample Templates:**

**Simple Greeting:**

```
Hello {{name}},

Welcome to our service!
We're excited to have you on board.

Best regards
```

**Business Introduction:**

```
Hi {{name}},

I noticed you're with {{company}}. We provide solutions that might interest your business.

Would you like to learn more?

Thanks,
Sales Team
```

**Personalized Offer:**

```
Dear {{name}},

Special offer for {{company}}!

Get 20% off on our premium services.
Contact us at {{phone}} for more details.

Limited time offer!
```

---

### 4. 🖼 Attach Media

**Purpose:** Add images, videos, or audio to messages

**Supported Formats:**

- **Images:** JPG, PNG, GIF (max 5MB recommended)
- **Videos:** MP4, AVI, MOV (max 16MB recommended)
- **Audio:** MP3, WAV, OGG

**How to Use:**

1. Click "Attach Media" in the sidebar
2. Click "Choose Media File"
3. Select your media file
4. Preview the media
5. Optionally change or remove the file

**Best Practices:**

- Keep file sizes reasonable for faster delivery
- For audio, use OGG format for best WhatsApp compatibility
- Test media messages on your own number first
- Media will be sent to ALL contacts in your CSV

**Audio Conversion (for best results):**

```bash
ffmpeg -i input.mp3 -avoid_negative_ts make_zero -ac 1 output.ogg
```

---

### 5. ▶️ Start Sending

**Purpose:** Send bulk messages to all contacts

**Pre-requisites:**

- ✅ Connected session selected
- ✅ CSV uploaded with contacts
- ✅ Message template created
- ⚪ Media attached (optional)

**How to Use:**

1. Click "Start Sending" in the sidebar
2. Review the summary
3. Click "Start Sending" button
4. Confirm the action
5. Monitor progress in real-time

**During Sending:**

- **Progress Bar:** Shows overall completion
- **Statistics:** Total, Sent, Failed, Remaining
- **Status:** Running/Paused/Stopped/Completed

**Controls:**

- **Pause:** Temporarily stop sending (can be resumed)
- **Resume:** Continue after pause
- **Stop:** Permanently stop the current batch

**Important Notes:**

- Messages are sent with 3-5 second delay (prevents blocking)
- Invalid numbers are automatically skipped
- Can't be undone once started (use Stop if needed)
- Check Delivery Logs for detailed status

---

### 6. 📊 Delivery Logs

**Purpose:** Track message delivery status

**How to Use:**

1. Click "Delivery Logs" in the sidebar
2. View all sent messages
3. Filter by:
   - All messages
   - Successful only
   - Failed only

**Log Information:**

- Phone number
- Status (success/failed)
- Error message (if failed)
- Timestamp

**Features:**

- **Refresh:** Update logs manually
- **Statistics:** Success rate and counts
- **Export:** Download logs as CSV

**Export Logs:**

- Click "Export as CSV"
- Saves all logs with timestamp
- Use for reporting or analysis

---

## Common Use Cases

### Use Case 1: Marketing Campaign

1. Prepare CSV with customer names and phones
2. Create engaging template with personalization
3. Attach product image
4. Send to all customers
5. Track delivery in logs

### Use Case 2: Event Invitations

1. Upload attendee list
2. Create invitation message with event details
3. Optionally attach event poster
4. Send invitations
5. Monitor responses

### Use Case 3: Payment Reminders

1. Import customer payment data
2. Create reminder template with amount and due date
3. Send reminders
4. Track who received the message

---

## Tips & Best Practices

### Avoiding Blocks

- ✅ Use 3-5 second delay (automatic)
- ✅ Don't send more than 50-100 messages per hour
- ✅ Use a business account if possible
- ✅ Don't send spam or unsolicited messages
- ❌ Don't send to numbers that haven't opted in

### Message Quality

- ✅ Personalize with variables
- ✅ Keep messages concise and clear
- ✅ Include a clear call-to-action
- ✅ Proofread before sending
- ❌ Don't use ALL CAPS excessively
- ❌ Avoid suspicious links

### Testing

1. Test with your own number first
2. Send to 2-3 contacts as a trial
3. Check delivery logs
4. Adjust template if needed
5. Then send to full list

### Data Preparation

- Clean phone numbers (remove spaces, +, -)
- Verify numbers are correct
- Remove duplicates
- Check for missing data
- Keep a backup of your CSV

---

## Troubleshooting

### Session Won't Connect

**Problem:** QR code or pairing code not working

**Solutions:**

- Check internet connection on phone and computer
- Make sure WhatsApp is updated
- Try deleting session and creating new one
- Use different connection method
- Restart the application

### Messages Not Sending

**Problem:** Sending stuck or failing

**Solutions:**

- Verify session is connected (green badge)
- Check if phone has internet
- Verify phone numbers have country code
- Try sending to your own number first
- Check backend terminal for errors

### CSV Upload Failed

**Problem:** Can't upload CSV file

**Solutions:**

- Ensure file has .csv extension
- Check "phone" column exists
- Remove special characters
- Try saving as CSV UTF-8
- Check file isn't corrupted

### Template Variables Not Working

**Problem:** Variables showing as {{name}} in messages

**Solutions:**

- Verify CSV has matching column names
- Check spelling (case-sensitive)
- Re-upload CSV
- Preview template before sending

---

## API Reference (For Developers)

### Sessions API

**Create Session:**

```http
POST /api/sessions/create
Body: {
  "sessionId": "string",
  "usePairingCode": boolean,
  "phoneNumber": "string" (if pairing code)
}
```

**List Sessions:**

```http
GET /api/sessions/list
```

**Delete Session:**

```http
DELETE /api/sessions/:sessionId
```

### Messages API

**Send Bulk:**

```http
POST /api/messages/send-bulk
Body: FormData {
  sessionId: string,
  contacts: JSON string,
  template: string,
  media: file (optional)
}
```

**Pause/Resume/Stop:**

```http
POST /api/messages/pause/:queueId
POST /api/messages/resume/:queueId
POST /api/messages/stop/:queueId
```

**Get Logs:**

```http
GET /api/messages/logs?limit=100
```

### CSV API

**Upload CSV:**

```http
POST /api/csv/upload
Body: FormData {
  csv: file
}
```

---

## Security & Privacy

### Data Storage

- Sessions stored locally in `sessions/` folder
- Uploaded CSVs processed in memory only
- Media files temporarily stored in `media/` folder
- Logs stored in memory (restart to clear)

### Best Practices

- Don't share session folders
- Backup important data
- Use strong authentication
- Don't commit sessions to git
- Clear logs periodically

---

## Support & Resources

### Getting Help

- Check [INSTALLATION.md](INSTALLATION.md) for setup
- Review this guide for usage
- Check console logs for errors
- Review Baileys documentation: https://baileys.wiki

### Community

- Report issues on GitHub
- Join Discord community
- Share feedback and suggestions

---

## Legal Disclaimer

This tool is for legitimate business communication only. Users must:

- Obtain consent before messaging
- Comply with WhatsApp Terms of Service
- Respect privacy and anti-spam laws
- Not use for harassment or spam
- Take full responsibility for usage

The developers are not responsible for misuse of this tool.

---

**Last Updated:** December 2024
**Version:** 1.0.0
