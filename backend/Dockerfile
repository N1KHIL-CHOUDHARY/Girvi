FROM node:22-alpine AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* tsconfig.json ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY src ./src

RUN pnpm prisma:generate
RUN pnpm build

FROM node:22-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

RUN mkdir -p storage/uploads

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

ENV NODE_ENV=production

CMD ["pnpm", "start"]