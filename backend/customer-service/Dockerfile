FROM node:22-alpine

WORKDIR /usr/src/app

# Copy shared common library
COPY backend/shared-common ./backend/shared-common
RUN cd backend/shared-common && npm install && npm run build

# Copy customer-service
COPY backend/customer-service ./backend/customer-service
RUN cd backend/customer-service && npm install && npm run build

# Copy database for prisma schema
COPY database ./database
COPY package.json package-lock.json ./
RUN npm install && npx prisma generate --schema=database/prisma/schema.prisma

EXPOSE 3002

CMD ["node", "backend/customer-service/dist/index.js"]
