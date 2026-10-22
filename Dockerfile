FROM node:22-slim
WORKDIR /app

# Install deps first so this layer is cached until package files change.
# Full install on purpose: tsx and node-pg-migrate's CLI run from node_modules.
COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["node_modules/.bin/tsx", "server/server.ts"]