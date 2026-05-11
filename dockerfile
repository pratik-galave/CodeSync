
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json* ./

RUN npm install --no-audit --no-fund

COPY ./frontend .

RUN npm run build 

FROM node:20-alpine 

WORKDIR /app

COPY ./backend/package.json ./backend/package-lock.json* ./

RUN npm install --no-audit --no-fund

COPY ./backend .

COPY --from=frontend-builder /app/dist ./public

CMD ["node","server.js"]