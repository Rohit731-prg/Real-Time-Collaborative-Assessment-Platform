FROM node:22-alpine AS build

WORKDIR /app

# --- ADD THESE TWO LINES HERE ---
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# --------------------------------

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 5173