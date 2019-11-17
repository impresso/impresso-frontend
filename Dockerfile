# 1. build
FROM node:10-alpine AS frontend_builder

WORKDIR /impresso_frontend

RUN apk add --no-cache git build-base python

COPY package.json package-lock.json ./

RUN npm install

COPY build ./build
COPY src ./src
COPY static ./static

RUN mkdir ./config
COPY config/prod.env.js config/index.js ./config/
COPY .eslintrc.js .eslintignore .postcssrc.js .babelrc ./
COPY index.html ./

ENV PUBLIC_PATH /app/
ENV NODE_ENV production
RUN npm run build

# 2. copy
FROM busybox

WORKDIR /impresso-frontend

COPY --from=frontend_builder /impresso_frontend/dist ./
