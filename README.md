# WhatsApp Bulk Messaging Application

A powerful, professional WhatsApp bulk messaging application built with Baileys, Express, React, and Socket.io. Send personalized bulk messages with media attachments while maintaining WhatsApp's native experience.

## ✨ Key Features

### Core Functionality

- 📱 **Multiple WhatsApp Sessions** - Manage multiple WhatsApp accounts simultaneously
- 🔐 **Dual Authentication** - Connect via QR Code or Pairing Code
- 📄 **CSV Upload** - Import contacts easily from CSV files
- ✍️ **Template Editor** - Create dynamic message templates with variables
- 🖼 **Media Support** - Attach images, videos, and audio files
- ▶️ **Bulk Sending** - Send messages to unlimited contacts with smart delays
- 📊 **Real-time Tracking** - Live delivery logs with success/failure status
- ⏸ **Full Control** - Pause, resume, or stop sending anytime
- 🔄 **Live Updates** - WebSocket-powered real-time status updates

### Advanced Features

- 🎯 Smart rate limiting (3-5 sec delays)
- 🔍 Automatic number validation
- 📈 Success analytics & statistics
- 💾 Export logs as CSV
- 🎨 Modern, intuitive UI
- 🔒 Persistent sessions
- ⚡ Efficient queue management

## 🚀 Quick Start

### Installation

```bash
# Install all dependencies
npm run install-all

# Start the application
npm run dev

# Or use the startup script
./start.sh
```

### Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## 📖 Documentation

- **[Installation Guide](INSTALLATION.md)** - Detailed setup instructions
- **[User Guide](USER_GUIDE.md)** - Complete feature documentation
- **[Quick Reference](QUICK_REFERENCE.md)** - Cheat sheet for common tasks

## 🎯 Usage Workflow

```
1️⃣ Session Management → Add & connect WhatsApp session (QR/Pairing)
2️⃣ Upload CSV → Import contacts with phone numbers
3️⃣ Template Editor → Create message with {{variables}}
4️⃣ Attach Media → (Optional) Add images/videos/audio
5️⃣ Start Sending → Send bulk messages with monitoring
6️⃣ Delivery Logs → Track & export delivery status
```

## 📋 CSV Format

Your CSV file must have a `phone` column. Additional columns become template variables.

**Example:**

```csv
phone,name,company
919999999999,John Doe,ABC Corp
918888888888,Jane Smith,XYZ Ltd
```

**Template:**

```
Hello {{name}},
Thank you for your interest in {{company}}.
```

## ⚠️ Important Notes

### Best Practices

✅ Test with your own number first  
✅ Max 50-100 messages/hour recommended  
✅ Get opt-in consent from recipients  
✅ Personalize messages with variables

❌ No spam or unsolicited messages  
❌ Follow WhatsApp Terms of Service  
❌ Don't send suspicious content

### Legal

Users are responsible for compliance with WhatsApp TOS and anti-spam laws. Get consent before messaging.

## 🔧 Tech Stack

**Backend:** Baileys, Express, Socket.io, Multer, CSV-Parser  
**Frontend:** React, Vite, Axios, Lucide Icons

## 📝 License

MIT - See LICENSE file for details

## 🙏 Acknowledgments

Built with [Baileys](https://baileys.wiki) by WhiskeySockets

---

**Made with ❤️ for legitimate business communication**  
**Version 1.0.0** | December 2024
