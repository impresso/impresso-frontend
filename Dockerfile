# 1. build
FROM node:12-alpine AS frontend_builder

ARG GIT_BRANCH
ARG GIT_REVISION

WORKDIR /impresso_frontend

RUN apk add --no-cache git build-base python

RUN npm install -g npm

COPY package.json package-lock.json ./

RUN npm install

COPY src ./src
COPY static ./static
COPY public ./public

COPY .eslintrc .eslintignore .postcssrc.js .babelrc vue.config.js ./
COPY .env .env.production ./

ENV PUBLIC_PATH /app/
ENV NODE_ENV production
ENV IMPRESSO_GIT_BRANCH=${GIT_BRANCH}
ENV IMPRESSO_GIT_REVISION=${GIT_REVISION}

RUN npm run build

# 2. copy
FROM busybox

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
