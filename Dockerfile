# 1. build
FROM node:12-alpine AS frontend_builder

WORKDIR /impresso_frontend

RUN apk add --no-cache git build-base python

COPY package.json package-lock.json ./

RUN npm install

COPY build ./build
COPY src ./src
COPY static ./static

COPY .eslintignore .postcssrc.js .babelrc ./
COPY .env .env.production ./
COPY index.html ./

ENV PUBLIC_PATH /app/
ENV NODE_ENV production
RUN npm run build

# 2. copy
FROM busybox

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
