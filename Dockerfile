# 1. build
FROM node:24-alpine AS frontend_builder

ARG GIT_TAG
ARG GIT_BRANCH
ARG GIT_REVISION
ARG APP_HOST

WORKDIR /impresso_frontend

# Install dependencies from the lockfile (reproducible install)
COPY package.json package-lock.json ./
RUN npm ci

# Application sources required to type-check and build
COPY index.html ./
COPY src ./src
COPY public ./public
COPY widget ./widget
COPY institutions-access ./institutions-access
COPY static ./static
COPY .storybook ./.storybook

# TypeScript / Vite configuration
COPY tsconfig.app.json tsconfig.json tsconfig.node.json tsconfig.vitest.json ./
COPY env.d.ts .prettierrc.json eslint.config.mjs ./
COPY vite.config.ts vitest.config.ts ./

# Environment files consumed by Vite
COPY .env .env.production ./

ENV PUBLIC_PATH=/app/
ENV NODE_ENV=production

ENV VITE_APP_HOST=${APP_HOST}
ENV VITE_GIT_TAG=${GIT_TAG}
ENV VITE_GIT_BRANCH=${GIT_BRANCH}
ENV VITE_GIT_REVISION=${GIT_REVISION}

RUN npm run build

# 2. copy
FROM busybox:1.36

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
