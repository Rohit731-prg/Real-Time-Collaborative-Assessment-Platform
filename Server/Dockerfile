FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=5000

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

USER node

EXPOSE 5000

CMD ["node", "src/index.js"]