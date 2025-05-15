# Install dependencies only when needed
FROM node:23-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:23-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Production image, copy necessary files and use a non-root user
FROM node:23-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Uncomment if you use a custom next.config.js
# COPY --from=builder /app/next.config.js ./next.config.js

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/.env ./.env

# Next.js port
EXPOSE 3000

# Use non-root user for security
USER node

CMD ["node", "server.js"]
