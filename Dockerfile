FROM node:20-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./

RUN yarn

COPY src ./src
RUN yarn build

# Prune dependencies
RUN yarn --production

FROM base AS release
ENV NODE_ENV=staging
ENV PORT=80

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["npm", "start"]