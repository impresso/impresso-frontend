# 1. build
FROM node:18-alpine AS frontend_builder

ARG GIT_TAG
ARG GIT_BRANCH
ARG GIT_REVISION

WORKDIR /impresso_frontend

RUN apk add --no-cache git build-base python3

COPY package.json yarn.lock ./
# COPY package.json ./

RUN yarn install

COPY index.html ./
COPY src ./src
COPY static ./static
COPY public ./public

COPY .eslintrc.cjs .eslintignore .postcssrc.js .babelrc vite.config.js ./
COPY .env .env.production ./

RUN npm install

ENV PUBLIC_PATH /app/
ENV NODE_ENV production
ENV GIT_TAG=${GIT_TAG}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV GIT_REVISION=${GIT_REVISION}

RUN yarn run build

# 2. copy
FROM busybox

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
