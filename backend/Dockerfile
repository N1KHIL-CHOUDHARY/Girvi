# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

COPY src ./src

# Generate Prisma Client and build the TypeScript application
RUN pnpm prisma:generate
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled JavaScript files from build stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["pnpm", "start"]
