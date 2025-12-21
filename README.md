# WhatsApp Marketing Suite

Production-grade WhatsApp Marketing platform with NestJS backend, React+TypeScript frontend, MongoDB, Baileys integration, local storage, Docker, and Electron desktop packaging.

## Stack

- Backend: NestJS (Node.js), Mongoose (MongoDB), JWT, bcrypt, Baileys
- Frontend: React + TypeScript (Vite), React Router, Context, Axios
- Database: MongoDB
- Optional: Redis (rate limiting/scheduling)
- Desktop: Electron (Windows/macOS)
- Container: Docker & docker-compose

## Quick Start (Dev)

1. Copy env files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start services (MongoDB + app) via Docker

```bash
docker compose up -d --build
```

3. Open frontend

- Web: http://localhost:5173
- API: http://localhost:3000

Default admin user is created on first boot if `SEED_ADMIN=true` is set.

## Monorepo Structure

- backend: NestJS API, Baileys session manager, scheduling, analytics
- frontend: React app with WhatsApp-themed UI and CSV flows
- electron: Desktop packager that spawns backend and loads frontend
- storage: Local persistent data (uploads, sessions)

## Electron (Desktop)

```bash
# from /electron
npm install
npm run dev
# for packaging
npm run build:mac   # macOS dmg
npm run build:win   # Windows exe
```

## Docker

- backend Dockerfile included
- frontend Dockerfile included
- docker-compose.yml provides MongoDB, optional Redis, volumes for data

## Security Notes

- JWT auth with role-based access
- Bcrypt password hashing
- Validation pipes, DTOs, sanitized inputs
- Expiry and plan limits enforcement on API

## Theming

- WhatsApp Green (#25D366), Dark Green (#075E54), Accent (#ECE5DD)
- Font: Inter
- Rounded, minimal shadows, chat-bubble previews

## License

Internal project scaffolding. Add your license terms as needed.
