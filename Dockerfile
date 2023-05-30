##### DEPENDENCIES

FROM node:20-alpine3.17 AS deps
RUN apk add --no-cache libc6-compat openssl1.1-compat
WORKDIR /app

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile;

##### Production only dependencies 
FROM deps as deps_prod

RUN yarn install --production --frozen-lockfile;


##### BUILDER

FROM node:20-alpine3.17 AS builder

ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG EMAIL_SERVER_HOST
ARG EMAIL_SERVER_PORT
ARG EMAIL_SERVER_SECURE
ARG EMAIL_SERVER_USER
ARG EMAIL_SERVER_PASSWORD
ARG EMAIL_FROM
ARG NEXT_PUBLIC_WS_URL

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN SKIP_ENV_VALIDATION=1 yarn build;

##### RUNNER

FROM node:20-alpine3.17 AS runner
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 kurumi

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# deps (we use custom server)
COPY --from=deps_prod --chown=kurumi:nodejs /app/node_modules ./node_modules
# NextJS
COPY --from=builder --chown=kurumi:nodejs /app/.next/standalone ./
COPY --from=builder --chown=kurumi:nodejs /app/.next/static ./.next/static
# Custom server build
COPY --from=builder --chown=kurumi:nodejs /app/dist ./dist



USER kurumi
EXPOSE 3000
ENV PORT 3000

CMD ["node", "/app/dist/server/server.js"]
