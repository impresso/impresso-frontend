# 1. build
FROM node:23-alpine AS frontend_builder

ARG GIT_TAG
ARG GIT_BRANCH
ARG GIT_REVISION

WORKDIR /impresso_frontend

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY static ./static
COPY public ./public
COPY widget ./widget
COPY .storybook ./.storybook

COPY .eslintrc.cjs .eslintignore tsconfig.app.json tsconfig.json tsconfig.node.json tsconfig.vitest.json ./
COPY env.d.ts .prettierrc.json index.html ./
COPY vite.config.ts vitest.config.ts ./
COPY .env .env.production ./

ENV PUBLIC_PATH=/app/
ENV NODE_ENV=production
ENV VITE_GIT_TAG=${GIT_TAG}
ENV VITE_GIT_BRANCH=${GIT_BRANCH}
ENV VITE_GIT_REVISION=${GIT_REVISION}

RUN npm run build

# 2. copy
FROM busybox:1.36

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
