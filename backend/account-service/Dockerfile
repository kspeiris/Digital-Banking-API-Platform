FROM node:22-alpine

WORKDIR /usr/src/app

# Copy shared common library
COPY backend/shared-common ./backend/shared-common
RUN cd backend/shared-common && npm install && npm run build

# Copy account-service
COPY backend/account-service ./backend/account-service
RUN cd backend/account-service && npm install && npm run build

# Copy database for prisma schema
COPY database ./database
COPY package.json package-lock.json ./
RUN npm install && npx prisma generate --schema=database/prisma/schema.prisma

EXPOSE 3003

CMD ["node", "backend/account-service/dist/index.js"]
