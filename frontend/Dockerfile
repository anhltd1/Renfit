FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

# Proxy target set in docker-compose (service name: backend)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
