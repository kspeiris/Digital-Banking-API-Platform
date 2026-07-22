FROM node:22-alpine

WORKDIR /usr/src/app

# Copy shared common library
COPY backend/shared-common ./backend/shared-common
RUN cd backend/shared-common && npm install && npm run build

# Copy admin-service
COPY backend/admin-service ./backend/admin-service
RUN cd backend/admin-service && npm install && npm run build

# Copy database for prisma schema
COPY database ./database
COPY package.json package-lock.json ./
RUN npm install && npx prisma generate --schema=database/prisma/schema.prisma

EXPOSE 3009

CMD ["node", "backend/admin-service/dist/index.js"]
