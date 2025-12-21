# Backend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm install
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
# storage is mounted by docker-compose, keep folder
RUN mkdir -p /app/storage/uploads /app/storage/sessions
EXPOSE 3000
CMD ["node", "dist/main.js"]
